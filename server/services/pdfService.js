const PDFDocument = require('pdfkit');

function formatLocation(worker) {
  const addressLine = worker?.location?.addressLine;
  const village = worker?.location?.village;
  const taluk = worker?.location?.taluk;
  const district = worker?.location?.district;
  const state = worker?.location?.state;

  const parts = [addressLine, village, taluk, district, state].filter(Boolean);
  return parts.length ? parts.join(', ') : '-';
}

function buildWorkersSectionPdfBuffer({ job, sectionTitle, sectionSubtitle, workers = [] }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('AgroLink - Worker Lists', { align: 'center' });
    doc.moveDown(0.8);

    doc.fontSize(13).fillColor('#1A6B3C').text(sectionTitle, { align: 'center' });
    if (sectionSubtitle) doc.fontSize(11).fillColor('black').text(sectionSubtitle, { align: 'center' });
    doc.moveDown(0.6);

    doc.fontSize(12).fillColor('black').text(`Job: ${job?.title || '-'}`);
    doc.text(`Category: ${job?.category || '-'}`);
    if (job?.startDate) doc.text(`Start date: ${new Date(job.startDate).toLocaleDateString()}`);
    doc.text(`Workers: ${workers.length}`);
    doc.moveDown();

    const startX = doc.page.margins.left;
    const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const nameW = Math.round(tableWidth * 0.30);
    const phoneW = Math.round(tableWidth * 0.22);
    const locationW = tableWidth - nameW - phoneW;

    // Header background
    const headerY = doc.y;
    const headerH = 22;
    doc.rect(startX, headerY, tableWidth, headerH).fill('#E8F5EE');

    doc.fillColor('#1A6B3C').fontSize(11);
    doc.text('Name', startX + 6, headerY + 6, { width: nameW - 12 });
    doc.text('Phone', startX + nameW + 6, headerY + 6, { width: phoneW - 12 });
    doc.text('Location', startX + nameW + phoneW + 6, headerY + 6, { width: locationW - 12 });

    // Header line
    doc.fillColor('black');
    doc.moveTo(startX, headerY + headerH).lineTo(startX + tableWidth, headerY + headerH).stroke('#D1D5DB');

    doc.moveDown(1);

    workers.forEach((worker) => {
      const name = worker?.name || '-';
      const phone = worker?.phone || '-';
      const location = formatLocation(worker);

      const rowStartY = doc.y;
      const nameH = doc.heightOfString(name, { width: nameW - 12 });
      const phoneH = doc.heightOfString(phone, { width: phoneW - 12 });
      const locationH = doc.heightOfString(location, { width: locationW - 12 });
      const rowH = Math.max(nameH, phoneH, locationH) + 10;

      // Row separator
      doc.moveTo(startX, rowStartY).lineTo(startX + tableWidth, rowStartY).stroke('#E5E7EB');

      // Text cells
      doc.fontSize(10.5).fillColor('black');
      doc.text(name, startX + 6, rowStartY + 4, { width: nameW - 12 });
      doc.text(phone, startX + nameW + 6, rowStartY + 4, { width: phoneW - 12 });
      doc.text(location, startX + nameW + phoneW + 6, rowStartY + 4, { width: locationW - 12 });

      doc.moveTo(startX, rowStartY + rowH).lineTo(startX + tableWidth, rowStartY + rowH).stroke('#E5E7EB');
      doc.y = rowStartY + rowH;
    });

    doc.end();
  });
}

function buildWorkerListPdfBuffer({ job, workers }) {
  return buildWorkersSectionPdfBuffer({
    job,
    sectionTitle: 'Worker List',
    sectionSubtitle: 'Matched workers',
    workers,
  });
}

module.exports = {
  buildWorkerListPdfBuffer,
  buildWorkersSectionPdfBuffer,
};
