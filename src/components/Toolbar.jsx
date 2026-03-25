export default function Toolbar({
  mode,
  setMode,
  onPlay,
  onStop,
  onReset,
  isAnimating,
  onClearRoutes,
  onResetPositions,
  onExportVideo,
  isExporting,
  exportProgress,
  selectedPlayerId,
  setSelectedPlayerId,
  onAddPlayer,
  onRemovePlayer,
  players,
}) {
  const attackCount = players.filter((p) => p.team === 'attack').length;
  const defenseCount = players.filter((p) => p.team === 'defense').length;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-800 rounded-xl">
      {/* Mode buttons */}
      <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => { setMode('move'); setSelectedPlayerId(null); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'move'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          ✋ Move
        </button>
        <button
          onClick={() => { setMode('route'); setSelectedPlayerId(null); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'route'
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          ✏️ Route
        </button>
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* Player management */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-gray-300 tabular-nums">{attackCount}</span>
          <button
            onClick={() => onAddPlayer('attack')}
            disabled={isAnimating}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
            title="Add attacker"
          >+</button>
        </div>
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-300 tabular-nums">{defenseCount}</span>
          <button
            onClick={() => onAddPlayer('defense')}
            disabled={isAnimating}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
            title="Add defender"
          >+</button>
        </div>
        {selectedPlayerId && (
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

      <div className="w-px h-8 bg-gray-600" />

      {/* Playback */}
      <div className="flex gap-1">
        {!isAnimating ? (
          <button
            onClick={onPlay}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors"
          >
            ▶ Play
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium transition-colors"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* Actions */}
      <button
        onClick={onClearRoutes}
        disabled={isAnimating}
        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        🗑 Routes
      </button>
      <button
        onClick={onResetPositions}
        disabled={isAnimating}
        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        ↻ Reset All
      </button>

      <div className="w-px h-8 bg-gray-600" />

      {/* Export */}
      <button
        onClick={onExportVideo}
        disabled={isAnimating || isExporting}
        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isExporting
          ? `📹 ${Math.round(exportProgress * 100)}%`
          : '📹 Export'}
      </button>

      {/* Status hint */}
      <div className="ml-auto text-xs text-gray-400">
        {mode === 'move' && !selectedPlayerId && 'Drag players to position'}
        {mode === 'move' && selectedPlayerId && `Selected: ${selectedPlayerId}`}
        {mode === 'route' && !selectedPlayerId && 'Click a player to draw their route'}
        {mode === 'route' && selectedPlayerId && 'Click field to add waypoints'}
        {isAnimating && '🎬 Playing...'}
      </div>
    </div>
  );
}
