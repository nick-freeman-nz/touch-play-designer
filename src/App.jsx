import { useState, useRef, useCallback, useEffect } from 'react';
import FieldCanvas from './components/FieldCanvas';
import Toolbar from './components/Toolbar';
import PlayList from './components/PlayList';
import { DEFAULT_ATTACK_POSITIONS, DEFAULT_DEFENSE_POSITIONS, DEFAULT_BALL, FIELD } from './utils/constants';
import { getPlayDuration } from './utils/animation';
import { recordPlay } from './utils/videoExport';

const defaultPlayers = () => [
  ...DEFAULT_ATTACK_POSITIONS.map((p) => ({ ...p, route: [] })),
  ...DEFAULT_DEFENSE_POSITIONS.map((p) => ({ ...p, route: [] })),
];

const defaultBall = () => ({ ...DEFAULT_BALL, route: [] });

let nextId = 100;

export default function App() {
  const [players, setPlayers] = useState(defaultPlayers);
  const [ball, setBall] = useState(defaultBall);
  const [selectedId, setSelectedId] = useState(null); // player id or 'ball'
  const [mode, setMode] = useState('move');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentPlayId, setCurrentPlayId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const animFrameRef = useRef(null);

  // Track whether undo is possible (selected entity has route waypoints)
  const canUndo = (() => {
    if (!selectedId) return false;
    if (selectedId === 'ball') return ball && ball.route && ball.route.length > 0;
    const p = players.find((p) => p.id === selectedId);
    return p && p.route && p.route.length > 0;
  })();

  const handlePlay = useCallback(() => {
    const totalFrames = getPlayDuration(players, ball, speed);
    if (totalFrames === 0) return;
    setIsAnimating(true);
    setSelectedId(null);
    let frame = 0;
    function tick() {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      setAnimationProgress(progress);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsAnimating(false);
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, [players, ball, speed]);

  const handleStop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsAnimating(false);
    setAnimationProgress(0);
  }, []);

  const handleClearRoutes = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, route: [] })));
    setBall((prev) => ({ ...prev, route: [] }));
    setSelectedId(null);
  }, []);

  const handleResetPositions = useCallback(() => {
    setPlayers(defaultPlayers());
    setBall(defaultBall());
    setSelectedId(null);
    setCurrentPlayId(null);
  }, []);

  const handleAddPlayer = useCallback((team) => {
    nextId++;
    const teamPlayers = players.filter((p) => p.team === team);
    const label = String(teamPlayers.length + 1);
    const prefix = team === 'attack' ? 'a' : 'd';
    const baseX = team === 'attack' ? FIELD.WIDTH * 0.45 : FIELD.WIDTH * 0.55;
    setPlayers((prev) => [
      ...prev,
      {
        id: `${prefix}${nextId}`,
        label,
        team,
        x: baseX + Math.random() * 40 - 20,
        y: FIELD.HEIGHT / 2 + Math.random() * 60 - 30,
        route: [],
      },
    ]);
  }, [players]);

  const handleRemovePlayer = useCallback(() => {
    if (!selectedId || selectedId === 'ball') return;
    setPlayers((prev) => prev.filter((p) => p.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const handleUndo = useCallback(() => {
    if (!selectedId) return;
    if (selectedId === 'ball') {
      setBall((prev) => ({
        ...prev,
        route: prev.route.slice(0, -1),
      }));
    } else {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === selectedId
            ? { ...p, route: p.route.slice(0, -1) }
            : p
        )
      );
    }
  }, [selectedId]);

  const handleMirror = useCallback(() => {
    const midX = FIELD.WIDTH / 2;
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        x: midX + (midX - p.x),
        route: (p.route || []).map((wp) => ({ ...wp, x: midX + (midX - wp.x) })),
      }))
    );
    setBall((prev) => ({
      ...prev,
      x: midX + (midX - prev.x),
      route: (prev.route || []).map((wp) => ({ ...wp, x: midX + (midX - wp.x) })),
    }));
  }, []);

  const handleExportVideo = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    recordPlay(
      players,
      ball,
      (blob) => {
        setIsExporting(false);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `play-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      },
      (progress) => setExportProgress(progress),
      speed
    );
  }, [players, ball, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Ctrl+Z = undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Space = play/stop
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        if (isAnimating) {
          handleStop();
        } else {
          handlePlay();
        }
        return;
      }
      // Escape = deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }
      // Delete/Backspace = remove selected player
      if ((e.key === 'Delete' || e.key === 'Backspace') && e.target === document.body) {
        if (selectedId && selectedId !== 'ball') {
          handleRemovePlayer();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handlePlay, handleStop, handleRemovePlayer, isAnimating, selectedId]);

  return (
    <div className="h-screen flex flex-col text-white p-4 gap-3" style={{ background: 'var(--cph-deep)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'var(--cph-bright)', color: 'var(--cph-deep)' }}
          >
            🏉
          </div>
          <div>
            <h1
              className="text-lg font-bold tracking-tight leading-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'var(--cph-mint)' }}
            >
              CPH TOUCH
              <span className="font-normal ml-1.5" style={{ color: 'var(--cph-light)' }}>
                Play Designer
              </span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--cph-mid)', marginTop: '-1px' }}>
              Copenhagen Touch Rugby
            </p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--cph-mid)', background: 'var(--cph-forest)' }}>
          v2.0
        </span>
      </div>

      <Toolbar
        mode={mode}
        setMode={setMode}
        onPlay={handlePlay}
        onStop={handleStop}
        isAnimating={isAnimating}
        onClearRoutes={handleClearRoutes}
        onResetPositions={handleResetPositions}
        onExportVideo={handleExportVideo}
        isExporting={isExporting}
        exportProgress={exportProgress}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onUndo={handleUndo}
        onMirror={handleMirror}
        speed={speed}
        setSpeed={setSpeed}
        players={players}
        canUndo={canUndo}
      />
      <div className="flex-1 flex gap-3 min-h-0">
        <FieldCanvas
          players={players}
          setPlayers={setPlayers}
          ball={ball}
          setBall={setBall}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          mode={mode}
          animationProgress={animationProgress}
          isAnimating={isAnimating}
        />
        <PlayList
          players={players}
          setPlayers={setPlayers}
          ball={ball}
          setBall={setBall}
          currentPlayId={currentPlayId}
          setCurrentPlayId={setCurrentPlayId}
        />
      </div>
    </div>
  );
}
