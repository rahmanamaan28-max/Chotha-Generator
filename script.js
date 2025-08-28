// DOM elements
const fileInput = document.getElementById('fileInput');
const rawNotes = document.getElementById('rawNotes');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const chothaContainer = document.getElementById('chothaContainer');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const compressionLevel = document.getElementById('compressionLevel');
const fileStatus = document.getElementById('fileStatus');
const boxCount = document.getElementById('boxCount');
const contentStats = document.getElementById('contentStats');

// Initialize with sample text
rawNotes.value = "PERCEPTION:\nProcess of interpreting sensations into meaningful patterns. It involves three steps: selection, organization, interpretation. Selection is focusing on certain stimuli. Organization uses Gestalt principles: similarity, proximity, continuity, closure. Interpretation assigns meaning based on past experience.\n\nGESTALT PRINCIPLES:\nLaws of organization. Figure-ground: we separate objects from background. Similarity: similar items are grouped. Proximity: nearby items are grouped. Continuity: we see continuous patterns. Closure: we fill in gaps to see complete objects.";

// Update font size value display
fontSizeSlider.addEventListener('input', function() {
    fontSizeValue.textContent = `${this.value}px`;
    adjustFontSize(this.value);
});

// Load document from file input
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading state
    fileStatus.textContent = `Processing ${file.name}...`;
    fileStatus.className = 'status-message status-info';
    
    // Handle text files
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        handleTextFile(file);
    } else {
        fileStatus.textContent = 'Please upload a text file (.txt)';
        fileStatus.className = 'status-message status-error';
    }
});

// Handle text files
function handleTextFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        rawNotes.value = e.target.result;
        fileStatus.textContent = `${file.name} loaded successfully`;
        fileStatus.className = 'status-message status-success';
    };
    reader.onerror = function() {
        fileStatus.textContent = 'Error reading file';
        fileStatus.className = 'status-message status-error';
    };
    reader.readAsText(file);
}

// Generate Chotha
generateBtn.addEventListener('click', function() {
    const text = rawNotes.value.trim();
    if (!text) {
        alert('Please enter some notes first!');
        return;
    }

    chothaContainer.innerHTML = '';
    
    // Parse input - split by lines that look like headings
    const lines = text.split('\n');
    let currentTopic = '';
    let currentContent = '';
    const topics = [];
    
    for (const line of lines) {
        // Check if this line is a heading (all caps, ends with colon, or significantly different from previous lines)
        const isHeading = line.match(/^[A-Z][A-Z\s]+:$/) || 
                         (line.length > 0 && line.length < 30 && line.toUpperCase() === line) ||
                         line.endsWith(':');
        
        if (isHeading) {
            // Save previous topic if exists
            if (currentTopic) {
                topics.push({ topic: currentTopic, content: currentContent });
            }
            
            // Start new topic
            currentTopic = line.replace(':', '').trim();
            currentContent = '';
        } else {
            // Add to current content
            currentContent += line + ' ';
        }
    }
    
    // Add the last topic
    if (currentTopic) {
        topics.push({ topic: currentTopic, content: currentContent });
    }
    
    // If no topics were detected, create one with all content
    if (topics.length === 0) {
        topics.push({ topic: 'Notes', content: text });
    }
    
    let totalChars = 0;
    
    // Process each topic
    topics.forEach(item => {
        const box = document.createElement('div');
        box.classList.add('chotha-box');
        
        // Apply current font size
        const fontSize = fontSizeSlider.value;
        box.style.fontSize = `${fontSize}px`;
        
        // Create heading
        const headingSpan = document.createElement('span');
        headingSpan.classList.add('chotha-heading');
        headingSpan.textContent = item.topic;
        box.appendChild(headingSpan);
        
        // Process content based on compression level
        const processedContent = processContent(item.content, compressionLevel.value);
        totalChars += processedContent.length;
        
        const contentSpan = document.createElement('span');
        contentSpan.classList.add('chotha-content');
        contentSpan.innerHTML = processedContent;
        box.appendChild(contentSpan);
        
        // Add to container
        chothaContainer.appendChild(box);
    });
    
    // Update stats
    boxCount.textContent = `${topics.length} boxes`;
    contentStats.textContent = `${totalChars} characters`;
});

// Process content to make it ultra-compact
function processContent(text, level) {
    // Remove extra spaces and line breaks
    let processedText = text.replace(/\s+/g, ' ').trim();
    
    // Apply short forms and replacements
    const replacements = {
        'important': 'Imp.',
        'definition': 'Def.',
        'function': 'Func.',
        'example': 'Eg.',
        'increase': '↑',
        'decrease': '↓',
        ' leads to ': '→',
        ' results in ': '→',
        ' therefore ': '∴',
        ' because ': '∵',
        ' and ': ' & ',
        ' with ': ' w/ ',
        ' without ': ' w/o ',
        ' approximately ': '≈',
        ' equals ': '=',
        ' not equal ': '≠',
        ' greater than ': '>',
        ' less than ': '<',
        ' plus ': '+',
        ' minus ': '-',
        ' divided by ': '÷',
        ' multiplied by ': '×',
    };
    
    // Apply replacements
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'gi');
        processedText = processedText.replace(regex, value);
    }
    
    // Apply compression based on level
    if (level === 'high' || level === 'extreme') {
        // Remove articles and some pronouns
        processedText = processedText.replace(/\b(the|a|an|is|are|was|were|be|being|been)\b/gi, '');
        
        // Remove unnecessary words
        processedText = processedText.replace(/\b(this|that|these|those|which|who|whom|whose)\b/gi, '');
    }
    
    if (level === 'extreme') {
        // Remove vowels from longer words (but keep first letter)
        processedText = processedText.replace(/\b([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{3,})[aeiouAEIOU]+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]*)\b/g, '$1$2');
        
        // Shorten common suffixes
        processedText = processedText.replace(/(ing|ed|tion|sion|ment|ity|able|ible|al|ive|ous|ful|less|ness|ship|hood|dom|ism|ist|ance|ence|ery|ory)\b/gi, '');
    }
    
    // Add line breaks for natural breaks
    processedText = processedText.replace(/\. /g, '.<br>');
    processedText = processedText.replace(/! /g, '!<br>');
    processedText = processedText.replace(/\? /g, '?<br>');
    processedText = processedText.replace(/; /g, ';<br>');
    
    // Highlight keywords
    processedText = processedText.replace(/\b([A-Z][a-z]+|[0-9]+%?|↑|↓|→|∴|∵|≈|=|≠|>|<|\+|-|÷|×)\b/g, '<span class="chotha-keyword">$1</span>');
    
    return processedText;
}

// Adjust font size
function adjustFontSize(size) {
    const boxes = document.querySelectorAll('.chotha-box');
    boxes.forEach(box => {
        box.style.fontSize = `${size}px`;
    });
}

// Clear all
clearBtn.addEventListener('click', function() {
    rawNotes.value = '';
    chothaContainer.innerHTML = '';
    fileInput.value = '';
    fileStatus.textContent = 'Select a file to begin';
    fileStatus.className = 'status-message status-info';
    boxCount.textContent = '0 boxes';
    contentStats.textContent = '0 characters';
    
    // Add a default empty box
    const box = document.createElement('div');
    box.classList.add('chotha-box');
    box.innerHTML = '<span class="chotha-heading">New Topic</span><span>Content will appear here</span>';
    chothaContainer.appendChild(box);
});

// Download Chotha
downloadBtn.addEventListener('click', function() {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chotha - Printable Version</title>
            <style>
                body { font-family: Courier New, monospace; padding: 10px; font-size: 8px; line-height: 1; }
                .chotha-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .chotha-box { width: 3in; height: 3in; border: 1px solid #000; padding: 5px; page-break-inside: avoid; }
                .chotha-heading { font-weight: bold; text-decoration: underline; display: block; margin-bottom: 3px; }
                .chotha-heading::after { content: ":"; }
                .chotha-keyword { font-weight: bold; }
                @media print { body { margin: 0; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="chotha-container">
                ${chothaContainer.innerHTML}
            </div>
            <script>
                window.onload = function() { window.print(); }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
});

// Print Chotha
printBtn.addEventListener('click', function() {
    window.print();
});
