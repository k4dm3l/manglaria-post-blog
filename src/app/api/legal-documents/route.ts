import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { LegalDocuments, ILegalDocuments } from "@/models/LegalDocuments";
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";
import {
  LEGAL_DOCUMENTS_YEAR_QUERY,
  PUBLIC_LEGAL_DOCUMENTS_LIMIT,
} from "@/constants/legal-documents";
import { toPublicLegalDocumentRecords } from "@/lib/legal-documents";
import { legalDocumentsYearSchema } from "@/lib/validations/legal-documents";
import { Model, Types } from "mongoose";

const legalDocumentsLimiter = rateLimiters.api;

function withCors(response: NextResponse) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.ALLOWED_ORIGIN || "*"
  );
  response.headers.set("Access-Control-Allow-Methods", "GET");
  return response;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function GET(request: Request) {
  return withRateLimit(legalDocumentsLimiter, async () => {
    try {
      const authHeader = request.headers.get("authorization");

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (token !== process.env.CONTENT_API_TOKEN) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connect();
        const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;
        const documents = await LegalDocumentsModel.find(LEGAL_DOCUMENTS_YEAR_QUERY)
          .sort({ year: -1 })
          .limit(PUBLIC_LEGAL_DOCUMENTS_LIMIT)
          .lean();

        return withCors(
          NextResponse.json(toPublicLegalDocumentRecords(documents))
        );
      }

      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connect();
      const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;
      const documents = await LegalDocumentsModel.find(LEGAL_DOCUMENTS_YEAR_QUERY)
        .sort({ year: -1 })
        .lean();

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

      const body = await request.json();
      const parsed = legalDocumentsYearSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid payload",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      await connect();
      const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;

      const { year, ...links } = parsed.data;

      try {
        const document = await LegalDocumentsModel.findOneAndUpdate(
          { year },
          {
            $set: {
              ...links,
              updatedBy: new Types.ObjectId(session.user.id),
              updatedAt: new Date(),
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        ).lean();

        return NextResponse.json(document);
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return NextResponse.json(
            { error: "A record for this year already exists" },
            { status: 409 }
          );
        }
        throw error;
      }
    } catch (error) {
      console.error("Error updating legal documents:", error);
      return NextResponse.json(
        { error: "Failed to update legal documents" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(request: Request) {
  return withRateLimit(legalDocumentsLimiter, async () => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const yearParam = searchParams.get("year");

      if (!yearParam) {
        return NextResponse.json(
          { error: "Query parameter 'year' is required" },
          { status: 400 }
        );
      }

      const year = Number(yearParam);
      if (!Number.isInteger(year)) {
        return NextResponse.json(
          { error: "Query parameter 'year' must be an integer" },
          { status: 400 }
        );
      }

      await connect();
      const LegalDocumentsModel = LegalDocuments as Model<ILegalDocuments>;
      const result = await LegalDocumentsModel.deleteOne({ year });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "Legal documents for this year were not found" },
          { status: 404 }
        );
      }

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error("Error deleting legal documents:", error);
      return NextResponse.json(
        { error: "Failed to delete legal documents" },
        { status: 500 }
      );
    }
  });
}
