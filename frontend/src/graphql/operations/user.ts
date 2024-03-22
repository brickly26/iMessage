import { gql } from "@apollo/client";

const friendRequestFields = `
  id
  status
  receiverId
  sender {
    id
    username
    image
  }
`;

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
    friendRequests: gql`
      query friendRequests {
        friendRequest {
          ${friendRequestFields}
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
      mutation SendFriendRequest($userId: String!) {
        sendFriendRequest(userId: $userId)
      }
    `,
  },
  Subscriptions: {
    sendFriendRequest: gql`
      subscription SendFriendRequets {
        friendRequestSent {
          id
          senderId
          recieverId
          status
        }
      }
    `,
  },
};

export default userOperations;
