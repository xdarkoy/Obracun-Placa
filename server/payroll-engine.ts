import { getActiveTaxRule } from "./db";

/**
 * Payroll Calculation Engine
 * Handles payroll calculations for all three jurisdictions: FBiH, RS, BD
 */

export interface PayrollCalculationInput {
  jurisdiction: "FBIH" | "RS" | "BD";
  grossAmount: number; // in smallest currency unit (pfenig)
  workDays: number;
  seniorityYears: number; // in hundredths (250 = 2.5 years)
  taxFactor: number; // in percentage (100 = 1.0, 150 = 1.5)
  effectiveDate: string; // YYYY-MM-DD format
  pensionFundChoice?: "FBIH_FUND" | "RS_FUND"; // Required for BD jurisdiction
}

export interface PayrollCalculationResult {
  calculatedGross: number;
  contributionsFrom: number;
  contributionsOn: number;
  taxableBase: number;
  taxAmount: number;
  netAmount: number;
  totalCost: number;
  contributionsBreakdown: Record<string, number>;
  allowancesBreakdown: Record<string, number>;
}

/**
 * Main calculation function - routes to appropriate jurisdiction calculator
 */
export async function calculatePayroll(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
  switch (input.jurisdiction) {
    case "FBIH":
      return await calculateFBIH(input);
    case "RS":
      return await calculateRS(input);
    case "BD":
      return await calculateBD(input);
    default:
      throw new Error(`Unknown jurisdiction: ${input.jurisdiction}`);
  }
}

/**
 * FBiH Calculation Logic
 * Supports both current model and future reform (based on effectiveDate)
 */
async function calculateFBIH(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
  const { grossAmount, taxFactor, effectiveDate } = input;
  
  // Fetch active tax rules for the effective date
  const pioFrom = await getActiveTaxRule("FBIH", "PIO_FROM", effectiveDate);
  const healthFrom = await getActiveTaxRule("FBIH", "HEALTH_FROM", effectiveDate);
  const unemploymentFrom = await getActiveTaxRule("FBIH", "UNEMPLOYMENT_FROM", effectiveDate);
  const pioOn = await getActiveTaxRule("FBIH", "PIO_ON", effectiveDate);
  const healthOn = await getActiveTaxRule("FBIH", "HEALTH_ON", effectiveDate);
  const unemploymentOn = await getActiveTaxRule("FBIH", "UNEMPLOYMENT_ON", effectiveDate);
  const incomeTax = await getActiveTaxRule("FBIH", "INCOME_TAX", effectiveDate);
  const personalDeduction = await getActiveTaxRule("FBIH", "PERSONAL_DEDUCTION", effectiveDate);
  
  if (!pioFrom || !healthFrom || !unemploymentFrom || !pioOn || !healthOn || !unemploymentOn || !incomeTax || !personalDeduction) {
    throw new Error("Missing tax rules for FBiH calculation");
  }
  
  // Step 1: Calculate contributions FROM salary (iz plaće)
  const pioFromAmount = Math.round((grossAmount * pioFrom.rateValue) / 10000);
  const healthFromAmount = Math.round((grossAmount * healthFrom.rateValue) / 10000);
  const unemploymentFromAmount = Math.round((grossAmount * unemploymentFrom.rateValue) / 10000);
  const totalContributionsFrom = pioFromAmount + healthFromAmount + unemploymentFromAmount;
  
  // Step 2: Calculate taxable base
  const personalDeductionAmount = Math.round((personalDeduction.rateValue * taxFactor) / 100);
  let taxableBase = grossAmount - totalContributionsFrom - personalDeductionAmount;
  if (taxableBase < 0) taxableBase = 0;
  
  // Step 3: Calculate income tax
  const taxAmount = Math.round((taxableBase * incomeTax.rateValue) / 10000);
  
  // Step 4: Calculate net salary
  const netAmount = grossAmount - totalContributionsFrom - taxAmount;
  
  // Step 5: Calculate contributions ON salary (na plaću)
  const pioOnAmount = Math.round((grossAmount * pioOn.rateValue) / 10000);
  const healthOnAmount = Math.round((grossAmount * healthOn.rateValue) / 10000);
  const unemploymentOnAmount = Math.round((grossAmount * unemploymentOn.rateValue) / 10000);
  const totalContributionsOn = pioOnAmount + healthOnAmount + unemploymentOnAmount;
  
  // Step 6: Calculate total cost to employer
  const totalCost = grossAmount + totalContributionsOn;
  
  return {
    calculatedGross: grossAmount,
    contributionsFrom: totalContributionsFrom,
    contributionsOn: totalContributionsOn,
    taxableBase,
    taxAmount,
    netAmount,
    totalCost,
    contributionsBreakdown: {
      PIO_FROM: pioFromAmount,
      HEALTH_FROM: healthFromAmount,
      UNEMPLOYMENT_FROM: unemploymentFromAmount,
      PIO_ON: pioOnAmount,
      HEALTH_ON: healthOnAmount,
      UNEMPLOYMENT_ON: unemploymentOnAmount,
    },
    allowancesBreakdown: {},
  };
}

/**
 * RS Calculation Logic
 * Integrated gross system with seniority calculation
 */
async function calculateRS(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
  const { grossAmount, seniorityYears, taxFactor, effectiveDate } = input;
  
  // Fetch active tax rules
  const pio = await getActiveTaxRule("RS", "PIO", effectiveDate);
  const health = await getActiveTaxRule("RS", "HEALTH", effectiveDate);
  const childProtection = await getActiveTaxRule("RS", "CHILD_PROTECTION", effectiveDate);
  const unemployment = await getActiveTaxRule("RS", "UNEMPLOYMENT", effectiveDate);
  const incomeTax = await getActiveTaxRule("RS", "INCOME_TAX", effectiveDate);
  const personalDeduction = await getActiveTaxRule("RS", "PERSONAL_DEDUCTION", effectiveDate);
  const seniorityRate = await getActiveTaxRule("RS", "SENIORITY_RATE", effectiveDate);
  
  if (!pio || !health || !childProtection || !unemployment || !incomeTax || !personalDeduction || !seniorityRate) {
    throw new Error("Missing tax rules for RS calculation");
  }
  
  // Step 1: Calculate seniority increase (minuli rad)
  const seniorityIncrease = Math.round((grossAmount * seniorityYears * seniorityRate.rateValue) / 1000000);
  const adjustedGross = grossAmount + seniorityIncrease;
  
  // Step 2: Calculate total contributions (31%)
  const pioAmount = Math.round((adjustedGross * pio.rateValue) / 10000);
  const healthAmount = Math.round((adjustedGross * health.rateValue) / 10000);
  const childProtectionAmount = Math.round((adjustedGross * childProtection.rateValue) / 10000);
  const unemploymentAmount = Math.round((adjustedGross * unemployment.rateValue) / 10000);
  const totalContributions = pioAmount + healthAmount + childProtectionAmount + unemploymentAmount;
  
  // Step 3: Calculate taxable base
  const personalDeductionAmount = Math.round((personalDeduction.rateValue * taxFactor) / 100);
  let taxableBase = adjustedGross - totalContributions - personalDeductionAmount;
  if (taxableBase < 0) taxableBase = 0;
  
  // Step 4: Calculate income tax (8%)
  const taxAmount = Math.round((taxableBase * incomeTax.rateValue) / 10000);
  
  // Step 5: Calculate net salary
  const netAmount = adjustedGross - totalContributions - taxAmount;
  
  // RS has no separate "on salary" contributions
  const totalCost = adjustedGross;
  
  return {
    calculatedGross: adjustedGross,
    contributionsFrom: totalContributions,
    contributionsOn: 0,
    taxableBase,
    taxAmount,
    netAmount,
    totalCost,
    contributionsBreakdown: {
      PIO: pioAmount,
      HEALTH: healthAmount,
      CHILD_PROTECTION: childProtectionAmount,
      UNEMPLOYMENT: unemploymentAmount,
      SENIORITY: seniorityIncrease,
    },
    allowancesBreakdown: {},
  };
}

/**
 * BD Calculation Logic
 * Hybrid system with choice of pension fund
 */
async function calculateBD(input: PayrollCalculationInput): Promise<PayrollCalculationResult> {
  const { grossAmount, taxFactor, effectiveDate, pensionFundChoice } = input;
  
  if (!pensionFundChoice) {
    throw new Error("Pension fund choice is required for BD jurisdiction");
  }
  
  // Fetch BD-specific rules
  const health = await getActiveTaxRule("BD", "HEALTH", effectiveDate);
  const unemployment = await getActiveTaxRule("BD", "UNEMPLOYMENT", effectiveDate);
  const incomeTax = await getActiveTaxRule("BD", "INCOME_TAX", effectiveDate);
  const personalDeduction = await getActiveTaxRule("BD", "PERSONAL_DEDUCTION", effectiveDate);
  
  // Fetch PIO from chosen fund
  const pioJurisdiction = pensionFundChoice === "FBIH_FUND" ? "FBIH" : "RS";
  const pioRuleCode = pensionFundChoice === "FBIH_FUND" ? "PIO_FROM" : "PIO";
  const pio = await getActiveTaxRule(pioJurisdiction, pioRuleCode, effectiveDate);
  
  if (!health || !unemployment || !incomeTax || !personalDeduction || !pio) {
    throw new Error("Missing tax rules for BD calculation");
  }
  
  // Step 1: Calculate contributions
  const pioAmount = Math.round((grossAmount * pio.rateValue) / 10000);
  const healthAmount = Math.round((grossAmount * health.rateValue) / 10000);
  const unemploymentAmount = Math.round((grossAmount * unemployment.rateValue) / 10000);
  const totalContributions = pioAmount + healthAmount + unemploymentAmount;
  
  // Step 2: Calculate taxable base
  const personalDeductionAmount = Math.round((personalDeduction.rateValue * taxFactor) / 100);
  let taxableBase = grossAmount - totalContributions - personalDeductionAmount;
  if (taxableBase < 0) taxableBase = 0;
  
  // Step 3: Calculate income tax (10%)
  const taxAmount = Math.round((taxableBase * incomeTax.rateValue) / 10000);
  
  // Step 4: Calculate net salary
  const netAmount = grossAmount - totalContributions - taxAmount;
  
  // BD follows FBiH model (no separate "on salary" contributions for now)
  const totalCost = grossAmount;
  
  return {
    calculatedGross: grossAmount,
    contributionsFrom: totalContributions,
    contributionsOn: 0,
    taxableBase,
    taxAmount,
    netAmount,
    totalCost,
    contributionsBreakdown: {
      PIO: pioAmount,
      HEALTH: healthAmount,
      UNEMPLOYMENT: unemploymentAmount,
    },
    allowancesBreakdown: {},
  };
}

/**
 * Inverse calculator: Net to Gross
 * Calculates required gross amount to achieve target net salary
 */
export async function calculateNetToGross(
  targetNet: number,
  jurisdiction: "FBIH" | "RS" | "BD",
  taxFactor: number,
  effectiveDate: string,
  pensionFundChoice?: "FBIH_FUND" | "RS_FUND"
): Promise<number> {
  // Use iterative approach to find gross amount
  let low = targetNet;
  let high = targetNet * 2;
  let iterations = 0;
  const maxIterations = 50;
  const tolerance = 10; // 0.10 KM tolerance
  
  while (iterations < maxIterations) {
    const mid = Math.round((low + high) / 2);
    
    const result = await calculatePayroll({
      jurisdiction,
      grossAmount: mid,
      workDays: 22,
      seniorityYears: 0,
      taxFactor,
      effectiveDate,
      pensionFundChoice,
    });
    
    const diff = result.netAmount - targetNet;
    
    if (Math.abs(diff) <= tolerance) {
      return mid;
    }
    
    if (diff > 0) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
    
    iterations++;
  }
  
  // If we didn't converge, return best approximation
  return Math.round((low + high) / 2);
}
