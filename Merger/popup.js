const { PDFDocument, degrees } = PDFLib

document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('mergeBtn').addEventListener('click', mergePdfs);

const fileListElement = document.getElementById('fileList');
let files = [];

function handleFileSelect(event)
{
    files = [];
    const newFiles = Array.from(event.target.files);
    files.push(...newFiles);
    renderFileList();
}


function renderFileList()
{
    fileListElement.innerHTML = '';
    files.forEach((file, index) =>
    {
        const listItem = document.createElement('li');
        listItem.className = 'file-item';
        listItem.innerHTML = `
        <span class="file-name" title="${file.name}">${file.name}</span>
        <div>
          <button class="move-up-btn" data-index="${index}">&#8593;</button>
          <button class="move-down-btn" data-index="${index}">&#8595;</button>
          <button class="remove-btn" data-index="${index}">-</button>
        </div>
      `;
        fileListElement.appendChild(listItem);
    });
    // Attach event listeners to the dynamically created buttons
    document.querySelectorAll('.move-up-btn').forEach(button =>
    {
        button.addEventListener('click', moveFileUp);
    });
    document.querySelectorAll('.move-down-btn').forEach(button =>
    {
        button.addEventListener('click', moveFileDown);
    });
    document.querySelectorAll('.remove-btn').forEach(button =>
    {
        button.addEventListener('click', removeFile);
    });
}

function moveFileUp(event)
{
    const index = parseInt(event.target.dataset.index);
    moveFile(index, -1);
}

function moveFileDown(event)
{
    const index = parseInt(event.target.dataset.index);
    moveFile(index, 1);
}

function moveFile(index, direction)
{
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    [files[index], files[newIndex]] = [files[newIndex], files[index]];
    renderFileList();
}

function removeFile(event)
{
    const index = parseInt(event.target.dataset.index);
    files.splice(index, 1);
    renderFileList();
}

async function mergePdfs()
{
    if (files.length === 0)
    {
        alert('Please select at least one PDF file.');
        return;
    }

    const pdfDocs = await Promise.all(files.map(file => readPdf(file)));
    const mergedPdf = await PDFDocument.create();

    for (const pdfDoc of pdfDocs)
    {
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));

    }

    const mergedPdfBytes = await mergedPdf.save();
    downloadPdf(mergedPdfBytes);
};

async function readPdf(file)
{
    const arrayBuffer = await file.arrayBuffer();
    return PDFDocument.load(arrayBuffer);
}

function downloadPdf(pdfBytes)
{
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
    URL.revokeObjectURL(url);
}
