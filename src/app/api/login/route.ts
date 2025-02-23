import { NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import connect from "@/lib/db";

export async function POST(req: Request) {
  await connect();
  const { email, password } = await req.json();

  // Buscar usuario
  const user = await User.findOne({ email, active: true });
  if (!user || !(await user.comparePassword(password))) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  // Generar JWT
  const token = jwt.sign({ userId: user._id }, process.env.NEXTAUTH_SECRET!, {
    expiresIn: "1d",
  });

  return NextResponse.json({ token }, { status: 200 });
}