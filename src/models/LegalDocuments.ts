import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILegalDocuments extends Document {
  financialStatementCorporacionManglaria?: string;
  certificateOfLegalRequirements?: string;
  actOfConstitutionCorporacionManglaria?: string;
  certificateOfExistence?: string;
  actOfGeneralAssembly?: string;
  tributaryStatementsCorporacionManglaria?: string;
  backgroundCheckCertificate?: string;
  certificateOfManagmentPositions?: string;
  managementReport?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const legalDocumentsSchema = new Schema<ILegalDocuments>(
  {
    financialStatementCorporacionManglaria: { type: String, default: "" },
    certificateOfLegalRequirements: { type: String, default: "" },
    actOfConstitutionCorporacionManglaria: { type: String, default: "" },
    certificateOfExistence: { type: String, default: "" },
    actOfGeneralAssembly: { type: String, default: "" },
    tributaryStatementsCorporacionManglaria: { type: String, default: "" },
    backgroundCheckCertificate: { type: String, default: "" },
    certificateOfManagmentPositions: { type: String, default: "" },
    managementReport: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const LegalDocuments = mongoose.models.LegalDocuments || mongoose.model<ILegalDocuments>("LegalDocuments", legalDocumentsSchema); 