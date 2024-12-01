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
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new AuthenticationError("User does not exist");
        }
    
        const correctPw: boolean = await user.isCorrectPassword(input.password);
        if (!correctPw) {
          throw new AuthenticationError('Invalid password');
        }
    
        const token = signToken({username: user.username, email: user.email});
        return { token, user };
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
    
        console.error('Unexpected error during user login:', error);
        throw new Error("An unexpected error occurred");
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
          throw new Error(`Sorry, that username or email already exists`);
        }
        console.error('Unexpected error during user registration', error);
        throw new Error('An unexpected error occurred');
      }
    },
  },
};