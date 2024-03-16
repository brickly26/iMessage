import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: String
    username: String
    image: String
    canSendRequest: Boolean
  }

  # type FriendRequest {
  #   id: String
  #   status: String
  # }

  type SearchedFriend {
    id: String
    username: String
    image: String
  }

  type Query {
    searchUsers(username: String): [User]
  }

  type Query {
    searchFriends(username: String): [SearchedFriend]
  }

  type Query {
    friendRequests: [User]
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
`;

export default typeDefs;
