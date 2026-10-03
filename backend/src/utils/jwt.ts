import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
}

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

export const signToken = (userId: string): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN as string) || '7d';
  return jwt.sign({ id: userId }, getSecret(), {
    expiresIn: expiresIn as any,
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch {
    return null;
  }
};
