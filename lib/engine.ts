import type {
  Candidate,
  RecommendDetailItem,
  RecommendDetailResponse,
  UserProfile,
} from './models';
import { INCOME_TYPE_LABEL } from './models';
import { BaseRule } from './rules/base';
import { PensionRule } from './rules/pension';
import { IrpRule } from './rules/irp';
import { IsaRule, IsaToIrpRule } from './rules/isa';
import {
  FamilyGiftRule,
  ForeignStockOffsetRule,
  ForeignStockSplitSellRule,
} from './rules/foreignStock';
import { EtfOptimizationRule } from './rules/etf';
import { DividendSeparateTaxRule } from './rules/dividend';
import { FinancialIncomeManagementRule } from './rules/capGains';

const RULES: BaseRule[] = [
  new PensionRule(),
  new IrpRule(),
  new IsaRule(),
  new IsaToIrpRule(),
  new ForeignStockSplitSellRule(),
  new FinancialIncomeManagementRule(),
  new ForeignStockOffsetRule(),
  new FamilyGiftRule(),
  new DividendSeparateTaxRule(),
  new EtfOptimizationRule(),
];

export function recommend(profile: UserProfile): RecommendDetailResponse {
  const applicable: Candidate[] = [];
  for (const rule of RULES) {
    if (rule.isApplicable(profile)) {
      applicable.push(rule.evaluate(profile));
    }
  }
  applicable.sort((a, b) => b.score - a.score);

  const top5: RecommendDetailItem[] = applicable
    .slice(0, 5)
    .map((c, idx) => ({ rank: idx + 1, ...c }));

  return {
    recommendations: top5,
    total_applicable: applicable.length,
    profile_summary: buildProfileSummary(profile),
  };
}

function formatThousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function buildProfileSummary(profile: UserProfile): string {
  const incomeText = INCOME_TYPE_LABEL[profile.income_type];
  const salaryText =
    profile.annual_salary > 0
      ? ` · 연봉 ${formatThousands(profile.annual_salary)}만원`
      : '';
  return `${profile.age}세 ${incomeText}${salaryText}`;
}
