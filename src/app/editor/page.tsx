import { auth } from "../auth";
import { redirect } from "next/navigation";
import MarkdownUploader from "../components/MarkdownUploader";

export default async function EditorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?error=Unauthorized");
  }

  return <MarkdownUploader />;
}