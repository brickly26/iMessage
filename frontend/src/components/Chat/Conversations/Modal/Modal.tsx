import { useLazyQuery } from "@apollo/client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
  Stack,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import userOperations from "../../../../graphql/operations/user";
import { SearchUsersData, SearchUsersVariables } from "../../../../util/types";
import UserSearchList from "./UserSearchList";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [searchUsers, { data, loading, error }] = useLazyQuery<
    SearchUsersData,
    SearchUsersVariables
  >(userOperations.Queries.searchUsers);

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // search users query
    searchUsers({ variables: { username } });
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
          {data?.searchUsers && <UserSearchList users={data?.searchUsers} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConversationModal;
