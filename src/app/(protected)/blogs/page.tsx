"use client";

import { BlogPostTable } from "@/components/BlogPostTable";

export default function BlogsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      <BlogPostTable />
    </div>
  );
}