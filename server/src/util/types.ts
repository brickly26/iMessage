import { Prisma, PrismaClient } from "@prisma/client";
import { ISODateString } from "next-auth";
import {
  conversationPopulated,
  messagePopulated,
  participantPopulated,
} from "../graphql/resolvers/conversations";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";
import { friendRequestPopulated } from "../graphql/resolvers/user";

/**
 * Server Configuration
 */

export interface GraphQLContext {
  session: Session | null;
  prisma: PrismaClient;
  pubsub: PubSub;
}

export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
  };
}

export interface Session {
  user?: User;
  expires: ISODateString;
}

/**
 * Users
 */

export interface User {
  id: string;
  username: string;
  email: string;
  canSendRequest?: boolean;
}

export interface Friend {
  id: string;
  username: string;
  email: string;
}

export interface CreateUsernameResponse {
  success?: boolean;
  error?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
}

export type FriendRequestPopulated = Prisma.FriendRequestGetPayload<{
  select: typeof friendRequestPopulated;
}>;

export interface SendFriendRequestSubscriptionPayload {
  sendFriendRequest: FriendRequestPopulated;
}

export interface AcceptFriendRequestSubscriptionPayload {
  acceptFriendRequest: FriendRequestPopulated;
}

export interface DeclineFriendRequestSubscriptionPayload {
  declineFriendRequest: FriendRequestPopulated;
}

/**
 * Conversations
 */

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type participantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export interface ConversationUpdatedSubscriptionPayload {
  conversationUpdated: {
    conversation: ConversationPopulated;
    addedUserIds: Array<string>;
    removedUserIds: Array<string>;
  };
}

export interface ConversationDeletedSubscriptionPayload {
  conversationDeleted: ConversationPopulated;
}

/**
 * Messages
 */

export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;

export interface SendMessageArguements {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
