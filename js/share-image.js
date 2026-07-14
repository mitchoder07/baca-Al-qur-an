/* ============================================================
   BACA — share-image.js
   Generates beautiful shareable verse images with the Baca logo.
   Uses HTML5 Canvas to render the image, then downloads or shares it.
   ============================================================ */

(function() {

// ============================================================
// CONFIG
// ============================================================

const COLORS = {
    dark: {
        bg: "#0f172a",
        bgGradient: ["#0f172a", "#1e293b"],
        arabic: "#ffffff",
        translit: "#34d399",
        translation: "#cbd5e1",
        reference: "#10b981",
        border: "rgba(255,255,255,0.08)",
        topBar: "linear-gradient(90deg, #10b981, #06b6d4)",
        logoText: "rgba(255,255,255,0.35)",
        pattern: "rgba(16,185,129,0.04)"
    },
    light: {
        bg: "#f8f5ee",
        bgGradient: ["#f8f5ee", "#f3ede0"],
        arabic: "#0d4f3c",
        translit: "#0d6e4f",
        translation: "#374151",
        reference: "#0d6e4f",
        border: "rgba(0,0,0,0.06)",
        topBar: "linear-gradient(90deg, #10b981, #06b6d4, #6366f1)",
        logoText: "rgba(0,0,0,0.2)",
        pattern: "rgba(16,185,129,0.03)"
    }
};

// ============================================================
// MAIN: Generate verse image
// ============================================================

function generateVerseImage(data) {
    return new Promise((resolve) => {
        const {
            arabic = "",
            transliteration = "",
            translation = "",
            reference = "",
            surahName = "",
            theme = "light"
        } = data;

        const c = COLORS[theme] || COLORS.light;
        const W = 1080;
        const H = 1080;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // === Background gradient ===
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, c.bgGradient[0]);
        grad.addColorStop(1, c.bgGradient[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // === Subtle geometric pattern ===
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = c.pattern;
        const dotSize = 3;
        const spacing = 40;
        for (let x = 0; x < W; x += spacing) {
            for (let y = 0; y < H; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        // === Top decorative bar ===
        const barGrad = ctx.createLinearGradient(0, 0, W, 0);
        barGrad.addColorStop(0, "#10b981");
        barGrad.addColorStop(0.5, "#06b6d4");
        barGrad.addColorStop(1, "#6366f1");
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, 0, W, 6);

        // === Inner border ===
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(40, 40, W - 80, H - 80, 20);
        ctx.stroke();

        // === Ornament at top ===
        drawOrnament(ctx, W / 2, 90, c);

        // === Surah name badge ===
        if (surahName) {
            ctx.font = "600 24px Poppins, sans-serif";
            ctx.fillStyle = c.reference;
            ctx.textAlign = "center";
            ctx.fillText(surahName, W / 2, 135);
        }

        // === Calculate total content height for vertical centering ===
        const arabicLines = wrapArabicText(arabic, 42);
        let arabicFontSize = 52;
        if (arabicLines.length > 3) arabicFontSize = 44;
        if (arabicLines.length > 5) arabicFontSize = 38;
        if (arabicLines.length > 7) arabicFontSize = 32;

        const translitLines = transliteration ? wrapText(transliteration, 55) : [];
        const transLines = wrapText(translation, 52);

        // Estimate total content height
        const arabicHeight = arabicLines.length * arabicFontSize * 1.6;
        const translitHeight = translitLines.length > 0 ? (translitLines.length * 38 + 30) : 0;
        const transHeight = transLines.length * 36 + 80; // +80 for divider
        const headerHeight = surahName ? 80 : 50;
        const totalContentHeight = headerHeight + arabicHeight + translitHeight + transHeight;
        const availableHeight = H - 200; // space between top ornament and bottom section
        const verticalOffset = Math.max(0, (availableHeight - totalContentHeight) / 2);
        const arabicY = 100 + verticalOffset + headerHeight;

        // === Arabic text ===
        ctx.fillStyle = c.arabic;
        ctx.textAlign = "center";
        ctx.direction = "rtl";
        ctx.font = `400 ${arabicFontSize}px "Amiri", "Noto Naskh Arabic", serif`;
        let y = arabicY;
        for (const line of arabicLines) {
            ctx.fillText(line, W / 2, y);
            y += arabicFontSize * 1.6;
        }

        // === Transliteration ===
        if (transliteration) {
            y += 30;
            ctx.direction = "ltr";
            ctx.fillStyle = c.translit;
            ctx.font = "italic 28px Poppins, sans-serif";
            const translitLines = wrapText(transliteration, 55);
            for (const line of translitLines) {
                ctx.fillText(line, W / 2, y);
                y += 38;
            }
        }

        // === Divider ===
        y += 20;
        const divY = y;
        const divGrad = ctx.createLinearGradient(W * 0.25, divY, W * 0.75, divY);
        divGrad.addColorStop(0, "transparent");
        divGrad.addColorStop(0.5, c.reference);
        divGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = divGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W * 0.3, divY);
        ctx.lineTo(W * 0.7, divY);
        ctx.stroke();

        // Small diamond at center
        ctx.fillStyle = c.reference;
        ctx.save();
        ctx.translate(W / 2, divY);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();

        // === Translation ===
        y += 35;
        ctx.fillStyle = c.translation;
        ctx.font = "400 26px Poppins, sans-serif";
        const transLines = wrapText(translation, 52);
        for (const line of transLines) {
            ctx.fillText(line, W / 2, y);
            y += 36;
        }

        // === Bottom section: reference (left) + Baca logo (right) ===
        const bottomY = H - 80;

        // Reference
        ctx.textAlign = "left";
        ctx.font = "600 22px Poppins, sans-serif";
        ctx.fillStyle = c.reference;
        ctx.fillText(reference, 70, bottomY);

        // Baca logo (text-based, subtle)
        ctx.textAlign = "right";
        ctx.font = "700 28px Poppins, sans-serif";
        const logoGrad = ctx.createLinearGradient(W - 200, bottomY, W - 70, bottomY);
        logoGrad.addColorStop(0, "#10b981");
        logoGrad.addColorStop(0.5, "#06b6d4");
        logoGrad.addColorStop(1, "#6366f1");
        ctx.fillStyle = logoGrad;
        ctx.fillText("Baca", W - 70, bottomY);

        // (Book icon removed — just the text logo)

        // === Bottom decorative bar ===
        ctx.fillStyle = barGrad;
        ctx.fillRect(0, H - 6, W, 6);

        // Convert to blob
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png', 0.95);
    });
}

// ============================================================
// HELPERS
// ============================================================

function wrapArabicText(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = "";
    for (const w of words) {
        if ((current + " " + w).trim().length > maxChars) {
            if (current) lines.push(current.trim());
            current = w;
        } else {
            current += " " + w;
        }
    }
    if (current) lines.push(current.trim());
    return lines;
}

function wrapText(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = "";
    for (const w of words) {
        if ((current + " " + w).trim().length > maxChars) {
            if (current) lines.push(current.trim());
            current = w;
        } else {
            current += " " + w;
        }
    }
    if (current) lines.push(current.trim());
    return lines;
}

function drawOrnament(ctx, x, y, colors) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors.reference;
    ctx.globalAlpha = 0.6;

    // Draw a simple Islamic-style ornament
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = colors.reference;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    // Small diamonds
    ctx.globalAlpha = 0.5;
    [-80, 80].forEach(dx => {
        ctx.save();
        ctx.translate(dx, 0);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
    });

    ctx.restore();
}

function drawBookIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    // Open book shape
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + size/2, y - 5, x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.quadraticCurveTo(x + size/2, y + size - 5, x, y + size);
    ctx.closePath();
    ctx.fill();

    // Center line
    ctx.beginPath();
    ctx.moveTo(x + size/2, y);
    ctx.lineTo(x + size/2, y + size);
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.restore();
}

// ============================================================
// SHARE: Download or Web Share
// ============================================================

async function shareVerseImage(data) {
    const blob = await generateVerseImage(data);
    if (!blob) return;

    const fileName = `baca-${data.surahName || 'verse'}-${Date.now()}.png`;

    // Try Web Share API (mobile)
    if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Baca — Quran Verse',
                    text: `${data.arabic}\n\n${data.translation}\n\n— ${data.reference}`
                });
                return;
            } catch (e) {
                if (e.name === 'AbortError') return; // User cancelled
            }
        }
    }

    // Fallback: Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================
// PREVIEW: Show image in a modal
// ============================================================

async function previewVerseImage(data) {
    const blob = await generateVerseImage(data);
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    // Remove existing preview
    const existing = document.getElementById('baca-image-preview');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'baca-image-preview';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 2rem; gap: 1rem; animation: fadeIn 0.2s;
    `;

    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'max-width: 90%; max-height: 70vh; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 0.8rem;';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.style.cssText = 'padding: 0.7rem 1.5rem; border-radius: 12px; border: none; background: linear-gradient(135deg, #10b981, #06b6d4); color: #fff; font-weight: 600; cursor: pointer; font-size: 0.9rem;';
    downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `baca-verse-${Date.now()}.png`;
        a.click();
    };

    const shareBtn = document.createElement('button');
    shareBtn.textContent = 'Share';
    shareBtn.style.cssText = 'padding: 0.7rem 1.5rem; border-radius: 12px; border: none; background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; cursor: pointer; font-size: 0.9rem;';
    shareBtn.onclick = () => shareVerseImage(data);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark" style="font-size:1.2rem"></i>';
    closeBtn.style.cssText = 'position: absolute; top: 1rem; right: 1rem; width: 44px; height: 44px; border-radius: 12px; border: none; background: rgba(255,255,255,0.15); color: #fff; cursor: pointer;';
    closeBtn.onclick = () => { overlay.remove(); setTimeout(() => URL.revokeObjectURL(url), 500); };

    btnRow.appendChild(downloadBtn);
    btnRow.appendChild(shareBtn);
    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    overlay.appendChild(btnRow);
    document.body.appendChild(overlay);

    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            setTimeout(() => URL.revokeObjectURL(url), 500);
        }
    });
}

// ============================================================
// EXPORT
// ============================================================

window.BacaShare = {
    generateVerseImage,
    shareVerseImage,
    previewVerseImage
};

})();
