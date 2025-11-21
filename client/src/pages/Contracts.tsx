import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BS_TRANSLATIONS as t } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Contracts() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    contractType: "NEODREĐENO" as "ODREĐENO" | "NEODREĐENO",
    grossAmount: 0,
    startDate: "",
    endDate: "",
    pensionFundChoice: undefined as "FBIH_FUND" | "RS_FUND" | undefined,
    minuliRadStartDate: "",
    previousTenureYears: 0,
  });

  const { data: employee } = trpc.employees.get.useQuery(
    { id: parseInt(employeeId!) },
    { enabled: !!employeeId }
  );

  const { data: contracts, isLoading, refetch } = trpc.contracts.list.useQuery(
    { employeeId: parseInt(employeeId!) },
    { enabled: !!employeeId }
  );

  const createContract = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast.success(t.messages.saveSuccess);
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContract.mutate({
      ...formData,
      employeeId: parseInt(employeeId!),
      grossAmount: formData.grossAmount * 100, // Convert to pfenigs
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">← Nazad</Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Ugovori - {employee?.firstName} {employee?.lastName}
          </h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj ugovor
        </Button>
      </div>

      {isLoading ? (
        <p>{t.messages.loading}</p>
      ) : !contracts || contracts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nema ugovora</CardTitle>
            <CardDescription>Dodajte prvi ugovor o radu</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj ugovor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <CardTitle>{t.contractTypes[contract.contractType]}</CardTitle>
                <CardDescription>
                  {new Date(contract.startDate).toLocaleDateString("bs-BA")} -{" "}
                  {contract.endDate
                    ? new Date(contract.endDate).toLocaleDateString("bs-BA")
                    : "Trenutno"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bruto plaća</p>
                  <p className="text-lg font-semibold">
                    {(contract.grossAmount / 100).toFixed(2)} KM
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold">
                    {contract.isActive ? "Aktivan" : "Neaktivan"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Dodaj novi ugovor</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Tip ugovora *</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value: "ODREĐENO" | "NEODREĐENO") =>
                    setFormData({ ...formData, contractType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEODREĐENO">
                      {t.contractTypes.NEODREĐENO}
                    </SelectItem>
                    <SelectItem value="ODREĐENO">
                      {t.contractTypes.ODREĐENO}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bruto plaća (KM) *</Label>
                <Input
                  type="number"
                  value={formData.grossAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grossAmount: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Datum početka *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Datum završetka</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Datum početka staža *</Label>
                <Input
                  type="date"
                  value={formData.minuliRadStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minuliRadStartDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prethodni staž (godine)</Label>
                <Input
                  type="number"
                  value={formData.previousTenureYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      previousTenureYears: parseInt(e.target.value),
                    })
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
              <Button type="submit" disabled={createContract.isPending}>
                {createContract.isPending ? t.messages.loading : t.actions.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
