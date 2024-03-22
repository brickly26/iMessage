import { GraphQLError } from "graphql";
import {
  CreateUsernameResponse,
  FriendRequestPopulated,
  FriendRequestSentSubscriptionPayload,
  GraphQLContext,
} from "../../util/types";
import { $Enums, Prisma, PrismaClient, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<Array<User>> => {
      const { username: searchedUsername } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { username: myUsername, id: userId },
      } = session;

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
            recieverId: {
              in: searchedUsers.map((user) => user.id),
            },
          },
        });

        const requestHash: Record<string, string> = sentRequests.reduce(
          (user: Record<string, string>, request) => {
            user[request.recieverId] = request.status;
            return user;
          },
          {}
        );

        console.log(requestHash);

        const users = searchedUsers.map((user) => ({
          ...user,
          friendshipStatus: requestHash[user.id]
            ? requestHash[user.id]
            : "SENDABLE",
        }));

        console.log(users);

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
      const { prisma, session } = context;
      const { username } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { username: myUsername, id: userId },
      } = session;

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
      const { prisma, session } = context;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          include: {
            recievedRequests: {
              select: friendRequestPopulated,
            },
          },
        });

        // Shouldnt happend but still
        if (!user) {
          throw new GraphQLError("User doesnt exits");
        }

        return user?.recievedRequests;
      } catch (error: any) {
        console.log("searchFriends Error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return {
          error: "Not authorized",
        };
      }

      const { id: userId } = session.user;

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
      const { session, prisma, pubsub } = context;
      const { userId } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: senderId },
      } = session;

      try {
        const sender = await prisma.user.findUnique({
          where: {
            id: senderId,
          },
          include: {
            sentRequests: true,
            recievedRequests: true,
            friends: true,
          },
        });

        const alreadyFriends = sender?.friends.find(
          (friend) => friend.id === userId
        );

        if (alreadyFriends) {
          throw new GraphQLError("You're already friends with this user");
        }

        const alreadySent = sender?.sentRequests.find(
          (request) => request.recieverId === userId
        );

        if (alreadySent) {
          throw new GraphQLError("You've already sent this user a request");
        }

        const alreadyRecievedRequestFromUser = sender?.recievedRequests.find(
          (request) => request.senderId === senderId
        );

        if (alreadyRecievedRequestFromUser) {
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
                id: alreadyRecievedRequestFromUser.id,
              },
              data: {
                status: "ACCEPTED",
              },
              include: {
                sender: true,
              },
            }),
          ]);

          pubsub.publish("SEND_FRIEND_REQUEST", {
            friendRequestSent: friendRequest,
          });

          console.log(friendRequest);

          return true;
        }

        const friendRequest = await prisma.friendRequest.create({
          data: {
            senderId,
            recieverId: userId,
            status: "PENDING",
          },
        });

        console.log(friendRequest);

        // Publish friend request user real-time
        pubsub.publish("SEND_FRIEND_REQUEST", {
          friendRequestSent: friendRequest,
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
      const { session, prisma, pubsub } = context;
      const { requestId, choice } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            senderId: requestId,
            recieverId: userId,
          },
        });

        // should always exist but just in case
        if (!friendRequest || friendRequest.status !== "PENDING") {
          throw new GraphQLError("Friend request doenst exist");
        }

        if (choice !== "ACCEPTED" && choice !== "DECLINED") {
          throw new GraphQLError("invalid choice");
        }

        const prismaTransactionArray: Array<any> = [
          prisma.friendRequest.update({
            where: {
              id: friendRequest.id,
            },
            data: {
              status: choice,
            },
          }),
        ];

        if (choice === "ACCEPTED") {
          // Add user to our friendslist
          prismaTransactionArray.push(
            prisma.user.update({
              where: {
                id: userId,
              },
              data: {
                friends: {
                  connect: {
                    id: requestId,
                  },
                },
                friendsWith: {
                  connect: {
                    id: requestId,
                  },
                },
              },
            })
          );

          // Add us to requesters friends list
          prismaTransactionArray.push(
            prisma.user.update({
              where: {
                id: requestId,
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
            })
          );
        }

        await prisma.$transaction(prismaTransactionArray);

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
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["SEND_FRIEND_REQUEST"]);
        },
        (
          payload: FriendRequestSentSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          const { session } = context;

          if (!session?.user) {
            throw new GraphQLError("Not Authorized");
          }

          const { id: userId } = session.user;
          const { senderId, recieverId } = payload.friendRequestSent;

          return userId === senderId || userId === recieverId;
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
    recieverId: true,
    sender: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
  });

export default resolvers;
