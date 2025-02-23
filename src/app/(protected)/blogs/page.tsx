// src/app/(protected)/users/page.tsx
"use client";

import { BlogPostTable } from "../../components/BlogPostTable"; // Importa el componente UsersTable

export default function BlogsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      <BlogPostTable />
    </div>
  );
}