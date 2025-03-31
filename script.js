let baseImage = null;
let scale = 1;
let xPos = 0;
let yPos = 0;
let isDragging = false;
let startX, startY;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const outputImage = document.getElementById('outputImage');
const downloadLink = document.getElementById('downloadLink');
const frameImage = new Image();
frameImage.src = '/frames/frame.png';

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage) {
        const baseWidth = baseImage.width * scale;
        const baseHeight = baseImage.height * scale;
        ctx.drawImage(baseImage, xPos, yPos, baseWidth, baseHeight);
    }

    // Draw frame fixed at 1000x1000
    ctx.drawImage(frameImage, 0, 0, 1000, 1000);

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
            // Reset position and scale
            scale = 1;
            xPos = (1000 - baseImage.width) / 2; // Center initially
            yPos = (1000 - baseImage.height) / 2;
            drawCanvas();
        };
        baseImage.src = URL.createObjectURL(e.target.files[0]);
    }
});

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
    const delta = e.deltaY * -0.001; // Scroll direction
    scale = Math.max(0.5, Math.min(4, scale + delta)); // Clamp between 0.5 and 4
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

// Initial frame load
frameImage.onload = drawCanvas;