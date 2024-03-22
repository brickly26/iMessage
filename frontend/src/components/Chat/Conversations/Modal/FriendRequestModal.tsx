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
import AddFriend from "./AddFriend";

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

  const onSendRequest = (recieverId: string) => {
    try {
      // send friend request
      sendFriendRequest({
        variables: {
          userId: recieverId,
        },
        update: (cache) => {
          const userSearch = cache.readQuery<SearchUsersData>({
            query: userOperations.Queries.searchUsers,
            variables: { username },
          });

          if (!userSearch) return;

          const { searchUsers: users } = userSearch;

          console.log(users);

          const updatedIdx = users.findIndex((user) => user.id === recieverId);

          console.log(updatedIdx);

          if (updatedIdx < 0) return;

          const clonedUsers = structuredClone(users);

          clonedUsers[updatedIdx].friendshipStatus = "PENDING";

          console.log(clonedUsers);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#2d2d2d" pb={4}>
        <ModalHeader>
          {friendModalPage === "friendRequests"
            ? "Friend Requests"
            : "Add Friend"}
        </ModalHeader>
        <ModalCloseButton />
        {friendModalPage === "addFriend" && <AddFriend session={session} />}
      </ModalContent>
    </Modal>
  );
};

export default FriendModal;
