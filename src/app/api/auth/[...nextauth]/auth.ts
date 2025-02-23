import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import connect from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connect();
        const user = await User.findOne({ email: credentials?.email });
        
        if (!user || !(await user.comparePassword(credentials?.password))) {
          return null;
        }
        
        return { 
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          profileImg: user.profileImg,
          role: user.role,
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: 
          process.env.NODE_ENV === "development" 
            ? "localhost" 
            : ".tudominio.com"
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.profileImg = user.profileImg;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.profileImg = token.profileImg as string;
      session.user.role = token.role as string;

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
};