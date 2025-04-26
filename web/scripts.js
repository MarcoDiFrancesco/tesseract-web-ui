// Main initialization function
document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const elements = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        ocrOutput: document.getElementById('ocrOutput'),
        loading: document.getElementById('loading'),
        copyButton: document.getElementById('copyButton'),
        fullPageDropOverlay: document.getElementById('fullPageDropOverlay')
    };
    
    // Initialize all event listeners
    initDragAndDropEvents(elements);
    initFileInputEvents(elements);
    initClipboardEvents(elements);
    initCopyButtonEvent(elements);
});

// Initialize drag and drop functionality
function initDragAndDropEvents(elements) {
    const { dropZone, fullPageDropOverlay, fileInput } = elements;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Handle drag events for the drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            preventDefaults(e);
            dropZone.classList.add('drop-zone--over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            preventDefaults(e);
            dropZone.classList.remove('drop-zone--over');
            
            // Process dropped files only on the 'drop' event
            if (eventName === 'drop') {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length === 1) {
                    fileInput.files = files;
                    handleFiles(files, elements);
                } else if (files.length > 1) {
                    alert('Please upload only 1 file');
                }
            }
        }, false);
    });
    
    // Handle drag events for the entire document
    document.addEventListener('dragenter', (e) => {
        preventDefaults(e);
        // Don't show the full page overlay when dragging over the drop zone
        if (!isDescendantOfDropZone(e.target, dropZone)) {
            fullPageDropOverlay.style.display = 'block';
        }
    }, false);
    
    document.addEventListener('dragover', preventDefaults, false);
    
    document.addEventListener('dragleave', (e) => {
        preventDefaults(e);
        // Only hide overlay if we're leaving the document
        if (e.relatedTarget == null || e.relatedTarget === document.body) {
            fullPageDropOverlay.style.display = 'none';
        }
    }, false);
    
    document.addEventListener('drop', (e) => {
        preventDefaults(e);
        fullPageDropOverlay.style.display = 'none';
        
        // Don't process the drop if it's on the drop zone (already handled by the dropZone event listener)
        if (isDescendantOfDropZone(e.target, dropZone)) {
            return;
        }
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length === 1) {
            fileInput.files = files;
            handleFiles(files, elements);
        } else if (files.length > 1) {
            alert('Please upload only 1 file');
        }
    }, false);
}

// Initialize file input events
function initFileInputEvents(elements) {
    const { dropZone, fileInput } = elements;
    
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length) {
            handleFiles(fileInput.files, elements);
        }
    });
}

// Initialize clipboard paste event handling
function initClipboardEvents(elements) {
    document.addEventListener('paste', (e) => {
        const clipboardItems = e.clipboardData.items;
        const items = [].slice.call(clipboardItems).filter(item => {
            // Filter for image items
            return item.type.indexOf('image') !== -1;
        });
        
        if (items.length === 0) {
            return;
        }
        
        const item = items[0];
        const blob = item.getAsFile();
        
        // Create a File object from the Blob
        const file = new File([blob], "pasted-image.png", { type: blob.type });
        
        // Create a FileList-like object
        const fileList = {
            0: file,
            length: 1,
            item: (index) => index === 0 ? file : null
        };
        
        handleFiles(fileList, elements);
    });
}

// Initialize copy button event
function initCopyButtonEvent(elements) {
    const { copyButton, ocrOutput } = elements;
    
    copyButton.addEventListener('click', () => {
        const text = ocrOutput.textContent;
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
}

// Helper function to prevent default events
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Helper function to check if an element is inside the drop zone
function isDescendantOfDropZone(element, dropZone) {
    let current = element;
    while (current) {
        if (current === dropZone) {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}

// Handle file selection and processing
function handleFiles(files, elements) {
    const file = files[0];
    
    // Display the file preview if it's an image
    if (file.type.startsWith('image/')) {
        displayPreview(file, elements.dropZone);
    } else if (file.type === 'application/pdf') {
        // Just show the file name for PDFs
        updateDropZoneContent(file.name, elements.dropZone);
    } else {
        alert('Please upload an image or PDF file');
        return;
    }
    
    // Process the file with OCR
    processWithOCR(file, elements);
}

// Update drop zone content with file name
function updateDropZoneContent(fileName, dropZone) {
    // Remove any existing thumbnails
    let thumbElement = dropZone.querySelector('.drop-zone__thumb');
    if (thumbElement) {
        thumbElement.remove();
    }
    
    // Update the prompt
    let prompt = dropZone.querySelector('.drop-zone__prompt');
    if (!prompt) {
        prompt = document.createElement('span');
        prompt.classList.add('drop-zone__prompt');
        dropZone.appendChild(prompt);
    }
    
    prompt.style.display = 'block';
    prompt.textContent = fileName;
}

// Display image preview in drop zone
function displayPreview(file, dropZone) {
    if (!file.type.startsWith('image/')) return;
    
    // Remove any existing thumbnails
    let thumbElement = dropZone.querySelector('.drop-zone__thumb');
    if (thumbElement) {
        thumbElement.remove();
    }
    
    // Hide the prompt
    const prompt = dropZone.querySelector('.drop-zone__prompt');
    if (prompt) {
        prompt.style.display = 'none';
    }
    
    // Create thumbnail element
    thumbElement = document.createElement('div');
    thumbElement.classList.add('drop-zone__thumb');
    thumbElement.dataset.label = file.name;
    dropZone.appendChild(thumbElement);
    
    // Create thumbnail preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        thumbElement.style.backgroundImage = `url('${reader.result}')`;
    };
}

// Process file with OCR API
function processWithOCR(file, elements) {
    const { loading, ocrOutput } = elements;
    
    // Show loading indicator
    loading.style.display = 'block';
    ocrOutput.textContent = 'Processing...';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify({
        languages: ['eng']
    }));
    
    fetch('/tesseract', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('OCR process failed');
        }
        return response.json();
    })
    .then(data => {
        // Hide loading indicator
        loading.style.display = 'none';
        
        // Display the OCR result
        if (data && data.data && data.data.stdout) {
            ocrOutput.textContent = data.data.stdout;
        } else {
            ocrOutput.textContent = 'No text was recognized in the image.';
        }
        
        // If there were errors or warnings, append them
        if (data && data.data && data.data.stderr) {
            const stderrContent = data.data.stderr.trim();
            if (stderrContent) {
                ocrOutput.textContent += '\n\n--- Warnings/Errors ---\n' + stderrContent;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loading.style.display = 'none';
        ocrOutput.textContent = 'Error processing the file: ' + error.message;
    });
}