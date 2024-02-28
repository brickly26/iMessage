import userResolvers from "./user";
import conversationResolvers from "./conversations";
import messageResolvers from "./message";
import merge from "lodash.merge";
import scalarResolvers from "./scalars";

const resolvers = merge(
  {},
  userResolvers,
  scalarResolvers,
  conversationResolvers,
  messageResolvers
);

export default resolvers;
