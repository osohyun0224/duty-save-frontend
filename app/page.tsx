'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  INCOME_TYPE_LABEL,
  INVEST_TYPE_LABEL,
  IncomeType,
  InvestType,
  RISK_TOLERANCE_LABEL,
  RiskTolerance,
  UserProfileSchema,
} from '@/lib/models';

interface FormState {
  age: string;
  annual_salary: string;
  income_type: IncomeType;
  invest_types: InvestType[];
  monthly_invest: string;
  has_isa: boolean;
  has_pension: boolean;
  has_irp: boolean;
  pension_contribution: string;
  irp_contribution: string;
  financial_income: string;
  risk_tolerance: RiskTolerance;
  has_spouse: boolean;
  has_children: boolean;
  has_minor_children: boolean;
  foreign_stock_unrealized_profit: string;
  dividend_income: string;
  holds_high_dividend: boolean;
}

const DEFAULT_FORM: FormState = {
  age: '35',
  annual_salary: '6000',
  income_type: 'employee',
  invest_types: ['foreign_stock', 'etf_foreign', 'domestic_stock'],
  monthly_invest: '100',
  has_isa: false,
  has_pension: true,
  has_irp: false,
  pension_contribution: '300',
  irp_contribution: '0',
  financial_income: '80',
  risk_tolerance: 'high',
  has_spouse: true,
  has_children: true,
  has_minor_children: true,
  foreign_stock_unrealized_profit: '1500',
  dividend_income: '30',
  holds_high_dividend: false,
};

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInvestType(t: InvestType) {
    setForm((prev) => ({
      ...prev,
      invest_types: prev.invest_types.includes(t)
        ? prev.invest_types.filter((x) => x !== t)
        : [...prev.invest_types, t],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const candidate = {
      age: Number(form.age),
      annual_salary: Number(form.annual_salary),
      income_type: form.income_type,
      invest_types: form.invest_types,
      monthly_invest: Number(form.monthly_invest),
      has_isa: form.has_isa,
      has_pension: form.has_pension,
      has_irp: form.has_irp,
      pension_contribution: Number(form.pension_contribution) || 0,
      irp_contribution: Number(form.irp_contribution) || 0,
      financial_income: Number(form.financial_income) || 0,
      risk_tolerance: form.risk_tolerance,
      has_spouse: form.has_spouse,
      has_children: form.has_children,
      has_minor_children: form.has_minor_children,
      foreign_stock_unrealized_profit:
        Number(form.foreign_stock_unrealized_profit) || 0,
      dividend_income: Number(form.dividend_income) || 0,
      holds_high_dividend: form.holds_high_dividend,
    };

    const parsed = UserProfileSchema.safeParse(candidate);
    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errMap[issue.path.join('.')] = issue.message;
      }
      setErrors(errMap);
      setSubmitting(false);
      return;
    }

    sessionStorage.setItem('profile', JSON.stringify(parsed.data));
    sessionStorage.removeItem('result');
    router.push('/result');
  }

  return (
    <main>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          주식 절세 추천
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          연봉·나이·투자 현황을 입력하면 한국 세법 기준 절세 상품 Top 5 를
          추천해드려요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        <Section title="기본 정보">
          <Field label="나이" error={errors.age}>
            <NumberInput
              value={form.age}
              onChange={(v) => update('age', v)}
              suffix="세"
              min={19}
              max={80}
            />
          </Field>
          <Field label="연봉 (만원)" error={errors.annual_salary}>
            <NumberInput
              value={form.annual_salary}
              onChange={(v) => update('annual_salary', v)}
              suffix="만원"
              min={0}
            />
          </Field>
          <Field label="소득 유형" error={errors.income_type}>
            <Select
              value={form.income_type}
              onChange={(v) => update('income_type', v as IncomeType)}
              options={Object.entries(INCOME_TYPE_LABEL).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </Field>
        </Section>

        <Section title="투자 현황">
          <Field
            label="보유 투자 유형"
            hint="해당하는 항목을 모두 선택하세요"
            error={errors.invest_types}
          >
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(INVEST_TYPE_LABEL) as InvestType[]).map((t) => (
                <Checkbox
                  key={t}
                  label={INVEST_TYPE_LABEL[t]}
                  checked={form.invest_types.includes(t)}
                  onChange={() => toggleInvestType(t)}
                />
              ))}
            </div>
            <div className="mt-2 border-t border-slate-100 pt-2">
              <Checkbox
                label="해당 없음 (투자 중인 종목이 없어요)"
                checked={form.invest_types.length === 0}
                onChange={() => {
                  if (form.invest_types.length > 0) {
                    update('invest_types', []);
                  }
                }}
              />
            </div>
          </Field>
          <Field label="월 투자 가능액 (만원)" error={errors.monthly_invest}>
            <NumberInput
              value={form.monthly_invest}
              onChange={(v) => update('monthly_invest', v)}
              suffix="만원"
              min={0}
            />
          </Field>
          <Field label="투자 성향" error={errors.risk_tolerance}>
            <Select
              value={form.risk_tolerance}
              onChange={(v) => update('risk_tolerance', v as RiskTolerance)}
              options={Object.entries(RISK_TOLERANCE_LABEL).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </Field>
          <Field
            label="해외주식 미실현 수익 (만원)"
            error={errors.foreign_stock_unrealized_profit}
          >
            <NumberInput
              value={form.foreign_stock_unrealized_profit}
              onChange={(v) =>
                update('foreign_stock_unrealized_profit', v)
              }
              suffix="만원"
              min={0}
            />
          </Field>
        </Section>

        <Section title="절세 계좌 보유">
          <Checkbox
            label="연금저축 보유"
            checked={form.has_pension}
            onChange={() => update('has_pension', !form.has_pension)}
          />
          {form.has_pension && (
            <Field
              label="연금저축 연 납입액 (만원, 최대 600)"
              error={errors.pension_contribution}
              indent
            >
              <NumberInput
                value={form.pension_contribution}
                onChange={(v) => update('pension_contribution', v)}
                suffix="만원"
                min={0}
                max={600}
              />
            </Field>
          )}
          <Checkbox
            label="IRP 보유"
            checked={form.has_irp}
            onChange={() => update('has_irp', !form.has_irp)}
          />
          {form.has_irp && (
            <Field
              label="IRP 연 납입액 (만원, 최대 300)"
              error={errors.irp_contribution}
              indent
            >
              <NumberInput
                value={form.irp_contribution}
                onChange={(v) => update('irp_contribution', v)}
                suffix="만원"
                min={0}
                max={300}
              />
            </Field>
          )}
          <Checkbox
            label="ISA 보유"
            checked={form.has_isa}
            onChange={() => update('has_isa', !form.has_isa)}
          />
        </Section>

        <Section title="소득·가족">
          <Field
            label="연 금융소득 (이자+배당, 만원)"
            error={errors.financial_income}
          >
            <NumberInput
              value={form.financial_income}
              onChange={(v) => update('financial_income', v)}
              suffix="만원"
              min={0}
            />
          </Field>
          <Field label="연 배당소득 (만원)" error={errors.dividend_income}>
            <NumberInput
              value={form.dividend_income}
              onChange={(v) => update('dividend_income', v)}
              suffix="만원"
              min={0}
            />
          </Field>
          <Checkbox
            label="고배당주 보유"
            checked={form.holds_high_dividend}
            onChange={() =>
              update('holds_high_dividend', !form.holds_high_dividend)
            }
          />
          <Checkbox
            label="배우자 있음"
            checked={form.has_spouse}
            onChange={() => update('has_spouse', !form.has_spouse)}
          />
          <Checkbox
            label="자녀 있음"
            checked={form.has_children}
            onChange={() => update('has_children', !form.has_children)}
          />
          {form.has_children && (
            <Checkbox
              label="미성년 자녀 포함"
              checked={form.has_minor_children}
              onChange={() =>
                update('has_minor_children', !form.has_minor_children)
              }
              indent
            />
          )}
        </Section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? '분석 중...' : '보러가기'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  error,
  hint,
  indent,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  indent?: boolean;
}) {
  return (
    <div className={indent ? 'ml-6' : ''}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  indent,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  indent?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-sm text-slate-700 ${indent ? 'ml-6' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}
