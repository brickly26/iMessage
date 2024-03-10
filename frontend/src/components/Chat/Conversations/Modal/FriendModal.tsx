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
} from "@chakra-ui/react";
import { useState } from "react";
import UserSearchList from "./UserSearchList";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface FriendModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  friendModalPage: string;
}

const FriendModal: React.FC<FriendModalProps> = ({
  session,
  isOpen,
  onClose,
  friendModalPage,
}) => {
  const [username, setUsername] = useState("");

  const {
    user: { id: userId },
  } = session;

  const router = useRouter();

  // const [
  //   searchUsers,
  //   {
  //     data: searchedUsersData,
  //     loading: searchedUsersLoading,
  //     error: searchedUsersError,
  //   },
  // ] = useLazyQuery<SearchUsersData, SearchUsersVariables>(
  //   userOperations.Queries.searchUsers
  // );

  // const [createConversation, { loading: createConversationLoading }] =
  //   useMutation<CreateConversationData, CreateConversationVariables>(
  //     conversationOperations.Mutations.createConversation
  //   );

  // const [updateParticipants, { loading: updateParticipantsLoading }] =
  //   useMutation<
  //     { updateParticipants: boolean },
  //     { conversationId: string; participantIds: Array<string> }
  //   >(conversationOperations.Mutations.updateParticipants);

  // const onSubmit = () => {
  //   if (!participants.length) return;

  //   const participantIds = participants.map((p) => p.id);

  //   const existing = findExistingConversation(participantIds);

  //   if (existing) {
  //     toast("Conversation already exists");
  //     setExistingConversation(existing);
  //     return;
  //   }

  //   editingConversation
  //     ? onUpdateConversation(editingConversation)
  //     : onCreateConverversation();
  // };

  // /**
  //  * Verifies that a conversation with selected
  //  * participants does not already exist
  //  */
  // const findExistingConversation = (participantIds: Array<string>) => {
  //   let existingConversation: ConversationPopulated | null = null;

  //   for (const conversation of conversations) {
  //     const addedParticipants = conversation.participants.filter(
  //       (p) => p.user.id !== userId
  //     );

  //     if (addedParticipants.length !== participantIds.length) {
  //       continue;
  //     }

  //     let allMatchingParticipants: boolean = false;

  //     for (const participant of addedParticipants) {
  //       const foundParticipant = participantIds.find(
  //         (p) => p === participant.user.id
  //       );

  //       if (!foundParticipant) {
  //         allMatchingParticipants = false;
  //         break;
  //       }

  //       /**
  //        * If we hit here,
  //        * all match
  //        */
  //       allMatchingParticipants = true;
  //     }

  //     if (allMatchingParticipants) {
  //       existingConversation = conversation;
  //     }
  //   }

  //   return existingConversation;
  // };

  // const onCreateConverversation = async () => {
  //   const participantIds = [userId, ...participants.map((p) => p.id)];

  //   try {
  //     // createConversation mutation
  //     const { data, errors } = await createConversation({
  //       variables: { participantIds },
  //     });

  //     if (!data?.createConversation || errors) {
  //       throw new Error("Failed to create conversation");
  //     }

  //     const {
  //       createConversation: { conversationId },
  //     } = data;

  //     router.push({ query: { conversationId } });

  //     /**
  //      * Clear state and close modal
  //      * on successful creation
  //      */
  //     setParticipants([]);
  //     setUsername("");
  //     onClose();
  //   } catch (error: any) {
  //     console.log("onCreateConversation Error", error);
  //     toast.error(error?.message);
  //   }
  // };

  // const onUpdateConversation = async (conversation: ConversationPopulated) => {
  //   const participantIds = participants.map((p) => p.id);

  //   try {
  //     const { data, errors } = await updateParticipants({
  //       variables: {
  //         conversationId: conversation.id,
  //         participantIds,
  //       },
  //     });

  //     if (!data?.updateParticipants || errors) {
  //       throw new Error("Failed to update participants");
  //     }

  //     /**
  //      * Clear state and close modal
  //      * on successful update
  //      */

  //     setParticipants([]);
  //     setUsername("");
  //     onClose();
  //   } catch (error) {
  //     console.log("onUpdateConversation error", error);
  //     toast.error("Failed to update participants");
  //   }
  // };

  // const onSearch = (event: React.FormEvent) => {
  //   event.preventDefault();

  //   // search users query
  //   searchUsers({ variables: { username } });
  // };

  // const addParticipant = (user: SearchedUser) => {
  //   setParticipants((prev) => [...prev, user]);
  //   setUsername("");
  // };

  // const removeParticipant = (userId: string) => {
  //   setParticipants((prev) => prev.filter((p) => userId !== p.id));
  // };

  // const onConversationClick = () => {
  //   if (!existingConversation) return;

  //   const { hasSeenLatestMessage } =
  //     getUserParticipantObject(existingConversation);

  //   onViewConversation(existingConversation.id, hasSeenLatestMessage);
  //   onClose();
  // };

  // /**
  //  * If a conversation is being edited,
  //  * update participant state to be that
  //  * conversations' participants
  //  */
  // useEffect(() => {
  //   if (editingConversation) {
  //     setParticipants(
  //       editingConversation.participants.map((p) => p.user as SearchedUser)
  //     );
  //     return;
  //   }
  // }, [editingConversation]);

  // /**
  //  * Reset existing conversation state
  //  * when participants added/removed
  //  */
  // useEffect(() => {
  //   setExistingConversation(null);
  // }, [participants]);

  // /**
  //  * Clear participant state if closed
  //  */
  // useEffect(() => {
  //   if (!isOpen) {
  //     setParticipants([]);
  //   }
  // }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#2d2d2d" pb={4}>
        <ModalHeader>
          {friendModalPage === "friendList" ? "Friend List" : "Add Friend"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={() => {}}>
            <Stack spacing={4}>
              <Input
                placeholder="Enter a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Button type="submit" disabled={!username}>
                Search
              </Button>
            </Stack>
          </form>
          {/* {searchedUsersData?.searchUsers && (
            <UserSearchList
              users={searchedUsersData?.searchUsers}
              addParticipant={addParticipant}
              participants={participants}
            />
          )} */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FriendModal;
