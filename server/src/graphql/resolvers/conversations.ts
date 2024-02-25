import { GraphQLError } from "graphql";
import {
  ConversationCreatedSubscriptionPayload,
  ConversationPopulated,
  GraphQLContext,
} from "../../util/types";
import { Prisma } from "@prisma/client";
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
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        /**
         * Find all conversations that user is part of
         */
        const conversations = await prisma.conversation.findMany({
          // where: {
          //   participants: {
          //     some: {
          //       userId: {
          //         equals: userId,
          //       },
          //     },
          //   },
          // },
          include: conversationPopulated,
        });

        /**
         * Since above query does not work
         */

        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
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
      const { session, prisma, pubsub } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

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
  },
  Subscription: {
    conversationCreated: {
      // subscribe: (_: any, __: any, context: GraphQLContext) => {
      //   const { pubsub } = context;
      //   return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      // },
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _,
          context: GraphQLContext
        ) => {
          const { session } = context;
          const {
            conversationCreated: { participants },
          } = payload;

          const userIsParticipant = !!participants.find(
            (p) => p.userId === session?.user?.id
          );

          return userIsParticipant;
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
