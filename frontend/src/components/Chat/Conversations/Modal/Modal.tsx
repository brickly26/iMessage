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
import userOperations from "../../../../graphql/operations/user";
import {
  CreateConversationData,
  CreateConversationVariables,
  SearchUsersData,
  SearchUsersVariables,
  SearchedUser,
} from "../../../../util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import toast from "react-hot-toast";
import conversationOperations from "../../../../graphql/operations/conversation";
import { Session } from "next-auth";

interface ConversationModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const {
    user: { id: userId },
  } = session;
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
  const [searchUsers, { data, loading, error }] = useLazyQuery<
    SearchUsersData,
    SearchUsersVariables
  >(userOperations.Queries.searchUsers);
  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationVariables>(
      conversationOperations.Mutations.createConversation
    );

  const onCreateConverversation = async () => {
    const participantIds = [userId, ...participants.map((p) => p.id)];
    try {
      // createConversation mutation
      const { data } = await createConversation({
        variables: { participantIds },
      });
    } catch (error: any) {
      console.log("onCreateConversation Error", error);
      toast.error(error?.message);
    }
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // search users query
    searchUsers({ variables: { username } });
  };

  const addParticipant = (user: SearchedUser) => {
    setParticipants((prev) => [...prev, user]);
    setUsername("");
  };

  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => userId !== p.id));
  };

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
              <Button type="submit" disabled={!username} isLoading={loading}>
                Search
              </Button>
            </Stack>
          </form>
          {data?.searchUsers && (
            <UserSearchList
              users={data?.searchUsers}
              addParticipant={addParticipant}
            />
          )}

          {participants.length !== 0 && (
            <>
              <Participants
                participants={participants}
                removeParticipant={removeParticipant}
              />
              <Button
                bg="brand.100"
                width="100%"
                mt={6}
                _hover={{ bg: "brand.100" }}
                onClick={onCreateConverversation}
                isLoading={createConversationLoading}
              >
                Create Conversation
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConversationModal;
