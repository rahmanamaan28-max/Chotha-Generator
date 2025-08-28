function generateChotha() {
    const rawText = document.getElementById('rawNotes').value;
    if (!rawText.trim()) {
        alert('Please enter some notes first!');
        return;
    }

    // 1. Clear previous output
    const container = document.getElementById('chothaContainer');
    container.innerHTML = '';

    // 2. Basic Parsing Logic (This is the key intelligence)
    // ASSUMPTION: User enters one topic per line.
    const topicLines = rawText.split('\n').filter(line => line.trim() !== '');

    topicLines.forEach(line => {
        // 2a. Create a new box for each topic
        const box = document.createElement('div');
        box.classList.add('chotha-box');

        // 2b. Find the heading (this logic can be improved)
        // Simple rule: The first few words before a period or dash could be the heading.
        let headingText = "Topic";
        let contentText = line;

        // Example: If line starts with a word like "PERCEPTION:"
        if (line.includes(':')) {
            const parts = line.split(':');
            headingText = parts[0].trim();
            contentText = parts.slice(1).join(':').trim();
        }

        // 2c. Build the HTML for the box
        // Add the underlined heading with colon
        const headingSpan = document.createElement('span');
        headingSpan.classList.add('chotha-heading');
        headingSpan.textContent = headingText;
        box.appendChild(headingSpan);

        // 2d. Process the content to make it ultra-compact
        // This is a crucial function that applies your rules.
        const processedContent = processContent(contentText);

        // Add the processed content
        const contentSpan = document.createElement('span');
        contentSpan.innerHTML = processedContent; // Use innerHTML to render arrows etc.
        box.appendChild(contentSpan);

        // 2e. Add the box to the grid container
        container.appendChild(box);
    });

    // 3. Enable the download button
    document.getElementById('downloadBtn').disabled = false;
}

function processContent(text) {
    // This function applies the transformation rules to the text.
    // This is where the "magic" happens. It needs to be very robust.

    // Rule 1: Replace long words with short forms
    const shortForms = {
        'important': 'Imp.',
        'definition': 'Def.',
        'function': 'Func.',
        'example': 'Eg.',
        'increase': '↑',
        'decrease': '↓',
        'leads to': '→',
        'results in': '→',
        'therefore': '∴',
        // ... add more based on your subject
    };

    let processedText = text;
    for (const [long, short] of Object.entries(shortForms)) {
        // Use regex for case-insensitive replacement
        const regex = new RegExp(long, 'gi');
        processedText = processedText.replace(regex, short);
    }

    // Rule 2: Add line breaks for natural breaks like periods or dashes.
    processedText = processedText.replace(/\. /g, '.<br>');
    processedText = processedText.replace(/: /g, ':<br>');
    processedText = processedText.replace(/- /g, '-<br>');

    // Rule 3 (Basic): Ensure it's dense. Remove unnecessary "the", "a", "is"
    processedText = processedText.replace(/\b(the|a|an|is|are|and)\b/gi, '');

    return processedText;
}

// Optional Download Function (requires html2canvas library)
function downloadChotha() {
    const element = document.getElementById('chothaContainer');
    html2canvas(element, {scale: 3}).then(canvas => { // High scale for print quality
        const link = document.createElement('a');
        link.download = 'my-chotha.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
