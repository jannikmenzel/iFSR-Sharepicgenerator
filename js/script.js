// Variablen für hochgeladene Bilder und deren Position
let uploadedImage = null;
let uploadedLogo = null;
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Standardwerte für Bild, Logo und Texte
const defaultImage = 'assets/images/defaultBackground.jpg';
const defaultLogo = 'assets/images/defaultLogo.svg';
const defaultHeadline = 'iFSR sharepic Headline';
const defaultSubline = 'Hier könnte ein unfassbar fesselnder Werbetext des Fachschaftsrats Informatik stehen.';

// Initialisierung beim Laden der Seite
window.onload = function () {
    document.getElementById('headline').value = defaultHeadline;
    document.getElementById('subline').value = defaultSubline;

    loadDefaultImage();
    loadDefaultLogo();
    generateSharepic();
};

// Lädt das Standardhintergrundbild
function loadDefaultImage() {
    uploadedImage = new Image();
    uploadedImage.onload = drawCanvas;
    uploadedImage.src = defaultImage;
}

// Lädt das Standardlogo
function loadDefaultLogo() {
    uploadedLogo = new Image();
    uploadedLogo.onload = drawCanvas;
    uploadedLogo.src = defaultLogo;
}

// Event-Listener für Datei-Uploads und Eingaben
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
document.getElementById('headline').addEventListener('input', generateSharepic);
document.getElementById('subline').addEventListener('input', generateSharepic);
document.getElementById('fontSize').addEventListener('input', generateSharepic);
document.getElementById('boxHeight').addEventListener('input', generateSharepic);
document.getElementById('logoSize').addEventListener('input', generateSharepic);
document.getElementById('logoPosition').addEventListener('change', generateSharepic);
document.getElementById('logoBackground').addEventListener('change', generateSharepic);
document.getElementById('logoColor').addEventListener('input', drawCanvas);

// Verarbeitet den Upload eines neuen Hintergrundbildes
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        uploadedImage = new Image();
        uploadedImage.onload = function () {
            imageOffsetX = 0;
            imageOffsetY = 0;
            drawCanvas();
        };
        uploadedImage.src = imageUrl;
    }
}

// Verarbeitet den Upload eines neuen Logos
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const logoUrl = URL.createObjectURL(file);
        uploadedLogo = new Image();
        uploadedLogo.onload = drawCanvas;
        uploadedLogo.src = logoUrl;
    }
}

// Generiert das Sharepic neu
function generateSharepic() {
    drawCanvas();
}

// Berechnet die Bildgröße passend zur Canvas-Größe
function calculateImageDimensions(image, canvas) {
    let imageWidth, imageHeight;

    if (image.width > image.height) {
        imageHeight = canvas.height;
        imageWidth = image.width * (imageHeight / image.height);
    } else {
        imageWidth = canvas.width;
        imageHeight = image.height * (imageWidth / image.width);
    }

    return { width: imageWidth, height: imageHeight };
}

// Zeichnet das Canvas mit Bild, Logo und Text
function drawCanvas() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const canvasSize = document.getElementById('canvasSize').value;
    if (canvasSize === 'square') {
        canvas.width = 1080;
        canvas.height = 1080;
    } else if (canvasSize === 'horizontal') {
        canvas.width = 1080;
        canvas.height = 1920;
    } else if (canvasSize === 'vertical') {
        canvas.width = 1920;
        canvas.height = 1080;
    }

    // Zeichnet das hochgeladene Hintergrundbild
    if (uploadedImage) {
        const { width, height } = calculateImageDimensions(uploadedImage, canvas);
        ctx.drawImage(uploadedImage, imageOffsetX, imageOffsetY, width, height);
    }

    // Zeichnet das weiße Textfeld
    const boxHeight = parseInt(document.getElementById('boxHeight').value);
    const boxPadding = 20;
    ctx.fillStyle = 'white';
    ctx.fillRect(boxPadding, canvas.height - boxHeight - boxPadding, canvas.width - 2 * boxPadding, boxHeight);

    // Holt die Texteingaben
    const headline = document.getElementById('headline').value;
    const subline = document.getElementById('subline').value;
    const fontSize = parseInt(document.getElementById('fontSize').value);

    // Setzt Schriftfarbe
    ctx.fillStyle = 'black';

    const headlineFont = `bold ${fontSize * 1.2}px 'Cairo', sans-serif`;
    const sublineFont = `${fontSize}px 'Cairo', sans-serif`;
    const maxWidth = canvas.width - 2 * boxPadding - 40;

    // Funktion zum Umbruch langer Texte
    function wrapText(ctx, text, x, y, maxWidth, font) {
        ctx.font = font;
        const lineHeight = parseInt(font.match(/\d+/)[0]) * 1.2;

        const words = text.split(' ');
        let line = '';
        let lines = [];

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
    }

    // Zeichnet Headline und Subline ins Canvas
    wrapText(ctx, headline, boxPadding + 20, canvas.height - boxHeight - boxPadding + 80, maxWidth, headlineFont);
    wrapText(ctx, subline, boxPadding + 20, canvas.height - boxHeight - boxPadding + 150, maxWidth, sublineFont);

    // Zeichnet das Logo
    if (uploadedLogo) {
        const logoSize = parseInt(document.getElementById('logoSize').value);
        const logoRatio = uploadedLogo.width / uploadedLogo.height;
        let logoWidth = logoSize * logoRatio;
        let logoHeight = logoSize;

        if (logoWidth > canvas.width - 40) {
            logoWidth = canvas.width - 40;
            logoHeight = logoWidth / logoRatio;
        }

        const logoPosition = document.getElementById('logoPosition').value;
        let logoX, logoY;

        switch (logoPosition) {
            case 'top-left':
                logoX = 20;
                logoY = 20;
                break;
            case 'top-right':
                logoX = canvas.width - logoWidth - 20;
                logoY = 20;
                break;
            case 'bottom-left':
                logoX = 20;
                logoY = canvas.height - logoHeight - 20;
                break;
            case 'bottom-right':
                logoX = canvas.width - logoWidth - 20;
                logoY = canvas.height - logoHeight - 20;
                break;
        }

        // Erstellt ein temporäres Canvas für die Farbmanipulation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = logoWidth;
        tempCanvas.height = logoHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Zeichnet das Original-Logo
        tempCtx.drawImage(uploadedLogo, 0, 0, logoWidth, logoHeight);

        // Holt die ausgewählte Farbe
        const logoColor = document.getElementById('logoColor').value;

        // Setzt den Modus auf "source-atop" und färbt das Logo um
        tempCtx.globalCompositeOperation = 'source-atop';
        tempCtx.fillStyle = logoColor;
        tempCtx.fillRect(0, 0, logoWidth, logoHeight);

        // Zeichnet den Hintergrund, falls aktiviert
        const logoBackground = document.getElementById('logoBackground').checked;
        if (logoBackground) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(logoX, logoY, logoWidth, logoHeight);
        }

        // Zeichnet das eingefärbte Logo auf das Haupt-Canvas
        ctx.drawImage(tempCanvas, logoX, logoY);
    }
}

// Canvas-Referenz
document.getElementById('canvasSize').addEventListener('change', function (e) {
    const canvas = document.getElementById('canvas');
    const selectedSize = e.target.value;

    // Setze die Canvas-Größe basierend auf der Auswahl
    switch (selectedSize) {
        case 'square':
            canvas.width = 1080;
            canvas.height = 1080;
            break;
        case 'horizontal':
            canvas.width = 1080;
            canvas.height = 1920;
            break;
        case 'vertical':
            canvas.width = 1920;
            canvas.height = 1080;
            break;
    }

    // Setze die Offsets zurück, wenn die Canvas-Größe geändert wird
    imageOffsetX = 0;
    imageOffsetY = 0;

    drawCanvas();
});

const canvas = document.getElementById('canvas');
if (!canvas) {
    console.error('Canvas element not found');
} else {
    // Bild-Drag-Funktionalität für Maus
    canvas.addEventListener('mousedown', function (e) {
        if (uploadedImage) {
            isDragging = true;
            dragStartX = e.offsetX - imageOffsetX;
            dragStartY = e.offsetY - imageOffsetY;
        }
    });

    canvas.addEventListener('mousemove', function (e) {
        if (isDragging && uploadedImage) {
            const { width, height } = calculateImageDimensions(uploadedImage, canvas);

            if (uploadedImage.width > uploadedImage.height) {
                imageOffsetX = e.offsetX - dragStartX;
                imageOffsetX = Math.min(0, Math.max(imageOffsetX, canvas.width - width));
            } else {
                imageOffsetY = e.offsetY - dragStartY;
                imageOffsetY = Math.min(0, Math.max(imageOffsetY, canvas.height - height));
            }
            drawCanvas();
        }
    });

    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mouseout', () => isDragging = false);

    // Bild-Drag-Funktionalität für Touch
    canvas.addEventListener('touchstart', function (e) {
        if (uploadedImage) {
            isDragging = true;
            // Nur den ersten Touch-Punkt verwenden
            dragStartX = e.touches[0].clientX - imageOffsetX;
            dragStartY = e.touches[0].clientY - imageOffsetY;
        }
    });

    canvas.addEventListener('touchmove', function (e) {
        if (isDragging && uploadedImage) {
            // Verhindert die Standard-Touch-Scroll-Funktion
            e.preventDefault();

            const { width, height } = calculateImageDimensions(uploadedImage, canvas);

            if (uploadedImage.width > uploadedImage.height) {
                imageOffsetX = e.touches[0].clientX - dragStartX;
                imageOffsetX = Math.min(0, Math.max(imageOffsetX, canvas.width - width));
            } else {
                imageOffsetY = e.touches[0].clientY - dragStartY;
                imageOffsetY = Math.min(0, Math.max(imageOffsetY, canvas.height - height));
            }
            drawCanvas();
        }
    });

    canvas.addEventListener('touchend', () => isDragging = false);
    canvas.addEventListener('touchcancel', () => isDragging = false);
}

// Download-Button für das Sharepic
document.getElementById('downloadBtn').addEventListener('click', function (event) {
    event.preventDefault();

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'sharepic.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});