// OCR Web Application - Main JavaScript

// Centralized DOM element access for consistent reference
const Elements = {
    get: () => ({
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        ocrOutput: document.getElementById('ocrOutput'),
        loading: document.getElementById('loading'),
        copyButton: document.getElementById('copyButton'),
        fullPageDropOverlay: document.getElementById('fullPageDropOverlay')
    })
};

// Utility functions for common operations
const Utils = {
    preventDefaults: (e) => {
        e.preventDefault();
        e.stopPropagation();
    },
    
    isDescendantOfDropZone: (element, dropZone) => {
        let current = element;
        while (current) {
            if (current === dropZone) return true;
            current = current.parentElement;
        }
        return false;
    },
    
    updateDropZoneContent: (fileName, dropZone) => {
        // Remove any existing thumbnails
        let thumbElement = dropZone.querySelector('.drop-zone__thumb');
        if (thumbElement) thumbElement.remove();
        
        // Display the file name in the drop zone
        let prompt = dropZone.querySelector('.drop-zone__prompt');
        if (!prompt) {
            prompt = document.createElement('span');
            prompt.classList.add('drop-zone__prompt');
            dropZone.appendChild(prompt);
        }
        
        prompt.style.display = 'block';
        prompt.textContent = fileName;
    },
    
    displayImagePreview: (file, dropZone) => {
        if (!file.type.startsWith('image/')) return;
        
        // Remove any existing thumbnails
        let thumbElement = dropZone.querySelector('.drop-zone__thumb');
        if (thumbElement) thumbElement.remove();
        
        // Hide the prompt text when showing preview
        const prompt = dropZone.querySelector('.drop-zone__prompt');
        if (prompt) prompt.style.display = 'none';
        
        // Create thumbnail element
        thumbElement = document.createElement('div');
        thumbElement.classList.add('drop-zone__thumb');
        thumbElement.dataset.label = file.name;
        dropZone.appendChild(thumbElement);
        
        // Load and display image preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbElement.style.backgroundImage = `url('${reader.result}')`;
        };
    }
};

// Handles file uploads and preprocessing before OCR
const FileHandler = {
    process: (files, elements) => {
        const file = files[0];
        
        // Display the file preview if it's an image
        if (file.type.startsWith('image/')) {
            Utils.displayImagePreview(file, elements.dropZone);
        } else if (file.type === 'application/pdf') {
            // Just show the file name for PDFs
            Utils.updateDropZoneContent(file.name, elements.dropZone);
        } else {
            alert('Please upload an image or PDF file');
            return;
        }
        
        // Process the file with OCR
        OCRProcessor.process(file, elements);
    }
};

// Manages API communication and OCR processing
const OCRProcessor = {
    process: (file, elements) => {
        const { loading, ocrOutput } = elements;
        
        // Show loading indicator during processing
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
            // Hide loading indicator after completion
            loading.style.display = 'none';
            
            // Display the OCR result text
            if (data?.data?.stdout) {
                ocrOutput.textContent = data.data.stdout;
            } else {
                ocrOutput.textContent = 'No text was recognized in the image.';
            }
            
            // Append any errors or warnings from the OCR engine
            if (data?.data?.stderr) {
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
};

// Sets up all user interaction handlers
const EventListeners = {
    initDragAndDrop: (elements) => {
        const { dropZone, fullPageDropOverlay, fileInput } = elements;
        
        // Prevent default drag behaviors to enable custom drop handling
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, Utils.preventDefaults, false);
            document.body.addEventListener(eventName, Utils.preventDefaults, false);
        });
        
        // Visual feedback when dragging over the drop zone
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                Utils.preventDefaults(e);
                dropZone.classList.add('drop-zone--over');
            }, false);
        });
        
        // Handle drag exit and file drops
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                Utils.preventDefaults(e);
                dropZone.classList.remove('drop-zone--over');
                
                // Process dropped files only on the 'drop' event
                if (eventName === 'drop') {
                    const files = e.dataTransfer.files;
                    
                    if (files.length === 1) {
                        fileInput.files = files;
                        FileHandler.process(files, elements);
                    } else if (files.length > 1) {
                        alert('Please upload only 1 file');
                    }
                }
            }, false);
        });
        
        // Show full-page drop overlay when dragging anywhere on the document
        document.addEventListener('dragenter', (e) => {
            Utils.preventDefaults(e);
            // Don't show the full page overlay when dragging over the drop zone
            if (!Utils.isDescendantOfDropZone(e.target, dropZone)) {
                fullPageDropOverlay.style.display = 'block';
            }
        }, false);
        
        document.addEventListener('dragover', Utils.preventDefaults, false);
        
        // Hide overlay when leaving the document
        document.addEventListener('dragleave', (e) => {
            Utils.preventDefaults(e);
            // Only hide overlay if we're leaving the document
            if (e.relatedTarget == null || e.relatedTarget === document.body) {
                fullPageDropOverlay.style.display = 'none';
            }
        }, false);
        
        // Process files dropped anywhere on the page
        document.addEventListener('drop', (e) => {
            Utils.preventDefaults(e);
            fullPageDropOverlay.style.display = 'none';
            
            // Don't process the drop if it's on the drop zone (already handled by the dropZone event listener)
            if (Utils.isDescendantOfDropZone(e.target, dropZone)) {
                return;
            }
            
            const files = e.dataTransfer.files;
            
            if (files.length === 1) {
                fileInput.files = files;
                FileHandler.process(files, elements);
            } else if (files.length > 1) {
                alert('Please upload only 1 file');
            }
        }, false);
    },
    
    initFileInput: (elements) => {
        const { dropZone, fileInput } = elements;
        
        // Open file dialog when clicking on drop zone
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Process selected files from the file input
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length) {
                FileHandler.process(fileInput.files, elements);
            }
        });
    },
    
    initClipboard: (elements) => {
        // Enable pasting images directly from clipboard
        document.addEventListener('paste', (e) => {
            const clipboardItems = e.clipboardData.items;
            const items = [...clipboardItems].filter(item => item.type.indexOf('image') !== -1);
            
            if (items.length === 0) return;
            
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
            
            FileHandler.process(fileList, elements);
        });
    },
    
    initCopyButton: (elements) => {
        const { copyButton, ocrOutput } = elements;
        
        // Enable copying OCR results to clipboard
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
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const elements = Elements.get();
    
    // Set up all user interaction handlers
    EventListeners.initDragAndDrop(elements);
    EventListeners.initFileInput(elements);
    EventListeners.initClipboard(elements);
    EventListeners.initCopyButton(elements);
});