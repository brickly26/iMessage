import { Stack, Text } from "@chakra-ui/react";
import { ConversationPopulated } from "../../../../../server/src/util/types";

interface ConversationsItemProps {
  conversation: ConversationPopulated
}

const ConversationItem: React.FC<ConversationsItemProps> = ({ conversation }) => {
  return (
    <Stack p={4} _hover={{ bg: "whiteAlpha.200"}} borderRadius={4}>
      <Text>{conversation.id}</Text>
    </Stack>
  )
};

export default ConversationItem;