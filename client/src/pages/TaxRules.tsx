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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function TaxRules() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<"FBIH" | "RS" | "BD" | "ALL">("ALL");

  const { data: taxRules, isLoading } = trpc.taxRules.list.useQuery();

  const filteredRules = selectedJurisdiction === "ALL"
    ? taxRules
    : taxRules?.filter((rule) => rule.jurisdictionCode === selectedJurisdiction);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">← Nazad</Link>
          </Button>
          <h1 className="text-3xl font-bold">{t.nav.taxRules}</h1>
        </div>
        <div className="w-64">
          <Select
            value={selectedJurisdiction}
            onValueChange={(value: "FBIH" | "RS" | "BD" | "ALL") =>
              setSelectedJurisdiction(value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Sve jurisdikcije</SelectItem>
              <SelectItem value="FBIH">{t.jurisdictions.FBIH}</SelectItem>
              <SelectItem value="RS">{t.jurisdictions.RS}</SelectItem>
              <SelectItem value="BD">{t.jurisdictions.BD}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p>{t.messages.loading}</p>
      ) : !filteredRules || filteredRules.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nema poreznih pravila</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Porezna pravila i stope</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jurisdikcija</TableHead>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead className="text-right">Stopa (%)</TableHead>
                  <TableHead>Važeće od</TableHead>
                  <TableHead>Važeće do</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      {t.jurisdictions[rule.jurisdictionCode]}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.ruleCode}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rule.ruleType === "CONTRIBUTION"
                            ? "bg-blue-100 text-blue-700"
                            : rule.ruleType === "TAX"
                            ? "bg-purple-100 text-purple-700"
                            : rule.ruleType === "LIMIT"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {rule.ruleType}
                      </span>
                    </TableCell>
                    <TableCell>{rule.description || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {rule.rateValue.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {new Date(rule.validFrom).toLocaleDateString("bs-BA")}
                    </TableCell>
                    <TableCell>
                      {rule.validTo
                        ? new Date(rule.validTo).toLocaleDateString("bs-BA")
                        : "Trenutno"}
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
