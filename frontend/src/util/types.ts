import { Prisma, PrismaClient } from "@prisma/client";
import { ISODateString } from "next-auth";

import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";
import { friendRequestPopulated } from "../graphql/resolvers/user";

/**
 * Prisma validator for conversation and participants
 */

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: messagePopulated,
    },
  });

/**
 * USER TYPES
 */

export interface CreateUsernameData {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUsernameVariables {
  username: string;
}

export interface SearchUsersData {
  searchUsers: Array<SearchedUser>;
}

export interface SearchUsersVariables {
  username: string;
}

export interface SearchFriendsData {
  searchFriends: Array<SearchedFriend>;
}

export interface SearchFriendsVariables {
  username: string;
}

export interface SearchedUser {
  id: string;
  username: string;
  friendshipStatus: string;
}

export interface SearchedFriend {
  id: string;
  username: string;
}

export interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    username: string;
  };
}

export interface FriendRequestsData {
  friendRequests: Array<FriendRequest>;
}

export interface SendFriendRequestData {
  sendFriendRequest: FriendRequest;
}

export interface AcceptFriendRequestData {
  acceptFriendRequest: FriendRequest;
}

export interface DeclineFriendRequestData {
  declineFriendRequest: FriendRequest;
}

export interface AcceptFriendRequestSubscriptionData {
  subscriptionData: {
    data: {
      acceptFriendRequest: FriendRequest;
    };
  };
}

export interface DeclineFriendRequestSubscriptionData {
  subscriptionData: {
    data: {
      declineFriendRequest: FriendRequest;
    };
  };
}

/**
 * CONVERSATION TYPES
 */

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface ConversationsData {
  conversations: Array<ConversationPopulated>;
}

export interface ConversationData {
  conversation: {
    id: string;
    participants: Array<{
      user: {
        id: string;
        username: string;
        friendshipStatus: string;
      };
    }>;
  };
}

export interface CreateConversationData {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationVariables {
  participantIds: Array<string>;
}

export interface ConversationUpdatedData {
  conversationUpdated: {
    // conversation: Omit<
    //   ConversationPopulated,
    //   "latestMessage" & {
    //     latestMessage: MessagePopulated;
    //   }
    // >;
    conversation: ConversationPopulated;
    addedUserIds: Array<string> | null;
    removedUserIds: Array<string> | null;
  };
}

export interface ConversationDeletedData {
  conversationDeleted: {
    id: string;
  };
}

/**
 * Messages
 */

export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;

export interface MessageIsFriend {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    friendshipStatus: string;
  };
}

export interface MessagesData {
  messages: Array<MessageIsFriend>;
}

export interface MessagesVariables {
  conversationId: string;
}

export interface SendMessageData {
  sendMessage: boolean;
}

export interface SendMessageVariables {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}

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
  canSendRequest: boolean;
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

export interface SendMessageArguements {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
