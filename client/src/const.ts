export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "https://placehold.co/128x128/4F46E5/FFFFFF?text=BiH";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Bosanski prijevodi
export const BS_TRANSLATIONS = {
  // Navigation
  nav: {
    dashboard: "Kontrolna tabla",
    tenants: "Kompanije",
    employees: "Zaposlenici",
    contracts: "Ugovori",
    payroll: "Obračun plaća",
    payrollRuns: "Obračuni",
    taxRules: "Porezni parametri",
    wageTypes: "Vrste primanja",
    municipalities: "Općine",
    settings: "Postavke",
  },
  
  // Common actions
  actions: {
    add: "Dodaj",
    edit: "Uredi",
    delete: "Obriši",
    save: "Sačuvaj",
    cancel: "Odustani",
    search: "Pretraži",
    filter: "Filtriraj",
    export: "Izvezi",
    import: "Uvezi",
    calculate: "Izračunaj",
    approve: "Odobri",
    process: "Obradi",
    view: "Pregled",
    details: "Detalji",
  },
  
  // Jurisdictions
  jurisdictions: {
    FBIH: "Federacija BiH",
    RS: "Republika Srpska",
    BD: "Brčko Distrikt",
  },
  
  // Contract types
  contractTypes: {
    ODREĐENO: "Određeno vrijeme",
    NEODREĐENO: "Neodređeno vrijeme",
  },
  
  // Payroll status
  payrollStatus: {
    DRAFT: "Nacrt",
    APPROVED: "Odobren",
    LOCKED: "Zaključan",
  },
  
  // Employee fields
  employee: {
    jmbg: "JMBG",
    firstName: "Ime",
    lastName: "Prezime",
    email: "Email",
    phone: "Telefon",
    iban: "IBAN",
    residenceCode: "Šifra općine",
    residenceJurisdiction: "Entitet prebivališta",
    taxFactor: "Faktor porezne kartice",
    isActive: "Aktivan",
  },
  
  // Contract fields
  contract: {
    contractType: "Tip ugovora",
    grossAmount: "Bruto plaća",
    startDate: "Datum početka",
    endDate: "Datum završetka",
    pensionFundChoice: "Izbor PIO fonda",
    minuliRadStartDate: "Datum početka staža",
    previousTenureYears: "Prethodni staž (godine)",
  },
  
  // Payroll fields
  payroll: {
    month: "Mjesec",
    year: "Godina",
    paymentDate: "Datum isplate",
    workDays: "Radni dani",
    seniorityYears: "Godine staža",
    grossAmount: "Bruto",
    netAmount: "Neto",
    taxAmount: "Porez",
    contributionsFrom: "Doprinosi iz plaće",
    contributionsOn: "Doprinosi na plaću",
    totalCost: "Ukupni trošak",
  },
  
  // Tax rule fields
  taxRule: {
    jurisdictionCode: "Jurisdikcija",
    ruleCode: "Šifra pravila",
    ruleType: "Tip pravila",
    rateValue: "Stopa (%)",
    description: "Opis",
    validFrom: "Važeće od",
    validTo: "Važeće do",
  },
  
  // Messages
  messages: {
    loading: "Učitavanje...",
    noData: "Nema podataka",
    error: "Greška",
    success: "Uspješno",
    confirmDelete: "Jeste li sigurni da želite obrisati?",
    deleteSuccess: "Uspješno obrisano",
    saveSuccess: "Uspješno sačuvano",
    calculateSuccess: "Obračun uspješno izvršen",
  },
  
  // Months
  months: {
    1: "Januar",
    2: "Februar",
    3: "Mart",
    4: "April",
    5: "Maj",
    6: "Juni",
    7: "Juli",
    8: "August",
    9: "Septembar",
    10: "Oktobar",
    11: "Novembar",
    12: "Decembar",
  },
};
