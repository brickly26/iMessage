import ConversationWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Flex } from "@chakra-ui/react";
import { User } from "../../util/types";

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  return (
    <Flex height="100vh">
      <ConversationWrapper user={user} />
      <FeedWrapper user={user} />
    </Flex>
  );
};

export default Chat;
