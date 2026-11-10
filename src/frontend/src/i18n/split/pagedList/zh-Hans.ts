import type en from "./en";

const zhHans: typeof en = {
  loadMore: "加载更多",
  loading: "加载中…",
  loadingMore: "正在加载更多…",
  noMoreResults: "没有更多结果",
  empty: "暂无内容。",
  loadError: "无法加载列表。",
  loadMoreError: "无法加载更多结果。",
  retry: "重试",
  showing: (count: string) => `已显示 ${count} 项`,
};

export default zhHans;
