import { AuthOptions, getServerSession, User } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }) {

      if (token) {
        const user = {
          id: token.sub,
          name: token.name,
          email: token.email,
          image: token.picture
        };

        session.user = user as User;
      }

      return session;
    },
    async jwt({ token }) {
      const userFound = await prisma.user.findUnique({
        where: {
          email: token.email ?? ''
        }
      });

      if (!userFound) return token;

      return {
        sub: userFound.id,
        name: userFound.name,
        email: userFound.email,
        picture: userFound.image
      };
    }
  },
  pages: {
    signIn: '/' // We're using a modal as a sign in page
  }
};

export const getAuth = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    return null
  }
};