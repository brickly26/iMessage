import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  Stack,
  Input,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import userOperations from "../../../../graphql/operations/user";
import {
  ConversationPopulated,
  CreateConversationData,
  CreateConversationVariables,
  ParticipantPopulated,
  SearchFriendsData,
  SearchFriendsVariables,
  SearchUsersData,
  SearchUsersVariables,
  SearchedFriend,
  SearchedUser,
} from "../../../../util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import conversationOperations from "../../../../graphql/operations/conversation";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import ConversationItem from "../ConversationItem";
import FriendSearchList from "./FriendSearchList";

interface ConversationModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  conversations: Array<ConversationPopulated>;
  editingConversation: ConversationPopulated | null;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void;
  getUserParticipantObject: (
    conversation: ConversationPopulated
  ) => ParticipantPopulated;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  session,
  isOpen,
  onClose,
  conversations,
  editingConversation,
  onViewConversation,
  getUserParticipantObject,
}) => {
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<SearchedFriend>>([]);
  const [existingConversation, setExistingConversation] =
    useState<ConversationPopulated | null>(null);

  const {
    user: { id: userId },
  } = session;

  const router = useRouter();

  const [
    searchFriends,
    {
      data: searchedFriendsData,
      loading: searchedFriendsLoading,
      error: searchedFriendsError,
    },
  ] = useLazyQuery<SearchFriendsData, SearchFriendsVariables>(
    userOperations.Queries.searchFriends
  );

  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationVariables>(
      conversationOperations.Mutations.createConversation
    );

  const [updateParticipants, { loading: updateParticipantsLoading }] =
    useMutation<
      { updateParticipants: boolean },
      { conversationId: string; participantIds: Array<string> }
    >(conversationOperations.Mutations.updateParticipants);

  const onSubmit = () => {
    if (!participants.length) return;

    const participantIds = participants.map((p) => p.id);

    const existing = findExistingConversation(participantIds);

    if (existing) {
      toast("Conversation already exists");
      setExistingConversation(existing);
      return;
    }

    editingConversation
      ? onUpdateConversation(editingConversation)
      : onCreateConverversation();
  };

  /**
   * Verifies that a conversation with selected
   * participants does not already exist
   */
  const findExistingConversation = (participantIds: Array<string>) => {
    let existingConversation: ConversationPopulated | null = null;

    for (const conversation of conversations) {
      const addedParticipants = conversation.participants.filter(
        (p) => p.user.id !== userId
      );

      if (addedParticipants.length !== participantIds.length) {
        continue;
      }

      let allMatchingParticipants: boolean = false;

      for (const participant of addedParticipants) {
        const foundParticipant = participantIds.find(
          (p) => p === participant.user.id
        );

        if (!foundParticipant) {
          allMatchingParticipants = false;
          break;
        }

        /**
         * If we hit here,
         * all match
         */
        allMatchingParticipants = true;
      }

      if (allMatchingParticipants) {
        existingConversation = conversation;
      }
    }

    return existingConversation;
  };

  const onCreateConverversation = async () => {
    const participantIds = [userId, ...participants.map((p) => p.id)];

    try {
      // createConversation mutation
      const { data, errors } = await createConversation({
        variables: { participantIds },
      });

      if (!data?.createConversation || errors) {
        throw new Error("Failed to create conversation");
      }

      const {
        createConversation: { conversationId },
      } = data;

      router.push({ query: { conversationId } });

      /**
       * Clear state and close modal
       * on successful creation
       */
      setParticipants([]);
      setUsername("");
      onClose();
    } catch (error: any) {
      console.log("onCreateConversation Error", error);
      toast.error(error?.message);
    }
  };

  const onUpdateConversation = async (conversation: ConversationPopulated) => {
    const participantIds = participants.map((p) => p.id);

    try {
      const { data, errors } = await updateParticipants({
        variables: {
          conversationId: conversation.id,
          participantIds,
        },
      });

      if (!data?.updateParticipants || errors) {
        throw new Error("Failed to update participants");
      }

      /**
       * Clear state and close modal
       * on successful update
       */

      setParticipants([]);
      setUsername("");
      onClose();
    } catch (error) {
      console.log("onUpdateConversation error", error);
      toast.error("Failed to update participants");
    }
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // search Friends query
    searchFriends({ variables: { username } });
  };

  const addParticipant = (user: SearchedFriend) => {
    setParticipants((prev) => [...prev, user]);
    setUsername("");
  };

  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => userId !== p.id));
  };

  const onConversationClick = () => {
    if (!existingConversation) return;

    const { hasSeenLatestMessage } =
      getUserParticipantObject(existingConversation);

    onViewConversation(existingConversation.id, hasSeenLatestMessage);
    onClose();
  };

  /**
   * If a conversation is being edited,
   * update participant state to be that
   * conversations' participants
   */
  useEffect(() => {
    if (editingConversation) {
      setParticipants(
        editingConversation.participants.map((p) => p.user as SearchedFriend)
      );
      return;
    }
  }, [editingConversation]);

  /**
   * Reset existing conversation state
   * when participants added/removed
   */
  useEffect(() => {
    setExistingConversation(null);
  }, [participants]);

  /**
   * Clear participant state if closed
   */
  useEffect(() => {
    if (!isOpen) {
      setParticipants([]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#2d2d2d" pb={4}>
        <ModalHeader>Create a Conversation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={onSearch}>
            <Stack spacing={4}>
              <Input
                placeholder="Enter a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Button
                type="submit"
                disabled={!username}
                isLoading={searchedFriendsLoading}
              >
                Search
              </Button>
            </Stack>
          </form>
          {searchedFriendsData?.searchFriends && (
            <FriendSearchList
              friends={searchedFriendsData?.searchFriends}
              addParticipant={addParticipant}
              participants={participants}
            />
          )}

          {participants.length !== 0 && (
            <>
              <Participants
                participants={participants.filter((p) => p.id !== userId)}
                removeParticipant={removeParticipant}
              />
              <Box mt={4}>
                {existingConversation && (
                  <ConversationItem
                    userId={userId}
                    conversation={existingConversation}
                    onClick={() => onConversationClick()}
                  />
                )}
              </Box>
              <Button
                bg="brand.100"
                width="100%"
                mt={6}
                disabled={!!existingConversation}
                _hover={{ bg: "brand.100" }}
                onClick={onSubmit}
                isLoading={
                  createConversationLoading || updateParticipantsLoading
                }
              >
                {editingConversation
                  ? "Update Conversation"
                  : "Create Conversation"}
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConversationModal;
