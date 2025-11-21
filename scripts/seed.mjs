import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { taxRules, municipalities, wageTypes } from "../drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL nije postavljen!");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Počinjem seed podataka...");

  // Seed općine (primjer - treba dodati sve općine)
  const municipalitiesData = [
    { code: "077", name: "Centar Sarajevo", jurisdiction: "FBIH" },
    { code: "078", name: "Novi Grad Sarajevo", jurisdiction: "FBIH" },
    { code: "079", name: "Novo Sarajevo", jurisdiction: "FBIH" },
    { code: "080", name: "Stari Grad Sarajevo", jurisdiction: "FBIH" },
    { code: "001", name: "Banja Luka", jurisdiction: "RS" },
    { code: "002", name: "Bijeljina", jurisdiction: "RS" },
    { code: "003", name: "Doboj", jurisdiction: "RS" },
    { code: "004", name: "Prijedor", jurisdiction: "RS" },
    { code: "BD1", name: "Brčko Distrikt", jurisdiction: "BD" },
  ];

  console.log("Dodajem općine...");
  for (const mun of municipalitiesData) {
    await db.insert(municipalities).values(mun).onDuplicateKeyUpdate({ set: { name: mun.name } });
  }

  // Seed porezne stope za FBiH (trenutni model)
  const fbihTaxRulesData = [
    // Doprinosi IZ plaće
    { jurisdictionCode: "FBIH", ruleCode: "PIO_FROM", ruleType: "CONTRIBUTION", rateValue: 1700, description: "Mirovinsko i invalidsko osiguranje IZ plaće", validFrom: "2020-01-01", validTo: "2025-06-30" },
    { jurisdictionCode: "FBIH", ruleCode: "HEALTH_FROM", ruleType: "CONTRIBUTION", rateValue: 1250, description: "Zdravstveno osiguranje IZ plaće", validFrom: "2020-01-01", validTo: "2025-06-30" },
    { jurisdictionCode: "FBIH", ruleCode: "UNEMPLOYMENT_FROM", ruleType: "CONTRIBUTION", rateValue: 150, description: "Osiguranje od nezaposlenosti IZ plaće", validFrom: "2020-01-01", validTo: "2025-06-30" },
    
    // Doprinosi NA plaću
    { jurisdictionCode: "FBIH", ruleCode: "PIO_ON", ruleType: "CONTRIBUTION", rateValue: 600, description: "Mirovinsko i invalidsko osiguranje NA plaću", validFrom: "2020-01-01", validTo: "2025-06-30" },
    { jurisdictionCode: "FBIH", ruleCode: "HEALTH_ON", ruleType: "CONTRIBUTION", rateValue: 400, description: "Zdravstveno osiguranje NA plaću", validFrom: "2020-01-01", validTo: "2025-06-30" },
    { jurisdictionCode: "FBIH", ruleCode: "UNEMPLOYMENT_ON", ruleType: "CONTRIBUTION", rateValue: 50, description: "Osiguranje od nezaposlenosti NA plaću", validFrom: "2020-01-01", validTo: "2025-06-30" },
    
    // Porez
    { jurisdictionCode: "FBIH", ruleCode: "INCOME_TAX", ruleType: "TAX", rateValue: 1000, description: "Porez na dohodak", validFrom: "2020-01-01", validTo: null },
    
    // Osobni odbitak
    { jurisdictionCode: "FBIH", ruleCode: "PERSONAL_DEDUCTION", ruleType: "DEDUCTION", rateValue: 30000, description: "Osnovni osobni odbitak (300 KM)", validFrom: "2020-01-01", validTo: null },
    
    // Limiti za neoporezive naknade
    { jurisdictionCode: "FBIH", ruleCode: "MEAL_DAILY_LIMIT", ruleType: "LIMIT", rateValue: 1000, description: "Dnevni limit za topli obrok (10 KM)", validFrom: "2020-01-01", validTo: null },
  ];

  // Seed porezne stope za FBiH (budući model - reforma 2025)
  const fbihFutureRulesData = [
    { jurisdictionCode: "FBIH", ruleCode: "PIO_FROM", ruleType: "CONTRIBUTION", rateValue: 1700, description: "Mirovinsko i invalidsko osiguranje IZ plaće (reforma)", validFrom: "2025-07-01", validTo: null },
    { jurisdictionCode: "FBIH", ruleCode: "HEALTH_FROM", ruleType: "CONTRIBUTION", rateValue: 1250, description: "Zdravstveno osiguranje IZ plaće (reforma)", validFrom: "2025-07-01", validTo: null },
    { jurisdictionCode: "FBIH", ruleCode: "UNEMPLOYMENT_FROM", ruleType: "CONTRIBUTION", rateValue: 150, description: "Osiguranje od nezaposlenosti IZ plaće (reforma)", validFrom: "2025-07-01", validTo: null },
    { jurisdictionCode: "FBIH", ruleCode: "PIO_ON", ruleType: "CONTRIBUTION", rateValue: 250, description: "Mirovinsko i invalidsko osiguranje NA plaću (reforma -3.5%)", validFrom: "2025-07-01", validTo: null },
    { jurisdictionCode: "FBIH", ruleCode: "HEALTH_ON", ruleType: "CONTRIBUTION", rateValue: 200, description: "Zdravstveno osiguranje NA plaću (reforma -2%)", validFrom: "2025-07-01", validTo: null },
    { jurisdictionCode: "FBIH", ruleCode: "UNEMPLOYMENT_ON", ruleType: "CONTRIBUTION", rateValue: 50, description: "Osiguranje od nezaposlenosti NA plaću (reforma)", validFrom: "2025-07-01", validTo: null },
  ];

  // Seed porezne stope za RS
  const rsTaxRulesData = [
    { jurisdictionCode: "RS", ruleCode: "PIO", ruleType: "CONTRIBUTION", rateValue: 1850, description: "Mirovinsko i invalidsko osiguranje", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "HEALTH", ruleType: "CONTRIBUTION", rateValue: 1200, description: "Zdravstveno osiguranje", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "CHILD_PROTECTION", ruleType: "CONTRIBUTION", rateValue: 170, description: "Dječja zaštita", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "UNEMPLOYMENT", ruleType: "CONTRIBUTION", rateValue: 60, description: "Osiguranje od nezaposlenosti", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "INCOME_TAX", ruleType: "TAX", rateValue: 800, description: "Porez na dohodak", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "PERSONAL_DEDUCTION", ruleType: "DEDUCTION", rateValue: 8333, description: "Osobni odbitak mjesečno (83.33 KM)", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "RS", ruleCode: "SENIORITY_RATE", ruleType: "CONTRIBUTION", rateValue: 30, description: "Stopa minulog rada (0.3%)", validFrom: "2020-01-01", validTo: null },
  ];

  // Seed porezne stope za BD
  const bdTaxRulesData = [
    { jurisdictionCode: "BD", ruleCode: "HEALTH", ruleType: "CONTRIBUTION", rateValue: 1200, description: "Zdravstveno osiguranje BD", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "BD", ruleCode: "UNEMPLOYMENT", ruleType: "CONTRIBUTION", rateValue: 150, description: "Osiguranje od nezaposlenosti BD", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "BD", ruleCode: "INCOME_TAX", ruleType: "TAX", rateValue: 1000, description: "Porez na dohodak BD", validFrom: "2020-01-01", validTo: null },
    { jurisdictionCode: "BD", ruleCode: "PERSONAL_DEDUCTION", ruleType: "DEDUCTION", rateValue: 30000, description: "Osnovni osobni odbitak BD (300 KM)", validFrom: "2020-01-01", validTo: null },
  ];

  console.log("Dodajem porezne stope...");
  const allTaxRules = [...fbihTaxRulesData, ...fbihFutureRulesData, ...rsTaxRulesData, ...bdTaxRulesData];
  for (const rule of allTaxRules) {
    await db.insert(taxRules).values(rule).onDuplicateKeyUpdate({ set: { description: rule.description } });
  }

  console.log("Seed podataka završen!");
  await connection.end();
}

seed().catch((error) => {
  console.error("Greška prilikom seed-a:", error);
  process.exit(1);
});
