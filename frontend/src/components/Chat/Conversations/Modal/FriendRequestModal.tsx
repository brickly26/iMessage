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

import { useRouter } from "next/router";
import AddFriend from "./AddFriend";
import FriendRequestList from "./FriendRequestList";
import { FriendRequest } from "../../../../util/types";
import userOperations from "../../../../graphql/operations/user";

interface FriendRequestModalProps {
  friendRequests: Array<FriendRequest>;
  isOpen: boolean;
  onClose: () => void;
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  friendRequests,
  isOpen,
  onClose,
}) => {
  const [friendRequestLoading, setFriendRequestLoading] = useState<{
    loading: boolean;
    requestId: string;
    choice: string;
  }>({
    loading: false,
    requestId: "",
    choice: "",
  });

  const [handleFriendRequest] = useMutation<
    { handleFriendRequest: boolean },
    { requestId: string; choice: string }
  >(userOperations.Mutation.handleFriendRequest);

  const FriendRequestHandler = async (requestId: string, choice: string) => {
    setFriendRequestLoading({
      loading: true,
      requestId: requestId,
      choice: choice,
    });
    try {
      const { data, errors } = await handleFriendRequest({
        variables: {
          requestId,
          choice,
        },
      });

      if (!data || errors) {
        throw new Error("Failed to update participants");
      }
    } catch (error: any) {
      console.log("handleFriendRequest Error", error);
      toast.error(error.message);
    } finally {
      setFriendRequestLoading({
        loading: false,
        requestId: "",
        choice: "",
      });
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#2d2d2d" pb={4}>
        <ModalHeader>Friend Requests</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FriendRequestList
            friendRequests={friendRequests}
            handleFriendRequest={FriendRequestHandler}
            friendRequestLoading={friendRequestLoading}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FriendRequestModal;
