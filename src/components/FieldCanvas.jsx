import { useRef, useEffect, useCallback, useState } from 'react';
import { drawField } from '../utils/fieldRenderer';
import { drawPlayers, drawRoutes, hitTestPlayer } from '../utils/playerRenderer';
import { canvasToField } from '../utils/fieldRenderer';
import { getAnimatedPositions } from '../utils/animation';
import { PLAYER_COLORS, PLAYER_RADIUS, FIELD } from '../utils/constants';

export default function FieldCanvas({
  players,
  setPlayers,
  selectedPlayerId,
  setSelectedPlayerId,
  mode,
  animationProgress,
  isAnimating,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 880, height: 600 });
  const draggingRef = useRef(null);

  // Resize canvas to fill container
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const aspect = 880 / 600;
      let w = rect.width;
      let h = w / aspect;
      if (h > rect.height) {
        h = rect.height;
        w = h * aspect;
      }
      setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draw everything (HiDPI-aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSize;

    // Scale canvas buffer for sharp rendering on HiDPI screens
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    drawField(ctx, width, height);
    drawRoutes(ctx, players, width, height);

    if (isAnimating) {
      const animated = getAnimatedPositions(players, animationProgress);
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

        if (p.animX !== undefined) {
          ctx.beginPath();
          ctx.arc(px, py, PLAYER_RADIUS + 6, 0, Math.PI * 2);
          ctx.fillStyle = color + '26';
          ctx.fill();
        }

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
    } else {
      drawPlayers(ctx, players, selectedPlayerId, width, height);
    }
  }, [players, selectedPlayerId, canvasSize, animationProgress, isAnimating]);

  const getFieldCoords = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      return canvasToField(cx, cy, canvasSize.width, canvasSize.height);
    },
    [canvasSize]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (isAnimating) return;
      const { x, y } = getFieldCoords(e);
      const hitId = hitTestPlayer(players, x, y);

      if (mode === 'move') {
        if (hitId) {
          setSelectedPlayerId(hitId);
          draggingRef.current = hitId;
        } else {
          setSelectedPlayerId(null);
        }
      } else if (mode === 'route') {
        if (hitId && !selectedPlayerId) {
          setSelectedPlayerId(hitId);
        } else if (selectedPlayerId && !hitId) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === selectedPlayerId
                ? { ...p, route: [...(p.route || []), { x, y }] }
                : p
            )
          );
        } else if (hitId) {
          setSelectedPlayerId(hitId);
        }
      }
    },
    [mode, players, selectedPlayerId, isAnimating, getFieldCoords, setPlayers, setSelectedPlayerId]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!draggingRef.current || isAnimating) return;
      const { x, y } = getFieldCoords(e);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === draggingRef.current ? { ...p, x, y } : p
        )
      );
    },
    [isAnimating, getFieldCoords, setPlayers]
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden min-h-0"
    >
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        className="cursor-crosshair rounded-lg shadow-2xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
