"use client";

import { ProjectTable } from "@/components/ProjectTable";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Proyectos</h1>
      <ProjectTable />
    </div>
  );
}