export const LEGAL_DOCUMENT_LINK_KEYS = [
  "financialStatementCorporacionManglaria",
  "certificateOfLegalRequirements",
  "actOfConstitutionCorporacionManglaria",
  "certificateOfExistence",
  "actOfGeneralAssembly",
  "tributaryStatementsCorporacionManglaria",
  "backgroundCheckCertificate",
  "certificateOfManagmentPositions",
  "managementReport",
  "organizationAssets",
  "incomeStatement",
] as const;

export type LegalDocumentLinkKey = (typeof LEGAL_DOCUMENT_LINK_KEYS)[number];

export type LegalDocumentLinks = Record<LegalDocumentLinkKey, string>;

export type LegalDocumentsYearRecord = LegalDocumentLinks & {
  year: number;
};

export const LEGAL_DOCUMENT_FIELDS: Array<{
  name: LegalDocumentLinkKey;
  label: string;
  placeholder: string;
}> = [
  {
    name: "financialStatementCorporacionManglaria",
    label: "Estado Financiero de la Corporación Manglaria",
    placeholder: "URL del Estado Financiero",
  },
  {
    name: "certificateOfLegalRequirements",
    label: "Certificado de Requisitos Legales",
    placeholder: "URL del Certificado de Requisitos Legales",
  },
  {
    name: "actOfConstitutionCorporacionManglaria",
    label: "Acta de Constitución de la Corporación Manglaria",
    placeholder: "URL de la Acta de Constitución",
  },
  {
    name: "certificateOfExistence",
    label: "Certificado de Existencia",
    placeholder: "URL del Certificado de Existencia",
  },
  {
    name: "actOfGeneralAssembly",
    label: "Acta de Asamblea General",
    placeholder: "URL de la Acta de Asamblea General",
  },
  {
    name: "tributaryStatementsCorporacionManglaria",
    label: "Estatutos Tributarios Corporación Manglaria",
    placeholder: "URL de la Declaración Tributaria",
  },
  {
    name: "backgroundCheckCertificate",
    label: "Certificado de Antecedentes",
    placeholder: "URL del Certificado de Antecedentes",
  },
  {
    name: "certificateOfManagmentPositions",
    label: "Certificado de Cargos Directivos",
    placeholder: "URL del Certificado de Cargos Directivos",
  },
  {
    name: "managementReport",
    label: "Último Informe de Gestión",
    placeholder: "URL del Informe de Gestión",
  },
  {
    name: "organizationAssets",
    label: "Patrimonio de la Organización",
    placeholder: "URL del Patrimonio de la Organización",
  },
  {
    name: "incomeStatement",
    label: "Declaración de Renta",
    placeholder: "URL de la Declaración de Renta",
  },
];

export const EMPTY_LEGAL_DOCUMENT_LINKS: LegalDocumentLinks = {
  financialStatementCorporacionManglaria: "",
  certificateOfLegalRequirements: "",
  actOfConstitutionCorporacionManglaria: "",
  certificateOfExistence: "",
  actOfGeneralAssembly: "",
  tributaryStatementsCorporacionManglaria: "",
  backgroundCheckCertificate: "",
  certificateOfManagmentPositions: "",
  managementReport: "",
  organizationAssets: "",
  incomeStatement: "",
};

export function createEmptyYearRecord(year: number): LegalDocumentsYearRecord {
  return {
    year,
    ...EMPTY_LEGAL_DOCUMENT_LINKS,
  };
}

export const LEGAL_DOCUMENTS_YEAR_QUERY = {
  year: { $gte: 2000, $lte: 2100 },
} as const;

export const PUBLIC_LEGAL_DOCUMENTS_LIMIT = 5;
