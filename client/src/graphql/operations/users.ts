import { gql } from "@apollo/client";

export default {
  Queries: {
    searchUsers: gql`
      query SearchUsers($username: String!) {
        searchUser(username: $username) {
          id
          username
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
  },
  Subscriptions: {},
};
