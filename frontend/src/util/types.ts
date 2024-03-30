import { Prisma } from "@prisma/client";
import { ISODateString } from "next-auth";

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
      image: true,
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
  image: string;
  friendshipStatus: string;
}

export interface SearchedFriend {
  id: string;
  username: string;
  image: string;
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
    image: string;
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
export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface ConversationsData {
  conversations: Array<ConversationPopulated>;
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
    image: string;
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
