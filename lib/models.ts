import { z } from 'zod';

export const InvestType = {
  domestic_stock: 'domestic_stock',
  foreign_stock: 'foreign_stock',
  etf_domestic: 'etf_domestic',
  etf_foreign: 'etf_foreign',
  fund: 'fund',
  deposit: 'deposit',
  bond: 'bond',
  reit: 'reit',
} as const;
export type InvestType = (typeof InvestType)[keyof typeof InvestType];
export const InvestTypeSchema = z.nativeEnum(InvestType);

export const INVEST_TYPE_LABEL: Record<InvestType, string> = {
  domestic_stock: '국내 상장주식',
  foreign_stock: '해외주식 (미국 등)',
  etf_domestic: '국내주식형 ETF',
  etf_foreign: '국내 상장 해외지수 ETF',
  fund: '공모펀드',
  deposit: '예·적금',
  bond: '채권',
  reit: '리츠',
};

export const IncomeType = {
  employee: 'employee',
  freelancer: 'freelancer',
  none: 'none',
} as const;
export type IncomeType = (typeof IncomeType)[keyof typeof IncomeType];
export const IncomeTypeSchema = z.nativeEnum(IncomeType);

export const INCOME_TYPE_LABEL: Record<IncomeType, string> = {
  employee: '직장인',
  freelancer: '프리랜서',
  none: '무소득',
};

export const RiskTolerance = {
  low: 'low',
  medium: 'medium',
  high: 'high',
} as const;
export type RiskTolerance = (typeof RiskTolerance)[keyof typeof RiskTolerance];
export const RiskToleranceSchema = z.nativeEnum(RiskTolerance);

export const RISK_TOLERANCE_LABEL: Record<RiskTolerance, string> = {
  low: '안정형',
  medium: '중립형',
  high: '공격형',
};

export const UserProfileSchema = z.object({
  age: z.number().int().min(19).max(80),
  annual_salary: z.number().int().min(0),
  income_type: IncomeTypeSchema,
  invest_types: z.array(InvestTypeSchema).max(20),
  monthly_invest: z.number().int().min(0),
  has_isa: z.boolean(),
  has_pension: z.boolean(),
  has_irp: z.boolean(),
  pension_contribution: z.number().int().min(0).max(600).default(0),
  irp_contribution: z.number().int().min(0).max(300).default(0),
  financial_income: z.number().int().min(0).default(0),
  risk_tolerance: RiskToleranceSchema,
  has_spouse: z.boolean().default(false),
  has_children: z.boolean().default(false),
  has_minor_children: z.boolean().default(false),
  foreign_stock_unrealized_profit: z.number().int().min(0).default(0),
  dividend_income: z.number().int().min(0).default(0),
  holds_high_dividend: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const RecommendItemSchema = z.object({
  rank: z.number().int().min(1).max(5),
  product: z.string(),
  category: z.string(),
  score: z.number(),
  expected_benefit_krw: z.number().int().nullable(),
  reason: z.string(),
  action: z.string(),
  warning: z.string().nullable(),
});
export type RecommendItem = z.infer<typeof RecommendItemSchema>;

export const RecommendResponseSchema = z.object({
  recommendations: z.array(RecommendItemSchema).max(5),
  total_applicable: z.number().int().min(0),
  profile_summary: z.string(),
});
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;

export const RuleIdValues = [
  'pension',
  'irp',
  'isa_general',
  'isa_welfare',
  'isa_youth',
  'isa_to_irp',
  'foreign_split',
  'foreign_offset',
  'family_gift',
  'etf',
  'dividend',
  'cap_gains',
] as const;
export type RuleId = (typeof RuleIdValues)[number];

export type Candidate = Omit<RecommendItem, 'rank'> & {
  rule_id: RuleId;
  recommended_contribution_krw: number | null;
  short_strategy: string;
  annual_limit_krw: number | null;
  tax_rate_percent: number | null;
};

export type RecommendDetailItem = RecommendItem & {
  rule_id: RuleId;
  recommended_contribution_krw: number | null;
  short_strategy: string;
  annual_limit_krw: number | null;
  tax_rate_percent: number | null;
};

export type RecommendDetailResponse = Omit<RecommendResponse, 'recommendations'> & {
  recommendations: RecommendDetailItem[];
};
