const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const pptx2html = require('pptx2html');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));

// Process PDF files
app.post('/api/process-pdf', upload.single('file'), async (req, res) => {
    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, text: data.text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process Word documents
app.post('/api/process-doc', upload.single('file'), async (req, res) => {
    try {
        const result = await mammoth.extractRawText({ path: req.file.path });
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, text: result.value });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process Excel files
app.post('/api/process-excel', upload.single('file'), async (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        let text = '';
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            text += XLSX.utils.sheet_to_csv(worksheet) + '\n';
        });
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process PowerPoint files
app.post('/api/process-ppt', upload.single('file'), async (req, res) => {
    try {
        // This is a simplified example - real implementation would be more complex
        const options = {
            outputDir: 'temp/',
            slides: true
        };
        
        const html = await pptx2html(req.file.path, options);
        let text = html.replace(/<[^>]*>/g, ' '); // Basic HTML stripping
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        res.json({ success: true, text });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
