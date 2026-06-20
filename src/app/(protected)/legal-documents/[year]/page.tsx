"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LegalDocumentsYearForm } from "@/components/legal-documents/legal-documents-year-form";
import { UI_COPY } from "@/constants/ui";
import {
  createEmptyYearRecord,
  LegalDocumentLinkKey,
  LegalDocumentsYearRecord,
} from "@/constants/legal-documents";
import { mergeYearRecord } from "@/lib/legal-documents";

type StoredLegalDocumentsYearRecord = LegalDocumentsYearRecord & {
  _id?: string;
};

function parseYearParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;

  const year = Number(raw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return null;
  }

  return year;
}

export default function LegalDocumentsYearPage() {
  const router = useRouter();
  const params = useParams();
  const year = parseYearParam(params.year);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [draft, setDraft] = useState<LegalDocumentsYearRecord | null>(null);

  useEffect(() => {
    if (year === null) {
      setInitialLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/legal-documents");
        if (!response.ok) throw new Error("Failed to fetch documents");

        const data = (await response.json()) as StoredLegalDocumentsYearRecord[];
        const existing = data.find((record) => record.year === year);

        setDraft(
          existing
            ? mergeYearRecord(existing, year)
            : createEmptyYearRecord(year)
        );
      } catch (error) {
        console.error("Error loading legal documents:", error);
        toast.error(UI_COPY.errors.generic);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDocuments();
  }, [year]);

  const handleChange = (name: LegalDocumentLinkKey, value: string) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            [name]: value,
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || year === null) return;

    setLoading(true);

    try {
      const response = await fetch("/api/legal-documents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          typeof errorBody?.error === "string"
            ? errorBody.error
            : UI_COPY.errors.generic;
        throw new Error(message);
      }

      toast.success(UI_COPY.success.saved);
      router.push("/legal-documents");
    } catch (error) {
      console.error("Error updating legal documents:", error);
      toast.error(
        error instanceof Error ? error.message : UI_COPY.errors.generic
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async () => {
    if (year === null) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/legal-documents?year=${year}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to delete year");
      }

      toast.success(UI_COPY.success.deleted);
      router.push("/legal-documents");
    } catch (error) {
      console.error("Error deleting legal documents year:", error);
      toast.error(UI_COPY.errors.generic);
    } finally {
      setDeleting(false);
    }
  };

  if (year === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{UI_COPY.nav.legal}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            El año solicitado no es válido.
          </p>
          <Button asChild variant="outline">
            <Link href="/legal-documents">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {initialLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-2 w-full" />
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : draft ? (
          <LegalDocumentsYearForm
            year={year}
            draft={draft}
            loading={loading}
            deleting={deleting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onDelete={handleDeleteYear}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
