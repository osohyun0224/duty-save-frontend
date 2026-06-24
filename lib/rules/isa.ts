import type { Candidate, RuleId, UserProfile } from '../models';
import {
  ISA_ANNUAL_MAX,
  ISA_EXCESS_TAX_RATE,
  ISA_EXPECTED_RETURN_RATE,
  ISA_GENERAL_LIMIT,
  ISA_NORMAL_TAX_RATE,
  ISA_TRANSFER_CREDIT_RATE,
  ISA_TRANSFER_LIMIT,
  ISA_WELFARE_LIMIT,
  ISA_WELFARE_SALARY,
  ISA_YOUTH_AGE_MAX,
  ISA_YOUTH_LIMIT,
  MAN_WON_TO_KRW,
} from '../constants';
import { isFinancialIncomeTaxable } from '../profileHelpers';
import { BaseRule, URGENCY, computeScore } from './base';

interface IsaVariant {
  ruleId: RuleId;
  productLabel: string;
  shortLabel: string;
  taxFreeLimit: number;
}

function pickIsaVariant(profile: UserProfile): IsaVariant {
  if (profile.age >= 19 && profile.age <= ISA_YOUTH_AGE_MAX) {
    return {
      ruleId: 'isa_youth',
      productLabel: '청년형 ISA',
      shortLabel: '청년형',
      taxFreeLimit: ISA_YOUTH_LIMIT,
    };
  }
  if (profile.annual_salary <= ISA_WELFARE_SALARY) {
    return {
      ruleId: 'isa_welfare',
      productLabel: 'ISA(서민형)',
      shortLabel: '서민형',
      taxFreeLimit: ISA_WELFARE_LIMIT,
    };
  }
  return {
    ruleId: 'isa_general',
    productLabel: 'ISA(일반형)',
    shortLabel: '일반형',
    taxFreeLimit: ISA_GENERAL_LIMIT,
  };
}

export class IsaRule extends BaseRule {
  readonly name = 'ISA';

  isApplicable(profile: UserProfile): boolean {
    if (isFinancialIncomeTaxable(profile)) return false;
    if (profile.age < 19) return false;
    return !profile.has_isa;
  }

  evaluate(profile: UserProfile): Candidate {
    const variant = pickIsaVariant(profile);
    const annualInv = profile.monthly_invest * 12;
    const fill = Math.min(ISA_ANNUAL_MAX, annualInv);
    const isStarter = fill === 0;
    const estProfit = fill * ISA_EXPECTED_RETURN_RATE;
    const benefitManWon = Math.round(
      Math.min(estProfit, variant.taxFreeLimit) * ISA_NORMAL_TAX_RATE
    );
    const { score, expectedBenefitKrw } = computeScore(
      benefitManWon,
      URGENCY.IMMEDIATE
    );

    const reason = isStarter
      ? `${variant.shortLabel} ISA 미보유. 지금 계좌만 미리 개설해두면 향후 투자 시작 시 연 수익 ${variant.taxFreeLimit}만원까지 비과세, 초과분 ${(ISA_EXCESS_TAX_RATE * 100).toFixed(1)}% 분리과세 혜택을 바로 활용할 수 있어요.`
      : `${variant.shortLabel} ISA 미보유. 연 수익 ${variant.taxFreeLimit}만원까지 비과세, 초과분 ${(ISA_EXCESS_TAX_RATE * 100).toFixed(1)}%(일반 ${(ISA_NORMAL_TAX_RATE * 100).toFixed(1)}% 대비 절세). 계좌 내 손익통산으로 세금 추가 절감.`;
    const action = isStarter
      ? `${variant.productLabel} 계좌 먼저 개설해두기 (월 투자 시작되면 연 한도 ${ISA_ANNUAL_MAX}만원까지 활용 가능)`
      : `${variant.productLabel} 개설 후 연 최대 ${fill}만원 납입`;

    return {
      rule_id: variant.ruleId,
      product: variant.productLabel,
      category: '비과세·분리과세',
      score,
      expected_benefit_krw: expectedBenefitKrw,
      recommended_contribution_krw: fill * MAN_WON_TO_KRW,
      annual_limit_krw: ISA_ANNUAL_MAX * MAN_WON_TO_KRW,
      tax_rate_percent: Math.round(ISA_EXCESS_TAX_RATE * 1000) / 10,
      short_strategy: isStarter
        ? `ISA ${variant.shortLabel} 계좌 선개설 — 비과세 한도 ${variant.taxFreeLimit}만원 준비`
        : `ISA ${variant.shortLabel} 비과세 한도(${variant.taxFreeLimit}만원) 활용`,
      reason,
      action,
      warning: '해외주식 직접 투자 불가 / 국내 상장 해외ETF는 가능 / 3년 의무 유지',
    };
  }
}

export class IsaToIrpRule extends BaseRule {
  readonly name = 'ISA→IRP 전환';

  isApplicable(profile: UserProfile): boolean {
    if (isFinancialIncomeTaxable(profile)) return false;
    if (profile.age < 19) return false;
    if (!profile.has_isa) return false;
    return profile.has_irp || profile.income_type === 'employee';
  }

  evaluate(_profile: UserProfile): Candidate {
    const benefitManWon = Math.round(
      ISA_TRANSFER_LIMIT * ISA_TRANSFER_CREDIT_RATE
    );
    const { score, expectedBenefitKrw } = computeScore(
      benefitManWon,
      URGENCY.STRUCTURAL
    );
    return {
      rule_id: 'isa_to_irp',
      product: 'ISA→IRP 전환',
      category: '세액공제 추가',
      score,
      expected_benefit_krw: expectedBenefitKrw,
      recommended_contribution_krw: ISA_TRANSFER_LIMIT * MAN_WON_TO_KRW,
      annual_limit_krw: ISA_TRANSFER_LIMIT * MAN_WON_TO_KRW,
      tax_rate_percent: Math.round(ISA_TRANSFER_CREDIT_RATE * 1000) / 10,
      short_strategy: 'ISA 만기금 IRP 전환 시 10% 추가 공제',
      reason: `ISA 만기금 IRP 이전 시 이전액의 10%(최대 ${ISA_TRANSFER_LIMIT}만원) 추가 세액공제.`,
      action: 'ISA 만기 시 IRP로 이전',
      warning: null,
    };
  }
}
