import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { LegalDocuments, ILegalDocuments } from "@/models/LegalDocuments";
import { withRateLimit } from "@/lib/rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { Model, Types } from "mongoose";

// Add legal documents rate limiter
const legalDocumentsLimiter = rateLimiters.api; // Using the general API rate limiter for now

export async function GET() {
  return withRateLimit(legalDocumentsLimiter, async () => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connect();
      const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;
      const documents = await LegalDocumentsModel.findOne();

      if (!documents) {
        return NextResponse.json({
          chamberOfCommerce: "",
          financialStatementsAssembly: "",
          surplusCertificate: "",
          bylaws: "",
          financialStatement: "",
        });
      }

      return NextResponse.json(documents);
    } catch (error) {
      console.error("Error fetching legal documents:", error);
      return NextResponse.json(
        { error: "Failed to fetch legal documents" },
        { status: 500 }
      );
    }
  });
}

export async function PUT(request: Request) {
  return withRateLimit(legalDocumentsLimiter, async () => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const data = await request.json() as Partial<ILegalDocuments>;

      await connect();
      const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;
      
      // Solo incluir campos que están presentes en el payload
      const updateData: Partial<ILegalDocuments> = {};
      const validFields: (keyof ILegalDocuments)[] = [
        "chamberOfCommerce",
        "financialStatementsAssembly",
        "surplusCertificate",
        "bylaws",
        "financialStatement"
      ];

      validFields.forEach(field => {
        if (data[field] !== undefined) {
          const value = data[field];
          if (typeof value === 'string') {
            (updateData as Record<string, string>)[field] = value;
          }
        }
      });

      // Siempre actualizar estos campos
      updateData.updatedAt = new Date();
      updateData.updatedBy = new Types.ObjectId(session.user.id);

      // Buscar y actualizar (upsert: true crea el documento si no existe)
      const documents = await LegalDocumentsModel.findOneAndUpdate(
        {},
        { $set: updateData },
        { 
          new: true,
          upsert: true,
          runValidators: false,
          setDefaultsOnInsert: true  // Usa valores por defecto del esquema
        }
      );

      return NextResponse.json(documents);
    } catch (error) {
      console.error("Error updating legal documents:", error);
      return NextResponse.json(
        { error: "Failed to update legal documents" },
        { status: 500 }
      );
    }
  });
} 