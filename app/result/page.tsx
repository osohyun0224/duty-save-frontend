'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchRecommendation } from '@/lib/recommend';
import type { RecommendDetailResponse, UserProfile } from '@/lib/models';

export default function ResultPage() {
  const router = useRouter();
  const [response, setResponse] = useState<RecommendDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('profile');
    if (!raw) {
      router.replace('/');
      return;
    }
    const profile: UserProfile = JSON.parse(raw);
    fetchRecommendation(profile)
      .then((res) => {
        sessionStorage.setItem('result', JSON.stringify(res));
        setResponse(res);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : '추천 계산 실패';
        setError(msg);
      });
  }, [router]);

  if (error) {
    return (
      <main>
        <BackLink />
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      </main>
    );
  }

  if (!response) {
    return (
      <main>
        <BackLink />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </main>
    );
  }

  if (response.recommendations.length === 0) {
    return (
      <main>
        <BackLink />
        <header className="mb-6">
          <p className="text-xs font-medium text-slate-500">
            {response.profile_summary}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            적용 가능한 절세 전략이 없어요
          </h1>
        </header>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600">
          <p>
            현재 입력 기준으로는 추천드릴 절세 상품을 찾지 못했어요. 보통 다음
            중 하나에 해당돼요.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>소득이 없어 세액공제 대상이 아님 (연봉·소득 유형 확인)</li>
            <li>월 투자 가능액이 0원이라 추가 납입 추천이 불가</li>
            <li>해외주식·고배당 등 절세 룰이 적용될 자산이 없음</li>
          </ul>
          <p className="mt-3">
            투자를 시작하시거나 상황이 바뀌면 다시 분석해보세요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BackLink />
      <header className="mb-6">
        <p className="text-xs font-medium text-slate-500">
          {response.profile_summary}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          절세 추천 Top {response.recommendations.length}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          전체 {response.total_applicable}개 적용 가능 전략 중 우선순위가 높은
          순서대로 보여드려요.
        </p>
      </header>

      <ul className="space-y-3">
        {response.recommendations.map((item) => (
          <li key={item.rank}>
            <Link
              href={`/result/${item.rank}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {item.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-base font-semibold text-slate-900 group-hover:text-brand-700">
                    {item.product}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {item.short_strategy}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-500">예상 절세액</span>
                    <span className="text-sm font-semibold text-brand-700">
                      {formatBenefit(item.expected_benefit_krw)}
                    </span>
                  </div>
                </div>
                <span className="self-center text-slate-300 transition group-hover:text-brand-500">
                  →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700"
    >
      ← 다시 입력하기
    </Link>
  );
}

function formatBenefit(krw: number | null): string {
  if (krw === null) return '추정 불가 (전략형)';
  return `약 ${krw.toLocaleString('ko-KR')}원`;
}
