# TODO - Sustav za obračun plaća u BiH

## Faza 1: Dizajn baze podataka i sheme
- [x] Definisati shemu za tenants (multi-tenancy podrška)
- [x] Definisati shemu za tax_rules (dinamičke porezne stope)
- [x] Definisati shemu za employees (zaposlenici)
- [x] Definisati shemu za contracts (ugovori o radu)
- [x] Definisati shemu za payroll_runs (obračuni)
- [x] Definisati shemu za payroll_items (stavke obračuna)
- [x] Definisati shemu za wage_types (vrste primanja)
- [x] Definisati shemu za municipalities (šifrarnik općina)
- [x] Definisati shemu za system_settings (sistemske postavke)

## Faza 2: Implementacija osnovnih entiteta i migracija
- [x] Implementirati sve tablice u drizzle/schema.ts
- [x] Pokrenuti db:push za kreiranje baze
- [x] Kreirati seed podatke za jurisdikcije (FBiH, RS, BD)
- [x] Kreirati seed podatke za osnovne porezne stope
- [x] Kreirati seed podatke za šifrarnik općina

## Faza 3: Razvoj backend API-ja za obračun plaća
- [x] Implementirati API za upravljanje zaposlenicima (CRUD)
- [x] Implementirati API za upravljanje ugovorima (CRUD)
- [x] Implementirati API za porezne parametre (CRUD sa verzioniranjem)
- [x] Implementirati API za vrste primanja (CRUD)
- [x] Implementirati kalkulacijski engine za FBiH
- [x] Implementirati kalkulacijski engine za RS
- [x] Implementirati kalkulacijski engine za BD
- [x] Implementirati logiku za minuli rad (senioritet)
- [x] Implementirati logiku za topli obrok (FBiH vs RS)
- [x] Implementirati inverzni kalkulator (Neto u Bruto)
- [x] Implementirati API za kreiranje obračuna
- [x] Implementirati API za odobravanje obračuna
- [ ] Implementirati API za generiranje izvještaja

## Faza 4: Razvoj frontend sučelja sa dinamičkim formama
- [ ] Kreirati Dashboard Layout sa navigacijom
- [ ] Implementirati stranicu za zaposlenike (lista, dodavanje, uređivanje, brisanje)
- [ ] Implementirati stranicu za ugovore
- [ ] Implementirati stranicu za obračun plaća
- [ ] Implementirati stranicu za pregled obračuna
- [ ] Implementirati forme sa validacijom
- [ ] Implementirati prikaz rezultata obračuna

## Faza 5: Implementacija sistema za konfiguraciju i postavke
- [ ] Implementirati stranicu za porezne parametre
- [ ] Implementirati stranicu za vrste primanja
- [ ] Implementirati stranicu za sistemske postavke
- [ ] Implementirati verzioniranje poreznih stopa
- [ ] Implementirati validaciju datuma važenja
- [ ] Implementirati pregled historije izmjena

## Faza 6: Testiranje i finalizacija aplikacije
- [ ] Napisati testove za kalkulacijski engine (FBiH)
- [ ] Napisati testove za kalkulacijski engine (RS)
- [ ] Napisati testove za kalkulacijski engine (BD)
- [ ] Napisati testove za minuli rad
- [ ] Napisati testove za topli obrok
- [ ] Napisati testove za inverzni kalkulator
- [ ] Testirati sve CRUD operacije
- [ ] Testirati validaciju podataka
- [ ] Testirati multi-tenancy funkcionalnost

## Faza 7: Dostava i dokumentacija
- [ ] Kreirati korisničku dokumentaciju
- [ ] Kreirati tehničku dokumentaciju
- [ ] Pripremiti checkpoint za deployment
- [ ] Finalna provjera i dostava korisniku
