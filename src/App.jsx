import { useState, useRef, useCallback } from 'react';
import FieldCanvas from './components/FieldCanvas';
import Toolbar from './components/Toolbar';
import PlayList from './components/PlayList';
import { DEFAULT_ATTACK_POSITIONS, DEFAULT_DEFENSE_POSITIONS, FIELD } from './utils/constants';
import { getPlayDuration } from './utils/animation';
import { recordPlay } from './utils/videoExport';

const defaultPlayers = () => [
  ...DEFAULT_ATTACK_POSITIONS.map((p) => ({ ...p, route: [] })),
  ...DEFAULT_DEFENSE_POSITIONS.map((p) => ({ ...p, route: [] })),
];

let nextId = 100;

export default function App() {
  const [players, setPlayers] = useState(defaultPlayers);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [mode, setMode] = useState('move');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentPlayId, setCurrentPlayId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const animFrameRef = useRef(null);

  const handlePlay = useCallback(() => {
    const totalFrames = getPlayDuration(players);
    if (totalFrames === 0) return;
    setIsAnimating(true);
    setSelectedPlayerId(null);
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
  }, [players]);

  const handleStop = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsAnimating(false);
    setAnimationProgress(0);
  }, []);

  const handleClearRoutes = useCallback(() => {
    setPlayers((prev) => prev.map((p) => ({ ...p, route: [] })));
    setSelectedPlayerId(null);
  }, []);

  const handleResetPositions = useCallback(() => {
    setPlayers(defaultPlayers());
    setSelectedPlayerId(null);
    setCurrentPlayId(null);
  }, []);

  const handleAddPlayer = useCallback((team) => {
    nextId++;
    const teamPlayers = players.filter((p) => p.team === team);
    const label = String(teamPlayers.length + 1);
    const prefix = team === 'attack' ? 'a' : 'd';
    // Place new player near center of their side
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
    if (!selectedPlayerId) return;
    setPlayers((prev) => prev.filter((p) => p.id !== selectedPlayerId));
    setSelectedPlayerId(null);
  }, [selectedPlayerId]);

  const handleExportVideo = useCallback(() => {
    setIsExporting(true);
    setExportProgress(0);
    recordPlay(
      players,
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
      (progress) => setExportProgress(progress)
    );
  }, [players]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white p-4 gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          {String.fromCodePoint(0x1F3C9)} Touch Play Designer
        </h1>
        <span className="text-xs text-gray-500">v1.1</span>
      </div>
      <Toolbar
        mode={mode}
        setMode={setMode}
        onPlay={handlePlay}
        onStop={handleStop}
        onReset={handleStop}
        isAnimating={isAnimating}
        onClearRoutes={handleClearRoutes}
        onResetPositions={handleResetPositions}
        onExportVideo={handleExportVideo}
        isExporting={isExporting}
        exportProgress={exportProgress}
        selectedPlayerId={selectedPlayerId}
        setSelectedPlayerId={setSelectedPlayerId}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        players={players}
      />
      <div className="flex-1 flex gap-3 min-h-0">
        <FieldCanvas
          players={players}
          setPlayers={setPlayers}
          selectedPlayerId={selectedPlayerId}
          setSelectedPlayerId={setSelectedPlayerId}
          mode={mode}
          animationProgress={animationProgress}
          isAnimating={isAnimating}
        />
        <PlayList
          players={players}
          setPlayers={setPlayers}
          currentPlayId={currentPlayId}
          setCurrentPlayId={setCurrentPlayId}
        />
      </div>
    </div>
  );
}
