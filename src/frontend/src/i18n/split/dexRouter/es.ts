import type en from "./en";

const es: typeof en = {
  routeLabel: "Ruta",
  routeNative: "Pool nativo",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "Elegida: mayor importe recibido, comisiones incluidas.",
  reasonNativeUnavailable:
    "El pool nativo está vacío, en llenado o es poco profundo para este importe.",
  reasonIcpswapUnavailable:
    "No hay cotización de ICPSwap disponible para este par.",
  icpswapFee: (pct: string) => `Comisión de ICPSwap (${pct})`,
  protocolFee: (pct: string) => `Comisión del protocolo (${pct})`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % a los LP del pool nativo: ${lp} · 30 % a su liquidez permanente: ${permanent}`,
  alternativeLabel: (route: string) => `Otra ruta (${route})`,
  alternativeNone: "Otra ruta",
  alternativeUnavailable: "No disponible",
  routeRule:
    "Una sola ruta por intercambio: el pool nativo (0,3 %) o ICPSwap (0,3 % más una comisión del protocolo del 0,1 %), la que dé el mayor importe recibido, comisiones incluidas. La ruta cotizada se envía con el intercambio.",
  fillingViaIcpswap: (gauge: string) =>
    `Los intercambios del pool nativo están cerrados mientras se llena: ${gauge}. El intercambio puede pasar por ICPSwap.`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `${input} intercambiados por ${output} vía ${route}.`,
  errSameToken: "Los dos tokens deben ser distintos.",
  errPairNotFound: "Este par no está en el registro.",
  errNoRoute: "No hay ninguna ruta disponible para este intercambio ahora.",
  errRouteMismatch: (route: string) =>
    `La ruta ahora es ${route}. Revise la nueva cotización y confirme de nuevo.`,
  errIcpswapReturned: (message: string) =>
    `ICPSwap no completó el intercambio: ${message}. El importe enviado volvió a su saldo DEX.`,
  errIcpswapHeld: (id: string, message: string) =>
    `ICPSwap no completó el intercambio enrutado n.º ${id}: ${message}. El importe enviado aún no ha vuelto; se le da seguimiento.`,
  errOutcomeUnknown: (id: string) =>
    `El resultado del intercambio enrutado n.º ${id} aún no se conoce. El admin lo verifica; su saldo DEX se actualiza una vez confirmado.`,
};

export default es;
