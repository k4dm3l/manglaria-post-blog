import mongoose, { Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", blogPostSchema);