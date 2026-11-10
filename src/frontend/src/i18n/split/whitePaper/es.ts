import mintRule from "../mintRule/es";
import type en from "./en";

const es: typeof en = {
  eyebrow: "Documentos / Libro blanco",
  title: "Los Diez Mil Inmortales",
  subtitle:
    "La edición corregida, alineada con el código fuente actual de la aplicación.",
  identityHeading: "Identidad de esta edición",
  identityBefore: "El nombre y el símbolo del ledger son ambos ",
  identityAfter:
    ", la prueba en curso. TTTI es la versión futura. Las transacciones más antiguas pueden usar una codificación decimal anterior.",
  contentsAria: "Índice de la edición corregida",
  contentsHeading: "Índice",
  contentsReading: "Lea esto primero",
  contentsLedger: "Token y suministro",
  contentsMechanics: "Mecánica de compra",
  mintInfoHeading: "Buy-to-mint",
  contentsControls: "Controles y riesgos",
  contentsDisclosures: "Declaraciones del creador",
  contentsPrivacy: "Privacidad",
  contentsVerification: "Verificación",
  readingEyebrow: "Edición corregida / alineada con el código fuente",
  readingTitle: "01 / Lea esto primero",
  readingP1: `TTTI es un token meme especulativo, no un derecho sobre un negocio ni una promesa de beneficios. No tiene valor intrínseco, derechos sobre ingresos ni un mercado garantizado. ${mintRule.all} El depósito de una solicitud de par rechazada, en cualquier token (TTTI-T incluido), pasa a la liquidez permanente reservada; el router lo reequilibra y lo inyecta a la proporción del pool. No hay promesa de valor. Su precio de mercado, si lo tiene, puede caer a cero. No compre con dinero que no pueda permitirse perder por completo.`,
  readingP2:
    "Esta edición explica lo que implementa el código fuente actual de la aplicación. No constituye prueba de un despliegue concreto, ni una auditoría independiente, ni un saldo de cuenta en tiempo real, ni una garantía de que una compra pueda completarse ahora.",
  englishOnlyNotice:
    "Las secciones 02 a 07 que siguen solo están disponibles en inglés.",
};

export default es;
