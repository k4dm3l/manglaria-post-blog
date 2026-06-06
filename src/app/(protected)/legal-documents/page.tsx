"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UI_COPY } from "@/constants/ui";

interface LegalDocuments {
  financialStatementCorporacionManglaria: string;
  certificateOfLegalRequirements: string;
  actOfConstitutionCorporacionManglaria: string;
  certificateOfExistence: string;
  actOfGeneralAssembly: string;
  tributaryStatementsCorporacionManglaria: string;
  backgroundCheckCertificate: string;
  certificateOfManagmentPositions: string;
  managementReport: string;
}

const documentFields: Array<{
  name: keyof LegalDocuments;
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
];

const emptyDocuments: LegalDocuments = {
  financialStatementCorporacionManglaria: "",
  certificateOfLegalRequirements: "",
  actOfConstitutionCorporacionManglaria: "",
  certificateOfExistence: "",
  actOfGeneralAssembly: "",
  tributaryStatementsCorporacionManglaria: "",
  backgroundCheckCertificate: "",
  certificateOfManagmentPositions: "",
  managementReport: "",
};

export default function LegalDocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocuments>(emptyDocuments);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/legal-documents");
        if (!response.ok) throw new Error("Failed to fetch documents");
        const data = await response.json();
        setDocuments({
          financialStatementCorporacionManglaria:
            data.financialStatement || "",
          certificateOfLegalRequirements:
            data.certificateOfLegalRequirements || "",
          actOfConstitutionCorporacionManglaria:
            data.actOfConstitutionCorporacionManglaria || "",
          certificateOfExistence: data.certificateOfExistence || "",
          actOfGeneralAssembly: data.actOfGeneralAssembly || "",
          tributaryStatementsCorporacionManglaria:
            data.tributaryStatementsCorporacionManglaria || "",
          backgroundCheckCertificate: data.backgroundCheckCertificate || "",
          certificateOfManagmentPositions:
            data.certificateOfManagmentPositions || "",
          managementReport: data.managementReport || "",
        });
      } catch (error) {
        console.error("Error loading legal documents:", error);
        toast.error(UI_COPY.errors.generic);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/legal-documents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documents),
      });

      if (!response.ok) throw new Error("Failed to update documents");
      toast.success(UI_COPY.success.saved);
    } catch (error) {
      console.error("Error updating legal documents:", error);
      toast.error(UI_COPY.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDocuments((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_COPY.nav.legal}</CardTitle>
      </CardHeader>
      <CardContent>
        {initialLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {documentFields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="url"
                    value={documents[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : UI_COPY.actions.save}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
