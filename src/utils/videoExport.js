import { drawField } from './fieldRenderer';
import { drawPlayers, drawRoutes } from './playerRenderer';
import { getAnimatedPositions, getPlayDuration } from './animation';
import { PLAYER_COLORS, PLAYER_RADIUS, FIELD } from './constants';
import { ANIMATION_FPS } from './constants';

export function recordPlay(players, onComplete, onProgress) {
  const width = 880;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const totalFrames = getPlayDuration(players);
  if (totalFrames === 0) {
    onComplete(null);
    return;
  }

  // Add padding frames: 30 at start (still), animation, 30 at end (still)
  const padFrames = 30;
  const allFrames = padFrames + totalFrames + padFrames;

  const stream = canvas.captureStream(ANIMATION_FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
  });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    onComplete(blob);
  };

  recorder.start();

  let frame = 0;

  function renderFrame() {
    let progress;
    if (frame < padFrames) {
      progress = 0;
    } else if (frame >= padFrames + totalFrames) {
      progress = 1;
    } else {
      progress = (frame - padFrames) / totalFrames;
    }

    // Draw field
    ctx.clearRect(0, 0, width, height);
    drawField(ctx, width, height);
    drawRoutes(ctx, players, width, height);

    // Draw animated players
    const animated = getAnimatedPositions(players, progress);
    const f = FIELD;
    const scaleX = width / (f.WIDTH + f.PADDING * 2);
    const scaleY = height / (f.HEIGHT + f.PADDING * 2);

    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(f.PADDING, f.PADDING);

    for (const p of animated) {
      const px = p.animX ?? p.x;
      const py = p.animY ?? p.y;
      const color = PLAYER_COLORS[p.team];

      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, px, py);
    }

    ctx.restore();

    // Play name watermark
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Touch Play Designer', 10, height - 10);

    if (onProgress) onProgress(frame / allFrames);

    frame++;
    if (frame <= allFrames) {
      setTimeout(renderFrame, 1000 / ANIMATION_FPS);
    } else {
      recorder.stop();
    }
  }

  renderFrame();
}
