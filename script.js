// DOM elements
const fileInput = document.getElementById('fileInput');
const rawNotes = document.getElementById('rawNotes');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const printBtn = document.getElementById('printBtn');
const chothaContainer = document.getElementById('chothaContainer');
const fontSizeSlider = document.getElementById('fontSize');

// Initialize with sample text
rawNotes.value = "PERCEPTION:\nProcess of interpreting sensations into meaningful patterns. It involves three steps: selection, organization, interpretation. Selection is focusing on certain stimuli. Organization uses Gestalt principles: similarity, proximity, continuity, closure. Interpretation assigns meaning based on past experience.\n\nGESTALT PRINCIPLES:\nLaws of organization. Figure-ground: we separate objects from background. Similarity: similar items are grouped. Proximity: nearby items are grouped. Continuity: we see continuous patterns. Closure: we fill in gaps to see complete objects.";

// Load document from file input
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        rawNotes.value = e.target.result;
    };
    reader.readAsText(file);
});

// Generate Chotha
generateBtn.addEventListener('click', function() {
    const text = rawNotes.value.trim();
    if (!text) {
        alert('Please enter some notes first!');
        return;
    }

    chothaContainer.innerHTML = '';
    
    // Parse input - split by lines that start with uppercase words (likely headings)
    const topicLines = text.split(/\n\s*\n/).filter(line => line.trim() !== '');
    
    // Process each topic
    topicLines.forEach(topic => {
        const box = document.createElement('div');
        box.classList.add('chotha-box');
        
        // Apply current font size
        const fontSize = fontSizeSlider.value;
        box.style.fontSize = `${fontSize}px`;
        
        // Try to detect heading (first line or text before colon)
        const lines = topic.split('\n');
        let headingText = "Note";
        let contentText = topic;
        
        if (lines[0].includes(':')) {
            const parts = lines[0].split(':');
            headingText = parts[0].trim();
            contentText = lines.slice(1).join(' ').trim();
        } else if (lines.length > 1) {
            headingText = lines[0].trim();
            contentText = lines.slice(1).join(' ').trim();
        }
        
        // Create heading
        const headingSpan = document.createElement('span');
        headingSpan.classList.add('chotha-heading');
        headingSpan.textContent = headingText;
        box.appendChild(headingSpan);
        
        // Process content
        const processedContent = processContent(contentText);
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
