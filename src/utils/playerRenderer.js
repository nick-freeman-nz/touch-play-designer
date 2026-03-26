import { PLAYER_RADIUS, PLAYER_COLORS, FIELD, BALL_RADIUS, BALL_COLOR, BALL_OUTLINE } from './constants';

export function drawPlayers(ctx, players, selectedId, canvasWidth, canvasHeight) {
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(f.PADDING, f.PADDING);

  for (const player of players) {
    const color = PLAYER_COLORS[player.team];
    const isSelected = player.id === selectedId;

    // Selection ring
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#e8a020';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Player circle
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = "bold 13px 'Barlow', system-ui";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.label, player.x, player.y);
  }

  ctx.restore();
}

// Shared rugby ball shape drawing
function drawRugbyBallShape(ctx, bx, by, scale = 1) {
  const rx = 14 * scale;
  const ry = 9 * scale;
  const angle = -Math.PI / 5; // tilted ~36°

  // Glow
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(232, 160, 32, 0.18)';
  ctx.fill();

  // Ball body
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = BALL_COLOR;
  ctx.fill();
  ctx.strokeStyle = BALL_OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center seam
  ctx.beginPath();
  ctx.moveTo(-rx * 0.75, 0);
  ctx.lineTo(rx * 0.75, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Cross stitches
  const stitchCount = 4;
  const stitchSpan = rx * 0.9;
  const stitchH = ry * 0.28;
  for (let i = 0; i < stitchCount; i++) {
    const sx = -stitchSpan / 2 + (stitchSpan / (stitchCount - 1)) * i;
    ctx.beginPath();
    ctx.moveTo(sx, -stitchH);
    ctx.lineTo(sx, stitchH);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  ctx.restore();
}

export function drawBall(ctx, ball, isSelected, canvasWidth, canvasHeight) {
  if (!ball) return;
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(f.PADDING, f.PADDING);

  const bx = ball.animX ?? ball.x;
  const by = ball.animY ?? ball.y;

  // Selection ring (elliptical)
  if (isSelected) {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-Math.PI / 5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#e8a020';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawRugbyBallShape(ctx, bx, by);

  ctx.restore();
}

export function drawBallRoute(ctx, ball, canvasWidth, canvasHeight) {
  if (!ball || !ball.route || ball.route.length === 0) return;
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(f.PADDING, f.PADDING);

  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  for (const point of ball.route) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.strokeStyle = BALL_COLOR;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow at end
  if (ball.route.length >= 1) {
    const last = ball.route[ball.route.length - 1];
    const prev = ball.route.length >= 2 ? ball.route[ball.route.length - 2] : { x: ball.x, y: ball.y };
    drawArrow(ctx, prev.x, prev.y, last.x, last.y, BALL_COLOR);
  }

  // Waypoint dots
  for (const point of ball.route) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
  }

  ctx.restore();
}

export function drawRoutes(ctx, players, canvasWidth, canvasHeight) {
  const f = FIELD;
  const scaleX = canvasWidth / (f.WIDTH + f.PADDING * 2);
  const scaleY = canvasHeight / (f.HEIGHT + f.PADDING * 2);

  ctx.save();
  ctx.scale(scaleX, scaleY);
  ctx.translate(f.PADDING, f.PADDING);

  for (const player of players) {
    if (!player.route || player.route.length === 0) continue;
    const color = PLAYER_COLORS[player.team];

    // Draw route line
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    for (const point of player.route) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrow at last point
    if (player.route.length >= 1) {
      const last = player.route[player.route.length - 1];
      const prev = player.route.length >= 2
        ? player.route[player.route.length - 2]
        : { x: player.x, y: player.y };
      drawArrow(ctx, prev.x, prev.y, last.x, last.y, color);
    }

    // Waypoint dots
    for (const point of player.route) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY, color) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function hitTestPlayer(players, fieldX, fieldY) {
  for (let i = players.length - 1; i >= 0; i--) {
    const p = players[i];
    const dx = p.x - fieldX;
    const dy = p.y - fieldY;
    if (dx * dx + dy * dy <= PLAYER_RADIUS * PLAYER_RADIUS) {
      return p.id;
    }
  }
  return null;
}

export function hitTestBall(ball, fieldX, fieldY) {
  if (!ball) return false;
  const dx = ball.x - fieldX;
  const dy = ball.y - fieldY;
  // Generous circular hit area covering the ellipse
  return dx * dx + dy * dy <= 18 * 18;
}

// Re-export for use in FieldCanvas and videoExport animated rendering
export { drawRugbyBallShape };
