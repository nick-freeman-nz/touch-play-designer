import { MoveIcon, RouteIcon, PlayIcon, StopIcon, UndoIcon, MirrorIcon, TrashIcon, ResetIcon, DownloadIcon, XIcon } from './Icons';

export default function Toolbar({
  mode,
  setMode,
  onPlay,
  onStop,
  isAnimating,
  onClearRoutes,
  onResetPositions,
  onExportVideo,
  isExporting,
  exportProgress,
  selectedId,
  setSelectedId,
  onAddPlayer,
  onRemovePlayer,
  onUndo,
  onMirror,
  speed,
  setSpeed,
  players,
  canUndo,
}) {
  const attackCount = players.filter((p) => p.team === 'attack').length;
  const defenseCount = players.filter((p) => p.team === 'defense').length;

  return (
    <div className="toolbar">
      {/* Mode */}
      <div className="toolbar-group">
        <div className="mode-toggle">
          <button
            onClick={() => { setMode('move'); setSelectedId(null); }}
            className={mode === 'move' ? 'active' : ''}
          >
            <MoveIcon /> Move
          </button>
          <button
            onClick={() => { setMode('route'); setSelectedId(null); }}
            className={mode === 'route' ? 'active' : ''}
          >
            <RouteIcon /> Route
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="toolbar-group">
        <div className="player-pill">
          <span className="dot" style={{ background: '#ef4444' }} />
          <span>{attackCount}</span>
          <button className="add-btn" onClick={() => onAddPlayer('attack')} disabled={isAnimating} data-tooltip="Add attacker">+</button>
        </div>
        <div className="player-pill">
          <span className="dot" style={{ background: '#3b82f6' }} />
          <span>{defenseCount}</span>
          <button className="add-btn" onClick={() => onAddPlayer('defense')} disabled={isAnimating} data-tooltip="Add defender">+</button>
        </div>
        {selectedId && selectedId !== 'ball' && (
          <button className="remove-btn" onClick={onRemovePlayer} disabled={isAnimating}>
            <XIcon style={{ width: 11, height: 11 }} /> Remove
          </button>
        )}
      </div>

      {/* Playback */}
      <div className="toolbar-group">
        {!isAnimating ? (
          <button className="play-btn go" onClick={onPlay}>
            <PlayIcon /> Play
          </button>
        ) : (
          <button className="play-btn stop" onClick={onStop}>
            <StopIcon /> Stop
          </button>
        )}
        <div className="speed-control">
          <input
            type="range" min="0.25" max="3" step="0.25"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
          <span className="speed-label">{speed}x</span>
        </div>
      </div>

      {/* Tools */}
      <div className="toolbar-group">
        <button className="icon-btn" onClick={onUndo} disabled={isAnimating || !canUndo} data-tooltip="Undo (Ctrl+Z)">
          <UndoIcon />
        </button>
        <button className="icon-btn" onClick={onMirror} disabled={isAnimating} data-tooltip="Mirror">
          <MirrorIcon />
        </button>
        <button className="icon-btn" onClick={onClearRoutes} disabled={isAnimating} data-tooltip="Clear routes">
          <TrashIcon />
        </button>
        <button className="icon-btn" onClick={onResetPositions} disabled={isAnimating} data-tooltip="Reset all">
          <ResetIcon />
        </button>
      </div>

      {/* Export */}
      <div className="toolbar-group">
        <button className="export-btn" onClick={onExportVideo} disabled={isAnimating || isExporting}>
          <DownloadIcon />
          {isExporting ? `${Math.round(exportProgress * 100)}%` : 'Export'}
        </button>
      </div>

      {/* Status */}
      <div className="toolbar-group fill">
        <div className="status-text">
          {mode === 'move' && !selectedId && 'Drag to position'}
          {mode === 'move' && selectedId === 'ball' && 'Ball selected'}
          {mode === 'move' && selectedId && selectedId !== 'ball' && `Player ${selectedId}`}
          {mode === 'route' && !selectedId && 'Select player or ball'}
          {mode === 'route' && selectedId === 'ball' && 'Click to add ball waypoints'}
          {mode === 'route' && selectedId && selectedId !== 'ball' && 'Click to add waypoints'}
          {isAnimating && 'Playing...'}
        </div>
      </div>
    </div>
  );
}
