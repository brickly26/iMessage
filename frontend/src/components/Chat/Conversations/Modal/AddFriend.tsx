import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { Button, ModalBody, Stack, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import UserSearchList from "./UserSearchList";
import toast from "react-hot-toast";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import userOperations from "../../../../graphql/operations/user";
import {
  AcceptFriendRequestData,
  DeclineFriendRequestData,
  SearchUsersData,
  SearchUsersVariables,
  SearchedUser,
} from "../../../../util/types";

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

  /**
   * Subscriptions
   */
  useSubscription<AcceptFriendRequestData>(
    userOperations.Subscriptions.acceptFriendRequest,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          acceptFriendRequest: {
            senderId,
            receiverId,
            id: acceptedFriendRequestId,
          },
        } = subscriptionData;

        const existing = client.readQuery<
          SearchUsersData,
          SearchUsersVariables
        >({
          query: userOperations.Queries.searchUsers,
          variables: { username },
        });

        if (!existing) return;

        const { searchUsers } = existing;

        client.writeQuery<SearchUsersData, SearchUsersVariables>({
          query: userOperations.Queries.searchUsers,
          variables: { username },
          data: {
            searchUsers: searchUsers.map((request) => {
              if (request.id === acceptedFriendRequestId) {
                request.friendshipStatus === "ACCEPTED";
              }
              return request;
            }),
          },
        });
      },
    }
  );

  useSubscription<DeclineFriendRequestData>(
    userOperations.Subscriptions.acceptFriendRequest,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          declineFriendRequest: {
            senderId,
            receiverId,
            id: acceptedFriendRequestId,
          },
        } = subscriptionData;

        const existing = client.readQuery<
          SearchUsersData,
          SearchUsersVariables
        >({
          query: userOperations.Queries.searchUsers,
          variables: { username },
        });

        if (!existing) return;

        const { searchUsers } = existing;

        client.writeQuery<SearchUsersData, SearchUsersVariables>({
          query: userOperations.Queries.searchUsers,
          variables: { username },
          data: {
            searchUsers: searchUsers.map((request) => {
              if (request.id === acceptedFriendRequestId) {
                request.friendshipStatus === "DECLINED";
              }
              return request;
            }),
          },
        });
      },
    }
  );

  const [
    sendFriendRequest,
    { error, data, loading: sendFriendRequestLoading },
  ] = useMutation<{ sendFriendRequest: boolean }, { userId: string }>(
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

          const updatedUsers = users.map((user) => {
            if (user.id === receiverId) {
              user.friendshipStatus === "PENDING";
            }
            return user;
          });

          console.log("searchUsers", searchUsers);

          cache.writeQuery<SearchUsersData>({
            query: userOperations.Queries.searchUsers,
            variables: { username },
            data: {
              searchUsers: updatedUsers,
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
