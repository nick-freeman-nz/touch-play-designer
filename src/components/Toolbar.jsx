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

  const btnBase = 'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150';
  const btnGreen = `${btnBase} text-white hover:brightness-110`;
  const divider = <div className="w-px h-8 opacity-30" style={{ background: 'var(--cph-bright)' }} />;

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl border"
      style={{
        background: 'var(--cph-forest)',
        borderColor: 'rgba(82, 183, 136, 0.15)',
      }}
    >
      {/* Mode buttons */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--cph-dark)' }}>
        <button
          onClick={() => { setMode('move'); setSelectedId(null); }}
          className={`${btnBase} ${
            mode === 'move'
              ? 'text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          style={mode === 'move' ? { background: 'var(--cph-primary)' } : {}}
        >
          ✋ Move
        </button>
        <button
          onClick={() => { setMode('route'); setSelectedId(null); }}
          className={`${btnBase} ${
            mode === 'route'
              ? 'text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          style={mode === 'route' ? { background: 'var(--cph-bright)', color: 'var(--cph-deep)' } : {}}
        >
          ✏️ Route
        </button>
      </div>

      {divider}

      {/* Player management */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: 'var(--cph-dark)' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-gray-300 tabular-nums">{attackCount}</span>
          <button
            onClick={() => onAddPlayer('attack')}
            disabled={isAnimating}
            className="w-6 h-6 flex items-center justify-center rounded text-white text-sm font-bold transition-colors disabled:opacity-50 hover:brightness-125"
            style={{ background: 'var(--cph-primary)' }}
            title="Add attacker"
          >+</button>
        </div>
        <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: 'var(--cph-dark)' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-300 tabular-nums">{defenseCount}</span>
          <button
            onClick={() => onAddPlayer('defense')}
            disabled={isAnimating}
            className="w-6 h-6 flex items-center justify-center rounded text-white text-sm font-bold transition-colors disabled:opacity-50 hover:brightness-125"
            style={{ background: 'var(--cph-primary)' }}
            title="Add defender"
          >+</button>
        </div>
        {selectedId && selectedId !== 'ball' && (
          <button
            onClick={onRemovePlayer}
            disabled={isAnimating}
            className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            title="Remove selected player"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {divider}

      {/* Playback */}
      <div className="flex gap-1">
        {!isAnimating ? (
          <button
            onClick={onPlay}
            className={`${btnGreen} shadow-md`}
            style={{ background: 'var(--cph-bright)', color: 'var(--cph-deep)' }}
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={onStop}
            className={`${btnBase} bg-red-600 hover:bg-red-500 text-white`}
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-xs" style={{ color: 'var(--cph-light)' }}>⚡</span>
        <input
          type="range"
          min="0.25"
          max="3"
          step="0.25"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-16 h-1 accent-emerald-500"
          title={`Speed: ${speed}x`}
        />
        <span className="text-xs tabular-nums w-7" style={{ color: 'var(--cph-mint)' }}>{speed}x</span>
      </div>

      {divider}

      {/* Actions */}
      <button
        onClick={onUndo}
        disabled={isAnimating || !canUndo}
        className={`${btnBase} text-white transition-colors disabled:opacity-30`}
        style={{ background: 'var(--cph-dark)' }}
        title="Undo last waypoint (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={onMirror}
        disabled={isAnimating}
        className={`${btnBase} text-white transition-colors disabled:opacity-50`}
        style={{ background: 'var(--cph-dark)' }}
        title="Mirror play horizontally"
      >
        ⇔ Mirror
      </button>
      <button
        onClick={onClearRoutes}
        disabled={isAnimating}
        className={`${btnBase} text-white transition-colors disabled:opacity-50`}
        style={{ background: 'var(--cph-dark)' }}
      >
        🗑 Routes
      </button>
      <button
        onClick={onResetPositions}
        disabled={isAnimating}
        className={`${btnBase} text-white transition-colors disabled:opacity-50`}
        style={{ background: 'var(--cph-dark)' }}
      >
        ↻ Reset
      </button>

      {divider}

      {/* Export */}
      <button
        onClick={onExportVideo}
        disabled={isAnimating || isExporting}
        className={`${btnBase} text-white transition-colors disabled:opacity-50`}
        style={{ background: 'var(--cph-primary)' }}
      >
        {isExporting
          ? `📹 ${Math.round(exportProgress * 100)}%`
          : '📹 Export'}
      </button>

      {/* Status hint */}
      <div className="ml-auto text-xs" style={{ color: 'var(--cph-light)', opacity: 0.7 }}>
        {mode === 'move' && !selectedId && 'Drag players or ball to position'}
        {mode === 'move' && selectedId === 'ball' && '🏉 Ball selected'}
        {mode === 'move' && selectedId && selectedId !== 'ball' && `Selected: ${selectedId}`}
        {mode === 'route' && !selectedId && 'Click a player or ball to draw route'}
        {mode === 'route' && selectedId === 'ball' && '🏉 Click field to add ball waypoints'}
        {mode === 'route' && selectedId && selectedId !== 'ball' && 'Click field to add waypoints'}
        {isAnimating && '🎬 Playing...'}
      </div>
    </div>
  );
}
