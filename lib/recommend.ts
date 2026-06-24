import { recommend as runEngine } from './engine';
import type { RecommendDetailResponse, UserProfile } from './models';

/**
 * 실제 백엔드 호출을 흉내내는 mock API.
 * 약 300ms 지연을 두어 로딩 상태 UI를 자연스럽게 만든다.
 * 실제 백엔드 붙일 때 이 함수 본문만 fetch('/recommend')로 갈아끼면 된다.
 */
export async function fetchRecommendation(
  profile: UserProfile
): Promise<RecommendDetailResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return runEngine(profile);
}
