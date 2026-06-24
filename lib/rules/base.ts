import type { Candidate, UserProfile } from '../models';
import { MAN_WON_TO_KRW } from '../constants';

export abstract class BaseRule {
  abstract readonly name: string;
  abstract isApplicable(profile: UserProfile): boolean;
  abstract evaluate(profile: UserProfile): Candidate;
}

export interface ScoreParts {
  score: number;
  expectedBenefitKrw: number | null;
}

const SCORE_SCALE = 10;
export const FIXED_SCORE = 500;

export function computeScore(
  benefitManWon: number,
  urgencyWeight: number
): ScoreParts {
  const score =
    Math.round(benefitManWon * urgencyWeight * SCORE_SCALE * 10) / 10;
  return { score, expectedBenefitKrw: benefitManWon * MAN_WON_TO_KRW };
}

export function fixedScore(): ScoreParts {
  return { score: FIXED_SCORE, expectedBenefitKrw: null };
}

export const URGENCY = {
  IMMEDIATE: 2.0,
  PARTIAL: 1.5,
  STRUCTURAL: 1.0,
  WARNING: 0.8,
} as const;
