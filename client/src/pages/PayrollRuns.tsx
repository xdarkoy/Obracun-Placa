import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BS_TRANSLATIONS as t } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, Calculator } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PayrollRuns() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paymentDate: "",
  });

  const { data: payrollRuns, isLoading, refetch } = trpc.payrollRuns.list.useQuery(
    { tenantId: parseInt(tenantId!) },
    { enabled: !!tenantId }
  );

  const createPayrollRun = trpc.payrollRuns.create.useMutation({
    onSuccess: () => {
      toast.success(t.messages.saveSuccess);
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const processPayroll = trpc.payroll.processRun.useMutation({
    onSuccess: (data) => {
      toast.success(`Obrađeno ${data.processedCount} zaposlenika`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPayrollRun.mutate({
      ...formData,
      tenantId: parseInt(tenantId!),
    });
  };

  const handleProcess = (runId: number) => {
    if (confirm("Jeste li sigurni da želite obraditi ovaj obračun?")) {
      processPayroll.mutate({
        payrollRunId: runId,
        tenantId: parseInt(tenantId!),
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">← Nazad</Link>
          </Button>
          <h1 className="text-3xl font-bold">{t.nav.payrollRuns}</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novi obračun
        </Button>
      </div>

      {isLoading ? (
        <p>{t.messages.loading}</p>
      ) : !payrollRuns || payrollRuns.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nema obračuna</CardTitle>
            <CardDescription>Kreirajte prvi obračun plaća</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novi obračun
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista obračuna</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum isplate</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {t.months[run.month as keyof typeof t.months]} {run.year}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          run.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : run.status === "LOCKED"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.payrollStatus[run.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {run.paymentDate
                        ? new Date(run.paymentDate).toLocaleDateString("bs-BA")
                        : "-"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {run.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleProcess(run.id)}
                          disabled={processPayroll.isPending}
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Obradi
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/payroll/${tenantId}/${run.id}`}>
                          Detalji
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Kreiraj novi obračun</DialogTitle>
              <DialogDescription>
                Unesite period za koji želite kreirati obračun plaća
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Mjesec *</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Godina *</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Datum isplate</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t.actions.cancel}
              </Button>
              <Button type="submit" disabled={createPayrollRun.isPending}>
                {createPayrollRun.isPending ? t.messages.loading : t.actions.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
