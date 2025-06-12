import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILegalDocuments extends Document {
  chamberOfCommerce?: string;
  financialStatementsAssembly?: string;
  surplusCertificate?: string;
  bylaws?: string;
  financialStatement?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const legalDocumentsSchema = new Schema<ILegalDocuments>(
  {
    chamberOfCommerce: { type: String, default: "" },
    financialStatementsAssembly: { type: String, default: "" },
    surplusCertificate: { type: String, default: "" },
    bylaws: { type: String, default: "" },
    financialStatement: { type: String, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const LegalDocuments = mongoose.models.LegalDocuments || mongoose.model<ILegalDocuments>("LegalDocuments", legalDocumentsSchema); 