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
}) {
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
          ✏️ Draw Route
        </button>
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
        <button
          onClick={onReset}
          disabled={isAnimating}
          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          ↺ Reset
        </button>
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* Actions */}
      <button
        onClick={onClearRoutes}
        disabled={isAnimating}
        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        🗑 Clear Routes
      </button>
      <button
        onClick={onResetPositions}
        disabled={isAnimating}
        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        ↻ Reset Positions
      </button>

      <div className="w-px h-8 bg-gray-600" />

      {/* Export */}
      <button
        onClick={onExportVideo}
        disabled={isAnimating || isExporting}
        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isExporting
          ? `📹 Recording ${Math.round(exportProgress * 100)}%`
          : '📹 Export Video'}
      </button>

      {/* Status hint */}
      <div className="ml-auto text-xs text-gray-400">
        {mode === 'move' && !selectedPlayerId && 'Click a player to select, then drag to move'}
        {mode === 'move' && selectedPlayerId && `Moving player ${selectedPlayerId}`}
        {mode === 'route' && !selectedPlayerId && 'Click a player to start drawing their route'}
        {mode === 'route' && selectedPlayerId && 'Click on the field to add waypoints. Click another player to switch.'}
        {isAnimating && '🎬 Playing animation...'}
      </div>
    </div>
  );
}
