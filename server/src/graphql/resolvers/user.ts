import { CreateUsernameResponse, GrapghQLContext } from "../../util/types";

const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GrapghQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return {
          error: 'Not authorized'
        }
      }

      const { id: userId } = session.user;

      try {
        // Check that username is not taken
        const exisitingUser = await prisma.user.findUnique({
          where: {
            username,
          }
        })

        if (exisitingUser) {
          return {
            error: 'Username already taken. Try another'
          }
        }

        //Update user
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            username
          }
        })

        return {
          success: true
        }

      } catch(error: any) {
        console.log('CreateUserName Error', error)
        return {
          error: error?.message
        }
      } 
    },
  },
};

export default resolvers;
