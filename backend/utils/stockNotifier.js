export const verificarEstoqueMinimo = (medicamento) => {
  if (medicamento.quantidade <= 5) {
    console.warn(`Estoque baixo: ${medicamento.nome}`);
  }
};
