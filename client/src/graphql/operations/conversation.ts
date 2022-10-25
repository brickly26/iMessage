import { gql } from "@apollo/client";

export default {
  Queries: {},
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantId: [String]!) {
        createConversation(participantId: $participantId) {
          conversationId
        }
      }
    `
  },
  Subscriptions: {}
}