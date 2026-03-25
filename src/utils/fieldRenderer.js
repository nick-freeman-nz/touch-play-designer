import { FIELD } from './constants';

export function drawField(ctx, width, height) {
  const f = FIELD;
  const scaleX = width / (f.WIDTH + f.PADDING * 2);
  const scaleY = height / (f.HEIGHT + f.PADDING * 2);

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(f.PADDING, f.PADDING);

  // Grass background
  ctx.fillStyle = f.GRASS_COLOR;
  ctx.fillRect(-f.PADDING, -f.PADDING, f.WIDTH + f.PADDING * 2, f.HEIGHT + f.PADDING * 2);

  // Alternating grass stripes
  const stripeWidth = f.WIDTH / 10;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = f.GRASS_DARK;
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, f.HEIGHT);
    }
  }

  // Try zones
  ctx.fillStyle = f.TRY_ZONE_COLOR;
  ctx.fillRect(-f.TRY_ZONE_DEPTH, 0, f.TRY_ZONE_DEPTH, f.HEIGHT);
  ctx.fillRect(f.WIDTH, 0, f.TRY_ZONE_DEPTH, f.HEIGHT);

  // Field outline
  ctx.strokeStyle = f.LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, f.WIDTH, f.HEIGHT);

  // Try zone lines
  ctx.strokeRect(-f.TRY_ZONE_DEPTH, 0, f.TRY_ZONE_DEPTH, f.HEIGHT);
  ctx.strokeRect(f.WIDTH, 0, f.TRY_ZONE_DEPTH, f.HEIGHT);

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(f.WIDTH / 2, 0);
  ctx.lineTo(f.WIDTH / 2, f.HEIGHT);
  ctx.stroke();

  // 10m lines (dashed)
  ctx.setLineDash([8, 6]);
  const tenM = f.WIDTH / 7; // approximate 10m marks
  for (let i = 1; i <= 6; i++) {
    if (i === 3 || i === 4) continue; // skip near halfway
    ctx.beginPath();
    ctx.moveTo(i * tenM, 0);
    ctx.lineTo(i * tenM, f.HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Center mark
  ctx.beginPath();
  ctx.arc(f.WIDTH / 2, f.HEIGHT / 2, 4, 0, Math.PI * 2);
  ctx.fillStyle = f.LINE_COLOR;
  ctx.fill();

  // "TRY ZONE" labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(-f.TRY_ZONE_DEPTH / 2, f.HEIGHT / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('TRY ZONE', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(f.WIDTH + f.TRY_ZONE_DEPTH / 2, f.HEIGHT / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('TRY ZONE', 0, 0);
  ctx.restore();

  ctx.restore();
}

// Convert canvas pixel coords to field coords and back
export function canvasToField(canvasX, canvasY, canvasWidth, canvasHeight) {
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);
  return {
    x: canvasX / scaleX - f.PADDING,
    y: canvasY / scaleY - f.PADDING,
  };
}

export function fieldToCanvas(fieldX, fieldY, canvasWidth, canvasHeight) {
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);
  return {
    x: (fieldX + f.PADDING) * scaleX,
    y: (fieldY + f.PADDING) * scaleY,
  };
}
