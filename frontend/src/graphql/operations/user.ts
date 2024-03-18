import { gql } from "@apollo/client";

const userOperations = {
  Queries: {
    searchUsers: gql`
      query SearchUsers($username: String!) {
        searchUsers(username: $username) {
          id
          username
          image
          friendshipStatus
        }
      }
    `,
  },
  Mutation: {
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `,
    sendFriendRequest: gql`
      mutation sendFriendRequest($userId: String!) {
        sendFriendRequest(userId: $userId)
      }
    `,
  },
  Subscriptions: {},
};

export default userOperations;
