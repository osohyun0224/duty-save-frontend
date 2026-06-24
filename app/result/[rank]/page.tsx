'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type {
  RecommendDetailItem,
  RecommendDetailResponse,
} from '@/lib/models';

export default function DetailPage({
  params,
}: {
  params: { rank: string };
}) {
  const { rank } = params;
  const router = useRouter();
  const [item, setItem] = useState<RecommendDetailItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('result');
    if (!raw) {
      router.replace('/result');
      return;
    }
    const result: RecommendDetailResponse = JSON.parse(raw);
    const found = result.recommendations.find(
      (r) => r.rank === Number(rank)
    );
    if (!found) {
      setNotFound(true);
      return;
    }
    setItem(found);
  }, [rank, router]);

  if (notFound) {
    return (
      <main>
        <BackLink />
        <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          해당 추천 항목을 찾을 수 없습니다.
        </p>
      </main>
    );
  }

  if (!item) {
    return (
      <main>
        <BackLink />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  return (
    <main>
      <BackLink />

      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            {item.rank}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {item.category}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          {item.product}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{item.short_strategy}</p>

        <div className="mt-5 rounded-xl bg-brand-50 px-4 py-3">
          <div className="text-xs font-medium text-brand-700">
            예상 절세액 (연간)
          </div>
          <div className="mt-1 text-2xl font-bold text-brand-700">
            {formatBenefit(item.expected_benefit_krw)}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Meta
            label="권장 납입액"
            value={formatKrw(item.recommended_contribution_krw)}
          />
          <Meta label="연 한도" value={formatKrw(item.annual_limit_krw)} />
          <Meta label="적용 세율" value={formatPercent(item.tax_rate_percent)} />
          <Meta label="추천 점수" value={item.score.toFixed(1)} />
        </dl>
      </header>

      <Block title="추천 근거" body={item.reason} />
      <Block title="실행 방법" body={item.action} accent="brand" />
      {item.warning && (
        <Block title="주의사항" body={item.warning} accent="warning" />
      )}
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/result"
      className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700"
    >
      ← Top 5 목록으로
    </Link>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Block({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: 'brand' | 'warning';
}) {
  const accentClass =
    accent === 'brand'
      ? 'border-brand-200 bg-brand-50'
      : accent === 'warning'
        ? 'border-amber-200 bg-amber-50'
        : 'border-slate-200 bg-white';
  return (
    <section className={`mb-3 rounded-2xl border p-5 ${accentClass}`}>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {body}
      </p>
    </section>
  );
}

function formatBenefit(krw: number | null): string {
  if (krw === null) return '추정 불가 (전략형)';
  return `${krw.toLocaleString('ko-KR')}원`;
}

function formatKrw(krw: number | null): string {
  if (krw === null) return '-';
  return `${krw.toLocaleString('ko-KR')}원`;
}

function formatPercent(p: number | null): string {
  if (p === null) return '-';
  return `${p}%`;
}
