import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import {
  MessagesVariables,
  MessagesData,
  MessageSubscriptionData,
} from "../../../../util/types";
import messageOperations from "../../../../graphql/operations/message";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";
import { useEffect } from "react";
import MessageItem from "./MessageItem";

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

  const subscribeToMoreMessage = (conversationId: string) => {
    return subscribeToMore({
      document: messageOperations.Subscription.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData) return prev;

        const newMessage = subscriptionData.data.messageSent;

        console.log(newMessage);
        return Object.assign({}, prev, {
          messages: [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToMoreMessage(conversationId);
  }, [conversationId]);

  if (error) {
    return null;
  }

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack spacing={4} px={2}>
          <SkeletonLoader count={4} height="60px" width="100%" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflow="scroll" height="100%">
          {data.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              sentByMe={userId === message.sender.id}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
