import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import connect from "@/lib/db";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined");
}

const isProduction = process.env.NODE_ENV === "production";

function getAuthCookieDomain(): string | undefined {
  if (!isProduction || !process.env.NEXTAUTH_URL) {
    return undefined;
  }

  try {
    return new URL(process.env.NEXTAUTH_URL).hostname;
  } catch {
    return undefined;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connect();
        const user = await User.findOne({
          email: credentials.email,
          active: true,
        }).lean();

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as "admin" | "editor",
          profileImg: user.profileImg || "",
        } as const;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.profileImg = user.profileImg;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as "admin" | "editor";
        session.user.id = token.id as string;
        session.user.profileImg = token.profileImg as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: getAuthCookieDomain(),
      },
    },
  },
  debug: !isProduction,
  secret: process.env.NEXTAUTH_SECRET,
};

export async function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return decoded;
  } catch {
    return null;
  }
}
