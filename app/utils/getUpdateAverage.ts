export default (
  promedioActual: number,
  cantidad: number,
  nuevoValor: number
) => {
  return (promedioActual * cantidad + nuevoValor) / (cantidad + 1);
};
