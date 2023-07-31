import userResolvers from "./user";
import conversationsResolvers from "./conversations";
import merge from "lodash.merge";

const resolvers = merge({}, userResolvers, conversationsResolvers);

export default resolvers;
