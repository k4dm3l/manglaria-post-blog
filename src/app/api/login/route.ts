import { NextResponse } from "next/server";
import { User, IUser } from "@/models/User";
import { Model } from "mongoose";
import jwt from "jsonwebtoken";
import connect from "@/lib/db";

export async function POST(req: Request) {
  await connect();
  const { email, password } = await req.json();

  const user = await (User as Model<IUser>).findOne({ email, active: true });
  if (!user || !(await user.comparePassword(password))) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = jwt.sign({ userId: user._id }, process.env.NEXTAUTH_SECRET!, {
    expiresIn: "1d",
  });

  return NextResponse.json({ token }, { status: 200 });
}