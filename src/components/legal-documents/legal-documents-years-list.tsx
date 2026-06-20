"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { LegalDocumentsYearCard } from "@/components/legal-documents/legal-documents-year-card";
import { UI_COPY } from "@/constants/ui";
import { LegalDocumentsYearRecord } from "@/constants/legal-documents";
import { mergeYearRecord } from "@/lib/legal-documents";

type StoredLegalDocumentsYearRecord = LegalDocumentsYearRecord & {
  _id?: string;
  updatedAt?: string;
};

export function LegalDocumentsYearsList() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [years, setYears] = useState<StoredLegalDocumentsYearRecord[]>([]);
  const [addYearOpen, setAddYearOpen] = useState(false);
  const [newYearValue, setNewYearValue] = useState("");
  const [yearToDelete, setYearToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingNavigationYear, setPendingNavigationYear] = useState<
    number | null
  >(null);

  const loadYears = useCallback(async () => {
    const response = await fetch("/api/legal-documents");
    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    const data = (await response.json()) as StoredLegalDocumentsYearRecord[];
    return data
      .map((record) => {
        const merged = mergeYearRecord(record, record.year);
        const normalized: StoredLegalDocumentsYearRecord = { ...merged };

        if (record._id) {
          normalized._id = record._id;
        }
        if (record.updatedAt) {
          normalized.updatedAt = record.updatedAt;
        }

        return normalized;
      })
      .sort((a, b) => b.year - a.year);
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const normalized = await loadYears();
        setYears(normalized);
      } catch (error) {
        console.error("Error loading legal documents:", error);
        toast.error(UI_COPY.errors.generic);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDocuments();
  }, [loadYears]);

  useEffect(() => {
    if (addYearOpen || pendingNavigationYear === null) return;

    router.push(`/legal-documents/${pendingNavigationYear}`);
    setPendingNavigationYear(null);
  }, [addYearOpen, pendingNavigationYear, router]);

  const openAddYearDialog = () => {
    setNewYearValue(new Date().getFullYear().toString());
    setAddYearOpen(true);
  };

  const handleAddYear = (event?: React.FormEvent) => {
    event?.preventDefault();

    const year = parseInt(newYearValue, 10);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      toast.error("Ingresa un año válido entre 2000 y 2100.");
      return;
    }

    setAddYearOpen(false);
    setNewYearValue("");
    setPendingNavigationYear(year);
  };

  const handleDeleteYear = async () => {
    if (yearToDelete === null) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/legal-documents?year=${yearToDelete}`,
        { method: "DELETE" }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to delete year");
      }

      setYears((prev) => prev.filter((record) => record.year !== yearToDelete));
      toast.success(UI_COPY.success.deleted);
    } catch (error) {
      console.error("Error deleting legal documents year:", error);
      toast.error(UI_COPY.errors.generic);
    } finally {
      setDeleting(false);
      setYearToDelete(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-52 w-full rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {years.length === 0
            ? "No hay años registrados."
            : `${years.length} año${years.length === 1 ? "" : "s"} registrado${years.length === 1 ? "" : "s"}.`}
        </p>
        <Button type="button" onClick={openAddYearDialog}>
          <Plus className="h-4 w-4" />
          Agregar año
        </Button>
      </div>

      {years.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Comienza agregando el primer año de documentos legales.
          </p>
          <Button type="button" variant="outline" onClick={openAddYearDialog}>
            <Plus className="h-4 w-4" />
            Agregar año
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={200}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {years.map((record) => (
              <LegalDocumentsYearCard
                key={record.year}
                record={record}
                onDelete={setYearToDelete}
              />
            ))}
          </div>
        </TooltipProvider>
      )}

      <Dialog open={addYearOpen} onOpenChange={setAddYearOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddYear} className="space-y-6">
            <DialogHeader className="space-y-0">
              <DialogTitle>Agregar año</DialogTitle>
            </DialogHeader>
            <Input
              id="new-year"
              type="number"
              min={2000}
              max={2100}
              value={newYearValue}
              onChange={(event) => setNewYearValue(event.target.value)}
              placeholder="2026"
              aria-label="Año"
              autoFocus
            />
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddYearOpen(false)}
              >
                {UI_COPY.actions.cancel}
              </Button>
              <Button type="submit">Continuar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={yearToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setYearToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar documentos de {yearToDelete}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente los enlaces registrados para
              el año {yearToDelete}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{UI_COPY.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteYear} disabled={deleting}>
              {deleting ? "Eliminando..." : UI_COPY.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
