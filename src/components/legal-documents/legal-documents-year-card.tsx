"use client";

import Link from "next/link";
import {
  CalendarClock,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UI_COPY } from "@/constants/ui";
import { LegalDocumentsYearRecord } from "@/constants/legal-documents";
import {
  countFilledLinks,
  LEGAL_DOCUMENT_LINK_COUNT,
} from "@/lib/legal-documents";

type LegalDocumentsYearCardProps = {
  record: LegalDocumentsYearRecord & { updatedAt?: string };
  onDelete: (year: number) => void;
};

function formatUpdatedAt(value?: string) {
  if (!value) return "Sin actualizaciones";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDocumentsBadgeVariant(filledCount: number) {
  if (filledCount === 0) return "outline" as const;
  if (filledCount === LEGAL_DOCUMENT_LINK_COUNT) return "default" as const;
  return "secondary" as const;
}

export function LegalDocumentsYearCard({
  record,
  onDelete,
}: LegalDocumentsYearCardProps) {
  const filledCount = countFilledLinks(record);
  const isComplete = filledCount === LEGAL_DOCUMENT_LINK_COUNT;

  return (
    <Card className="flex h-full flex-col transition-colors hover:border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold tracking-tight">
              {record.year}
            </span>
            {isComplete ? (
              <Badge variant="default" className="shrink-0">
                Completo
              </Badge>
            ) : null}
          </div>
          <Badge variant={getDocumentsBadgeVariant(filledCount)}>
            <FileText className="mr-1 h-3 w-3" />
            {filledCount}/{LEGAL_DOCUMENT_LINK_COUNT} enlaces
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Última actualización</p>
            <p>{formatUpdatedAt(record.updatedAt)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="outline" size="icon" className="h-9 w-9">
              <Link
                href={`/legal-documents/${record.year}`}
                aria-label={`${UI_COPY.actions.edit} ${record.year}`}
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{UI_COPY.actions.edit}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              aria-label={`${UI_COPY.actions.delete} ${record.year}`}
              onClick={() => onDelete(record.year)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{UI_COPY.actions.delete}</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
