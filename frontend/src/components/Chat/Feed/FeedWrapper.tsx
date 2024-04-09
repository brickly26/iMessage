import { Flex } from "@chakra-ui/react";

import { useRouter } from "next/router";
import MessagesHeader from "./Messages/Headers";
import MessageInput from "./Messages/Input";
import Messages from "./Messages/Messages";
import NoConversation from "./NoConversationSelected";
import { User } from "../../../util/types";

interface FeedWrapperProps {
  user: User;
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ user }) => {
  const router = useRouter();

  const { conversationId } = router.query;
  const { id: userId } = user;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
      direction="column"
    >
      {conversationId && typeof conversationId === "string" ? (
        <>
          <Flex
            direction="column"
            justify="space-between"
            overflow="hidden"
            flexGrow={1}
          >
            <MessagesHeader conversationId={conversationId} userId={userId} />
            <Messages conversationId={conversationId} userId={userId} />
          </Flex>
          <MessageInput user={user} conversationId={conversationId} />
        </>
      ) : (
        <NoConversation />
      )}
    </Flex>
  );
};

export default FeedWrapper;
