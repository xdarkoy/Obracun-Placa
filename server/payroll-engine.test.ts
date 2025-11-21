import { describe, expect, it, beforeAll } from "vitest";
import { calculatePayroll, calculateNetToGross } from "./payroll-engine";
import { getDb } from "./db";

describe("Payroll Calculation Engine", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }
  });

  describe("FBiH Calculation", () => {
    it("should calculate payroll correctly for FBiH jurisdiction", async () => {
      const result = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: 200000, // 2000 KM in pfenigs
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100, // 1.0
        effectiveDate: "2024-01-01",
      });

      expect(result.calculatedGross).toBe(200000);
      expect(result.contributionsFrom).toBeGreaterThan(0);
      expect(result.contributionsOn).toBeGreaterThan(0);
      expect(result.taxAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeLessThan(200000);
      expect(result.totalCost).toBeGreaterThan(200000);
      
      // Verify breakdown exists
      expect(result.contributionsBreakdown).toHaveProperty("PIO_FROM");
      expect(result.contributionsBreakdown).toHaveProperty("HEALTH_FROM");
      expect(result.contributionsBreakdown).toHaveProperty("PIO_ON");
    });

    it("should apply personal deduction correctly", async () => {
      const withDeduction = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: 100000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      const withHigherDeduction = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: 100000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 150, // 1.5 - higher deduction
        effectiveDate: "2024-01-01",
      });

      // Higher tax factor should result in lower tax and higher net
      expect(withHigherDeduction.taxAmount).toBeLessThan(withDeduction.taxAmount);
      expect(withHigherDeduction.netAmount).toBeGreaterThan(withDeduction.netAmount);
    });
  });

  describe("RS Calculation", () => {
    it("should calculate payroll correctly for RS jurisdiction", async () => {
      const result = await calculatePayroll({
        jurisdiction: "RS",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      expect(result.calculatedGross).toBe(200000);
      expect(result.contributionsFrom).toBeGreaterThan(0);
      expect(result.contributionsOn).toBe(0); // RS has no "on salary" contributions
      expect(result.taxAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeLessThan(200000);
      
      // Verify breakdown
      expect(result.contributionsBreakdown).toHaveProperty("PIO");
      expect(result.contributionsBreakdown).toHaveProperty("HEALTH");
      expect(result.contributionsBreakdown).toHaveProperty("CHILD_PROTECTION");
    });

    it("should apply seniority increase correctly", async () => {
      const withoutSeniority = await calculatePayroll({
        jurisdiction: "RS",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      const withSeniority = await calculatePayroll({
        jurisdiction: "RS",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 500, // 5 years (in hundredths)
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      // With seniority should have higher gross and net
      expect(withSeniority.calculatedGross).toBeGreaterThan(withoutSeniority.calculatedGross);
      expect(withSeniority.netAmount).toBeGreaterThan(withoutSeniority.netAmount);
      expect(withSeniority.contributionsBreakdown).toHaveProperty("SENIORITY");
    });
  });

  describe("BD Calculation", () => {
    it("should calculate payroll correctly for BD with FBiH fund", async () => {
      const result = await calculatePayroll({
        jurisdiction: "BD",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
        pensionFundChoice: "FBIH_FUND",
      });

      expect(result.calculatedGross).toBe(200000);
      expect(result.contributionsFrom).toBeGreaterThan(0);
      expect(result.netAmount).toBeLessThan(200000);
      expect(result.contributionsBreakdown).toHaveProperty("PIO");
      expect(result.contributionsBreakdown).toHaveProperty("HEALTH");
    });

    it("should throw error if pension fund choice is missing", async () => {
      await expect(
        calculatePayroll({
          jurisdiction: "BD",
          grossAmount: 200000,
          workDays: 22,
          seniorityYears: 0,
          taxFactor: 100,
          effectiveDate: "2024-01-01",
        })
      ).rejects.toThrow("Pension fund choice is required");
    });
  });

  describe("Net to Gross Calculator", () => {
    it("should calculate gross from target net for FBiH", async () => {
      const targetNet = 150000; // 1500 KM
      const calculatedGross = await calculateNetToGross(
        targetNet,
        "FBIH",
        100,
        "2024-01-01"
      );

      // Verify by calculating payroll with the result
      const verification = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: calculatedGross,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      // Net should be very close to target (within tolerance)
      expect(Math.abs(verification.netAmount - targetNet)).toBeLessThanOrEqual(10);
    });

    it("should calculate gross from target net for RS", async () => {
      const targetNet = 150000;
      const calculatedGross = await calculateNetToGross(
        targetNet,
        "RS",
        100,
        "2024-01-01"
      );

      const verification = await calculatePayroll({
        jurisdiction: "RS",
        grossAmount: calculatedGross,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2024-01-01",
      });

      expect(Math.abs(verification.netAmount - targetNet)).toBeLessThanOrEqual(10);
    });
  });

  describe("Tax Rate Versioning", () => {
    it("should use different rates for different dates", async () => {
      // Calculate with current rates (before reform)
      const beforeReform = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2025-06-01",
      });

      // Calculate with future rates (after reform)
      const afterReform = await calculatePayroll({
        jurisdiction: "FBIH",
        grossAmount: 200000,
        workDays: 22,
        seniorityYears: 0,
        taxFactor: 100,
        effectiveDate: "2025-08-01",
      });

      // After reform should have lower contributions on salary
      expect(afterReform.contributionsOn).toBeLessThan(beforeReform.contributionsOn);
      expect(afterReform.totalCost).toBeLessThan(beforeReform.totalCost);
    });
  });
});
