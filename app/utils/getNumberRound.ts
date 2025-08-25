type ModoRedondeo = "normal" | "arriba" | "abajo";

export default (
  num: number,
  decimales: number = 0,
  modo: ModoRedondeo = "normal"
) => {
  const factor = Math.pow(10, decimales);

  switch (modo) {
    case "arriba":
      return Math.ceil(num * factor) / factor;
    case "abajo":
      return Math.floor(num * factor) / factor;
    case "normal":
    default:
      return Math.round(num * factor) / factor;
  }
};
