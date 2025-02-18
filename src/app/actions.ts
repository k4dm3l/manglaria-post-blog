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


export async function mergeDevelopToMaster() {
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
