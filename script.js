function combineImages() {
    const baseImageInput = document.getElementById('baseImageInput');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const outputImage = document.getElementById('outputImage');
    const downloadLink = document.getElementById('downloadLink');
    const scaleSlider = document.getElementById('scaleSlider');
    const xPosSlider = document.getElementById('xPosSlider');
    const yPosSlider = document.getElementById('yPosSlider');

    if (!baseImageInput.files[0]) {
        alert('Please upload a base image.');
        return;
    }

    const baseImage = new Image();
    const frameImage = new Image();

    // Set canvas to fixed 1000x1000 resolution
    canvas.width = 1000;
    canvas.height = 1000;

    baseImage.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scale base image based on slider (0.5 to 4.0)
        const scale = parseFloat(scaleSlider.value);
        const baseWidth = baseImage.width * scale;
        const baseHeight = baseImage.height * scale;

        // Position base image using sliders, allowing it to extend beyond canvas
        const maxX = canvas.width - baseWidth;
        const maxY = canvas.height - baseHeight;
        const xPos = (xPosSlider.value / 100) * maxX;
        const yPos = (yPosSlider.value / 100) * maxY;

        // Draw base image, clipping occurs naturally if it exceeds canvas
        ctx.drawImage(baseImage, xPos, yPos, baseWidth, baseHeight);

        frameImage.onload = function () {
            // Fix frame size to 1000x1000 (scaled from 1800x1800)
            const frameWidth = 1000;
            const frameHeight = 1000;
            ctx.drawImage(frameImage, 0, 0, frameWidth, frameHeight);

            const combinedImage = canvas.toDataURL('image/png');
            outputImage.src = combinedImage;
            outputImage.style.display = 'block';
            downloadLink.href = combinedImage;
            downloadLink.style.display = 'block';
            canvas.style.display = 'none';
        };

        frameImage.src = '/frames/frame.png'; // Your 1800x1800 frame
    };
    baseImage.src = URL.createObjectURL(baseImageInput.files[0]);

    // Update on slider change for real-time preview
    [scaleSlider, xPosSlider, yPosSlider].forEach(slider => {
        slider.oninput = combineImages;
    });
}

// Initial call to set up sliders
document.getElementById('baseImageInput').onchange = combineImages;