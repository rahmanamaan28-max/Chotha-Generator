const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Process file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const text = await extractTextFromFile(req.file);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function extractTextFromFile(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    
    try {
        if (extension === '.pdf') {
            const data = await pdfParse(fs.readFileSync(file.path));
            return data.text;
        } else if (extension === '.docx' || extension === '.doc') {
            const result = await mammoth.extractRawText({ path: file.path });
            return result.value;
        } else if (extension === '.xlsx' || extension === '.xls') {
            const workbook = XLSX.readFile(file.path);
            let text = '';
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                text += XLSX.utils.sheet_to_csv(worksheet) + '\n\n';
            });
            return text;
        } else if (extension === '.txt') {
            return fs.readFileSync(file.path, 'utf8');
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        throw new Error(`Failed to process file: ${error.message}`);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
