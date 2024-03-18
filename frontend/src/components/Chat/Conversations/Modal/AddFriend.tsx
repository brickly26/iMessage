import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, ModalBody, Stack, Input } from "@chakra-ui/react";
import { useState } from "react";
import UserSearchList from "./UserSearchList";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import userOperations from "../../../../graphql/operations/user";
import { SearchUsersData, SearchUsersVariables } from "../../../../util/types";

interface AddFriendProps {
  session: Session;
}

const AddFriend: React.FC<AddFriendProps> = ({ session }) => {
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
  );
};

export default AddFriend;
