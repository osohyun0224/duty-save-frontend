import type { UserProfile } from './models';
import { FIN_INCOME_THRESHOLD, PENSION_LIMIT } from './constants';

export function isFinancialIncomeTaxable(profile: UserProfile): boolean {
  return profile.financial_income >= FIN_INCOME_THRESHOLD;
}

export function annualInvestmentManWon(profile: UserProfile): number {
  return profile.monthly_invest * 12;
}

export function pensionRoomFill(profile: UserProfile): number {
  const room = Math.max(0, PENSION_LIMIT - profile.pension_contribution);
  return Math.min(room, annualInvestmentManWon(profile));
}
