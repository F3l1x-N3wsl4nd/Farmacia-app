import PDFDocument from 'pdfkit';

export const gerarReciboVenda = (venda, res) => {
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.text('Recibo de Venda', { align: 'center' });
  venda.itens.forEach(item => {
    doc.text(`${item.nome} - ${item.quantidade} x ${item.precoUnitario} Kz`);
  });
  doc.text(`Total: ${venda.total} Kz`);

  doc.end();
};
