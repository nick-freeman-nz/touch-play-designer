// Field dimensions (touch rugby proportions ~70m x 50m, scaled to canvas)
export const FIELD = {
  WIDTH: 800,
  HEIGHT: 520,
  PADDING: 40,
  TRY_ZONE_DEPTH: 50,
  LINE_COLOR: '#ffffff',
  GRASS_COLOR: '#2d8a4e',
  GRASS_DARK: '#267a43',
  TRY_ZONE_COLOR: '#1e6e3a',
};

// Player defaults
export const PLAYER_RADIUS = 16;
export const PLAYER_COLORS = {
  attack: '#ef4444',  // red
  defense: '#3b82f6', // blue
};

// Ball
export const BALL_RADIUS = 10;
export const BALL_COLOR = '#e8a020'; // gold
export const BALL_OUTLINE = '#f5c052';
export const DEFAULT_BALL = { x: 360, y: 260, route: [] };

export const DEFAULT_ATTACK_POSITIONS = [
  { id: 'a1', label: '1', team: 'attack', x: 420, y: 100 },
  { id: 'a2', label: '2', team: 'attack', x: 420, y: 180 },
  { id: 'a3', label: '3', team: 'attack', x: 420, y: 260 },
  { id: 'a4', label: '4', team: 'attack', x: 420, y: 340 },
  { id: 'a5', label: '5', team: 'attack', x: 420, y: 420 },
  { id: 'a6', label: '6', team: 'attack', x: 360, y: 260 },
];

export const DEFAULT_DEFENSE_POSITIONS = [
  { id: 'd1', label: '1', team: 'defense', x: 480, y: 100 },
  { id: 'd2', label: '2', team: 'defense', x: 480, y: 180 },
  { id: 'd3', label: '3', team: 'defense', x: 480, y: 260 },
  { id: 'd4', label: '4', team: 'defense', x: 480, y: 340 },
  { id: 'd5', label: '5', team: 'defense', x: 480, y: 420 },
  { id: 'd6', label: '6', team: 'defense', x: 540, y: 260 },
];

export const ANIMATION_SPEED = 2; // pixels per frame
export const ANIMATION_FPS = 60;
