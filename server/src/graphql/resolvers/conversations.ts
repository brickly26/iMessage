import { Prisma } from "@prisma/client";
import { ObjectID } from "bson";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";
import {
  ConversationCreatedSubscriptionPayload,
  ConversationDeletedSubscriptionPayload,
  ConversationPopulated,
  ConversationUpdatedSubscriptionPayload,
  GraphQLContext,
  GraphQLWSContext,
} from "../../utils/types";

const resolvers = {
  Query: {
    conversation: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<ConversationPopulated> => {
      const { req, prisma } = context;
      const { conversationId } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        /**
         * Find all conversations that user is part of
         */
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
          },
          include: conversationPopulated,
        });

        if (!conversation) {
          throw new GraphQLError("Conversation does not exist");
        }

        const sentRequests = await prisma.friendRequest.findMany({
          where: {
            senderId: userId,
            receiverId: {
              in: conversation.participants.map(
                (participant) => participant.user.id
              ),
            },
          },
        });

        console.log("sentRequests", sentRequests);

        const receivedRequests = await prisma.friendRequest.findMany({
          where: {
            receiverId: userId,
            senderId: {
              in: conversation.participants.map(
                (participant) => participant.user.id
              ),
            },
          },
        });

        console.log("receivedRequests", receivedRequests);

        const requestHash: Record<string, string> = sentRequests.reduce(
          (user: Record<string, string>, request) => {
            user[request.receiverId] = request.status;
            return user;
          },
          {}
        );

        receivedRequests.forEach((request) => {
          requestHash[request.senderId] =
            request.status !== "ACCEPTED" ? "SENDABLE" : "ACCEPTED";
        });

        const newConversation = {
          ...conversation,
          participants: conversation.participants.map((participant) => ({
            ...participant,
            user: {
              ...participant.user,
              friendshipStatus: requestHash[participant.userId]
                ? requestHash[participant.userId]
                : "SENDABLE",
            },
          })),
        };

        return newConversation;
      } catch (error: any) {
        console.log("Conversations Error", error);
        throw new GraphQLError(error?.message);
      }
    },
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { req, prisma } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        /**
         * Find all conversations that user is part of
         */
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: userId,
                },
              },
            },
          },
          include: conversationPopulated,
        });

        /**
         * Since above query does not work
         */

        return conversations;
      } catch (error: any) {
        console.log("Conversations Error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { participantIds } = args;
      const { req, prisma, pubsub } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  hasSeenLatestMessage: id === userId,
                  userId: id,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // emit a CONVERSATION_CREATED event using pubsub
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return { conversationId: conversation.id };
      } catch (error) {
        console.log("createConversation Error", error);
        throw new GraphQLError("Error creating conversation");
      }
    },
    markConversationAsRead: async (
      _: any,
      args: { userId: string; conversationId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { prisma, req } = context;
      const { userId, conversationId } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId: userId,
            conversationId: conversationId,
          },
        });

        if (!participant) {
          throw new GraphQLError("Participant does not exist");
        }

        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });

        return true;
      } catch (error: any) {
        console.log("markConversationAsRead error", error);
        throw new GraphQLError(error?.message);
      }
    },
    deleteConversation: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { conversationId } = args;
      const { req, prisma, pubsub } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      const tempConvoId = new ObjectID().toString();

      try {
        /**
         * Delete conversation and all related entities
         */
        const [_, deletedConversation] = await prisma.$transaction([
          prisma.message.updateMany({
            where: {
              conversationId,
            },
            data: {
              conversationId: tempConvoId,
            },
          }),
          prisma.conversation.delete({
            where: {
              id: conversationId,
            },
            include: conversationPopulated,
          }),
          prisma.conversationParticipant.deleteMany({
            where: {
              conversationId,
            },
          }),
          prisma.message.deleteMany({
            where: {
              conversationId: tempConvoId,
            },
          }),
        ]);

        pubsub.publish("CONVERSATION_DELETED", {
          conversationDeleted: deletedConversation,
        });
      } catch (error: any) {
        console.log("DeleteConversation error", error);
        throw new GraphQLError(error?.message);
      }
      return true;
    },
    updateParticipants: async (
      _: any,
      args: { conversationId: string; participantIds: Array<string> },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { req, prisma, pubsub } = context;
      const { conversationId, participantIds } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        const conversation = await prisma.conversation.findUnique({
          where: {
            id: conversationId,
          },
          include: {
            participants: true,
          },
        });

        // Shouldnt happen but to be safe
        if (!conversation) {
          throw new GraphQLError("No conversation found");
        }

        const participants = conversation?.participants;

        const existingParticipants = participants.map((p) => p.userId);

        const participantsToDelete = existingParticipants.filter(
          (id) => !participantIds.includes(id)
        );

        const participantsToCreate = participantIds.filter(
          (id) => !existingParticipants.includes(id)
        );

        const transactionStatements = [
          prisma.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              participants: {
                deleteMany: {
                  userId: {
                    in: participantsToDelete,
                  },
                  conversationId,
                },
              },
            },
            include: conversationPopulated,
          }),
        ];

        if (participantsToCreate.length) {
          transactionStatements.push(
            prisma.conversation.update({
              where: {
                id: conversationId,
              },
              data: {
                participants: {
                  createMany: {
                    data: participantsToCreate.map((id) => ({
                      userId: id,
                      hasSeenLatestMessage: false,
                    })),
                  },
                },
              },
              include: conversationPopulated,
            })
          );
        }

        const [deleteUpdate, addUpdate] = await prisma.$transaction(
          transactionStatements
        );

        // publish updates
        pubsub.publish("CONVERSATION_UPDATED", {
          conversationUpdated: {
            conversation: addUpdate || deleteUpdate,
            addedUserIds: participantsToCreate,
            removedUserIds: participantsToDelete,
          },
        });

        return true;
      } catch (error: any) {
        console.log("updateParticipants Error", error);
        throw new GraphQLError(error.message);
      }
    },
  },
  Subscription: {
    conversationCreated: {
      // subscribe: (_: any, __: any, context: GraphQLContext) => {
      //   const { pubsub } = context;
      //   return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      // },
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _,
          context: GraphQLWSContext
        ) => {
          const { session } = context;
          const {
            conversationCreated: { participants },
          } = payload;

          if (!session?.userId) {
            throw new GraphQLError("Not authorized");
          }

          return userIsConversationParticipant(participants, session.userId);
        }
      ),
    },
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: ConversationUpdatedSubscriptionPayload,
          _,
          context: GraphQLWSContext
        ) => {
          const { session } = context;

          if (!session?.userId) {
            throw new GraphQLError("Not authorized");
          }

          const { userId } = session;
          const {
            conversationUpdated: {
              conversation: { participants, latestMessage },
              removedUserIds,
            },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(
            participants,
            session.userId
          );

          const userSentLatestMessage = latestMessage?.senderId === userId;

          const userIsBeingRemoved =
            removedUserIds && !!removedUserIds.find((id) => userId);

          return (
            (userIsParticipant && !userSentLatestMessage) ||
            userSentLatestMessage ||
            userIsBeingRemoved
          );
        }
      ),
    },
    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
        },
        (
          payload: ConversationDeletedSubscriptionPayload,
          _,
          context: GraphQLWSContext
        ) => {
          const { session } = context;

          if (!session?.userId) {
            throw new GraphQLError("Not Authorized");
          }

          const { userId } = session;
          const { participants } = payload.conversationDeleted;

          return userIsConversationParticipant(participants, userId);
        }
      ),
    },
  },
};

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: messagePopulated,
    },
  });

export default resolvers;
