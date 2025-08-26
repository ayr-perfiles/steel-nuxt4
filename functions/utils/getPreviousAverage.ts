export default (
  promedioActual: number,
  cantidad: number,
  valorQuitado: number
) => {
  if (cantidad <= 1) {
    throw new Error(
      "No se puede calcular el promedio al quitar un valor si solo había un elemento."
    );
  }

  return (promedioActual * cantidad - valorQuitado) / (cantidad - 1);
};
