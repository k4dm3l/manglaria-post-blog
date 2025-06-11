import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { User } from "@/models/User";
import connect from "@/lib/db";
import { headers } from "next/headers";
import { validateToken } from '@/lib/auth';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import jwt from "jsonwebtoken";
import { Model } from "mongoose";
import { IUser } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connect();

    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    let session = null;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (token && token !== 'null') {
      session = await validateToken(token);

      if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }

      session = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: string };
    } else {
      session = await getServerSession(authOptions) as any;

      if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    const currentUserId = session.userId ? session.userId : session.user.id;
    const adminUser = await (User as Model<IUser>).findById(currentUserId);

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para crear usuarios" }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();
    const existingUser = await (User as Model<IUser>).findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
    }

    const user = await (User as Model<IUser>).create({ name, email, password: await bcrypt.hash(password as string, 12), role });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
