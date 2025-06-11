import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { User } from "@/models/User";
import { Model } from "mongoose";
import { IUser } from "@/models/User";
import { z } from "zod";

// Add type for session user
type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
};

// Update validation schema for partial updates
const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["admin", "editor"]).optional(),
  profileImg: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation error",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const userData = validationResult.data;
    await connect();

    const updatedUser = await (User as Model<IUser>).findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}