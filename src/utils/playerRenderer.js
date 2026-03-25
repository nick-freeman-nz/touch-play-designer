import { PLAYER_RADIUS, PLAYER_COLORS, FIELD } from './constants';

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
      ctx.strokeStyle = '#fbbf24';
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
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.label, player.x, player.y);
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
