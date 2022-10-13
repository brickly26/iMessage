const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: (_: any, args: { username: string }, context: any) => {
      const { username } = args;
      console.log("Hey you made it: ", username)
    },
  },
}

export default resolvers