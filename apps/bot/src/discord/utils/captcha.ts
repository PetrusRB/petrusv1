import { createCanvas } from 'canvas';
import { randomInt } from 'crypto';

export type GenCaptchaType = {
  id: string;
  text: string;
  buffer: any;
  expiresAt: number;
};

export async function generateCaptchaImage(opts?: {
  width?: number;
  height?: number;
  length?: number;
}) {
  const width = opts?.width ?? 280;
  const height = opts?.height ?? 100;
  const length = opts?.length ?? 6;

  // registrar fonte
  // try { registerFont('./assets/fonts/Inter-Regular.ttf', { family: 'Inter' }); } catch {}

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f6f7fb';
  ctx.fillRect(0, 0, width, height);

  // Ruído - linhas
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${randomInt(50, 200)}, ${randomInt(
      50,
      200
    )}, ${randomInt(50, 200)}, 0.25)`;
    ctx.moveTo(randomInt(0, width), randomInt(0, height));
    ctx.lineTo(randomInt(0, width), randomInt(0, height));
    ctx.stroke();
  }

  // Texto (alfanumérico maiúsculo)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++)
    code += chars.charAt(randomInt(0, chars.length));

  // Draw text with random transform for each char
  const fontSize = Math.floor(height * 0.6);
  ctx.textBaseline = 'middle';
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = (width / (code.length + 1)) * (i + 1);
    const y = height / 2 + randomInt(-6, 6);
    ctx.save();

    const angle = (randomInt(-25, 25) * Math.PI) / 180;
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.font = `${fontSize + randomInt(-6, 6)}px "sans"`;
    ctx.fillStyle = `rgba(${randomInt(10, 120)}, ${randomInt(
      10,
      120
    )}, ${randomInt(10, 120)}, 0.9)`;
    ctx.fillText(char, -fontSize / 2 + randomInt(-2, 2), randomInt(-4, 4));

    ctx.restore();
  }

  // More noise - dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${randomInt(0, 255)}, ${randomInt(
      0,
      255
    )}, ${randomInt(0, 255)}, 0.15)`;
    ctx.beginPath();
    ctx.arc(
      randomInt(0, width),
      randomInt(0, height),
      randomInt(1, 3),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const buffer = canvas.toBuffer('image/png');
  return { buffer, code };
}
