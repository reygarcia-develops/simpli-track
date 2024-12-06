import jwt from 'jsonwebtoken';
import { AuthData, AuthRequest } from '../types/auth';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';

dotenv.config();


// Middleware to authenticate token
export const authenticateToken = async ({ req }: {req: AuthRequest}): Promise<AuthRequest> => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop()?.trim(); 
  }

  if (!token) {
    return req;
  }

  try {
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2h' });
    req.user = data;
  } catch (err) {
    throw new GraphQLError('Invalid token', {extensions: {code: 'UNAUTHORIZED'}});
  }

  return req;
};

// Function to sign the token
export const signToken = (payload: AuthData): string => {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment');
  }

  return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};
