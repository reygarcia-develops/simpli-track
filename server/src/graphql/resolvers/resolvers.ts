import { Resolvers } from "../../generated/graphql.js";
import { authResolvers } from "./auth.js";

export const resolvers: Resolvers = {
  Query: {
    ...authResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
  },
};