import { eq, and, gte, lte, or, isNull, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  tenants, 
  InsertTenant,
  employees,
  InsertEmployee,
  contracts,
  InsertContract,
  taxRules,
  InsertTaxRule,
  municipalities,
  wageTypes,
  InsertWageType,
  payrollRuns,
  InsertPayrollRun,
  payrollItems,
  InsertPayrollItem,
  systemSettings,
  InsertSystemSetting
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ TENANTS ============

export async function createTenant(data: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tenants).values(data);
  return result;
}

export async function getTenantsByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tenants).where(eq(tenants.ownerId, ownerId));
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(tenants).set(data).where(eq(tenants.id, id));
}

export async function deleteTenant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(tenants).where(eq(tenants.id, id));
}

// ============ EMPLOYEES ============

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values(data);
  return result;
}

export async function getEmployeesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(employees).where(eq(employees.tenantId, tenantId));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(employees).set(data).where(eq(employees.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(employees).where(eq(employees.id, id));
}

// ============ CONTRACTS ============

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(contracts).values(data);
  return result;
}

export async function getContractsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contracts).where(eq(contracts.employeeId, employeeId));
}

export async function getActiveContractByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contracts)
    .where(and(eq(contracts.employeeId, employeeId), eq(contracts.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(contracts).set(data).where(eq(contracts.id, id));
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(contracts).where(eq(contracts.id, id));
}

// ============ TAX RULES ============

export async function createTaxRule(data: InsertTaxRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(taxRules).values(data);
  return result;
}

export async function getTaxRulesByJurisdiction(jurisdictionCode: "FBIH" | "RS" | "BD") {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(taxRules).where(eq(taxRules.jurisdictionCode, jurisdictionCode));
}

export async function getActiveTaxRule(jurisdictionCode: "FBIH" | "RS" | "BD", ruleCode: string, effectiveDate: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(taxRules)
    .where(
      and(
        eq(taxRules.jurisdictionCode, jurisdictionCode),
        eq(taxRules.ruleCode, ruleCode),
        sql`${taxRules.validFrom} <= ${effectiveDate}`,
        or(
          isNull(taxRules.validTo),
          sql`${taxRules.validTo} >= ${effectiveDate}`
        )
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTaxRules() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(taxRules).orderBy(desc(taxRules.validFrom));
}

export async function updateTaxRule(id: number, data: Partial<InsertTaxRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(taxRules).set(data).where(eq(taxRules.id, id));
}

export async function deleteTaxRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(taxRules).where(eq(taxRules.id, id));
}

// ============ MUNICIPALITIES ============

export async function getAllMunicipalities() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(municipalities);
}

export async function getMunicipalitiesByJurisdiction(jurisdiction: "FBIH" | "RS" | "BD") {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(municipalities).where(eq(municipalities.jurisdiction, jurisdiction));
}

// ============ WAGE TYPES ============

export async function createWageType(data: InsertWageType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(wageTypes).values(data);
  return result;
}

export async function getWageTypesByTenantId(tenantId: number | null) {
  const db = await getDb();
  if (!db) return [];
  
  if (tenantId === null) {
    return await db.select().from(wageTypes).where(isNull(wageTypes.tenantId));
  }
  
  return await db.select().from(wageTypes).where(eq(wageTypes.tenantId, tenantId));
}

export async function getWageTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(wageTypes).where(eq(wageTypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWageType(id: number, data: Partial<InsertWageType>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(wageTypes).set(data).where(eq(wageTypes.id, id));
}

export async function deleteWageType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(wageTypes).where(eq(wageTypes.id, id));
}

// ============ PAYROLL RUNS ============

export async function createPayrollRun(data: InsertPayrollRun) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payrollRuns).values(data);
  return result;
}

export async function getPayrollRunsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payrollRuns)
    .where(eq(payrollRuns.tenantId, tenantId))
    .orderBy(desc(payrollRuns.year), desc(payrollRuns.month));
}

export async function getPayrollRunById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payrollRuns).where(eq(payrollRuns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayrollRun(id: number, data: Partial<InsertPayrollRun>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(payrollRuns).set(data).where(eq(payrollRuns.id, id));
}

export async function deletePayrollRun(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(payrollRuns).where(eq(payrollRuns.id, id));
}

// ============ PAYROLL ITEMS ============

export async function createPayrollItem(data: InsertPayrollItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payrollItems).values(data);
  return result;
}

export async function getPayrollItemsByRunId(payrollRunId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payrollItems).where(eq(payrollItems.payrollRunId, payrollRunId));
}

export async function getPayrollItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payrollItems).where(eq(payrollItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayrollItem(id: number, data: Partial<InsertPayrollItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(payrollItems).set(data).where(eq(payrollItems.id, id));
}

export async function deletePayrollItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(payrollItems).where(eq(payrollItems.id, id));
}

// ============ SYSTEM SETTINGS ============

export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemSetting(data: InsertSystemSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(systemSettings).values(data).onDuplicateKeyUpdate({
    set: { settingValue: data.settingValue }
  });
}
