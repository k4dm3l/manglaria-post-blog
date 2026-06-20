import { z } from "zod";
import { LEGAL_DOCUMENT_LINK_KEYS } from "@/constants/legal-documents";

const urlOrEmpty = z.string().url("URL inválida").or(z.literal(""));

const legalDocumentLinksShape = LEGAL_DOCUMENT_LINK_KEYS.reduce(
  (shape, key) => {
    shape[key] = urlOrEmpty;
    return shape;
  },
  {} as Record<(typeof LEGAL_DOCUMENT_LINK_KEYS)[number], typeof urlOrEmpty>
);

export const legalDocumentLinksSchema = z.object(legalDocumentLinksShape);

export const legalDocumentsYearSchema = legalDocumentLinksSchema.extend({
  year: z
    .number()
    .int("El año debe ser un número entero")
    .min(2000, "El año debe ser 2000 o posterior")
    .max(2100, "El año debe ser 2100 o anterior"),
});

export type LegalDocumentsYearInput = z.infer<typeof legalDocumentsYearSchema>;
