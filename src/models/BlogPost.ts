import { generateSlug } from "@/lib/utils";
import mongoose, { Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  description: string;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  image: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    slug: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

blogPostSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", blogPostSchema);