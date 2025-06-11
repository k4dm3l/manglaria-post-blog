import { getScheduledPosts } from '@/lib/scheduler';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { IBlogPost } from '@/types/blog';

export default async function ScheduledPostsPage() {
  const posts = await getScheduledPosts();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts Programados</h1>
        <Button asChild>
          <Link href="/editor">Crear nuevo post</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.map((post: IBlogPost) => (
          <Card key={post._id.toString()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{post.title}</span>
                <span className="text-sm text-muted-foreground">
                  Programado para: {format(new Date(post.scheduledFor!), 'PPP', { locale: es })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <Link href={`/editor/${post.type}/${post.slug}`}>
                    Editar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay posts programados
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 