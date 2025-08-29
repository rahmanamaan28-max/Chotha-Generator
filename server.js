const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.array('files'), async (req, res) => {
    const extractedTexts = [];
    for (const file of req.files) {
        const text = await extractTextFromFile(file);
        extractedTexts.push(text);
        fs.unlinkSync(file.path); // Clean up
    }
    res.json({ texts: extractedTexts });
});

async function extractTextFromFile(file) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    try {
        if (ext === 'pdf') {
            const data = await pdfParse(fs.readFileSync(file.path));
            return data.text;
        } else if (['docx', 'doc'].includes(ext)) {
            const result = await mammoth.extractRawText({ path: file.path });
            return result.value;
        } else if (['xlsx', 'xls'].includes(ext)) {
            const workbook = XLSX.readFile(file.path);
            return workbook.SheetNames.map(sheet => XLSX.utils.sheet_to_csv(workbook.Sheets[sheet])).join('\n');
        } else if (ext === 'txt') {
            return fs.readFileSync(file.path, 'utf8');
        } else {
            return 'Unsupported file type';
        }
    } catch (error) {
        return `Error processing file: ${error.message}`;
    }
}

app.listen(3000, () => console.log('Server running on port 3000'));
