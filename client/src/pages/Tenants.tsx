import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Tenants() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">← Nazad</Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Kompanije</h1>
      <p>Stranica u izradi - koristite Dashboard za upravljanje kompanijama</p>
    </div>
  );
}
