import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl, BS_TRANSLATIONS as t } from "@/const";
import { Building2, Users, FileText, Settings, Calculator } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t.messages.loading}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-md w-full px-6 text-center space-y-8">
          <div className="space-y-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-24 h-24 mx-auto" />
            <h1 className="text-4xl font-bold text-gray-900">{APP_TITLE}</h1>
            <p className="text-lg text-gray-600">
              Kompletan sustav za obračun plaća u Bosni i Hercegovini
            </p>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dinamički i fleksibilan</CardTitle>
                <CardDescription>
                  Podržava sve tri jurisdikcije: FBiH, RS i BD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-left">
                <div className="flex items-start gap-2">
                  <Calculator className="w-4 h-4 mt-0.5 text-indigo-600" />
                  <span>Automatski obračun sa verzioniranim poreznim stopama</span>
                </div>
                <div className="flex items-start gap-2">
                  <Settings className="w-4 h-4 mt-0.5 text-indigo-600" />
                  <span>Potpuno konfigurabilan bez izmjene koda</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-indigo-600" />
                  <span>Generiranje državnih obrazaca (MIP, GIP)</span>
                </div>
              </CardContent>
            </Card>
            
            <Button asChild size="lg" className="w-full">
              <a href={getLoginUrl()}>Prijavi se</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10" />
            <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="outline" asChild>
              <Link href="/dashboard">{t.nav.dashboard}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Dobrodošli, {user?.name}!</h2>
            <p className="text-gray-600">Odaberite modul za početak rada</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle>{t.nav.tenants}</CardTitle>
                  </div>
                  <CardDescription>
                    Upravljanje kompanijama i njihovim podacima
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>{t.nav.employees}</CardTitle>
                  </div>
                  <CardDescription>
                    Evidencija zaposlenika i ugovora o radu
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calculator className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle>{t.nav.payroll}</CardTitle>
                  </div>
                  <CardDescription>
                    Obračun plaća i generiranje izvještaja
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/tax-rules">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>{t.nav.taxRules}</CardTitle>
                  </div>
                  <CardDescription>
                    Konfiguracija poreznih stopa i parametara
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
