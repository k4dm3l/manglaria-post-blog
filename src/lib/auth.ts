// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { getSession } from "next-auth/react";

export const getToken = async () => {
  const session = await getSession();
  return session?.user ? true : false;
};

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export async function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return decoded;
  } catch (error) {
    return null;
  }
}