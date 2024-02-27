import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { MessagesVariables, MessagesData } from "../../../../util/types";
import messageOperations from "../../../../graphql/operations/message";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

export const Messages: React.FC<MessagesProps> = ({
  userId,
  conversationId,
}) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(messageOperations.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  if (error) {
    return null;
  }

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack spacing={4} px={2}>
          <SkeletonLoader count={4} height="60px" width="100%" />
          <span>Loading Messages</span>
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflow="scroll" height="100%">
          {data.messages.map((message) => (
            // <MessageItem />
            <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
