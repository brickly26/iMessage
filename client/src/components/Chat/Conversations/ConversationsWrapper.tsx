import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { useQuery } from "@apollo/client";
import { ConversationsData } from "../../../util/types";
import { ConversationPopulated } from "../../../../../server/src/util/types";
import { useEffect } from "react";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FC<ConversationsWrapperProps> = ({
  session,
}) => {
  const {
    data: conversationsData,
    loading: ConversationsLoading,
    error: ConversationsError,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.coversationCreated,
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

        if (
          prev.conversations.find(
            (conversation) => conversation.id === newConversation.id
          )
        ) {
          return prev;
        }

        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  // execute subscription on component mount
  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={6} px={3}>
      {/* Skeleton loader */}
      <ConversationList
        session={session}
        conversations={conversationsData?.conversations || []}
      />
    </Box>
  );
};

export default ConversationsWrapper;
