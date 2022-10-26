import { GrapghQLContext } from "../../util/types";

const resolvers = {
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantsIds: Array<string> },
      context: GrapghQLContext
    ) => {
      console.log("Inside CREATE CONVERSATION", args);
    },
  },
};

export default resolvers;
