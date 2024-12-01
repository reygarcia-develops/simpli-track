import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: AuthData;
}

export interface AuthData {
  username: string;
  email: string;
}
