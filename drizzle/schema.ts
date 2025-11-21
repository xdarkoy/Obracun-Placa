import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tenants - Multi-tenancy support for multiple companies
 */
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  taxId: varchar("taxId", { length: 50 }), // PIB/JIB
  address: text("address"),
  jurisdiction: mysqlEnum("jurisdiction", ["FBIH", "RS", "BD"]).notNull(),
  ownerId: int("ownerId").notNull().references(() => users.id),
  settingsJson: text("settingsJson"), // JSON for additional settings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Municipalities - Šifrarnik općina u BiH
 */
export const municipalities = mysqlTable("municipalities", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // npr. "077" za Centar Sarajevo
  name: varchar("name", { length: 255 }).notNull(),
  jurisdiction: mysqlEnum("jurisdiction", ["FBIH", "RS", "BD"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Municipality = typeof municipalities.$inferSelect;
export type InsertMunicipality = typeof municipalities.$inferInsert;

/**
 * Tax Rules - Dinamičke porezne stope sa verzioniranjem
 */
export const taxRules = mysqlTable("taxRules", {
  id: int("id").autoincrement().primaryKey(),
  jurisdictionCode: mysqlEnum("jurisdictionCode", ["FBIH", "RS", "BD"]).notNull(),
  ruleCode: varchar("ruleCode", { length: 100 }).notNull(), // npr. "PIO_FROM", "HEALTH_ON"
  ruleType: mysqlEnum("ruleType", ["CONTRIBUTION", "TAX", "LIMIT", "DEDUCTION"]).notNull(),
  rateValue: int("rateValue").notNull(), // Stored as basis points (e.g., 1750 = 17.5%)
  description: text("description"),
  validFrom: date("validFrom").notNull(),
  validTo: date("validTo"), // NULL znači "do daljnjega"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaxRule = typeof taxRules.$inferSelect;
export type InsertTaxRule = typeof taxRules.$inferInsert;

/**
 * Wage Types - Katalog vrsta primanja
 */
export const wageTypes = mysqlTable("wageTypes", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").references(() => tenants.id),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isTaxableFBIH: boolean("isTaxableFBIH").default(true).notNull(),
  isTaxableRS: boolean("isTaxableRS").default(true).notNull(),
  includesInPIO: boolean("includesInPIO").default(true).notNull(),
  isNetToGross: boolean("isNetToGross").default(false).notNull(),
  reportingCategory: varchar("reportingCategory", { length: 50 }), // Za mapiranje na obrasce
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WageType = typeof wageTypes.$inferSelect;
export type InsertWageType = typeof wageTypes.$inferInsert;

/**
 * Employees - Zaposlenici
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  jmbg: varchar("jmbg", { length: 13 }).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  iban: varchar("iban", { length: 34 }),
  currentResidenceCode: varchar("currentResidenceCode", { length: 10 }).notNull(), // Šifra općine
  residenceJurisdiction: mysqlEnum("residenceJurisdiction", ["FBIH", "RS", "BD"]).notNull(),
  taxFactor: int("taxFactor").default(100).notNull(), // Stored as percentage (100 = 1.0, 150 = 1.5)
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Contracts - Ugovori o radu
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  contractType: mysqlEnum("contractType", ["ODREĐENO", "NEODREĐENO"]).notNull(),
  grossAmount: int("grossAmount").notNull(), // Stored in smallest currency unit (pfenig/para)
  startDate: date("startDate").notNull(),
  endDate: date("endDate"), // NULL za neodređeno
  pensionFundChoice: mysqlEnum("pensionFundChoice", ["FBIH_FUND", "RS_FUND"]), // Za Brčko
  minuliRadStartDate: date("minuliRadStartDate").notNull(),
  previousTenureYears: int("previousTenureYears").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

/**
 * Payroll Runs - Obračuni plaća
 */
export const payrollRuns = mysqlTable("payrollRuns", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().references(() => tenants.id),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  status: mysqlEnum("status", ["DRAFT", "APPROVED", "LOCKED"]).default("DRAFT").notNull(),
  paymentDate: date("paymentDate"),
  createdById: int("createdById").notNull().references(() => users.id),
  approvedById: int("approvedById").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type InsertPayrollRun = typeof payrollRuns.$inferInsert;

/**
 * Payroll Items - Stavke obračuna (rezultati izračuna)
 */
export const payrollItems = mysqlTable("payrollItems", {
  id: int("id").autoincrement().primaryKey(),
  payrollRunId: int("payrollRunId").notNull().references(() => payrollRuns.id),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  contractId: int("contractId").notNull().references(() => contracts.id),
  
  // Input values
  inputGross: int("inputGross").notNull(), // Ugovorena bruto plaća
  workDays: int("workDays").default(22).notNull(),
  seniorityYears: int("seniorityYears").default(0).notNull(), // Stored as hundredths (250 = 2.5 years)
  
  // Calculated values (all stored in smallest currency unit)
  calculatedGross: int("calculatedGross").notNull(),
  contributionsFrom: int("contributionsFrom").notNull(), // Doprinosi IZ plaće
  contributionsOn: int("contributionsOn").default(0).notNull(), // Doprinosi NA plaću
  taxableBase: int("taxableBase").notNull(),
  taxAmount: int("taxAmount").notNull(),
  netAmount: int("netAmount").notNull(),
  totalCost: int("totalCost").notNull(), // Ukupni trošak poslodavca
  
  // Detailed breakdown stored as JSON
  contributionsBreakdown: text("contributionsBreakdown"), // JSON: {"PIO": 15000, "HEALTH": 10000, ...}
  allowancesBreakdown: text("allowancesBreakdown"), // JSON: {"MEAL": 5000, "TRANSPORT": 3000, ...}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollItem = typeof payrollItems.$inferSelect;
export type InsertPayrollItem = typeof payrollItems.$inferInsert;

/**
 * System Settings - Sistemske postavke
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
