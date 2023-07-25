import { gql } from "apollo-server-core";

const typeDefs = gql`
  type User {
    id: String
    username: String
  }

  type CreateUsernameResponse {
    success: Boolean
    error: String
  }

  type Query {
    searchUsers(username: String): [User]
  }

  type Mutation {
    createUsername(username: String): CreateUsernameResponse
  }
`;

export default typeDefs;
