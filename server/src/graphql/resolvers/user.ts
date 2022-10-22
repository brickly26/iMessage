import { GrapghQLContext } from "../../util/types";

const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: (_: any, args: { username: string }, context: GrapghQLContext) => {
      const { username } = args;
      const { session, prisma } = context;
      console.log("Hey you made it: ", username)
    },
  },
}

export default resolvers