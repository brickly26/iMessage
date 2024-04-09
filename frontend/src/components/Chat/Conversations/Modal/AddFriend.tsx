import { useLazyQuery, useMutation, useSubscription } from "@apollo/client";
import { Button, ModalBody, Stack, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import UserSearchList from "./UserSearchList";
import toast from "react-hot-toast";

import { useRouter } from "next/router";
import userOperations from "../../../../graphql/operations/user";
import {
  AcceptFriendRequestData,
  AcceptFriendRequestSubscriptionData,
  DeclineFriendRequestData,
  DeclineFriendRequestSubscriptionData,
  SearchUsersData,
  SearchUsersVariables,
  SearchedUser,
  User,
} from "../../../../util/types";

interface AddFriendProps {
  user: User;
}

const AddFriend: React.FC<AddFriendProps> = ({ user }) => {
  const [username, setUsername] = useState("");

  const { id: userId } = user;

  const router = useRouter();

  const [
    searchUsers,
    {
      data: searchedUsersData,
      loading: searchedUsersLoading,
      error: searchedUsersError,
      subscribeToMore,
    },
  ] = useLazyQuery<SearchUsersData, SearchUsersVariables>(
    userOperations.Queries.searchUsers
  );

  /**
   * Subscriptions
   */

  const subscribeToMoreAcceptFriendRequest = (username: string) => {
    return subscribeToMore({
      document: userOperations.Subscriptions.acceptFriendRequest,
      variables: {
        username,
      },
      updateQuery: (
        prev,
        { subscriptionData }: AcceptFriendRequestSubscriptionData
      ) => {
        if (!subscriptionData) return prev;

        const { id: acceptedFriendReqeustId, sender } =
          subscriptionData.data.acceptFriendRequest;

        return sender.id === userId
          ? prev
          : {
              ...prev,
              searchUsers: prev.searchUsers.map((request) => {
                if (request.id === acceptedFriendReqeustId) {
                  request.friendshipStatus = "ACCEPTED";
                }
                return request;
              }),
            };
      },
    });
  };

  // useSubscription<AcceptFriendRequestData>(
  //   userOperations.Subscriptions.acceptFriendRequest,
  //   {
  //     onData: ({ client, data }) => {
  //       const { data: subscriptionData } = data;

  //       if (!subscriptionData) return;

  //       const {
  //         acceptFriendRequest: {
  //           senderId,
  //           receiverId,
  //           id: acceptedFriendRequestId,
  //         },
  //       } = subscriptionData;

  //       const existing = client.readQuery<
  //         SearchUsersData,
  //         SearchUsersVariables
  //       >({
  //         query: userOperations.Queries.searchUsers,
  //         variables: { username },
  //       });

  //       if (!existing) return;

  //       const { searchUsers } = existing;

  //       client.writeQuery<SearchUsersData, SearchUsersVariables>({
  //         query: userOperations.Queries.searchUsers,
  //         variables: { username },
  //         data: {
  //           searchUsers: searchUsers.map((request) => {
  //             if (request.id === acceptedFriendRequestId) {
  //               request.friendshipStatus = "ACCEPTED";
  //             }
  //             return request;
  //           }),
  //         },
  //       });
  //     },
  //   }
  // );

  const subscribeToMoreDeclineFriendRequest = (username: string) => {
    return subscribeToMore({
      document: userOperations.Subscriptions.declineFriendRequest,
      variables: {
        username,
      },
      updateQuery: (
        prev,
        { subscriptionData }: DeclineFriendRequestSubscriptionData
      ) => {
        if (!subscriptionData) return prev;

        const { id: declinedFriendReqeustId, sender } =
          subscriptionData.data.declineFriendRequest;

        return sender.id === userId
          ? prev
          : {
              ...prev,
              searchUsers: prev.searchUsers.map((request) => {
                if (request.id === declinedFriendReqeustId) {
                  request.friendshipStatus = "DECLINED";
                }
                return request;
              }),
            };
      },
    });
  };

  // useSubscription<DeclineFriendRequestData>(
  //   userOperations.Subscriptions.declineFriendRequest,
  //   {
  //     onData: ({ client, data }) => {
  //       const { data: subscriptionData } = data;

  //       if (!subscriptionData) return;

  //       const {
  //         declineFriendRequest: {
  //           senderId,
  //           receiverId,
  //           id: declinedFriendRequestId,
  //         },
  //       } = subscriptionData;

  //       const existing = client.readQuery<
  //         SearchUsersData,
  //         SearchUsersVariables
  //       >({
  //         query: userOperations.Queries.searchUsers,
  //         variables: { username },
  //       });

  //       if (!existing) return;

  //       const { searchUsers } = existing;

  //       client.writeQuery<SearchUsersData, SearchUsersVariables>({
  //         query: userOperations.Queries.searchUsers,
  //         variables: { username },
  //         data: {
  //           searchUsers: searchUsers.map((request) => {
  //             if (request.id === declinedFriendRequestId) {
  //               request.friendshipStatus = "DECLINED";
  //             }
  //             return request;
  //           }),
  //         },
  //       });
  //     },
  //   }
  // );

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
              user.friendshipStatus = "PENDING";
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

  useEffect(() => {
    subscribeToMoreAcceptFriendRequest(username);
    subscribeToMoreDeclineFriendRequest(username);
  }, [username]);

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
