import MarkdownUploader from "@/app/components/MarkdownUploader";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">CMS Manglaria</h1>
      <MarkdownUploader />
    </div>
  );
}
