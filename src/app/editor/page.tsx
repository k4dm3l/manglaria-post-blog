import { auth } from "../auth";
import { redirect } from "next/navigation";
import MarkdownUploader from "../components/MarkdownUploader";
import { getPosts } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function EditorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?error=Unauthorized");
  }

  const [blogs, projects] = await Promise.all([
    getPosts("blog"),
    getPosts("projects")
  ]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Sección de Creación */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Crear Nuevo Contenido</h2>
        <MarkdownUploader />
      </div>

      {/* Listado de Posts Existentes */}
      <Section title="Entradas de Blog" posts={blogs} type="blog" />
      <Section title="Proyectos" posts={projects} type="projects" />
    </div>
  );
}

// Componente reutilizable para cada sección
function Section({ title, posts, type }: { 
  title: string; 
  posts: any[];
  type: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Card key={post.name}>
            <CardHeader>
              <CardTitle>{post.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/editor/${type}/${post.name}`}
                className="text-primary hover:underline"
              >
                Editar
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}