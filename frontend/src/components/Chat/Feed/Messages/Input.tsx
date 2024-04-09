import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import {
  MessagesData,
  SendMessageData,
  SendMessageVariables,
  User,
} from "../../../../util/types";
import { ObjectID } from "bson";

interface MessageInputProps {
  user: User;
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  user,
  conversationId,
}) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage, { data, error, loading }] = useMutation<
    SendMessageData,
    SendMessageVariables
  >(messageOperations.Mutation.sendMessage);

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Call sendMessage  mutation
      const { id: senderId } = user;
      const messageId = new ObjectID().toString();
      const newMessage: SendMessageVariables = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };

      setMessageBody("");

      const { data, errors } = await sendMessage({
        variables: newMessage,
        optimisticResponse: {
          sendMessage: true,
        },
        update: (cache) => {
          const existing = cache.readQuery<MessagesData>({
            query: messageOperations.Query.messages,
            variables: { conversationId },
          }) as MessagesData;

          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: messageOperations.Query.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  id: messageId,
                  body: messageBody,
                  senderId: user.id,
                  conversationId,
                  sender: {
                    id: user.id,
                    username: user.username,
                    friendshipStatus: "ACCEPTED",
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing?.messages,
              ],
            },
          });
        },
      });

      if (!data?.sendMessage || error) {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      console.log("onSendMessage error", error);
      toast.error(error?.message);
    }
  };

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="New message"
          size="md"
          resize="none"
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
          _hover={{
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};

export default MessageInput;
