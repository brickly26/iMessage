import { gql } from "@apollo/client";

const friendRequestFields = `
  id
  status
  receiverId
  sender {
    id
    username
  }
`;

const userOperations = {
  Queries: {
    searchUsers: gql`
      query SearchUsers($username: String!) {
        searchUsers(username: $username) {
          id
          username
          friendshipStatus
        }
      }
    `,
    searchFriends: gql`
      query SearchFriends($username: String!) {
        searchFriends(username: $username) {
          id
          username
        }
      }
    `,
    friendRequests: gql`
      query FriendRequests {
        friendRequests {
          ${friendRequestFields}
        }
      }
    `,
  },
  Mutation: {
    login: gql`
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          id
          username
        }
      }
    `,
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `,
    sendFriendRequest: gql`
      mutation SendFriendRequest($userId: String!) {
        sendFriendRequest(userId: $userId)
      }
    `,
    handleFriendRequest: gql`
      mutation HandleFriendRequest($requestId: String!, $choice: String!) {
        handleFriendRequest(requestId: $requestId, choice: $choice)
      }
    `,
  },
  Subscriptions: {
    sendFriendRequest: gql`
      subscription SendFriendRequets {
        sendFriendRequest {
          ${friendRequestFields}
        }
      }
    `,
    acceptFriendRequest: gql`
      subscription AcceptFriendRequets {
        acceptFriendRequest {
          ${friendRequestFields}
        }
      }
    `,
    declineFriendRequest: gql`
      subscription DeclineFriendRequets {
        declineFriendRequest {
          ${friendRequestFields}
        }
      }
    `,
  },
};

export default userOperations;
