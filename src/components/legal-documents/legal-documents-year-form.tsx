"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UI_COPY } from "@/constants/ui";
import {
  LEGAL_DOCUMENT_FIELDS,
  LegalDocumentLinkKey,
  LegalDocumentsYearRecord,
} from "@/constants/legal-documents";
import {
  countFilledLinks,
  LEGAL_DOCUMENT_LINK_COUNT,
} from "@/lib/legal-documents";
import { cn } from "@/lib/utils";

type LegalDocumentsYearFormProps = {
  year: number;
  draft: LegalDocumentsYearRecord;
  loading: boolean;
  deleting: boolean;
  onChange: (name: LegalDocumentLinkKey, value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onDelete: () => void;
};

function isValidUrl(value: string) {
  if (!value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function LegalDocumentsYearForm({
  year,
  draft,
  loading,
  deleting,
  onChange,
  onSubmit,
  onDelete,
}: LegalDocumentsYearFormProps) {
  const filledCount = countFilledLinks(draft);
  const progress = Math.round((filledCount / LEGAL_DOCUMENT_LINK_COUNT) * 100);
  const isComplete = filledCount === LEGAL_DOCUMENT_LINK_COUNT;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-5">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/legal-documents">
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {UI_COPY.nav.legal}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">{year}</h2>
              {isComplete ? (
                <Badge>Completo</Badge>
              ) : (
                <Badge variant="secondary">
                  {filledCount}/{LEGAL_DOCUMENT_LINK_COUNT} enlaces
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground sm:max-w-xs sm:text-right">
            Ingresa la URL pública de cada documento legal para este año.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso de carga</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 lg:grid-cols-2">
        {LEGAL_DOCUMENT_FIELDS.map((field) => {
          const value = draft[field.name];
          const hasLink = isValidUrl(value);

          return (
            <div
              key={field.name}
              className={cn(
                "rounded-lg border bg-muted/20 p-4 transition-colors",
                hasLink && "border-primary/20 bg-primary/5"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-snug"
                >
                  {field.label}
                </Label>
                {hasLink ? (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    className="h-4 w-4 shrink-0 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={value}
                    onChange={(event) =>
                      onChange(field.name, event.target.value)
                    }
                    placeholder="https://..."
                    className="pl-9"
                  />
                </div>

                {hasLink ? (
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${field.label}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-6 border-t bg-card/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {UI_COPY.actions.delete}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Eliminar documentos de {year}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente los enlaces registrados
                  para el año {year}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{UI_COPY.actions.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} disabled={deleting}>
                  {deleting ? "Eliminando..." : UI_COPY.actions.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="outline">
              <Link href="/legal-documents">{UI_COPY.actions.cancel}</Link>
            </Button>
            <Button type="submit" disabled={loading} className="min-w-28">
              {loading ? "Guardando..." : UI_COPY.actions.save}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
