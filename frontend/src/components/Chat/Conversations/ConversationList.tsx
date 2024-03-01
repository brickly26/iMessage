import { Box, Button, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationModal from "./Modal/Modal";
import { useState } from "react";
import { ConversationPopulated } from "../../../util/types";
import ConversationItem from "./ConversationItem";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import toast from "react-hot-toast";

interface ConversationListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  session,
  conversations,
  onViewConversation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConversation] = useMutation<
    { deleteConversation: boolean },
    { conversationId: string }
  >(conversationOperations.Mutations.deleteConversation);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const router = useRouter();
  const {
    user: { id: userId },
  } = session;

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ""
            );
          },
        }),
        {
          loading: "Deleting...",
          success: "Conversation deleted",
          error: "Failed to delete conversation",
        }
      );
    } catch (error) {
      console.log("onDeleteConversation error", error);
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  );

  return (
    <Box
      width={{ base: "100%", md: "400px" }}
      position="relative"
      height="100%"
      overflow="hidden"
    >
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpen}
      >
        <Text textAlign="center" color="whiteAlpha.800" fontWeight={500}>
          Find or start a conversation
        </Text>
      </Box>

      <ConversationModal isOpen={isOpen} onClose={onClose} session={session} />
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.user.id === session.user.id
        );
        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={() =>
              onViewConversation(
                conversation.id,
                participant?.hasSeenLatestMessage
              )
            }
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
            isSelected={conversation.id === router.query.conversationId}
            userId={userId}
            onDeleteConversation={onDeleteConversation}
          />
        );
      })}
      <Box position="absolute" bottom={0} left={0} width="100%" px={8}>
        <Button onClick={() => signOut()} width="100%">
          sign out
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationList;
