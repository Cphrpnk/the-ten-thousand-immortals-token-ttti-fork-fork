import mintRule from "../mintRule/es";
import type en from "./en";

const es: typeof en = {
  label: "Versión de prueba",
  intro:
    "Esta es una versión de prueba: un token, TTTI-T, 10.000 USD en total, desde 1 USD. Mismo precio que cualquier TTTI futuro: sin descuento, sin bonificación, sin ventaja. Si alguna vez hay una versión completa, TTTI-T se convierte 1:1 en TTTI. Es posible que nunca haya una versión completa.",
  errorText:
    "Las cifras de la asignación en directo no están disponibles temporalmente.",
  retry: "Reintentar",
  statusComplete: "Asignación completada",
  statusPaused: "Compras en pausa",
  statusCurrent: "Asignación en curso",
  pricePerToken: "Precio por TTTI-T (antes de la comisión)",
  totalSupply: "Suministro total",
  remaining: "Restante",
  progressAria: (percent: string) =>
    `Suministro total: ${percent}% del suministro máximo`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `Suministro total: ${total} / ${max} ${symbol} (${percent}%)`,
  disclosuresTitle: "Declaraciones del creador",
  disclosure1: `${mintRule.all} El depósito de una solicitud de par rechazada, en cualquier token (TTTI-T incluido), pasa a la liquidez permanente reservada. Las tenencias del creador están declaradas y son públicas: los importes que se mantienen para el creador, por token, figuran en la página Pools. El creador no defiende ningún precio ni opera para generar volumen. Cualquier persona, incluido el creador, puede aportar liquidez a su discreción y retirarla según las reglas de bloqueo. Confíe únicamente en lo que pueda verificar.`,
  disclosure2:
    "TTTI y THAT tienen el mismo creador. TTTI no tiene ningún vínculo con THAT: no puede intercambiarse por THAT, ni usarse dentro de THAT, ni convertirse en ninguna otra cosa.",
};

export default es;
