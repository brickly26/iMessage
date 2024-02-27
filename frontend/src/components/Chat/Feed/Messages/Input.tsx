import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import { SendMessageData, SendMessageVariables } from "../../../../util/types";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  session,
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
      const { id: senderId } = session.user;
      const newMessage: SendMessageVariables = {
        senderId,
        conversationId,
        body: messageBody,
      };

      const { data, errors } = await sendMessage({
        variables: newMessage,
        optimisticResponse: {
          sendMessage: true,
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
