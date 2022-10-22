import { gql } from '@apollo/client';

export default {
  Queries: {},
  Mutations: {
    createUserName: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `
  },
  Subscriptions: {},
}