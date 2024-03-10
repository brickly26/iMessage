import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationModal from "./Modal/ConversationModal";
import { useState } from "react";
import {
  ConversationPopulated,
  ParticipantPopulated,
} from "../../../util/types";
import ConversationItem from "./ConversationItem";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import toast from "react-hot-toast";
import { HiOutlineUsers } from "react-icons/hi";
import { IoPersonAddOutline } from "react-icons/io5";
import FriendModal from "./Modal/FriendModal";

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
  const router = useRouter();
  const {
    user: { id: userId },
  } = session;

  const [editingConversation, setEditingConversation] =
    useState<ConversationPopulated | null>(null);

  const [friendModalPage, setFriendModalPage] = useState("friendList");
  const [isOpenConvo, setIsOpenConvo] = useState(false);
  const onOpenConvo = () => setIsOpenConvo(true);
  const onCloseConvo = () => setIsOpenConvo(false);

  const [isOpenFriend, setIsOpenFriend] = useState(false);
  const onOpenFriendList = () => {
    setFriendModalPage("friendList");
    setIsOpenFriend(true);
  };
  const onOpenFriendRequest = () => {
    setFriendModalPage("friendRequest");
    setIsOpenFriend(true);
  };
  const toggleCloseFriend = () => setIsOpenFriend(false);

  /**
   * Mutations
   */
  const [updateParticipants, { loading: updateParticipantsLoading }] =
    useMutation<
      { updateParticipants: boolean },
      { conversationId: string; participantIds: Array<string> }
    >(conversationOperations.Mutations.updateParticipants);

  const [deleteConversation] = useMutation<
    { deleteConversation: boolean },
    { conversationId: string }
  >(conversationOperations.Mutations.deleteConversation);

  const onLeaveConversation = async (conversation: ConversationPopulated) => {
    const participantIds = conversation.participants
      .filter((p) => p.user.id !== userId)
      .map((p) => p.user.id);

    try {
      const { data, errors } = await updateParticipants({
        variables: {
          conversationId: conversation.id,
          participantIds,
        },
      });

      console.log("leaving", errors, data);

      if (!data || errors) {
        throw new Error("Failed to update participants");
      }
    } catch (error: any) {
      console.log("onUpdateConversation error", error);
      toast.error(error.message);
    }
  };

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

  const getUserParticipantObject = (conversation: ConversationPopulated) => {
    return conversation.participants.find(
      (p) => p.user.id === session.user.id
    ) as ParticipantPopulated;
  };

  const onEditConversation = (conversation: ConversationPopulated) => {
    setEditingConversation(conversation);
    onOpen();
  };

  const toggleCloseConvo = () => {
    setEditingConversation(null);
    onCloseConvo();
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
      <Flex mb={4} justify="space-between">
        <IconButton
          bg="blackAlpha.300"
          aria-label="Friends"
          icon={<HiOutlineUsers />}
          onClick={onOpenFriendList}
        />
        <IconButton
          bg="blackAlpha.300"
          aria-label="Friends"
          icon={<IoPersonAddOutline />}
          onClick={onOpenFriendRequest}
        />
      </Flex>
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpenConvo}
      >
        <Text textAlign="center" color="whiteAlpha.800" fontWeight={500}>
          Find or start a conversation
        </Text>
      </Box>

      <FriendModal
        isOpen={isOpenFriend}
        onClose={toggleCloseFriend}
        session={session}
        friendModalPage={friendModalPage}
      />

      <ConversationModal
        isOpen={isOpenConvo}
        onClose={toggleCloseConvo}
        session={session}
        conversations={conversations}
        editingConversation={editingConversation}
        getUserParticipantObject={getUserParticipantObject}
        onViewConversation={onViewConversation}
      />
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.userId === session.user.id
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
            onLeaveConversation={onLeaveConversation}
            onEditConversation={() => onEditConversation(conversation)}
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
