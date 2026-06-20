import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LegalDocumentsYearsList } from "@/components/legal-documents/legal-documents-years-list";
import { UI_COPY } from "@/constants/ui";

export default function LegalDocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_COPY.nav.legal}</CardTitle>
      </CardHeader>
      <CardContent>
        <LegalDocumentsYearsList />
      </CardContent>
    </Card>
  );
}
