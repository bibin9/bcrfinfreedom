import { describe, it, expect } from "vitest";
import {
  assessResidency,
  compareNREvsNRO,
  estimateRNORTaxSavings,
  marginalRateForIncome,
  projectRNORWindow,
} from "@/lib/nriTax";
import type { ResidencyInput } from "@/lib/nriTax";

function baseInput(overrides: Partial<ResidencyInput> = {}): ResidencyInput {
  return {
    daysInCurrentFY: 60,
    daysInPrecedingFYs: [60, 60, 60, 60],
    isIndianCitizenOrPIO: true,
    returningFromEmployment: false,
    indianIncomeINR: 2_00_000,
    taxedInAnotherCountry: true,
    nonResidentIn9of10LastYrs: true,
    daysInLast7Years: 400,
    ...overrides,
  };
}

describe("assessResidency", () => {
  it("≥ 182 days in India this FY → Resident (RNOR if qualifying)", () => {
    const r = assessResidency(baseInput({ daysInCurrentFY: 200 }));
    expect(["RNOR", "ROR"]).toContain(r.status);
  });

  it("short-stay typical NRI (60 days) → NR", () => {
    const r = assessResidency(baseInput({ daysInCurrentFY: 60 }));
    expect(r.status).toBe("NR");
  });

  it("Indian citizen with ₹20L income + 150 days + no tax elsewhere → RNOR via deemed-resident", () => {
    const r = assessResidency(
      baseInput({
        daysInCurrentFY: 150,
        indianIncomeINR: 20_00_000,
        taxedInAnotherCountry: false,
        isIndianCitizenOrPIO: true,
      }),
    );
    expect(r.status).toBe("RNOR");
    expect(r.deemedResident).toBe(true);
  });

  it("resident with 9/10 NR history → RNOR, not ROR", () => {
    const r = assessResidency(
      baseInput({
        daysInCurrentFY: 200,
        nonResidentIn9of10LastYrs: true,
      }),
    );
    expect(r.status).toBe("RNOR");
  });

  it("long-settled resident (not 9/10, > 729 days) → ROR", () => {
    const r = assessResidency(
      baseInput({
        daysInCurrentFY: 300,
        nonResidentIn9of10LastYrs: false,
        daysInLast7Years: 2000,
      }),
    );
    expect(r.status).toBe("ROR");
  });

  it("secondary test: 60 + 365 → Resident (foreign national on long-term visa)", () => {
    const r = assessResidency(
      baseInput({
        daysInCurrentFY: 90,
        daysInPrecedingFYs: [100, 100, 100, 100],
        isIndianCitizenOrPIO: false,
      }),
    );
    expect(["RNOR", "ROR"]).toContain(r.status);
  });

  it("Indian citizen with 60-181 days but < 365 preceding days → NR", () => {
    const r = assessResidency(
      baseInput({
        daysInCurrentFY: 100,
        daysInPrecedingFYs: [50, 50, 50, 50],
        indianIncomeINR: 5_00_000,
      }),
    );
    expect(r.status).toBe("NR");
  });
});

describe("projectRNORWindow", () => {
  it("long-term NRI → 2 RNOR FYs", () => {
    const p = projectRNORWindow({
      returnFY: 2027,
      nonResidentFYsInLast10: 10,
      avgDaysPerYearAsNRI: 60,
    });
    expect(p.rnorFYs).toEqual([2027, 2028]);
    expect(p.rorFromFY).toBe(2029);
  });

  it("partial NRI history → 1 RNOR FY", () => {
    const p = projectRNORWindow({
      returnFY: 2027,
      nonResidentFYsInLast10: 7,
      avgDaysPerYearAsNRI: 120,
    });
    expect(p.rnorFYs.length).toBe(1);
    expect(p.rorFromFY).toBe(2028);
  });

  it("short NRI period + lots of India days → no RNOR window", () => {
    const p = projectRNORWindow({
      returnFY: 2027,
      nonResidentFYsInLast10: 2,
      avgDaysPerYearAsNRI: 150,
    });
    expect(p.rnorFYs.length).toBe(0);
    expect(p.rorFromFY).toBe(2027);
  });
});

describe("compareNREvsNRO", () => {
  it("NRE always yields more than NRO (positive tax rate)", () => {
    const r = compareNREvsNRO({
      principalINR: 10_00_000,
      interestRate: 0.07,
      marginalTaxRate: 0.3,
    });
    expect(r.nreNetInterest).toBe(r.grossAnnualInterest);
    expect(r.nreNetInterest).toBeGreaterThan(r.nroNetInterest);
    expect(r.nroNetInterest).toBeCloseTo(r.grossAnnualInterest * 0.7, 0);
  });

  it("0% tax → NRE and NRO are equal", () => {
    const r = compareNREvsNRO({
      principalINR: 10_00_000,
      interestRate: 0.07,
      marginalTaxRate: 0,
    });
    expect(r.nreNetInterest).toBe(r.nroNetInterest);
  });
});

describe("estimateRNORTaxSavings", () => {
  it("tax saved = foreign income × years × marginal rate", () => {
    const r = estimateRNORTaxSavings({
      foreignIncomeINR: 25_00_000,
      rnorYears: 2,
      marginalTaxRate: 0.3,
    });
    expect(r.totalForeignIncome).toBe(50_00_000);
    expect(r.totalTaxSaved).toBe(15_00_000);
  });

  it("0 RNOR years → 0 saved", () => {
    const r = estimateRNORTaxSavings({
      foreignIncomeINR: 25_00_000,
      rnorYears: 0,
      marginalTaxRate: 0.3,
    });
    expect(r.totalTaxSaved).toBe(0);
  });
});

describe("marginalRateForIncome", () => {
  it("new-regime slabs are monotonically non-decreasing", () => {
    const incomes = [1_00_000, 5_00_000, 8_00_000, 11_00_000, 13_00_000, 16_00_000, 30_00_000];
    const rates = incomes.map(marginalRateForIncome);
    for (let i = 1; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThanOrEqual(rates[i - 1]);
    }
  });

  it("income above ₹15L is 30%", () => {
    expect(marginalRateForIncome(25_00_000)).toBe(0.3);
  });
});
