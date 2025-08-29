// DOM elements
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadStatus = document.getElementById('uploadStatus');
const processBtn = document.getElementById('processBtn');
const extractedContent = document.getElementById('extractedContent');
const generateChothaBtn = document.getElementById('generateChothaBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const chothaPreview = document.getElementById('chothaPreview');

// Store uploaded files and their content
let uploadedFiles = [];
let extractedText = '';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// File input change handler
fileInput.addEventListener('change', handleFileSelection);

// Process button click handler
processBtn.addEventListener('click', processAllFiles);

// Generate Chotha button click handler
generateChothaBtn.addEventListener('click', generateChotha);

// Clear all button click handler
clearAllBtn.addEventListener('click', clearAll);

// Download text button click handler
downloadTextBtn.addEventListener('click', downloadText);

// Handle file selection
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    uploadedFiles = files;
    updateFileList();
    updateUploadStatus('ready');
}

// Update file list display
function updateFileList() {
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
            </div>
            <span class="file-type">${getFileType(file.name)}</span>
        `;
        fileList.appendChild(fileItem);
    });
    
    processBtn.disabled = uploadedFiles.length === 0;
}

// Update status message
function updateUploadStatus(status, message = '') {
    uploadStatus.className = 'status-message';
    
    switch(status) {
        case 'ready':
            uploadStatus.className += ' status-info';
            uploadStatus.innerHTML = `Ready to process ${uploadedFiles.length} file(s)`;
            break;
        case 'processing':
            uploadStatus.className += ' status-processing';
            uploadStatus.innerHTML = `<span class="loading-spinner"></span> Processing files...`;
            break;
        case 'success':
            uploadStatus.className += ' status-success';
            uploadStatus.innerHTML = message || 'Files processed successfully!';
            break;
        case 'error':
            uploadStatus.className += ' status-error';
            uploadStatus.innerHTML = message || 'Error processing files. Please try again.';
            break;
        default:
            uploadStatus.innerHTML = 'Select files to begin processing';
    }
}

// Process all uploaded files
async function processAllFiles() {
    if (uploadedFiles.length === 0) return;
    
    updateUploadStatus('processing');
    extractedText = '';
    
    try {
        for (const file of uploadedFiles) {
            const content = await extractContentFromFile(file);
            extractedText += `=== ${file.name} ===\n\n${content}\n\n`;
        }
        
        extractedContent.value = extractedText;
        updateUploadStatus('success', `Successfully processed ${uploadedFiles.length} file(s)`);
    } catch (error) {
        console.error('Error processing files:', error);
        updateUploadStatus('error', `Error: ${error.message}`);
    }
}

// Extract content from different file types
async function extractContentFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    try {
        switch(extension) {
            case 'pdf':
                return await extractTextFromPDF(file);
            case 'doc':
            case 'docx':
                return await extractTextFromWord(file);
            case 'xls':
            case 'xlsx':
                return await extractTextFromExcel(file);
            case 'txt':
                return await extractTextFromTextFile(file);
            case 'ppt':
            case 'pptx':
                return await extractTextFromPowerPoint(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    } catch (error) {
        throw new Error(`Failed to process ${file.name}: ${error.message}`);
    }
}

// Extract text from PDF files
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const typedArray = new Uint8Array(event.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    text += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                
                resolve(text);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Extract text from Word documents
async function extractTextFromWord(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const arrayBuffer = event.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Extract text from Excel files
async function extractTextFromExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                let text = '';
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    text += `Sheet: ${sheetName}\n`;
                    text += XLSX.utils.sheet_to_csv(worksheet) + '\n\n';
                });
                
                resolve(text);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Extract text from text files
async function extractTextFromTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Extract text from PowerPoint (basic implementation)
async function extractTextFromPowerPoint(file) {
    // PowerPoint processing is complex in browser - return basic message
    return "PowerPoint content extraction is limited in browser. For better results, please convert to PDF first.";
}

// Generate Chotha from extracted text
function generateChotha() {
    if (!extractedText.trim()) {
        alert('Please process documents first!');
        return;
    }
    
    // Simple Chotha generation - you can expand this with your specific logic
    const chothaContent = createCompactChotha(extractedText);
    chothaPreview.innerHTML = `<div class="chotha-content">${chothaContent}</div>`;
}

// Create compact Chotha content
function createCompactChotha(text) {
    // Your Chotha generation logic here
    // This is a simplified version - expand with your specific requirements
    
    return text.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
            // Basic compression for demonstration
            return line.replace(/\s+/g, ' ')
                      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, '')
                      .substring(0, 100);
        })
        .join('<br>');
}

// Clear all content
function clearAll() {
    fileInput.value = '';
    uploadedFiles = [];
    extractedText = '';
    extractedContent.value = '';
    fileList.innerHTML = '';
    chothaPreview.innerHTML = '<p>Chotha content will appear here after processing</p>';
    updateUploadStatus('default');
    processBtn.disabled = true;
}

// Download extracted text
function downloadText() {
    if (!extractedText.trim()) {
        alert('No content to download!');
        return;
    }
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-content.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'PDF Document',
        'doc': 'Word Document',
        'docx': 'Word Document',
        'xls': 'Excel Spreadsheet',
        'xlsx': 'Excel Spreadsheet',
        'txt': 'Text File',
        'ppt': 'PowerPoint',
        'pptx': 'PowerPoint'
    };
    return typeMap[extension] || 'Unknown File Type';
}

// Initialize
updateUploadStatus('default');
