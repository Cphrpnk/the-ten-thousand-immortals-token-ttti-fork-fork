import { defineDict } from "../core/dict";

/** Site-wide text: document title, language picker, conflict notice. */
export const SITE_TEXT = defineDict({
  en: {
    title: "The Ten Thousand Immortals — TTTI-T",
    languagePicker: "Language",
    conflictNotice: "",
  },
  fr: {
    title: "Les Dix Mille Immortels — TTTI-T",
    languagePicker: "Langue",
    conflictNotice: "En cas de conflit, la version anglaise prévaut.",
  },
  es: {
    title: "Los Diez Mil Inmortales — TTTI-T",
    languagePicker: "Idioma",
    conflictNotice: "En caso de conflicto, prevalece la versión en inglés.",
  },
  "zh-Hans": {
    title: "万名不朽者 — TTTI-T",
    languagePicker: "语言",
    conflictNotice: "如有冲突，以英文版本为准。",
  },
  "pt-BR": {
    title: "Os Dez Mil Imortais — TTTI-T",
    languagePicker: "Idioma",
    conflictNotice: "Em caso de conflito, prevalece a versão em inglês.",
  },
  ko: {
    title: "만 명의 불멸자 — TTTI-T",
    languagePicker: "언어",
    conflictNotice: "내용이 상충하는 경우 영어 버전이 우선합니다.",
  },
  "pa-Guru": {
    title: "ਦਸ ਹਜ਼ਾਰ ਅਮਰ — TTTI-T",
    languagePicker: "ਭਾਸ਼ਾ",
    conflictNotice: "ਟਕਰਾਅ ਦੀ ਸਥਿਤੀ ਵਿੱਚ, ਅੰਗਰੇਜ਼ੀ ਸੰਸਕਰਣ ਨੂੰ ਤਰਜੀਹ ਦਿੱਤੀ ਜਾਵੇਗੀ।",
  },
});

/** Native name of each language, shown as the picker buttons' accessible name. */
export const LANG_NAMES = {
  en: "English",
  fr: "Français",
  es: "Español",
  "zh-Hans": "简体中文",
  "pt-BR": "Português (Brasil)",
  ko: "한국어",
  "pa-Guru": "ਪੰਜਾਬੀ",
} as const;

/** Short visible label of each language in the picker. */
export const LANG_SHORT_LABELS = {
  en: "EN",
  fr: "FR",
  es: "ES",
  "zh-Hans": "中文",
  "pt-BR": "PT",
  ko: "한국어",
  "pa-Guru": "ਪੰਜਾਬੀ",
} as const;
