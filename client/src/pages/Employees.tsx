import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BS_TRANSLATIONS as t } from "@/const";
import { trpc } from "@/lib/trpc";
import { Plus, UserPlus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Employees() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jmbg: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    iban: "",
    currentResidenceCode: "",
    residenceJurisdiction: "FBIH" as "FBIH" | "RS" | "BD",
    taxFactor: 100,
  });

  const { data: employees, isLoading, refetch } = trpc.employees.list.useQuery(
    { tenantId: parseInt(tenantId!) },
    { enabled: !!tenantId }
  );

  const createEmployee = trpc.employees.create.useMutation({
    onSuccess: () => {
      toast.success(t.messages.saveSuccess);
      setIsAddDialogOpen(false);
      setFormData({
        jmbg: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        iban: "",
        currentResidenceCode: "",
        residenceJurisdiction: "FBIH",
        taxFactor: 100,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate({
      ...formData,
      tenantId: parseInt(tenantId!),
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" asChild className="mb-4">
            <Link href="/dashboard">← Nazad na Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-bold">{t.nav.employees}</h1>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj zaposlenika
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t.messages.loading}</p>
        </div>
      ) : !employees || employees.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <UserPlus className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Nema zaposlenika</CardTitle>
            <CardDescription>
              Dodajte prvog zaposlenika kako biste započeli sa obračunom plaća
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj zaposlenika
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista zaposlenika</CardTitle>
            <CardDescription>
              Ukupno zaposlenika: {employees.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JMBG</TableHead>
                  <TableHead>Ime i prezime</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Općina</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-mono text-sm">
                      {employee.jmbg}
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.email || "-"}</TableCell>
                    <TableCell>{employee.currentResidenceCode}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          employee.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {employee.isActive ? "Aktivan" : "Neaktivan"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contracts/${employee.id}`}>
                          Ugovori
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Dodaj novog zaposlenika</DialogTitle>
              <DialogDescription>
                Unesite osnovne podatke o zaposleniku
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="jmbg">JMBG *</Label>
                <Input
                  id="jmbg"
                  value={formData.jmbg}
                  onChange={(e) =>
                    setFormData({ ...formData, jmbg: e.target.value })
                  }
                  maxLength={13}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Ime *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Prezime *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="residenceCode">Šifra općine *</Label>
                <Input
                  id="residenceCode"
                  value={formData.currentResidenceCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentResidenceCode: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="residenceJurisdiction">
                  Entitet prebivališta *
                </Label>
                <Select
                  value={formData.residenceJurisdiction}
                  onValueChange={(value: "FBIH" | "RS" | "BD") =>
                    setFormData({ ...formData, residenceJurisdiction: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FBIH">{t.jurisdictions.FBIH}</SelectItem>
                    <SelectItem value="RS">{t.jurisdictions.RS}</SelectItem>
                    <SelectItem value="BD">{t.jurisdictions.BD}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxFactor">Faktor porezne kartice</Label>
                <Input
                  id="taxFactor"
                  type="number"
                  value={formData.taxFactor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taxFactor: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  100 = 1.0, 150 = 1.5
                </p>
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
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? t.messages.loading : t.actions.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
