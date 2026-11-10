import type en from "./en";

const ko: typeof en = {
  loadMore: "더 보기",
  loading: "불러오는 중…",
  loadingMore: "더 불러오는 중…",
  noMoreResults: "더 이상 결과가 없습니다",
  empty: "아직 표시할 내용이 없습니다.",
  loadError: "목록을 불러오지 못했습니다.",
  loadMoreError: "추가 결과를 불러오지 못했습니다.",
  retry: "다시 시도",
  showing: (count: string) => `${count}개 표시 중`,
};

export default ko;
