import { GraphQLError } from "graphql";
import {
  CreateUsernameResponse,
  GraphQLContext,
  SendFriendRequestResponse,
} from "../../util/types";
import { User } from "@prisma/client";

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
        user: { username: myUsername },
      } = session;

      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: searchedUsername,
              not: myUsername,
              mode: "insensitive",
            },
          },
        });

        return users;
      } catch (error: any) {
        console.log("searchUsers Error", error);
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
  },
};

export default resolvers;
