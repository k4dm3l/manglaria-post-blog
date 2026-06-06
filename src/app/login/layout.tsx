import { UI_COPY } from "@/constants/ui";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div>
          <p className="text-lg font-semibold">{UI_COPY.appName}</p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {UI_COPY.appDescription}
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Gestiona blogs, proyectos y contenido legal desde un solo lugar.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
