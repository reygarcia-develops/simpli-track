import jwt, { JwtPayload } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { AuthRequest } from '../types/auth';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables


// Middleware to authenticate token
export const authenticateToken = async ({ req }: {req: AuthRequest}): Promise<AuthRequest> => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop()?.trim();  // Handle 'Bearer <token>'
  }

  if (!token) {
    return req;
  }

  try {
    // jwt.verify returns JwtPayload when using the 'verify' method with a valid token
    const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '2h' }) as JwtPayload;
    req.user = data;
  } catch (err) {
    console.log('Invalid token');
  }

  return req;
};

// Function to sign the token
export const signToken = (username: string, email: string, id: unknown): string => {
  const payload = { username, email, id };
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error('JWT_SECRET_KEY is not defined in the environment');
  }

  return jwt.sign({ data: payload }, secretKey, { expiresIn: '2h' });
};

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
};
