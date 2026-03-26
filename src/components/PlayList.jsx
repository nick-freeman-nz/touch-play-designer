import { useState, useEffect, useRef } from 'react';
import { loadPlays, savePlay, deletePlay } from '../lib/storage';

export default function PlayList({ players, setPlayers, ball, setBall, currentPlayId, setCurrentPlayId }) {
  const [plays, setPlays] = useState([]);
  const [playName, setPlayName] = useState('');
  const [saving, setSaving] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadPlays().then(setPlays);
  }, []);

  const handleSave = async () => {
    if (!playName.trim()) return;
    setSaving(true);
    const play = {
      id: currentPlayId || crypto.randomUUID(),
      name: playName.trim(),
      players: players.map(({ id, label, team, x, y, route }) => ({
        id, label, team, x, y, route: route || [],
      })),
      ball: ball ? { x: ball.x, y: ball.y, route: ball.route || [] } : null,
    };
    const saved = await savePlay(play);
    setCurrentPlayId(saved.id);
    setPlays(await loadPlays());
    setSaving(false);
  };

  const handleLoad = (play) => {
    setCurrentPlayId(play.id);
    setPlayName(play.name);
    setPlayers(
      play.players.map((p) => ({
        ...p,
        route: p.route || [],
      }))
    );
    if (play.ball) {
      setBall({ x: play.ball.x, y: play.ball.y, route: play.ball.route || [] });
    }
  };

  const handleDelete = async (id) => {
    await deletePlay(id);
    if (currentPlayId === id) {
      setCurrentPlayId(null);
      setPlayName('');
    }
    setPlays(await loadPlays());
  };

  const handleNew = () => {
    setCurrentPlayId(null);
    setPlayName('');
  };

  return (
    <div
      className="w-72 rounded-xl flex flex-col overflow-hidden border"
      style={{ background: 'var(--cph-forest)', borderColor: 'rgba(82, 183, 136, 0.15)' }}
    >
      {/* Save section */}
      <div className="p-3" style={{ borderBottom: '1px solid rgba(82, 183, 136, 0.15)' }}>
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'var(--cph-bright)', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          💾 Save Play
        </h2>
        <input
          type="text"
          value={playName}
          onChange={(e) => setPlayName(e.target.value)}
          placeholder="Play name..."
          className="w-full px-3 py-1.5 rounded-md text-white text-sm placeholder-gray-500 focus:outline-none"
          style={{
            background: 'var(--cph-dark)',
            border: '1px solid rgba(82, 183, 136, 0.2)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--cph-bright)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(82, 183, 136, 0.2)'}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!playName.trim() || saving}
            className="flex-1 px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 hover:brightness-110"
            style={{ background: 'var(--cph-bright)', color: 'var(--cph-deep)' }}
          >
            {saving ? 'Saving...' : currentPlayId ? 'Update' : 'Save'}
          </button>
          <button
            onClick={handleNew}
            className="px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors hover:brightness-125"
            style={{ background: 'var(--cph-dark)' }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Play list */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'var(--cph-bright)', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          📋 Saved Plays ({plays.length})
        </h2>
        {plays.length === 0 && (
          <p className="text-xs italic" style={{ color: 'var(--cph-mid)' }}>No plays saved yet</p>
        )}
        <div className="space-y-1.5">
          {plays.map((play) => (
            <div
              key={play.id}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: play.id === currentPlayId ? 'rgba(82, 183, 136, 0.15)' : 'rgba(26, 58, 42, 0.5)',
                border: play.id === currentPlayId ? '1px solid rgba(82, 183, 136, 0.4)' : '1px solid transparent',
              }}
              onClick={() => handleLoad(play)}
              onMouseEnter={(e) => {
                if (play.id !== currentPlayId) e.currentTarget.style.background = 'var(--cph-dark)';
              }}
              onMouseLeave={(e) => {
                if (play.id !== currentPlayId) e.currentTarget.style.background = 'rgba(26, 58, 42, 0.5)';
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{play.name}</div>
                <div className="text-xs" style={{ color: 'var(--cph-mid)' }}>
                  {play.players?.length || 0} players
                  {play.ball ? ' + ball' : ''}
                  {play.updated_at &&
                    ` · ${new Date(play.updated_at).toLocaleDateString()}`}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(play.id);
                }}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                title="Delete play"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(82, 183, 136, 0.1)' }}>
        <div className="text-xs space-y-0.5" style={{ color: 'var(--cph-mid)' }}>
          <div><kbd className="font-mono bg-black/30 px-1 rounded">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="font-mono bg-black/30 px-1 rounded">Space</kbd> Play/Stop</div>
          <div><kbd className="font-mono bg-black/30 px-1 rounded">Esc</kbd> Deselect</div>
        </div>
      </div>
    </div>
  );
}
