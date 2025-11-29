import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyMessage } from 'viem';
import { findUserByWallet, createUser } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'wallet',
      name: 'Wallet',
      credentials: {
        address: { label: 'Wallet Address', type: 'text' },
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.message || !credentials?.signature) {
          return null;
        }

        try {
          // Verify the signature
          const isValid = await verifyMessage({
            address: credentials.address as `0x${string}`,
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
          });

          if (!isValid) {
            return null;
          }

          // Find or create user
          let user = await findUserByWallet(credentials.address);
          
          if (!user) {
            user = await createUser({
              walletAddress: credentials.address,
              name: `User ${credentials.address.slice(0, 6)}`,
            });
          }

          return {
            id: user.id,
            name: user.name,
            walletAddress: user.walletAddress,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).walletAddress = token.walletAddress;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Generate sign-in message
export function generateSignInMessage(address: string, nonce: string): string {
  return `Sign in to CreatorBridge\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
}

// Generate random nonce
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
