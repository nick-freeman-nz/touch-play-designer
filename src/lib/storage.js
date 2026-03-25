import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'touch-plays';

// ─── Local Storage fallback ──────────────────
function getLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocal(plays) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plays));
}

// ─── Public API ──────────────────────────────

export async function loadPlays() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('plays')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.warn('Supabase load failed, using localStorage:', error.message);
      return getLocal();
    }
    return data;
  }
  return getLocal();
}

export async function savePlay(play) {
  const now = new Date().toISOString();
  const record = {
    ...play,
    updated_at: now,
    created_at: play.created_at || now,
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('plays')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase save failed, saving locally:', error.message);
      savePlayLocal(record);
      return record;
    }
    return data;
  }

  savePlayLocal(record);
  return record;
}

function savePlayLocal(play) {
  const plays = getLocal();
  const idx = plays.findIndex((p) => p.id === play.id);
  if (idx >= 0) {
    plays[idx] = play;
  } else {
    plays.unshift(play);
  }
  saveLocal(plays);
}

export async function deletePlay(id) {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('plays').delete().eq('id', id);
    if (error) console.warn('Supabase delete failed:', error.message);
  }

  // Always clean local too
  const plays = getLocal();
  saveLocal(plays.filter((p) => p.id !== id));
}
