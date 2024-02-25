import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { useQuery } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import { ConversationPopulated, ConversationsData } from "../../../util/types";
import { useEffect } from "react";
import { useRouter } from "next/router";

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
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
    subscribeToMore,
  } = useQuery<ConversationsData>(conversationOperations.Queries.conversations);

  const onViewConversation = async (conversationId: string) => {
    /**
     * 1. Push the conversationId to the router query params
     */
    router.push({ query: { conversationId } });

    /**
     * 2. Mark the conversation as read
     */
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
        if (!subscriptionData) return prev;
        console.log("prev", prev);

        const newConversation = subscriptionData.data.conversationCreated;

        console.log("newConvo", newConversation);

        const conversations = Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });

        console.log("convos", conversations);

        return conversations;
      },
    });
  };

  /**
   * Execute subscription on mount
   */
  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
    >
      {/* Skeleton Loader */}
      <ConversationList
        session={session}
        conversations={conversationsData?.conversations || []}
        onViewConversation={onViewConversation}
      />
    </Box>
  );
};

export default ConversationsWrapper;
