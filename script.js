let baseImage = null;
let scale = 1;
let xPos = 0;
let yPos = 0;
let isDragging = false;
let startX, startY;
let textContent = '';
let isTextEditable = true; // Flag for text editability

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const outputImage = document.getElementById('outputImage');
const downloadLink = document.getElementById('downloadLink');
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const frameImage = new Image();
frameImage.src = '/frames/frame.png';

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage) {
        const baseWidth = baseImage.width * scale;
        const baseHeight = baseImage.height * scale;
        ctx.drawImage(baseImage, xPos, yPos, baseWidth, baseHeight);

        // Enable download button once image is loaded
        downloadLink.classList.remove('disabled');
    } else {
        downloadLink.classList.add('disabled');
    }

    // Draw frame fixed at 1000x1000
    ctx.drawImage(frameImage, 0, 0, 1000, 1000);

    // Draw text
    if (textContent) {
        ctx.font = `30px ${fontSelect.value}`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(textContent, 500, 900); // Centered near bottom
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(textContent, 500, 900); // Outline for readability
    }

    // Update download link
    const combinedImage = canvas.toDataURL('image/png');
    outputImage.src = combinedImage;
    downloadLink.href = combinedImage;
}

// Handle image upload
document.getElementById('baseImageInput').addEventListener('change', function (e) {
    if (e.target.files[0]) {
        baseImage = new Image();
        baseImage.onload = function () {
            scale = 1;
            xPos = (1000 - baseImage.width) / 2;
            yPos = (1000 - baseImage.height) / 2;
            drawCanvas();
        };
        baseImage.src = URL.createObjectURL(e.target.files[0]);
    }
});

// Handle text input
textInput.addEventListener('input', function () {
    if (isTextEditable) {
        textContent = textInput.value;
        drawCanvas();
    }
});

// Handle font change
fontSelect.addEventListener('change', drawCanvas);

// Mouse events
canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDragging);
canvas.addEventListener('wheel', scaleImage);

// Touch events
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', stopDragging);

function startDragging(e) {
    isDragging = true;
    startX = e.clientX - xPos;
    startY = e.clientY - yPos;
    e.preventDefault();
}

function drag(e) {
    if (isDragging) {
        xPos = e.clientX - startX;
        yPos = e.clientY - startY;
        drawCanvas();
    }
}

function stopDragging() {
    isDragging = false;
}

function scaleImage(e) {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    scale = Math.max(0.5, Math.min(4, scale + delta));
    drawCanvas();
}

// Touch handling
let initialDistance = null;

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - xPos;
        startY = e.touches[0].clientY - yPos;
    } else if (e.touches.length === 2) {
        isDragging = false;
        initialDistance = getTouchDistance(e.touches);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
        xPos = e.touches[0].clientX - startX;
        yPos = e.touches[0].clientY - startY;
        drawCanvas();
    } else if (e.touches.length === 2) {
        const currentDistance = getTouchDistance(e.touches);
        if (initialDistance) {
            const scaleChange = currentDistance / initialDistance;
            scale = Math.max(0.5, Math.min(4, scale * scaleChange));
            initialDistance = currentDistance;
            drawCanvas();
        }
    }
}

// Toggle text editability (for testing, you can call this in console: toggleTextEditability())
function toggleTextEditability() {
    isTextEditable = !isTextEditable;
    textInput.disabled = !isTextEditable;
    console.log(`Text editability: ${isTextEditable}`);
}

// Initial frame load
frameImage.onload = drawCanvas;