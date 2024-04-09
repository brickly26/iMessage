import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";
import {
  GraphQLContext,
  GraphQLWSContext,
  MessagePopulated,
  MessageSentSubscriptionPayload,
  SendMessageArguements,
} from "../../utils/types";
import { conversationPopulated, messagePopulated } from "./conversations";

const resolvers = {
  Query: {
    messages: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<Array<MessagePopulated>> => {
      const { req, prisma } = context;
      const { conversationId } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      // Verify that conversation exisits and user is a participant
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });

      if (!conversation) {
        throw new GraphQLError("Conversation Not Found");
      }

      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );

      if (!allowedToView) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });

        const sentRequests = await prisma.friendRequest.findMany({
          where: {
            senderId: userId,
            receiverId: {
              in: messages.map((message) => message.senderId),
            },
          },
        });

        console.log("sentRequests", sentRequests);

        const receivedRequests = await prisma.friendRequest.findMany({
          where: {
            receiverId: userId,
            senderId: {
              in: messages.map((message) => message.senderId),
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

        const newMessages = messages.map((message) => ({
          ...message,
          sender: {
            ...message.sender,
            friendshipStatus: requestHash[message.senderId]
              ? requestHash[message.senderId]
              : "SENDABLE",
          },
        }));

        return newMessages;
      } catch (error: any) {
        console.log("messages error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArguements,
      context: GraphQLContext
    ): Promise<boolean> => {
      const { req, prisma, pubsub } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;
      const { id: messageId, senderId, conversationId, body } = args;

      if (userId !== senderId) {
        throw new GraphQLError("Not authorized");
      }

      try {
        /**
         * Create new message entity
         */

        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId: senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        /**
         * Find ConversationParticiapnt entity
         */

        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });

        /**
         * Should always exist
         */
        if (!participant) {
          throw new GraphQLError("Participant does not exist");
        }

        /**
         * Update conversation entity
         */
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: participant.id,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
          include: conversationPopulated,
        });

        /**
         * Update Clients that conversation was updated
         */
        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });

        pubsub.publish("CONVERSATION_UPDATED", {
          conversationUpdated: {
            conversation,
          },
        });
      } catch (error) {
        console.log("send message error", error);
        throw new GraphQLError("Error sending message");
      }

      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (
          payload: MessageSentSubscriptionPayload,
          args: { conversationId: string },
          context: GraphQLContext
        ) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};

export default resolvers;
