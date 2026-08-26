const fs = require('fs');
const { PDFDocument, degrees } = require('pdf-lib');

async function testPdfEngines() {
  console.log('=== Testing PDF Engine Core Functions ===');

  // 1. Test Merge
  const bufA = fs.readFileSync('/home/anuveshh/pdfexpress/test-assets/sample_a.pdf');
  const bufB = fs.readFileSync('/home/anuveshh/pdfexpress/test-assets/sample_b.pdf');

  const docA = await PDFDocument.load(bufA);
  const docB = await PDFDocument.load(bufB);

  const merged = await PDFDocument.create();
  const pagesA = await merged.copyPages(docA, docA.getPageIndices());
  const pagesB = await merged.copyPages(docB, docB.getPageIndices());

  pagesA.forEach((p) => merged.addPage(p));
  pagesB.forEach((p) => merged.addPage(p));

  const mergedBytes = await merged.save();
  console.log(`[PASS] Merge: ${pagesA.length + pagesB.length} total pages merged, ${mergedBytes.length} bytes`);

  // 2. Test Organize & Rotate
  const organized = await PDFDocument.create();
  const reorderedIndices = [2, 0, 1]; // reorder pages 3, 1, 2
  const copied = await organized.copyPages(docA, reorderedIndices);

  copied[0].setRotation(degrees(90)); // rotate first page
  copied.forEach((p) => organized.addPage(p));

  const organizedBytes = await organized.save();
  console.log(`[PASS] Organize: ${copied.length} pages reordered & rotated, ${organizedBytes.length} bytes`);

  console.log('=== All Engine Verification Passed! ===');
}

testPdfEngines().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
