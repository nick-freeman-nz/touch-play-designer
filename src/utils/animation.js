import { ANIMATION_SPEED } from './constants';

// Calculate positions along routes at a given progress (0-1)
export function getAnimatedPositions(players, progress) {
  return players.map((player) => {
    if (!player.route || player.route.length === 0) {
      return { ...player };
    }

    const fullPath = [{ x: player.x, y: player.y }, ...player.route];
    const totalDist = getTotalDistance(fullPath);

    if (totalDist === 0) return { ...player };

    const targetDist = progress * totalDist;
    let traveled = 0;

    for (let i = 1; i < fullPath.length; i++) {
      const segDist = dist(fullPath[i - 1], fullPath[i]);
      if (traveled + segDist >= targetDist) {
        const t = (targetDist - traveled) / segDist;
        return {
          ...player,
          animX: lerp(fullPath[i - 1].x, fullPath[i].x, t),
          animY: lerp(fullPath[i - 1].y, fullPath[i].y, t),
        };
      }
      traveled += segDist;
    }

    const last = fullPath[fullPath.length - 1];
    return { ...player, animX: last.x, animY: last.y };
  });
}

// Get total duration of play in frames based on longest route
export function getPlayDuration(players) {
  let maxDist = 0;
  for (const player of players) {
    if (!player.route || player.route.length === 0) continue;
    const fullPath = [{ x: player.x, y: player.y }, ...player.route];
    maxDist = Math.max(maxDist, getTotalDistance(fullPath));
  }
  return Math.ceil(maxDist / ANIMATION_SPEED);
}

function getTotalDistance(path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += dist(path[i - 1], path[i]);
  }
  return total;
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
