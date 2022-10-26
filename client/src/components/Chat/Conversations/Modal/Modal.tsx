import React, { useState } from "react";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
  ModalBody,
  ModalFooter,
  Modal,
  Stack,
  Input,
  Button,
} from "@chakra-ui/react";
import { useLazyQuery, useMutation } from "@apollo/client";
import userOperations from "../../../../graphql/operations/user";
import conversationOperation from "../../../../graphql/operations/conversation";
import {
  CreateConversationData,
  CreateConversationInput,
  SearchedUser,
  SearchUsersData,
  SearchUsersInput,
} from "../../../../util/types";
import UserSearchList from "./UserSearchList";
import Participants from "./participants";
import toast from "react-hot-toast";
import { Session } from "next-auth";

interface ModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ModalProps> = ({
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
    SearchUsersInput
  >(userOperations.Queries.searchUsers);

  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationInput>(
      conversationOperation.Mutations.createConversation
    );

  const onCreateConversation = async () => {
    try {
      // createConversation mutation

      const participantIds = [userId, ...participants.map((participant) => participant.id)];

      const { data } = await createConversation({
        variables: {
          participantIds,
        },
      });

      console.log('Here is data', data)
    } catch (error: any) {
      console.log("onCreateConversation error", error);
      toast.error(error?.message);
    }
  };

  const onSearch = (event: React.FormEvent) => {
    event?.preventDefault();

    // searchUsers query
    searchUsers({ variables: { username } });
  };

  const addParticipant = (user: SearchedUser) => {
    setParticipants((prev) => [...prev, user]);
    setUsername("");
  };

  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <>
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
                  onChange={(e) => setUsername(e?.target.value)}
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
                  isLoading={createConversationLoading}
                  onClick={onCreateConversation}
                >
                  Create Conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConversationModal;
