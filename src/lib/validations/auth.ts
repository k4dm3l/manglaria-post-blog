import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const legalDocumentSchema = z.object({
  financialStatementCorporacionManglaria: z
    .string()
    .url("URL inválida")
    .or(z.literal("")),
  certificateOfLegalRequirements: z
    .string()
    .url("URL inválida")
    .or(z.literal("")),
  actOfConstitutionCorporacionManglaria: z
    .string()
    .url("URL inválida")
    .or(z.literal("")),
  certificateOfExistence: z.string().url("URL inválida").or(z.literal("")),
  actOfGeneralAssembly: z.string().url("URL inválida").or(z.literal("")),
  tributaryStatementsCorporacionManglaria: z
    .string()
    .url("URL inválida")
    .or(z.literal("")),
  backgroundCheckCertificate: z.string().url("URL inválida").or(z.literal("")),
  certificateOfManagmentPositions: z
    .string()
    .url("URL inválida")
    .or(z.literal("")),
  managementReport: z.string().url("URL inválida").or(z.literal("")),
});

export type LegalDocumentFormValues = z.infer<typeof legalDocumentSchema>;
