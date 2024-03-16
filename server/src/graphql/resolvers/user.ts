import { GraphQLError } from "graphql";
import { CreateUsernameResponse, GraphQLContext } from "../../util/types";
import { $Enums, Prisma, PrismaClient, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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

        const requestHash: Record<string, boolean> = sentRequests.reduce(
          (user: Record<string, boolean>, request) => {
            user[request.recieverId] = true;
            return user;
          },
          {}
        );

        const users = searchedUsers.map((user) => ({
          ...user,
          canSendRequest: !requestHash[user.id],
        }));

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
            receivedRequests: true,
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

        const alreadyRecievedRequestFromUser = sender?.receivedRequests.find(
          (request) => request.senderId === senderId
        );

        if (alreadyRecievedRequestFromUser) {
          // Add friend to both users and update friend request status to accepted
          await prisma.$transaction([
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
            }),
          ]);
          return true;
        }

        await prisma.friendRequest.create({
          data: {
            senderId,
            recieverId: userId,
            status: "PENDING",
          },
        });

        // Publish friend request user real-time

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
      const { session, prisma } = context;
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

          // pubsub send out that we accepted friend request
        }

        await prisma.$transaction(prismaTransactionArray);

        return true;
      } catch (error: any) {
        console.log("sendFriendRequest error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
};

export default resolvers;
