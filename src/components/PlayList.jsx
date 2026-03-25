import { useState, useEffect, useRef } from 'react';
import { loadPlays, savePlay, deletePlay } from '../lib/storage';

export default function PlayList({ players, setPlayers, currentPlayId, setCurrentPlayId }) {
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
    <div className="w-72 bg-gray-800 rounded-xl flex flex-col overflow-hidden">
      {/* Save section */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          💾 Save Play
        </h2>
        <input
          type="text"
          value={playName}
          onChange={(e) => setPlayName(e.target.value)}
          placeholder="Play name..."
          className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            disabled={!playName.trim() || saving}
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : currentPlayId ? 'Update' : 'Save'}
          </button>
          <button
            onClick={handleNew}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm font-medium transition-colors"
          >
            + New
          </button>
        </div>
      </div>

      {/* Play list */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          📋 Saved Plays ({plays.length})
        </h2>
        {plays.length === 0 && (
          <p className="text-xs text-gray-500 italic">No plays saved yet</p>
        )}
        <div className="space-y-1.5">
          {plays.map((play) => (
            <div
              key={play.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                play.id === currentPlayId
                  ? 'bg-blue-900/50 border border-blue-500/50'
                  : 'bg-gray-700/50 hover:bg-gray-700 border border-transparent'
              }`}
              onClick={() => handleLoad(play)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{play.name}</div>
                <div className="text-xs text-gray-400">
                  {play.players?.length || 0} players
                  {play.updated_at &&
                    ` · ${new Date(play.updated_at).toLocaleDateString()}`}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(play.id);
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete play"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
