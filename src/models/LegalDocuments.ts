import mongoose, { Schema, Document, Types } from "mongoose";
import {
  LegalDocumentLinks,
  LegalDocumentsYearRecord,
} from "@/constants/legal-documents";

export type { LegalDocumentLinks, LegalDocumentsYearRecord };

export interface ILegalDocuments extends Document, LegalDocumentsYearRecord {
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const legalDocumentsSchema = new Schema<ILegalDocuments>(
  {
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    financialStatementCorporacionManglaria: { type: String, default: "" },
    certificateOfLegalRequirements: { type: String, default: "" },
    actOfConstitutionCorporacionManglaria: { type: String, default: "" },
    certificateOfExistence: { type: String, default: "" },
    actOfGeneralAssembly: { type: String, default: "" },
    tributaryStatementsCorporacionManglaria: { type: String, default: "" },
    backgroundCheckCertificate: { type: String, default: "" },
    certificateOfManagmentPositions: { type: String, default: "" },
    managementReport: { type: String, default: "" },
    organizationAssets: { type: String, default: "" },
    incomeStatement: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

legalDocumentsSchema.index({ year: 1 }, { unique: true });

export const LegalDocuments =
  mongoose.models.LegalDocuments ||
  mongoose.model<ILegalDocuments>("LegalDocuments", legalDocumentsSchema);
