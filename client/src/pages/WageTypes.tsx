import { Link } from "wouter";
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

export default function WageTypes() {
  const { data: wageTypes, isLoading } = trpc.wageTypes.list.useQuery({
    tenantId: null,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Button variant="outline" asChild className="mb-4">
          <Link href="/dashboard">← Nazad</Link>
        </Button>
        <h1 className="text-3xl font-bold">{t.nav.wageTypes}</h1>
      </div>

      {isLoading ? (
        <p>{t.messages.loading}</p>
      ) : !wageTypes || wageTypes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nema vrsta primanja</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vrste primanja</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Oporezivo FBiH</TableHead>
                  <TableHead>Oporezivo RS</TableHead>
                  <TableHead>Uključuje PIO</TableHead>
                  <TableHead>Neto u Bruto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wageTypes.map((wageType) => (
                  <TableRow key={wageType.id}>
                    <TableCell className="font-mono text-sm">
                      {wageType.code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {wageType.name}
                    </TableCell>
                    <TableCell>
                      {wageType.isTaxableFBIH ? "✓" : "✗"}
                    </TableCell>
                    <TableCell>
                      {wageType.isTaxableRS ? "✓" : "✗"}
                    </TableCell>
                    <TableCell>
                      {wageType.includesInPIO ? "✓" : "✗"}
                    </TableCell>
                    <TableCell>
                      {wageType.isNetToGross ? "✓" : "✗"}
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
