import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import {
  ConversationDeletedData,
  ConversationPopulated,
  ConversationUpdatedData,
  ConversationsData,
  ParticipantPopulated,
} from "../../../util/types";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({
  session,
}) => {
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;
  const {
    user: { id: userId },
  } = session;

  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
    subscribeToMore,
  } = useQuery<ConversationsData>(conversationOperations.Queries.conversations);

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(conversationOperations.Mutations.markConversationAsRead);

  useSubscription<ConversationUpdatedData>(
    conversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          conversationUpdated: { conversation: updatedConversation },
        } = subscriptionData;

        const currentlyViewingConversation =
          updatedConversation.id === conversationId;

        if (currentlyViewingConversation) {
          onViewConversation(conversationId, false);
        }
      },
    }
  );

  useSubscription<ConversationDeletedData>(
    conversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery<ConversationsData>({
          query: conversationOperations.Queries.conversations,
        });

        if (!existing) return;

        const { conversations } = existing;
        const {
          conversationDeleted: { id: deletedConversationId },
        } = subscriptionData;

        client.writeQuery<ConversationsData>({
          query: conversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (conversation) => conversation.id !== deletedConversationId
            ),
          },
        });

        router.push("/");
      },
    }
  );

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => {
    /**
     * 1. Push the conversationId to the router query params
     */
    router.push({ query: { conversationId } });

    /**
     * 2. Mark the conversation as read
     */
    if (hasSeenLatestMessage) return;

    // markConversationAsRead mutation
    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: (cache) => {
          /**
           * Get conversation participants from cache
           */
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          const participants = [...participantsFragment.participants];

          const userParticipantIdx = participants.findIndex(
            (p) => p.user.id === userId
          );

          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];

          /**
           * Update participant to show latest message as read
           */
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipant on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error: any) {
      console.log("onViewConversation Error", error);
    }
  };

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: conversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;

        const newConversation = subscriptionData.data.conversationCreated;

        const conversations = Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });

        return conversations;
      },
    });
  };

  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box
      width={{ base: "100%", md: "430px" }}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      bg="whiteAlpha.50"
      flexDirection="column"
      gap={4}
      py={6}
      px={3}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height="80px" width="270px" />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
