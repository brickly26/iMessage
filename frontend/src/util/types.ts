export interface Session {
  user: User;
}

export interface User {
  id: string;
  username: string;
}

/**
 * Prisma validator for conversation and participants
 */

/**
 * USER TYPES
 */

export interface LoginData {
  login: {
    id: string;
    username: string;
  };
}

export interface LoginVariables {
  username: string;
  password: string;
}

export interface RegisterData {
  register: {
    id: string;
    username: string;
  };
}

export interface RegisterVariables {
  username: string;
  password: string;
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

export interface ParticipantPopulated {
  user: {
    id: string;
    username: string;
  };
  hasSeenLatestMessage: boolean;
}

// export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
//   include: typeof participantPopulated;
// }>;

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

export interface ConversationPopulated {
  id: string;
  participants: Array<ParticipantPopulated>;
  latestMessage: {
    include: MessagePopulated;
  };
  updatedAt: Date;
}

/**
 * Messages
 */

export interface MessagePopulated {
  id: string;
  sender: {
    id: string;
    username: string;
    friendshipStatus: string;
  };
  body: string;
  createdAt: Date;
}

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
