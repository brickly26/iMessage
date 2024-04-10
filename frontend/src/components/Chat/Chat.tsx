import ConversationWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Flex } from "@chakra-ui/react";
import { User } from "../../util/types";

interface ChatProps {
  user: User;
  reloadSession: () => void;
}

const Chat: React.FC<ChatProps> = ({ user, reloadSession }) => {
  return (
    <Flex height="100vh">
      <ConversationWrapper user={user} reloadSession={reloadSession} />
      <FeedWrapper user={user} />
    </Flex>
  );
};

export default Chat;
