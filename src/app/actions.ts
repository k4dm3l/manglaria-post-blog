"use server";

import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import { revalidatePath } from "next/cache";

const OctokitWithThrottling = Octokit.plugin(throttling);

const octokit = new OctokitWithThrottling({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (
      retryAfter: number,
      options: any,
      octokit: any,
      retryCount: number
    ) => {
      console.warn(`Rate limit excedido para ${options.method} ${options.url} - Reintentos: ${retryCount}`);
      return retryCount < 5; // Máximo 5 reintentos
    },
    onSecondaryRateLimit: (
      retryAfter: number,
      options: any,
      octokit: any,
      retryCount: number
    ) => {
      console.error(`Secondary rate limit detectado para ${options.method} ${options.url}`);
      return false; // No reintentar
    }
  }
});

const repo = process.env.REPO!;
const owner = process.env.OWNER!;

export async function uploadMarkdown(formData: FormData) {
  "use server";

  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string; // Nuevo campo

  if (!file) return { error: "No se proporcionó archivo" };
  if (!["blog", "projects"].includes(type)) return { error: "Tipo inválido" };
  
  // Validación de extensión .md
  if (!file.name.endsWith(".md")) {
    return { error: "Solo se permiten archivos .md" };
  }

  // Convertir ArrayBuffer a texto
  const content = await file.text();
  
  try {
    // Obtener referencia actual de develop
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/develop",
    });

    // Verificar si el archivo existe
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: `src/content/${type}/${file.name}`,
        ref: refData.object.sha,
      });
      sha = Array.isArray(data) ? undefined : data.sha;
    } catch (error) {
      sha = undefined;
    }

    // Subir archivo con usuario asociado
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `src/content/${type}/${file.name}`,
      message: `Nuevo contenido: ${title} [skip-ci]`,
      content: Buffer.from(content).toString("base64"),
      branch: "develop",
      sha,
      committer: {
        name: "CMS Manglaria",
        email: "cms@manglaria.org",
      },
    });

    revalidatePath("/");
    return { 
      success: `Archivo subido exitosamente`,
      commitSha: data.commit.sha 
    };
  } catch (error: any) {
    console.error("GitHub API Error:", JSON.stringify(error));
    return { error: `Error al subir: ${error.response?.data?.message || error.message}` };
  }
}


export async function mergeDevelopToMain() {
  "use server";

  try {
    // Obtener último commit de develop
    const { data: developStatus } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: "develop",
    });

    // Verificar si hay cambios pendientes
    const { data: comparison } = await octokit.repos.compareCommits({
      owner,
      repo,
      base: "main",
      head: "develop",
    });

    if (comparison.status === "identical") {
      return { error: "No hay cambios para fusionar" };
    }

    // Crear merge commit
    const { data } = await octokit.repos.merge({
      owner,
      repo,
      base: "main",
      head: "develop",
      commit_message: `Merge automático [${new Date().toISOString()}]`,
    });

    // Actualizar referencia de develop
    await octokit.git.updateRef({
      owner,
      repo,
      ref: "heads/develop",
      sha: developStatus.commit.sha,
      force: true,
    });

    revalidatePath("/");
    return { success: `Merge completado: ${data.sha.substring(0, 7)}` };
  } catch (error: any) {
    if (error.status === 409) {
      return { error: "Conflicto de merge: Resuelve manualmente en GitHub" };
    }
    return { error: `Error en merge: ${error.response?.data?.message || error.message}` };
  }
}

// Obtener lista de posts
export async function getPosts(type: "blog" | "projects") {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: `src/content/${type}`,
      ref: "develop"
    });

    return (data as any[]).filter(file => 
      file.type === "file" && 
      file.name.endsWith(".md")
    ).map(file => ({
      name: file.name.replace(/\.md$/, ""),
      path: file.path,
      sha: file.sha,
      download_url: file.download_url
    }));
  } catch (error: any) {
    console.error("Error obteniendo posts:", error);
    return [];
  }
}

// Obtener contenido de un post específico
export async function getPostContent(path: string) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: "develop"
    });

    const content = Buffer.from((data as any).content, "base64").toString("utf8");
    const { title, excerpt } = parseFrontmatter(content);
    
    return {
      title,
      excerpt,
      content: content.split("---")[2].trim(),
      sha: (data as any).sha
    };
  } catch (error: any) {
    console.error("Error obteniendo contenido:", error);
    return null;
  }
}

// Actualizar post existente
export async function updateMarkdownFile(
  path: string,
  content: string,
  sha: string
) {
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Actualización: ${path.split("/").pop()}`,
      content: Buffer.from(content).toString("base64"),
      branch: "develop",
      sha,
      committer: {
        name: "CMS Manglaria",
        email: "cms@manglaria.org",
      },
    });

    return { success: "Post actualizado correctamente" };
  } catch (error: any) {
    console.error("Error actualizando post:", error);
    return { error: `Error al actualizar: ${error.response?.data?.message || error.message}` };
  }
}

// Helper para parsear frontmatter
function parseFrontmatter(content: string) {
  const frontmatter = content.split("---")[1];
  return {
    title: frontmatter.match(/title: (.*)/)?.[1]?.trim() || "",
    excerpt: frontmatter.match(/excerpt: (.*)/)?.[1]?.trim() || ""
  };
}
