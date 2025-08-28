// DOM elements
const fileInput = document.getElementById('fileInput');
const rawNotes = document.getElementById('rawNotes');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const chothaContainer = document.getElementById('chothaContainer');
const fontSizeSlider = document.getElementById('fontSize');
const fileStatus = document.getElementById('fileStatus');
const fileTypeButtons = document.querySelectorAll('.file-type-btn');

// Current file type
let currentFileType = 'text';

// Initialize with sample text
rawNotes.value = "PERCEPTION:\nProcess of interpreting sensations into meaningful patterns. It involves three steps: selection, organization, interpretation. Selection is focusing on certain stimuli. Organization uses Gestalt principles: similarity, proximity, continuity, closure. Interpretation assigns meaning based on past experience.\n\nGESTALT PRINCIPLES:\nLaws of organization. Figure-ground: we separate objects from background. Similarity: similar items are grouped. Proximity: nearby items are grouped. Continuity: we see continuous patterns. Closure: we fill in gaps to see complete objects.";

// Set up file type buttons
fileTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        fileTypeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFileType = button.dataset.type;
        updateFileInputAccept();
    });
});

// Update file input accept attribute based on selected file type
function updateFileInputAccept() {
    switch(currentFileType) {
        case 'text':
            fileInput.accept = '.txt,.text';
            fileStatus.textContent = 'Select a text file to begin';
            break;
        case 'pdf':
            fileInput.accept = '.pdf';
            fileStatus.textContent = 'Select a PDF file (note: text extraction may vary)';
            break;
        case 'doc':
            fileInput.accept = '.doc,.docx';
            fileStatus.textContent = 'Select a Word document (note: text extraction may vary)';
            break;
        case 'ppt':
            fileInput.accept = '.ppt,.pptx';
            fileStatus.textContent = 'Select a PowerPoint file (note: text extraction may vary)';
            break;
        case 'excel':
            fileInput.accept = '.xls,.xlsx';
            fileStatus.textContent = 'Select an Excel file (note: text extraction may vary)';
            break;
    }
}

// Load document from file input
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading state
    fileStatus.textContent = `Processing ${file.name}...`;
    fileStatus.className = 'status-message status-info';
    
    // Handle different file types
    if (currentFileType === 'text') {
        handleTextFile(file);
    } else {
        // For other file types, we would normally need server-side processing
        // This is a simulation for demonstration purposes
        simulateFileProcessing(file);
    }
});

// Handle text files
function handleTextFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        rawNotes.value = e.target.result;
        fileStatus.textContent = `${file.name} loaded successfully`;
        fileStatus.className = 'status-message status-info';
    };
    reader.onerror = function() {
        fileStatus.textContent = 'Error reading file';
        fileStatus.className = 'status-message status-error';
    };
    reader.readAsText(file);
}

// Simulate processing for other file types
function simulateFileProcessing(file) {
    // In a real application, this would be done with proper libraries or server-side processing
    setTimeout(() => {
        // Sample content based on file type
        let sampleContent = "";
        
        switch(currentFileType) {
            case 'pdf':
                sampleContent = "PDF Content: Perception is the process of interpreting sensations. It involves selection, organization, and interpretation of sensory input. Gestalt principles explain how we organize visual information.";
                break;
            case 'doc':
                sampleContent = "Word Document: This is a simulation of content from a Word document. Perception involves processing sensory information. Key concepts include bottom-up and top-down processing.";
                break;
            case 'ppt':
                sampleContent = "PowerPoint Slides: Slide 1: Introduction to Perception. Slide 2: Sensory receptors receive stimuli. Slide 3: Brain interprets signals. Slide 4: Gestalt principles of organization.";
                break;
            case 'excel':
                sampleContent = "Excel Data: Concept, Definition, Example. Perception, Interpretation of sensations, Recognizing a face. Sensation, Raw data from senses, Light entering eye.";
                break;
        }
        
        rawNotes.value = `[Simulated content from ${file.name}]\n\n${sampleContent}`;
        fileStatus.textContent = `Simulated content loaded from ${file.name} (real content would require server processing)`;
        fileStatus.className = 'status-message status-info';
    }, 1500);
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
        
        // Process content
        const processedContent = processContent(item.content);
        const contentSpan = document.createElement('span');
        contentSpan.innerHTML = processedContent;
        box.appendChild(contentSpan);
        
        // Add to container
        chothaContainer.appendChild(box);
    });
});

// Process content to make it compact
function processContent(text) {
    // Apply short forms and replacements
    const replacements = {
        'important': 'Imp.',
        'definition': 'Def.',
        'function': 'Func.',
        'example': 'Eg.',
        'increase': '↑',
        'decrease': '↓',
        ' leads to ': ' → ',
        ' results in ': ' → ',
        ' therefore ': ' ∴ ',
        ' because ': ' ∵ ',
        ' and ': ' & ',
        ' with ': ' w/ ',
        ' without ': ' w/o ',
    };
    
    let processedText = text;
    
    // Apply replacements
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'gi');
        processedText = processedText.replace(regex, value);
    }
    
    // Add line breaks for natural breaks
    processedText = processedText.replace(/\. /g, '.<br>');
    processedText = processedText.replace(/! /g, '!<br>');
    processedText = processedText.replace(/\? /g, '?<br>');
    processedText = processedText.replace(/; /g, ';<br>');
    
    return processedText;
}

// Adjust font size
fontSizeSlider.addEventListener('input', function() {
    const size = this.value;
    const boxes = document.querySelectorAll('.chotha-box');
    boxes.forEach(box => {
        box.style.fontSize = `${size}px`;
    });
});

// Clear all
clearBtn.addEventListener('click', function() {
    rawNotes.value = '';
    chothaContainer.innerHTML = '';
    fileInput.value = '';
    fileStatus.textContent = 'Select a file to begin';
    fileStatus.className = 'status-message status-info';
    
    // Add a default empty box
    const box = document.createElement('div');
    box.classList.add('chotha-box');
    box.innerHTML = '<span class="chotha-heading">New Topic</span><span>Content will appear here</span>';
    chothaContainer.appendChild(box);
});

// Download Chotha
downloadBtn.addEventListener('click', function() {
    alert("Download functionality would be implemented here. In a full implementation, this would use the html2canvas library to convert the Chotha to an image.");
});

// Print Chotha
printBtn.addEventListener('click', function() {
    window.print();
});
