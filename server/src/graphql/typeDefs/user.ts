import { gql } from "apollo-server-core";

const typeDefs = gql`
  type SearchedUser {
    id: String
    username: String
  }

  type CreateUsernameResponse {
    success: Boolean
    error: String
  }

  type Query {
    searchUsers(username: String): [SearchedUser]
  }

  type Mutation {
    createUsername(username: String): CreateUsernameResponse
  }
`;

export default typeDefs;
