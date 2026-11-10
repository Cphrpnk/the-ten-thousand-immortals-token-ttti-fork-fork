import type en from "./en";

const share =
  "En cada mint, una parte bloqueada m de los TTTI-T acuñados se aporta al pool junto con sus dólares de contrapartida y se bloquea a nombre del minter. m se calcula en el momento del pago a partir de la relación entre el valor de los pools y la capitalización, entre 0 % y 50 %, y se registra con la posición. El relevo libera este bloqueo como máximo a los 3 meses.";
const remainder =
  "El resto (1 − m) lo elige el minter antes de pagar. Opción A: también se aporta al pool, sin bloqueo; la posición puede retirarse en cualquier momento o bloquearse voluntariamente de 3 meses a 5 años. Opción B: el minter conserva esos TTTI-T en su wallet y no paga la liquidez correspondiente.";
const payment =
  "El pago es (10 000 USD + la liquidez aportada por TTTI-T) × q ÷ 0,99, donde la liquidez aportada por TTTI-T es 10 000 USD en la opción A y m × 10 000 USD en la opción B. 10 000 USD × q van siempre a la reserva común; el 1 % del importe pagado va al creador, después de la reserva de ciclos. El TTTI-T nunca entra en un pool sin sus dólares de contrapartida. En la liquidación de una subasta se aplica la misma regla, con el precio B del ganador en lugar de 10 000 USD para la parte de la posición.";
const redemption =
  "Canje contra la reserva común: 1 TTTI-T se canjea por 10 000 USD como máximo, sin comisión. Por x TTTI-T devueltos al contrato, el pago es el menor entre 10 000 USD × x y (la reserva ÷ el TTTI-T en circulación fuera del contrato) × x, pagado a prorrata de la composición de la reserva, en ICP, ckBTC, ckUSDC y ckUSDT.";

const es: typeof en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default es;
