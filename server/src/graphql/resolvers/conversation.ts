const resolvers = {
  Mutation: {
    createConversation: async () => {
      console.log("Inside CREATE CONVERSATION")
    },
  },
}

export default resolvers