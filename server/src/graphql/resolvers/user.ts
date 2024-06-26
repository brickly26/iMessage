import { Prisma, User } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import {
  AcceptFriendRequestSubscriptionPayload,
  CreateUsernameResponse,
  DeclineFriendRequestSubscriptionPayload,
  FriendRequestPopulated,
  GraphQLContext,
  GraphQLWSContext,
  SendFriendRequestSubscriptionPayload,
} from "../../utils/types";
import bcrypt from "bcrypt";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<Array<User>> => {
      const { username: searchedUsername } = args;
      const { req, prisma } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId, username: myUsername } = req.session;

      try {
        const searchedUsers = await prisma.user.findMany({
          where: {
            username: {
              contains: searchedUsername,
              not: myUsername,
              mode: "insensitive",
            },
          },
        });

        const sentRequests = await prisma.friendRequest.findMany({
          where: {
            senderId: userId,
            receiverId: {
              in: searchedUsers.map((user) => user.id),
            },
          },
        });

        console.log("sentRequests", sentRequests);

        const receivedRequests = await prisma.friendRequest.findMany({
          where: {
            receiverId: userId,
            senderId: {
              in: searchedUsers.map((user) => user.id),
            },
          },
        });

        console.log("receivedRequests", receivedRequests);

        const requestHash: Record<string, string> = sentRequests.reduce(
          (user: Record<string, string>, request) => {
            user[request.receiverId] = request.status;
            return user;
          },
          {}
        );

        receivedRequests.forEach((request) => {
          requestHash[request.senderId] =
            request.status !== "ACCEPTED" ? "SENDABLE" : "ACCEPTED";
        });

        console.log("requesthash", requestHash);

        const users = searchedUsers.map((user) => ({
          ...user,
          friendshipStatus: requestHash[user.id]
            ? requestHash[user.id]
            : "SENDABLE",
        }));

        console.log("users", users);

        return users;
      } catch (error: any) {
        console.log("searchUsers Error", error);
        throw new GraphQLError(error?.message);
      }
    },
    searchFriends: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<Array<User>> => {
      const { prisma, req } = context;
      const { username } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId, username: myUsername } = req.session;

      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: username,
              not: myUsername,
              mode: "insensitive",
            },
            friendIds: {
              has: userId,
            },
          },
        });

        return users;
      } catch (error: any) {
        console.log("searchFriends Error", error);
        throw new GraphQLError(error?.message);
      }
    },
    friendRequests: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<Array<FriendRequestPopulated>> => {
      const { prisma, req } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            receivedRequests: {
              select: friendRequestPopulated,
            },
          },
        });

        // Shouldnt happend but still
        if (!user) {
          throw new GraphQLError("User doesnt exits");
        }

        console.log(user.receivedRequests);

        const friendRequestList = user.receivedRequests.filter(
          (request) => request.status === "PENDING"
        );

        return friendRequestList;
      } catch (error: any) {
        console.log("searchFriends Error", error);
        throw new GraphQLError(error?.message);
      }
    },
    me: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<User | null> => {
      const { prisma, req } = context;

      console.log(req.session);

      if (!req?.session.userId) {
        return null;
      }

      console.log(req.session.userId);

      try {
        const user = await prisma.user.findFirst({
          where: {
            id: req.session.userId,
          },
        });

        return user;
      } catch (error: any) {
        console.log("searchFriends Error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    register: async (
      _: any,
      args: { username: string; password: string },
      context: GraphQLContext
    ): Promise<User & { conversationId: string }> => {
      const { username, password } = args;
      const { prisma, req } = context;

      if (!req) {
        throw new GraphQLError("req doesnt exist");
      }

      if (username.length <= 3) {
        throw new GraphQLError("Username too short.");
      }

      if (password.length < 8) {
        throw new GraphQLError("Password must be at least 8 characters");
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUser) {
          throw new GraphQLError("Username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });

        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: [
                  { userId: user.id, hasSeenLatestMessage: true },
                  {
                    userId: process.env.DEV_ID as string,
                    hasSeenLatestMessage: true,
                  },
                ],
              },
            },
            messages: {
              create: {
                senderId: process.env.DEV_ID as string,
                body: "Welcome! Thanks for checking out my project",
              },
            },
          },
        });

        await prisma.message.create({
          data: {
            senderId: process.env.DEV_ID as string,
            body: "You can start by sending someone a friend request",
            conversationId: conversation.id,
          },
        });

        req.session.userId = user.id;
        req.session.username = user.username;

        return { ...user, conversationId: conversation.id };
      } catch (error: any) {
        console.log("register error", error);
        throw new GraphQLError(error?.message);
      }
    },
    login: async (
      _: any,
      args: { username: string; password: string },
      context: GraphQLContext
    ): Promise<User> => {
      const { username, password } = args;
      const { prisma, req } = context;

      if (!req) {
        throw new GraphQLError("req doesnt exist");
      }

      try {
        const user = await prisma.user.findFirst({
          where: {
            username,
          },
        });

        if (!user) {
          throw new GraphQLError("Invaild credentials");
        }

        const passwordIsCorrect = await bcrypt.compare(password, user.password);

        if (!passwordIsCorrect) {
          throw new GraphQLError("Invaild credentials");
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        return user;
      } catch (error: any) {
        console.log("register error", error);
        throw new GraphQLError(error?.message);
      }
    },
    signOut: async (
      _: any,
      __: any,
      context: GraphQLContext
    ): Promise<boolean> => {
      const { req, res } = context;

      if (!req.session.userId) {
        throw new GraphQLError("session doesnt exist");
      }

      return new Promise((resolve) =>
        req.session.destroy((err) => {
          res.clearCookie("auth");
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }

          resolve(true);
        })
      );
    },
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { req, prisma } = context;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        // Check to see if username is not taken
        const existingUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUser) {
          return {
            error: "Username already taken. Try another",
          };
        }

        // Update user to have username
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            username,
          },
        });

        return { success: true };
      } catch (error: any) {
        console.log("createUsername error", error);
        return {
          error: error?.message,
        };
      }
    },
    sendFriendRequest: async (
      _: any,
      args: { userId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { req, prisma, pubsub } = context;
      const { userId } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId: senderId } = req.session;

      try {
        const alreadyreceivedRequestFromUser =
          await prisma.friendRequest.findFirst({
            where: {
              senderId: userId,
              receiverId: senderId,
            },
          });

        if (alreadyreceivedRequestFromUser?.status === "ACCEPTED") {
          throw new GraphQLError("You're already friends with this user");
        }

        if (alreadyreceivedRequestFromUser) {
          // Add friend to both users and update friend request status to accepted
          const [_, __, friendRequest] = await prisma.$transaction([
            prisma.user.update({
              where: {
                id: senderId,
              },
              data: {
                friends: {
                  connect: {
                    id: userId,
                  },
                },
                friendsWith: {
                  connect: {
                    id: userId,
                  },
                },
              },
            }),
            prisma.user.update({
              where: {
                id: userId,
              },
              data: {
                friends: {
                  connect: {
                    id: senderId,
                  },
                },
                friendsWith: {
                  connect: {
                    id: senderId,
                  },
                },
              },
            }),
            prisma.friendRequest.update({
              where: {
                id: alreadyreceivedRequestFromUser.id,
              },
              data: {
                status: "ACCEPTED",
              },
              include: {
                sender: true,
              },
            }),
          ]);

          pubsub.publish("ACCEPT_FRIEND_REQUEST", {
            acceptFriendRequest: friendRequest,
          });

          console.log(friendRequest);

          return true;
        }

        const friendRequest = await prisma.friendRequest.create({
          data: {
            senderId,
            receiverId: userId,
            status: "PENDING",
          },
          include: {
            sender: true,
          },
        });

        console.log(friendRequest);

        // Publish friend request user real-time
        pubsub.publish("SEND_FRIEND_REQUEST", {
          sendFriendRequest: friendRequest,
        });

        return true;
      } catch (error: any) {
        console.log("sendFriendRequest error", error);
        throw new GraphQLError(error?.message);
      }
    },
    handleFriendRequest: async (
      _: any,
      args: { requestId: string; choice: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { req, prisma, pubsub } = context;
      const { requestId, choice } = args;

      if (!req.session?.userId) {
        throw new GraphQLError("Not authorized");
      }

      const { userId } = req.session;

      try {
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            id: requestId,
          },
        });

        // should always exist but just in case
        if (!friendRequest || friendRequest.status !== "PENDING") {
          throw new GraphQLError("Friend request doenst exist");
        }

        if (choice !== "ACCEPTED" && choice !== "DECLINED") {
          throw new GraphQLError("invalid choice");
        }

        if (choice === "ACCEPTED") {
          const updatedFriendRequest = await prisma.friendRequest.update({
            where: {
              id: friendRequest.id,
            },
            data: {
              status: choice,
            },
            include: {
              sender: true,
            },
          });

          // Add user to our friendslist
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              friends: {
                connect: {
                  id: friendRequest.senderId,
                },
              },
              friendsWith: {
                connect: {
                  id: friendRequest.senderId,
                },
              },
            },
          });

          // Add us to requesters friends list
          await prisma.user.update({
            where: {
              id: friendRequest.senderId,
            },
            data: {
              friends: {
                connect: [
                  {
                    id: userId,
                  },
                ],
              },
              friendsWith: {
                connect: [
                  {
                    id: userId,
                  },
                ],
              },
            },
          });

          pubsub.publish("ACCEPT_FRIEND_REQUEST", {
            acceptFriendRequest: updatedFriendRequest,
          });
        } else {
          const updatedFriendRequest = await prisma.friendRequest.update({
            where: {
              id: friendRequest.id,
            },
            data: {
              status: choice,
            },
            include: {
              sender: true,
            },
          });

          pubsub.publish("DECLINE_FRIEND_REQUEST", {
            declineFriendRequest: updatedFriendRequest,
          });
        }

        return true;
      } catch (error: any) {
        console.log("sendFriendRequest error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Subscription: {
    sendFriendRequest: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["SEND_FRIEND_REQUEST"]);
        },
        (
          payload: SendFriendRequestSubscriptionPayload,
          _: any,
          context: GraphQLWSContext
        ) => {
          const { session } = context;

          if (!session?.userId) {
            throw new GraphQLError("Not Authorized");
          }

          const { userId } = session;
          const { senderId, receiverId } = payload.sendFriendRequest;

          return userId === senderId || userId === receiverId;
        }
      ),
    },
    acceptFriendRequest: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["ACCEPT_FRIEND_REQUEST"]);
        },
        (
          payload: AcceptFriendRequestSubscriptionPayload,
          _: any,
          context: GraphQLWSContext
        ) => {
          const { session } = context;

          if (!session?.userId) {
            console.log(session);
            throw new GraphQLError("Not Authorized");
          }
          const { userId } = session;
          const { senderId, receiverId } = payload.acceptFriendRequest;
          return userId === senderId || userId === receiverId;
        }
      ),
    },
    declineFriendRequest: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLWSContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["DECLINE_FRIEND_REQUEST"]);
        },
        (
          payload: DeclineFriendRequestSubscriptionPayload,
          _: any,
          context: GraphQLWSContext
        ) => {
          const { session } = context;
          if (!session?.userId) {
            throw new GraphQLError("Not Authorized");
          }
          const { userId } = session;
          const { senderId, receiverId } = payload.declineFriendRequest;
          return userId === senderId || userId === receiverId;
        }
      ),
    },
  },
};

export const friendRequestPopulated =
  Prisma.validator<Prisma.FriendRequestSelect>()({
    status: true,
    id: true,
    senderId: true,
    receiverId: true,
    createdAt: true,
    sender: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export default resolvers;
