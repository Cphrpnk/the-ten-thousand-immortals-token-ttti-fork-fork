import type en from "./en";

const zhHans: typeof en = {
  block: "区块",
  blockLabel: (block: string) => `区块 #${block}`,
  linkedBlock: "链接的区块",
  linkedBlockNotOnPage: "链接的区块不在此页。",
  showLinkedBlock: "显示链接的区块",
};

export default zhHans;
