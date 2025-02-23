import mongoose, { Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 5, // Mínimo 5 caracteres
      maxlength: 200, // Máximo 100 caracteres
    },
    description: {
      type: String,
      required: true,
      minlength: 10, // Mínimo 10 caracteres
      maxlength: 300, // Máximo 200 caracteres
    },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);