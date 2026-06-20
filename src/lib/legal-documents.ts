import {
  EMPTY_LEGAL_DOCUMENT_LINKS,
  LEGAL_DOCUMENT_LINK_KEYS,
  LegalDocumentLinkKey,
  LegalDocumentLinks,
  LegalDocumentsYearRecord,
} from "@/constants/legal-documents";

export const LEGAL_DOCUMENT_LINK_COUNT = LEGAL_DOCUMENT_LINK_KEYS.length;

type StoredLegalDocument = LegalDocumentsYearRecord & {
  _id?: unknown;
  updatedBy?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  __v?: unknown;
};

export function pickLegalDocumentLinks(
  data: Partial<Record<LegalDocumentLinkKey, unknown>>
): LegalDocumentLinks {
  return LEGAL_DOCUMENT_LINK_KEYS.reduce((links, key) => {
    const value = data[key];
    links[key] = typeof value === "string" ? value : "";
    return links;
  }, {} as LegalDocumentLinks);
}

export function toPublicLegalDocumentRecord(
  document: StoredLegalDocument
): LegalDocumentsYearRecord {
  return {
    year: document.year,
    ...pickLegalDocumentLinks(document),
  };
}

export function toPublicLegalDocumentRecords(
  documents: StoredLegalDocument[]
): LegalDocumentsYearRecord[] {
  return documents.map(toPublicLegalDocumentRecord);
}

export function countFilledLinks(links: LegalDocumentLinks): number {
  return LEGAL_DOCUMENT_LINK_KEYS.filter((key) => links[key].trim() !== "")
    .length;
}

export function mergeYearRecord(
  existing: LegalDocumentsYearRecord | undefined,
  year: number
): LegalDocumentsYearRecord {
  if (!existing) {
    return { year, ...EMPTY_LEGAL_DOCUMENT_LINKS };
  }

  return {
    year,
    ...pickLegalDocumentLinks(existing),
  };
}
