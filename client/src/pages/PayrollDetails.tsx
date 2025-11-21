import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BS_TRANSLATIONS as t } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PayrollDetails() {
  const { tenantId, runId } = useParams<{ tenantId: string; runId: string }>();

  const { data: payrollRun } = trpc.payrollRuns.get.useQuery(
    { id: parseInt(runId!) },
    { enabled: !!runId }
  );

  const { data: payrollItems, isLoading } = trpc.payrollItems.list.useQuery(
    { payrollRunId: parseInt(runId!) },
    { enabled: !!runId }
  );

  const { data: employees } = trpc.employees.list.useQuery(
    { tenantId: parseInt(tenantId!) },
    { enabled: !!tenantId }
  );

  const getEmployeeName = (employeeId: number) => {
    const employee = employees?.find((e) => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "-";
  };

  const totalNet = payrollItems?.reduce((sum, item) => sum + item.netAmount, 0) || 0;
  const totalGross = payrollItems?.reduce((sum, item) => sum + item.calculatedGross, 0) || 0;
  const totalCost = payrollItems?.reduce((sum, item) => sum + item.totalCost, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Button variant="outline" asChild className="mb-4">
          <Link href={`/payroll/${tenantId}`}>← Nazad na obračune</Link>
        </Button>
        <h1 className="text-3xl font-bold">
          Detalji obračuna -{" "}
          {payrollRun && `${t.months[payrollRun.month as keyof typeof t.months]} ${payrollRun.year}`}
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ukupno Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(totalGross / 100).toFixed(2)} KM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ukupno Neto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(totalNet / 100).toFixed(2)} KM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ukupni trošak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(totalCost / 100).toFixed(2)} KM</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <p>{t.messages.loading}</p>
      ) : !payrollItems || payrollItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nema stavki obračuna</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Pokrenite obradu obračuna kako bi se generisale stavke
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Stavke obračuna</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zaposlenik</TableHead>
                  <TableHead className="text-right">Bruto</TableHead>
                  <TableHead className="text-right">Doprinosi iz</TableHead>
                  <TableHead className="text-right">Porez</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                  <TableHead className="text-right">Doprinosi na</TableHead>
                  <TableHead className="text-right">Ukupni trošak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {getEmployeeName(item.employeeId)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.calculatedGross / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{(item.contributionsFrom / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{(item.taxAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(item.netAmount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      +{(item.contributionsOn / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(item.totalCost / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
