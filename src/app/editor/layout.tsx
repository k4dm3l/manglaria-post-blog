import Navigation from "../components/navigation";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="container py-6">{children}</main>
    </>
  );
}