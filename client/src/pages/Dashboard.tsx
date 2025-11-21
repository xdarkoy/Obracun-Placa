import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BS_TRANSLATIONS as t } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, Users, Calculator, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
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

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    address: "",
    jurisdiction: "FBIH" as "FBIH" | "RS" | "BD",
  });

  const { data: tenants, isLoading, refetch } = trpc.tenants.list.useQuery();
  const createTenant = trpc.tenants.create.useMutation({
    onSuccess: () => {
      toast.success(t.messages.saveSuccess);
      setIsAddDialogOpen(false);
      setFormData({ name: "", taxId: "", address: "", jurisdiction: "FBIH" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTenant.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t.nav.dashboard}</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.actions.add} {t.nav.tenants}
          </Button>
        </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t.messages.loading}</p>
        </div>
      ) : !tenants || tenants.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nema kompanija</h3>
          <p className="text-muted-foreground mb-4">
            Dodajte prvu kompaniju kako biste započeli sa obračunom plaća
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj kompaniju
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription>
                        {t.jurisdictions[tenant.jurisdiction]}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tenant.taxId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">PIB/JIB: </span>
                    <span className="font-medium">{tenant.taxId}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="text-sm text-muted-foreground">
                    {tenant.address}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employees/${tenant.id}`}>
                      <Users className="w-4 h-4 mr-2" />
                      {t.nav.employees}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/payroll/${tenant.id}`}>
                      <Calculator className="w-4 h-4 mr-2" />
                      {t.nav.payroll}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Dodaj novu kompaniju</DialogTitle>
              <DialogDescription>
                Unesite podatke o kompaniji za koju želite voditi obračun plaća
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv kompanije *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdikcija *</Label>
                <Select
                  value={formData.jurisdiction}
                  onValueChange={(value: "FBIH" | "RS" | "BD") =>
                    setFormData({ ...formData, jurisdiction: value })
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
                <Label htmlFor="taxId">PIB/JIB</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
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
              <Button type="submit" disabled={createTenant.isPending}>
                {createTenant.isPending ? t.messages.loading : t.actions.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
