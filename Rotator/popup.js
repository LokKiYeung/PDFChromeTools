const { PDFDocument, degrees } = PDFLib
document.getElementById('rotateBtn').addEventListener('click', async () =>
{
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0)
    {
        alert('Please select a PDF file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (event) =>
    {
        const newFilename = file.name.replace('.pdf', '-rotated.pdf');
        const pdfBytes = new Uint8Array(event.target.result);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();
        const angle = parseInt(document.getElementById('rotationInput').value, 0)
        pages.forEach(page => page.setRotation(degrees(page.getRotation().angle + angle)));

        const rotatedPdfBytes = await pdfDoc.save();

        // Trigger download
        const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newFilename;
        a.click();
        URL.revokeObjectURL(url);
    };

    reader.readAsArrayBuffer(file);
});
