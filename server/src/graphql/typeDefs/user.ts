import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: String
    username: String
    friendshipStatus: String
  }

  type FriendRequest {
    id: String
    senderId: String
    receiverId: String
    status: String
    sender: User
  }

  type SearchedFriend {
    id: String
    username: String
  }

  type Query {
    searchUsers(username: String): [User]
  }

  type Query {
    searchFriends(username: String): [SearchedFriend]
  }

  type Query {
    friendRequests: [FriendRequest]
  }

  type Mutation {
    register(username: String!, password: String!): User
  }

  type Mutation {
    login(username: String!, password: String!): Boolean
  }

  type Mutation {
    createUsername(username: String): CreateUsernameResponse
  }

  type Mutation {
    sendFriendRequest(userId: String!): Boolean
  }

  type Mutation {
    handleFriendRequest(requestId: String!, choice: String!): Boolean
  }

  type Mutation {
    declineFriendRequest(requestId: String!): Boolean
  }

  type CreateUsernameResponse {
    success: Boolean
    error: String
  }

  type Subscription {
    sendFriendRequest: FriendRequest
  }

  type Subscription {
    acceptFriendRequest: FriendRequest
  }

  type Subscription {
    declineFriendRequest: FriendRequest
  }
`;

export default typeDefs;
