import { useRef, useEffect, useCallback, useState } from 'react';
import { drawField } from '../utils/fieldRenderer';
import { drawPlayers, drawRoutes, drawBall, drawBallRoute, hitTestPlayer, hitTestBall } from '../utils/playerRenderer';
import { canvasToField } from '../utils/fieldRenderer';
import { getAnimatedPositions, getAnimatedBallPosition } from '../utils/animation';
import { PLAYER_COLORS, PLAYER_RADIUS, FIELD, BALL_RADIUS, BALL_COLOR, BALL_OUTLINE } from '../utils/constants';

export default function FieldCanvas({
  players,
  setPlayers,
  ball,
  setBall,
  selectedId,
  setSelectedId,
  mode,
  animationProgress,
  isAnimating,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 880, height: 600 });
  const draggingRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Fill the entire container — no letterboxing
      setCanvasSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSize;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    drawField(ctx, width, height);
    drawRoutes(ctx, players, width, height);
    drawBallRoute(ctx, ball, width, height);

    if (isAnimating) {
      const animated = getAnimatedPositions(players, animationProgress);
      const animBall = getAnimatedBallPosition(ball, animationProgress);
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
        ctx.font = "bold 13px 'Barlow', system-ui";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, px, py);
      }

      if (animBall) {
        const bx = animBall.animX ?? animBall.x;
        const by = animBall.animY ?? animBall.y;

        ctx.beginPath();
        ctx.arc(bx, by, BALL_RADIUS + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 160, 32, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bx, by, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = BALL_COLOR;
        ctx.fill();
        ctx.strokeStyle = BALL_OUTLINE;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    } else {
      drawPlayers(ctx, players, selectedId, width, height);
      drawBall(ctx, ball, selectedId === 'ball', width, height);
    }
  }, [players, ball, selectedId, canvasSize, animationProgress, isAnimating]);

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
      const ballHit = hitTestBall(ball, x, y);
      const playerHit = hitTestPlayer(players, x, y);

      if (mode === 'move') {
        if (ballHit) {
          setSelectedId('ball');
          draggingRef.current = 'ball';
        } else if (playerHit) {
          setSelectedId(playerHit);
          draggingRef.current = playerHit;
        } else {
          setSelectedId(null);
        }
      } else if (mode === 'route') {
        if (ballHit && selectedId !== 'ball') {
          setSelectedId('ball');
        } else if (playerHit && !selectedId) {
          setSelectedId(playerHit);
        } else if (playerHit && selectedId !== playerHit) {
          setSelectedId(playerHit);
        } else if (selectedId && !playerHit && !ballHit) {
          if (selectedId === 'ball') {
            setBall((prev) => ({ ...prev, route: [...(prev.route || []), { x, y }] }));
          } else {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === selectedId
                  ? { ...p, route: [...(p.route || []), { x, y }] }
                  : p
              )
            );
          }
        } else if (ballHit) {
          setSelectedId('ball');
        } else if (playerHit) {
          setSelectedId(playerHit);
        }
      }
    },
    [mode, players, ball, selectedId, isAnimating, getFieldCoords, setPlayers, setBall, setSelectedId]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!draggingRef.current || isAnimating) return;
      const { x, y } = getFieldCoords(e);
      if (draggingRef.current === 'ball') {
        setBall((prev) => ({ ...prev, x, y }));
      } else {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === draggingRef.current ? { ...p, x, y } : p
          )
        );
      }
    },
    [isAnimating, getFieldCoords, setPlayers, setBall]
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  return (
    <div ref={containerRef} className="canvas-wrap">
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
