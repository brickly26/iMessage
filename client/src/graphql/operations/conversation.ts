import { gql } from "@apollo/client";

export default {
  Queries: {},
  Mutation: {
    createConversation: gql`
      mutation createConversation($participantIds: [String]!) {
        createConversation(participantIds: $participantIds) {
          conversationId: String
        }
      }
    `,
  },
  Subscription: {},
};
