import { gql } from "@apollo/client";
import { MessageFields } from "./message";

const ConversationFields = `
    id
    participants {
      user {
        id
        username
        image
      }
      hasSeenLatestMessage
    }
    latestMessage {
      ${MessageFields}
    }
    updatedAt
`;

const conversationOperations = {
  Queries: {
    conversation: gql`
      query Conversation($conversationId: String!) {
        conversation(conversationId: $conversationId) {
          id
          participants {
            user {
              id
              username
              image
              friendshipStatus
            }
          }
        }
      }
    `,
    conversations: gql`
      query Conversations {
        conversations {
          ${ConversationFields}
        }
      }
    `,
  },
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantIds: [String]!) {
        createConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $userId: String!
        $conversationId: String!
      ) {
        markConversationAsRead(userId: $userId, conversationId: $conversationId)
      }
    `,
    deleteConversation: gql`
      mutation DeleteConversation($conversationId: String!) {
        deleteConversation(conversationId: $conversationId)
      }
    `,
    updateParticipants: gql`
      mutation UpdatedParticipants(
        $conversationId: String!
        $participantIds: [String]!
      ) {
        updateParticipants(
          conversationId: $conversationId
          participantIds: $participantIds
        )
      }
    `,
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${ConversationFields}
        }
      }
    `,
    conversationUpdated: gql`
      subscription ConversationUpdated {
        conversationUpdated {
          conversation {
            ${ConversationFields}
          }
          addedUserIds
          removedUserIds
        }
      }
    `,
    conversationDeleted: gql`
      subscription ConversationDeleted {
        conversationDeleted {
          id
        }
      }
    `,
  },
};

export default conversationOperations;
