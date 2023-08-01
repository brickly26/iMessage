import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { useQuery } from "@apollo/client";
import { ConversationsData } from "../../../util/types";

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
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  console.log("here is data", conversationsData);

  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={6} px={3}>
      {/* Skeleton loader */}
      <ConversationList session={session} />
    </Box>
  );
};

export default ConversationsWrapper;
