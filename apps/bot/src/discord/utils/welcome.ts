import { Canvas, createCanvas, loadImage } from 'canvas';

interface WelcomeOptions {
  width?: number;
  height?: number;
  backgroundImage: string;
  borderGradient?: [string, string];
  avatar?: string;
}

export const generateWelcome = async (
  username: string,
  message: string,
  opts: WelcomeOptions
) => {
  const width = opts?.width ?? 600;
  const height = opts?.height ?? 300;
  const borderSize = 12;

  // Criar canvas pra imagem
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, opts.borderGradient?.[0] ?? '#6EE7B7');
  grad.addColorStop(1, opts.borderGradient?.[1] ?? '#3B82F6');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Desenhar um fundo
  const bg = await loadImage(opts.backgroundImage);
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    borderSize,
    borderSize,
    width - borderSize * 2,
    height - borderSize * 2
  );
  ctx.clip();

  ctx.drawImage(bg, 0, 0, width, height);
  ctx.restore();

  // Desenhar um avatar
  if (opts.avatar) {
    try {
      const avatarImg = await loadImage(opts.avatar);
      const size = 120;
      const x = 40;
      const y = height / 2 - size / 2;

      // clip circular
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();
    } catch {
      console.warn('Falha ao carregar o avatar.');
    }
  }

  // Textos
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';

  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(`Olá, ${username}!`, 200, 140);

  ctx.font = '28px sans-serif';
  ctx.fillText(message, 200, 200);

  // Retorna buffer da imagem pra mandar no Discord
  return canvas.toBuffer('image/png');
};
