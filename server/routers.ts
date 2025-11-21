import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { calculatePayroll, calculateNetToGross } from "./payroll-engine";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ TENANTS ============
  tenants: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTenantsByOwnerId(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        taxId: z.string().optional(),
        address: z.string().optional(),
        jurisdiction: z.enum(["FBIH", "RS", "BD"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTenant({
          ...input,
          ownerId: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        taxId: z.string().optional(),
        address: z.string().optional(),
        jurisdiction: z.enum(["FBIH", "RS", "BD"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTenant(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTenant(input.id);
      }),
  }),

  // ============ EMPLOYEES ============
  employees: router({
    list: protectedProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployeesByTenantId(input.tenantId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployeeById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        jmbg: z.string().length(13),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        iban: z.string().optional(),
        currentResidenceCode: z.string(),
        residenceJurisdiction: z.enum(["FBIH", "RS", "BD"]),
        taxFactor: z.number().default(100),
      }))
      .mutation(async ({ input }) => {
        return await db.createEmployee(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        jmbg: z.string().length(13).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        iban: z.string().optional(),
        currentResidenceCode: z.string().optional(),
        residenceJurisdiction: z.enum(["FBIH", "RS", "BD"]).optional(),
        taxFactor: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateEmployee(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteEmployee(input.id);
      }),
  }),

  // ============ CONTRACTS ============
  contracts: router({
    list: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContractsByEmployeeId(input.employeeId);
      }),
    
    getActive: protectedProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getActiveContractByEmployeeId(input.employeeId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        contractType: z.enum(["ODREĐENO", "NEODREĐENO"]),
        grossAmount: z.number(),
        startDate: z.string(),
        endDate: z.string().optional(),
        pensionFundChoice: z.enum(["FBIH_FUND", "RS_FUND"]).optional(),
        minuliRadStartDate: z.string(),
        previousTenureYears: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const { startDate, endDate, minuliRadStartDate, ...rest } = input;
        const data: any = {
          ...rest,
          startDate: new Date(startDate),
          minuliRadStartDate: new Date(minuliRadStartDate),
        };
        if (endDate) {
          data.endDate = new Date(endDate);
        }
        return await db.createContract(data);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        contractType: z.enum(["ODREĐENO", "NEODREĐENO"]).optional(),
        grossAmount: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        pensionFundChoice: z.enum(["FBIH_FUND", "RS_FUND"]).optional(),
        minuliRadStartDate: z.string().optional(),
        previousTenureYears: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, startDate, endDate, minuliRadStartDate, ...rest } = input;
        const data: any = { ...rest };
        if (startDate) {
          data.startDate = new Date(startDate);
        }
        if (endDate) {
          data.endDate = new Date(endDate);
        }
        if (minuliRadStartDate) {
          data.minuliRadStartDate = new Date(minuliRadStartDate);
        }
        return await db.updateContract(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteContract(input.id);
      }),
  }),

  // ============ TAX RULES ============
  taxRules: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllTaxRules();
    }),
    
    byJurisdiction: protectedProcedure
      .input(z.object({ jurisdiction: z.enum(["FBIH", "RS", "BD"]) }))
      .query(async ({ input }) => {
        return await db.getTaxRulesByJurisdiction(input.jurisdiction);
      }),
    
    create: protectedProcedure
      .input(z.object({
        jurisdictionCode: z.enum(["FBIH", "RS", "BD"]),
        ruleCode: z.string(),
        ruleType: z.enum(["CONTRIBUTION", "TAX", "LIMIT", "DEDUCTION"]),
        rateValue: z.number(),
        description: z.string().optional(),
        validFrom: z.string(),
        validTo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { validFrom, validTo, ...rest } = input;
        const data: any = {
          ...rest,
          validFrom: new Date(validFrom),
        };
        if (validTo) {
          data.validTo = new Date(validTo);
        }
        return await db.createTaxRule(data);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        rateValue: z.number().optional(),
        description: z.string().optional(),
        validFrom: z.string().optional(),
        validTo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, validFrom, validTo, ...rest } = input;
        const data: any = { ...rest };
        if (validFrom) {
          data.validFrom = new Date(validFrom);
        }
        if (validTo) {
          data.validTo = new Date(validTo);
        }
        return await db.updateTaxRule(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTaxRule(input.id);
      }),
  }),

  // ============ MUNICIPALITIES ============
  municipalities: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllMunicipalities();
    }),
    
    byJurisdiction: protectedProcedure
      .input(z.object({ jurisdiction: z.enum(["FBIH", "RS", "BD"]) }))
      .query(async ({ input }) => {
        return await db.getMunicipalitiesByJurisdiction(input.jurisdiction);
      }),
  }),

  // ============ WAGE TYPES ============
  wageTypes: router({
    list: protectedProcedure
      .input(z.object({ tenantId: z.number().nullable() }))
      .query(async ({ input }) => {
        return await db.getWageTypesByTenantId(input.tenantId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        tenantId: z.number().nullable(),
        code: z.string(),
        name: z.string(),
        isTaxableFBIH: z.boolean().default(true),
        isTaxableRS: z.boolean().default(true),
        includesInPIO: z.boolean().default(true),
        isNetToGross: z.boolean().default(false),
        reportingCategory: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createWageType(input);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        name: z.string().optional(),
        isTaxableFBIH: z.boolean().optional(),
        isTaxableRS: z.boolean().optional(),
        includesInPIO: z.boolean().optional(),
        isNetToGross: z.boolean().optional(),
        reportingCategory: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateWageType(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteWageType(input.id);
      }),
  }),

  // ============ PAYROLL RUNS ============
  payrollRuns: router({
    list: protectedProcedure
      .input(z.object({ tenantId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPayrollRunsByTenantId(input.tenantId);
      }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPayrollRunById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        tenantId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        paymentDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { paymentDate, ...rest } = input;
        const data: any = {
          ...rest,
          createdById: ctx.user.id,
        };
        if (paymentDate) {
          data.paymentDate = new Date(paymentDate);
        }
        return await db.createPayrollRun(data);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["DRAFT", "APPROVED", "LOCKED"]).optional(),
        paymentDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, paymentDate, ...rest } = input;
        const data: any = { ...rest };
        if (paymentDate) {
          data.paymentDate = new Date(paymentDate);
        }
        return await db.updatePayrollRun(id, data);
      }),
    
    approve: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updatePayrollRun(input.id, {
          status: "APPROVED",
          approvedById: ctx.user.id,
          approvedAt: new Date(),
        });
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePayrollRun(input.id);
      }),
  }),

  // ============ PAYROLL ITEMS ============
  payrollItems: router({
    list: protectedProcedure
      .input(z.object({ payrollRunId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPayrollItemsByRunId(input.payrollRunId);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePayrollItem(input.id);
      }),
  }),

  // ============ PAYROLL CALCULATION ============
  payroll: router({
    calculate: protectedProcedure
      .input(z.object({
        jurisdiction: z.enum(["FBIH", "RS", "BD"]),
        grossAmount: z.number(),
        workDays: z.number().default(22),
        seniorityYears: z.number().default(0),
        taxFactor: z.number().default(100),
        effectiveDate: z.string(),
        pensionFundChoice: z.enum(["FBIH_FUND", "RS_FUND"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await calculatePayroll(input);
      }),
    
    calculateNetToGross: protectedProcedure
      .input(z.object({
        targetNet: z.number(),
        jurisdiction: z.enum(["FBIH", "RS", "BD"]),
        taxFactor: z.number().default(100),
        effectiveDate: z.string(),
        pensionFundChoice: z.enum(["FBIH_FUND", "RS_FUND"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const gross = await calculateNetToGross(
          input.targetNet,
          input.jurisdiction,
          input.taxFactor,
          input.effectiveDate,
          input.pensionFundChoice
        );
        return { grossAmount: gross };
      }),
    
    processRun: protectedProcedure
      .input(z.object({
        payrollRunId: z.number(),
        tenantId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get all active employees for this tenant
        const employees = await db.getEmployeesByTenantId(input.tenantId);
        const activeEmployees = employees.filter(e => e.isActive);
        
        // Get payroll run details
        const payrollRun = await db.getPayrollRunById(input.payrollRunId);
        if (!payrollRun) {
          throw new Error("Payroll run not found");
        }
        
        // Get tenant to determine jurisdiction
        const tenant = await db.getTenantById(input.tenantId);
        if (!tenant) {
          throw new Error("Tenant not found");
        }
        
        const effectiveDate = `${payrollRun.year}-${String(payrollRun.month).padStart(2, '0')}-01`;
        
        // Process each employee
        const results = [];
        for (const employee of activeEmployees) {
          // Get active contract
          const contract = await db.getActiveContractByEmployeeId(employee.id);
          if (!contract) continue;
          
          // Calculate seniority years
          const startDate = new Date(contract.minuliRadStartDate);
          const currentDate = new Date(effectiveDate);
          const yearsWorked = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          const totalYears = yearsWorked + contract.previousTenureYears;
          const seniorityYears = Math.round(totalYears * 100); // Convert to hundredths
          
          // Calculate payroll
          const calculation = await calculatePayroll({
            jurisdiction: tenant.jurisdiction,
            grossAmount: contract.grossAmount,
            workDays: 22,
            seniorityYears,
            taxFactor: employee.taxFactor,
            effectiveDate,
            pensionFundChoice: contract.pensionFundChoice || undefined,
          });
          
          // Create payroll item
          await db.createPayrollItem({
            payrollRunId: input.payrollRunId,
            employeeId: employee.id,
            contractId: contract.id,
            inputGross: contract.grossAmount,
            workDays: 22,
            seniorityYears,
            calculatedGross: calculation.calculatedGross,
            contributionsFrom: calculation.contributionsFrom,
            contributionsOn: calculation.contributionsOn,
            taxableBase: calculation.taxableBase,
            taxAmount: calculation.taxAmount,
            netAmount: calculation.netAmount,
            totalCost: calculation.totalCost,
            contributionsBreakdown: JSON.stringify(calculation.contributionsBreakdown),
            allowancesBreakdown: JSON.stringify(calculation.allowancesBreakdown),
          });
          
          results.push({
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            netAmount: calculation.netAmount,
          });
        }
        
        return {
          success: true,
          processedCount: results.length,
          results,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
