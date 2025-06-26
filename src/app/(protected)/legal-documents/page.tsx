"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function LegalDocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<LegalDocuments>({
    financialStatementCorporacionManglaria: "",
    certificateOfLegalRequirements: "",
    actOfConstitutionCorporacionManglaria: "",
    certificateOfExistence: "",
    actOfGeneralAssembly: "",
    tributaryStatementsCorporacionManglaria: "",
    backgroundCheckCertificate: "",
    certificateOfManagmentPositions: "",
    managementReport: "",
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/legal-documents");
        if (!response.ok) throw new Error("Failed to fetch documents");
        const data = await response.json();
        setDocuments({
          financialStatementCorporacionManglaria: data.financialStatement || "",
          certificateOfLegalRequirements: data.certificateOfLegalRequirements || "",
          actOfConstitutionCorporacionManglaria: data.actOfConstitutionCorporacionManglaria || "",
          certificateOfExistence: data.certificateOfExistence || "",
          actOfGeneralAssembly: data.actOfGeneralAssembly || "",
          tributaryStatementsCorporacionManglaria: data.tributaryStatementsCorporacionManglaria || "",
          backgroundCheckCertificate: data.backgroundCheckCertificate || "",
          certificateOfManagmentPositions: data.certificateOfManagmentPositions || "",
          managementReport: data.managementReport || "",
        });
      } catch (error) {
        console.error("Error loading legal documents:", error);
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

    } catch (error) {
      console.error("Error updating legal documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDocuments(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="financialStatementCorporacionManglaria">Estado Financiero de la Corporación Manglaria</Label>
                  <Input
                    id="financialStatementCorporacionManglaria"
                    name="financialStatementCorporacionManglaria"
                    value={documents.financialStatementCorporacionManglaria}
                    onChange={handleChange}
                    placeholder="URL del Estado Financiero de la Corporación Manglaria"
                  />
                </div>
                <div>
                  <Label htmlFor="certificateOfLegalRequirements">Certificado de Requisitos Legales</Label>
                  <Input
                    id="certificateOfLegalRequirements"
                    name="certificateOfLegalRequirements"
                    value={documents.certificateOfLegalRequirements}
                    onChange={handleChange}
                    placeholder="URL del Certificado de Requisitos Legales"
                  />
                </div>
                <div>
                  <Label htmlFor="actOfConstitutionCorporacionManglaria">Acta de Constitución de la Corporación Manglaria</Label>
                  <Input
                    id="actOfConstitutionCorporacionManglaria"
                    name="actOfConstitutionCorporacionManglaria"
                    value={documents.actOfConstitutionCorporacionManglaria}
                    onChange={handleChange}
                    placeholder="URL de la Acta de Constitución de la Corporación Manglaria"
                  />
                </div>
                <div>
                  <Label htmlFor="certificateOfExistence">Certificado de Existencia</Label>
                  <Input
                    id="certificateOfExistence"
                    name="certificateOfExistence"
                    value={documents.certificateOfExistence}
                    onChange={handleChange}
                    placeholder="URL del Certificado de Existencia"
                  />
                </div>
                <div>
                  <Label htmlFor="actOfGeneralAssembly">Acta de General Asamblea</Label>
                  <Input
                    id="actOfGeneralAssembly"
                    name="actOfGeneralAssembly"
                    value={documents.actOfGeneralAssembly}
                    onChange={handleChange}
                    placeholder="URL de la Acta de General Asamblea"
                  />
                </div>
                <div>
                  <Label htmlFor="tributaryStatementsCorporacionManglaria">Declaración Tributaria de la Corporación Manglaria</Label>
                  <Input
                    id="tributaryStatementsCorporacionManglaria"
                    name="tributaryStatementsCorporacionManglaria"
                    value={documents.tributaryStatementsCorporacionManglaria}
                    onChange={handleChange}
                    placeholder="URL de la Declaración Tributaria de la Corporación Manglaria"
                  />
                </div>
                <div>
                  <Label htmlFor="backgroundCheckCertificate">Certificado de Verificación de Antecedentes</Label>
                  <Input
                    id="backgroundCheckCertificate"
                    name="backgroundCheckCertificate"
                    value={documents.backgroundCheckCertificate}
                    onChange={handleChange}
                    placeholder="URL del Certificado de Verificación de Antecedentes"
                  />
                </div>
                <div>
                  <Label htmlFor="certificateOfManagmentPositions">Certificado de Posiciones de Gestión</Label>
                  <Input
                    id="certificateOfManagmentPositions"
                    name="certificateOfManagmentPositions"
                    value={documents.certificateOfManagmentPositions}
                    onChange={handleChange}
                    placeholder="URL del Certificado de Posiciones de Gestión"
                  />
                </div>
                <div>
                  <Label htmlFor="managementReport">Reporte de Gestión</Label>
                  <Input
                    id="managementReport"
                    name="managementReport"
                    value={documents.managementReport}
                    onChange={handleChange}
                    placeholder="URL del Reporte de Gestión"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
