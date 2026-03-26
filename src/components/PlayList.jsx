import { useState, useEffect, useRef } from 'react';
import { loadPlays, savePlay, deletePlay } from '../lib/storage';
import { XIcon } from './Icons';

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
    setPlayers(play.players.map((p) => ({ ...p, route: p.route || [] })));
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

  return (
    <div className="w-64 panel flex flex-col overflow-hidden">
      {/* Save */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="section-label">Save Play</div>
        <input
          type="text"
          value={playName}
          onChange={(e) => setPlayName(e.target.value)}
          placeholder="Play name..."
          className="sidebar-input"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} disabled={!playName.trim() || saving} className="save-btn">
            {saving ? '...' : currentPlayId ? 'Update' : 'Save'}
          </button>
          <button onClick={() => { setCurrentPlayId(null); setPlayName(''); }} className="new-btn">
            New
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="section-label">Plays ({plays.length})</div>
        {plays.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 4px' }}>
            No plays saved yet
          </p>
        )}
        <div className="flex flex-col gap-1">
          {plays.map((play) => (
            <div
              key={play.id}
              className={`play-card ${play.id === currentPlayId ? 'active' : ''}`}
              onClick={() => handleLoad(play)}
            >
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }} className="truncate">
                  {play.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {play.players?.length || 0} players
                  {play.updated_at && ` · ${new Date(play.updated_at).toLocaleDateString()}`}
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => { e.stopPropagation(); handleDelete(play.id); }}
              >
                <XIcon style={{ width: 12, height: 12 }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="p-3 flex flex-col gap-1.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="shortcut-row"><kbd>⌘Z</kbd> Undo</div>
        <div className="shortcut-row"><kbd>Space</kbd> Play</div>
        <div className="shortcut-row"><kbd>Esc</kbd> Deselect</div>
      </div>
    </div>
  );
}
