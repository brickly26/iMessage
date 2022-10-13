import { gql } from '@apollo/client';

export default {
  Queries: {},
  Mutation: {
    createUserName: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `
  },
  Subscription: {},
}