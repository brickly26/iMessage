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
import { useEffect, useState } from "react";
import UserSearchList from "./UserSearchList";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import userOperations from "../../../../graphql/operations/user";
import { SearchUsersData, SearchUsersVariables } from "../../../../util/types";

interface FriendModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

const FriendModal: React.FC<FriendModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");

  const {
    user: { id: userId },
  } = session;

  const [
    searchUsers,
    {
      data: searchedUsersData,
      loading: searchedUsersLoading,
      error: searchedUsersError,
    },
  ] = useLazyQuery<SearchUsersData, SearchUsersVariables>(
    userOperations.Queries.searchUsers
  );

  const [sendFriendRequest, { loading: sendFriendRequestLoading }] =
    useMutation<{ sendFriendRequest: boolean }, { userId: string }>(
      userOperations.Mutation.sendFriendRequest
    );

  const onSendRequest = (receiverId: string) => {
    try {
      // send friend request
      sendFriendRequest({
        variables: {
          userId: receiverId,
        },
        update: (cache) => {
          const userSearch = cache.readQuery<SearchUsersData>({
            query: userOperations.Queries.searchUsers,
            variables: { username },
          });

          if (!userSearch) return;

          const { searchUsers: users } = userSearch;

          const updatedIdx = users.findIndex((user) => user.id === receiverId);

          if (updatedIdx < 0) return;

          const clonedUsers = structuredClone(users);

          clonedUsers[updatedIdx].friendshipStatus = "PENDING";

          cache.writeQuery<SearchUsersData>({
            query: userOperations.Queries.searchUsers,
            variables: { username },
            data: {
              searchUsers: clonedUsers,
            },
          });
        },
      });
    } catch (error: any) {
      console.log("onSendRequest Error", error);
      toast.error("Failed to send friend request");
    }
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    // search users query
    searchUsers({ variables: { username } });
  };

  // useEffect(() => {
  //   subscribeToMoreSearchedUsers(username);
  // }, [username]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#2d2d2d" pb={4}>
        <ModalHeader>Add Friend</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={onSearch}>
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
          {searchedUsersData?.searchUsers && (
            <UserSearchList
              users={searchedUsersData?.searchUsers}
              sendRequest={onSendRequest}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FriendModal;
