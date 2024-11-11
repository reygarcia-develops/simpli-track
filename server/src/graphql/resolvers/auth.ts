import { AuthResponse, MutationLoginUserArgs, MutationRegisterUserArgs, QueryHelloArgs } from "../../generated/graphql.js";
import { AuthenticationError, signToken } from "../../middleware/auth.js";
import User from "../../models/user.js";

export const authResolvers = {
  Query: {
    hello: async (_: any, { name }: QueryHelloArgs ): Promise<string> => {
      return `Hello, ${name}!`;
    }
  },
  Mutation: {
    loginUser: async (_: any, { input }: MutationLoginUserArgs): Promise<AuthResponse> => {
      const user = await User.findOne({ email: input.email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw: boolean = await user.isCorrectPassword(input.password);

      if (!correctPw) {
        throw AuthenticationError;
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    registerUser: async (_: any, { input }: MutationRegisterUserArgs): Promise<AuthResponse> => {
      const user = await User.create(input);
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
  },
};