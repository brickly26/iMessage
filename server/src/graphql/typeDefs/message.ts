import { gql } from "graphql-tag";

const typeDefs = gql`
  type MessageUser {
    id: String
    username: String
    image: String
    friendshipStatus: String
  }
  type Message {
    id: String
    sender: MessageUser
    body: String
    createdAt: Date
  }

  type Query {
    messages(conversationId: String): [Message]
  }

  type Mutation {
    sendMessage(
      id: String
      conversationId: String
      senderId: String
      body: String
    ): Boolean
  }

  type Subscription {
    messageSent(conversationId: String): Message
  }
`;

export default typeDefs;
