import { Session } from "next-auth";
import ConversationWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Flex } from "@chakra-ui/react";

interface ChatProps {
  session: Session;
}

const Chat: React.FC<ChatProps> = ({ session }) => {
  return (
    <Flex height="100vh">
      <ConversationWrapper session={session} />
      <FeedWrapper session={session} />
    </Flex>
  );
};

export default Chat;
