import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Match uploads folder used in src/server.js (projectRoot/uploads)
const uploadsDir = path.join(__dirname, '../../uploads');
const certificatesDir = path.join(uploadsDir, 'certificates');

if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

export async function generateCertificateImage({ templateUrl, studentName, courseTitle, enrollmentId }) {
  if (!templateUrl) {
    throw new Error('No certificate template URL provided');
  }

  let templatePath = templateUrl;
  if (templateUrl.startsWith('/uploads/')) {
    templatePath = path.join(uploadsDir, templateUrl.replace('/uploads/', ''));
  }

  let createCanvas;
  let loadImage;
  try {
    const canvasModule = await import('canvas');
    ({ createCanvas, loadImage } = canvasModule);
  } catch (e) {
    console.error('Canvas module not installed; returning template image as certificate', e?.message || e);
    // Fallback: just return the original template URL so the app still works
    return templateUrl;
  }

  const image = await loadImage(templatePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, image.width, image.height);

  const nameFontSize = Math.round(image.height * 0.06);
  const titleFontSize = Math.round(image.height * 0.03);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `bold ${nameFontSize}px "Sans"`;
  ctx.fillStyle = '#222222';
  const nameX = image.width / 2;
  const nameY = image.height * 0.55;
  ctx.fillText(studentName, nameX, nameY);

  ctx.font = `normal ${titleFontSize}px "Sans"`;
  ctx.fillStyle = '#444444';
  const titleY = nameY + titleFontSize * 1.8;
  ctx.fillText(`for completing "${courseTitle}"`, nameX, titleY);

  const buffer = canvas.toBuffer('image/png');
  const filename = `${Date.now()}-${enrollmentId}.png`;
  const filePath = path.join(certificatesDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/certificates/${filename}`;
}


