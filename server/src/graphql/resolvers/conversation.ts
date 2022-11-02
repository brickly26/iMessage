import { ConversationPopulated, GrapghQLContext } from "../../util/types";
import { ApolloError } from "apollo-server-core";
import { Prisma } from "@prisma/client";

const resolvers = {
  Query: {
    conversations: async (_: any, __: any, context: GrapghQLContext): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new ApolloError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        /**
         * Find all conversations that user is a part of
         */
        const conversations = await prisma.conversation.findMany({
          /**
           * Below has been confrims to be the correct
           * query by the Prisma team. Had been confirmed
           * that there is an issue on their end
           * Issue seems specifi to Mongo
           */
          // where: {
          //   participants: {
          //     some: {
          //       userId: {
          //         equals: userId,
          //       }
          //     }
          //   }
          // },
          include: conversationPopulated,
        });

        /**
         * Since above query does not work
         */
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => (p.userId = userId))
        );
      } catch (error: any) {
        console.log("conversations error", error);
        throw new ApolloError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: GrapghQLContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma } = context;
      const { participantIds } = args;

      console.log("helloworld", participantIds);

      if (!session?.user) {
        throw new ApolloError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        // Create conversation entity in the database
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

        // emit a CONVERSATION_CREATED event using pubsub

        return {
          conversationId: conversation.id,
        };
      } catch (error) {
        console.log("create conversation error", error);
        throw new ApolloError("Error creating conversation");
      }
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
