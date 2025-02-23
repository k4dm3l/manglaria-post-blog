import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function authMiddleware(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return decoded; // Retorna el payload del token
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}