import type en from "./en";

const ko: typeof en = {
  block: "블록",
  blockLabel: (block: string) => `블록 #${block}`,
  linkedBlock: "연결된 블록",
  linkedBlockNotOnPage: "연결된 블록이 이 페이지에 없습니다.",
  showLinkedBlock: "연결된 블록 표시",
};

export default ko;
