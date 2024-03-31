import { useMutation, useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import {
  MessagesVariables,
  MessagesData,
  MessageSubscriptionData,
  SearchUsersData,
} from "../../../../util/types";
import messageOperations from "../../../../graphql/operations/message";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../common/SkeletonLoader";
import { useEffect } from "react";
import MessageItem from "./MessageItem";
import userOperations from "../../../../graphql/operations/user";
import { da } from "date-fns/locale";

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

        return newMessage.sender.id === userId
          ? prev
          : Object.assign({}, prev, {
              messages: [newMessage, ...prev.messages],
            });
      },
    });
  };

  const [
    sendFriendRequest,
    {
      error: sendFriendRequestError,
      data: sendFriendRequestdata,
      loading: sendFriendRequestLoading,
    },
  ] = useMutation<{ sendFriendRequest: boolean }, { userId: string }>(
    userOperations.Mutation.sendFriendRequest
  );

  const onSendRequest = (receiverId: string) => {
    try {
      // send friend request
      sendFriendRequest({
        variables: {
          userId: receiverId,
        },
        update: (cache) => {
          const data = cache.readQuery<MessagesData, MessagesVariables>({
            query: messageOperations.Query.messages,
            variables: { conversationId },
          });

          if (!data) return;

          const { messages } = data;

          const updatedMessages = messages.map((message) => {
            if (message.sender.id === receiverId) {
              return {
                ...message,
                sender: {
                  ...message.sender,
                  friendshipStatus: "PENDING",
                },
              };
            }
            return message;
          });

          console.log("searchUsers", updatedMessages);

          cache.writeQuery<MessagesData, MessagesVariables>({
            query: messageOperations.Query.messages,
            variables: { conversationId },
            data: {
              messages: updatedMessages,
            },
          });
        },
      });
    } catch (error: any) {
      console.log("onSendRequest Error", error);
      toast.error("Failed to send friend request");
    }
  };

  console.log("messages", data?.messages);

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
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {data.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              sendRequest={onSendRequest}
              sentByMe={userId === message.sender.id}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

export default Messages;
