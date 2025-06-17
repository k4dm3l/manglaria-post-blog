"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalDocuments {
  chamberOfCommerce: string;
  financialStatementsAssembly: string;
  surplusCertificate: string;
  bylaws: string;
  financialStatement: string;
}

export default function LegalDocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<LegalDocuments>({
    chamberOfCommerce: "",
    financialStatementsAssembly: "",
    surplusCertificate: "",
    bylaws: "",
    financialStatement: "",
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/legal-documents");
        if (!response.ok) throw new Error("Failed to fetch documents");
        const data = await response.json();
        setDocuments({
          chamberOfCommerce: data.chamberOfCommerce || "",
          financialStatementsAssembly: data.financialStatementsAssembly || "",
          surplusCertificate: data.surplusCertificate || "",
          bylaws: data.bylaws || "",
          financialStatement: data.financialStatement || "",
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
                  <Label htmlFor="chamberOfCommerce">Camara de Comercio</Label>
                  <Input
                    id="chamberOfCommerce"
                    name="chamberOfCommerce"
                    value={documents.chamberOfCommerce}
                    onChange={handleChange}
                    placeholder="URL de la Camara de Comercio"
                  />
                </div>
                <div>
                  <Label htmlFor="financialStatementsAssembly">Asamblea de Estados Financieros</Label>
                  <Input
                    id="financialStatementsAssembly"
                    name="financialStatementsAssembly"
                    value={documents.financialStatementsAssembly}
                    onChange={handleChange}
                    placeholder="URL de la Asamblea de Estados Financieros"
                  />
                </div>
                <div>
                  <Label htmlFor="surplusCertificate">Certificado de Superávit</Label>
                  <Input
                    id="surplusCertificate"
                    name="surplusCertificate"
                    value={documents.surplusCertificate}
                    onChange={handleChange}
                    placeholder="URL del Certificado de Superávit"
                  />
                </div>
                <div>
                  <Label htmlFor="bylaws">Estatutos</Label>
                  <Input
                    id="bylaws"
                    name="bylaws"
                    value={documents.bylaws}
                    onChange={handleChange}
                    placeholder="URL de los Estatutos"
                  />
                </div>
                <div>
                  <Label htmlFor="financialStatement">Estado Financiero</Label>
                  <Input
                    id="financialStatement"
                    name="financialStatement"
                    value={documents.financialStatement}
                    onChange={handleChange}
                    placeholder="URL del Estado Financiero"
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
