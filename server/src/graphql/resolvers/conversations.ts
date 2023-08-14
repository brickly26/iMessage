import { Prisma } from "@prisma/client";
import { ConversationPopulated, GraphQLContext } from "../../util/types";
import { ApolloError } from "apollo-server-core";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new ApolloError("Not authorized");
      }

      const { id: userId } = session.user;

      try {
        // Find All Conversation that user is part of

        const conversations = await prisma.conversation.findMany({
          //   // where: {
          //   //   participants: {
          //   //     some: {
          //   //       userId: {
          //   //         equals: userId,
          //   //       },
          //   //     },
          //   //   },
          //   // },
          include: conversationPopulated,
        });

        // Since above query does not work
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
      } catch (error: any) {
        console.log("Conversations erro", error);
        throw new ApolloError(error?.message);
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
      const { session, prisma, pubsub } = context;

      console.log("IDS", participantIds);

      if (!session?.user) {
        throw new ApolloError("Not authorized");
      }

      const { id: userId } = session.user;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // emit a Conversation created event using pubsub
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return {
          conversationId: conversation.id,
        };
      } catch (error: any) {
        console.log("createConversation error", error.message);
        throw new ApolloError("Error creating conversation");
      }
    },
  },
  Subscription: {
    conversationCreated: {
      subscibe: (_: any, __: any, context: GraphQLContext) => {
        const { pubsub } = context;

        return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      },

      // withFilter(
      //   (_: any, __: any, context: GraphQLContext) => {
      //     const { pubsub } = context;

      //     return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      //   },
      //   (
      //     payload: ConversationCreatedSubscriptionPayload,
      //     _,
      //     context: GraphQLContext
      //   ) => {
      //     const { session } = context;
      //     const {
      //       conversationCreated: { participants },
      //     } = payload;

      //     const userIsParticipant = !!participants.find(
      //       (p) => p.userId === session?.user?.id
      //     );

      //     return userIsParticipant;
      //   }
      // ),
    },
  },
};

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
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
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export default resolvers;
