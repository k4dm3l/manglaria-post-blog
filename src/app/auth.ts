// src/auth.ts
import { NextAuthOptions, getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/auth";

export const auth = () => getServerSession(authOptions);