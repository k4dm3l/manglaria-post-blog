import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { User } from "@/models/User";
import { Model } from "mongoose";
import { IUser } from "@/models/User";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { active } = body;
    const { id } = await params;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active status must be a boolean" },
        { status: 400 }
      );
    }

    console.log(body);

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connect();

    // Use findByIdAndUpdate with { new: true } to return the updated document
    // and { runValidators: false } to skip validation since we're only updating active status
    const user = await (User as Model<IUser>).findByIdAndUpdate(
      id,
      { $set: { active } },
      { new: true, runValidators: false }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Estado actualizado exitosamente", user });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del usuario" },
      { status: 500 }
    );
  }
}