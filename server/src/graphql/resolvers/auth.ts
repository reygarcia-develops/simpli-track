import { GraphQLError } from "graphql";
import { AuthResponse, MutationLoginUserArgs, MutationRegisterUserArgs, QueryHelloArgs } from "../../generated/graphql.js";
import { signToken } from "../../middleware/auth.js";
import User from "../../models/user.js";

export const authResolvers = {
  Query: {
    hello: async (_: any, { name }: QueryHelloArgs ): Promise<string> => {
      return `Hello, ${name}!`;
    }
  },
  Mutation: {
    loginUser: async (_: any, { input }: MutationLoginUserArgs): Promise<AuthResponse> => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new GraphQLError('Invalid login', {extensions: {code: 'NOTFOUND'}} );
        }
    
        const correctPw: boolean = await user.isCorrectPassword(input.password);
        if (!correctPw) {
          throw new GraphQLError('Invalid login', {extensions: {code: 'NOTFOUND'}} );

        }
    
        const token = signToken({username: user.username, email: user.email});
        return { token, user };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        console.log('made it here');
        throw new GraphQLError("An unexpected error occurred", {extensions: {code: 'INTERNAL_SERVER_ERROR', stacktrace: error}});
      }
    },

    registerUser: async (_: any, { input }: MutationRegisterUserArgs): Promise<AuthResponse> => {
      try {
        const user = await User.create(input);
        const userPayload = {username: user.username, email: user.email};
        const token = signToken(userPayload);
        return { token, user: userPayload};
      } catch (error: any) {
        if(error?.code === 11000) {
          throw new GraphQLError(`Invalid registration`, {extensions: {code: 'CONFLICT'}});
        }
        throw new GraphQLError("An unexpected error occurred", {extensions: {code: 'INTERNAL_SERVER_ERROR', stacktrace: error}});
      }
    },
  },
};