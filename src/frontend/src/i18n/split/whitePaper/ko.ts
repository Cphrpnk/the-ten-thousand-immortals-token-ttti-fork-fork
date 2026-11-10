import mintRule from "../mintRule/ko";
import type en from "./en";

const ko: typeof en = {
  eyebrow: "문서 / 백서",
  title: "만 명의 불사신",
  subtitle: "현재 애플리케이션 소스 코드에 맞춘 수정판입니다.",
  identityHeading: "이 판의 식별 정보",
  identityBefore: "ledger의 이름과 심볼은 모두 ",
  identityAfter:
    "이며, 현재 운영 중인 테스트입니다. TTTI는 향후 버전입니다. 이전 거래는 예전 소수점 인코딩을 사용할 수 있습니다.",
  contentsAria: "수정판 목차",
  contentsHeading: "목차",
  contentsReading: "먼저 읽어 주세요",
  contentsLedger: "토큰 및 공급량",
  contentsMechanics: "구매 방식",
  mintInfoHeading: "Buy-to-mint",
  contentsControls: "통제 및 위험",
  contentsDisclosures: "창작자 고지",
  contentsPrivacy: "개인정보",
  contentsVerification: "검증",
  readingEyebrow: "수정판 / 소스 코드 기준",
  readingTitle: "01 / 먼저 읽어 주세요",
  readingP1: `TTTI는 투기적인 밈 토큰이며, 어떤 사업에 대한 권리나 수익의 약속이 아닙니다. TTTI에는 내재 가치, 수익에 대한 권리, 보장된 시장이 없습니다. ${mintRule.all} 거절된 페어 요청의 보증금은 토큰(TTTI-T 포함)과 관계없이 따로 보관되는 영구 유동성으로 들어가며, 라우터가 재조정하여 풀 비율로 주입합니다. 가치에 대한 약속은 없습니다. 시장 가격이 있더라도 0으로 떨어질 수 있습니다. 전부 잃을 경우 감당할 수 없는 돈으로는 구매하지 마십시오.`,
  readingP2:
    "이 판은 현재 애플리케이션 소스 코드가 구현하는 내용을 설명합니다. 이는 특정 배포에 대한 증명, 독립적인 감사, 실시간 계정 잔액, 또는 지금 구매를 완료할 수 있다는 보장이 아닙니다.",
  englishOnlyNotice: "아래 02~07절은 영어로만 제공됩니다.",
};

export default ko;
