import gql from "graphql-tag";
import {
  GraphQLContext,
  MessageSentSubscriptionPayload,
  SendMessageArguements,
} from "../../util/types";
import { GraphQLError } from "graphql";
import { messagePopulated } from "./conversations";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Query: {},
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArguements,
      context: GraphQLContext
    ): Promise<boolean> => {
      const { session, prisma, pubsub } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;
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
                  id: senderId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId: senderId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
        });

        /**
         * Update Clients that conversation was updated
         */
        pubsub.publish("MESSAGE_SENT", { messageSend: newMessage });
        // pubsub.publish("CONVERSATION_UPDATED", {
        //   conversationUpdated: {
        //     conversation,
        //   },
        // });
      } catch (error) {
        console.log("send message error", error);
        throw new GraphQLError("Error sending message");
      }

      return true;
    },
  },
  Subscription: {
    messageSend: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
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
