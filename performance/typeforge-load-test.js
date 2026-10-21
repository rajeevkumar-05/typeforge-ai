import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

// BASE_URL is the backend origin WITHOUT /api. No production URL is hardcoded.
const base = (__ENV.BASE_URL || '').replace(/\/+$/, '');
const flow = __ENV.FLOW || 'leaderboard';
const profile = __ENV.PROFILE || 'smoke';
const peak = Number(__ENV.VUS || 10);
if (!/^https?:\/\/[^/]+$/.test(base)) throw new Error('Set BASE_URL to the backend origin, without /api or a trailing path.');
if (!['leaderboard', 'dashboard', 'session'].includes(flow)) throw new Error('FLOW must be leaderboard, dashboard, or session.');
if (!['smoke', 'load'].includes(profile)) throw new Error('PROFILE must be smoke or load.');
if (!Number.isInteger(peak) || peak < 1 || peak > 1000) throw new Error('VUS must be an integer from 1 to 1000.');
if (flow === 'session' && (__ENV.TARGET_ENV !== 'staging' || __ENV.ALLOW_WRITES !== 'yes')) {
  throw new Error('Session writes require TARGET_ENV=staging and ALLOW_WRITES=yes. Verify BASE_URL points to a disposable staging database.');
}

// File format: ["staging-user-1-jwt", "staging-user-2-jwt", ...].
// Keep this local and out of Git. Never use production users for session writes.
const tokens = flow === 'leaderboard' ? [] : JSON.parse(open(__ENV.TOKENS_FILE || './tokens.local.json'));
const requiredTokens = profile === 'smoke' ? 1 : peak;
if (flow !== 'leaderboard' && (!Array.isArray(tokens) || tokens.length < requiredTokens || tokens.some(t => typeof t !== 'string' || !t.trim()))) {
  throw new Error(`Provide at least ${requiredTokens} valid staging-user JWT strings; one distinct user per virtual user.`);
}
if (flow !== 'leaderboard' && new Set(tokens).size !== tokens.length) {
  throw new Error('Use distinct test-user tokens rather than repeating one token.');
}

http.setResponseCallback(http.expectedStatuses(200, 201));
const names = flow === 'leaderboard' ? ['leaderboard'] : flow === 'dashboard' ? ['stats', 'history'] : ['save'];
const thresholds = {
  http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true, delayAbortEval: '15s' }],
  checks: [{ threshold: 'rate>0.99', abortOnFail: true, delayAbortEval: '15s' }],
};
for (const name of names) thresholds[`http_req_duration{name:${name}}`] = ['p(95)<1000'];

export const options = {
  scenarios: {
    users: profile === 'smoke'
      ? { executor: 'per-vu-iterations', vus: 1, iterations: 1, maxDuration: '2m' }
      : {
          executor: 'ramping-vus', startVUs: 0,
          stages: [
            { duration: '30s', target: peak },
            { duration: '2m', target: peak },
            { duration: '30s', target: 0 },
          ],
          gracefulRampDown: '45s', gracefulStop: '45s',
        },
  },
  thresholds,
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

function json(response) {
  try { return response.json(); } catch { return null; }
}
function params(name, token) {
  return {
    tags: { name }, timeout: '10s', redirects: 0,
    headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {},
  };
}

export function setup() {
  const r = http.get(`${base}/api/health`, params('health'));
  if (r.status !== 200 || json(r)?.status !== 'ok') {
    throw new Error('Health preflight failed. Verify backend URL and warm it up separately if using Render Free.');
  }
  // A health response alone does not test MongoDB; each flow below does.
}

export default function () {
  const token = tokens[exec.vu.idInTest - 1];
  if (flow === 'leaderboard') {
    const periods = ['alltime', 'daily', 'weekly', 'monthly'];
    const period = periods[(exec.vu.idInTest + exec.vu.iterationInScenario - 1) % periods.length];
    const r = http.get(`${base}/api/leaderboard?period=${period}&limit=50`, params('leaderboard'));
    const body = json(r);
    check(r, {
      'leaderboard returns 200': r => r.status === 200,
      'leaderboard is an array': () => Array.isArray(body),
      'leaderboard respects limit': () => Array.isArray(body) && body.length <= 50,
    });
    sleep(5 + Math.random() * 5);
  } else if (flow === 'dashboard') {
    const stats = http.get(`${base}/api/tests/stats`, params('stats', token));
    const statsBody = json(stats);
    check(stats, {
      'stats returns 200': r => r.status === 200,
      'stats has test count': () => Number.isFinite(statsBody?.testsCompleted),
    });
    const history = http.get(`${base}/api/tests?page=1&limit=20`, params('history', token));
    const historyBody = json(history);
    check(history, {
      'history returns 200': r => r.status === 200,
      'history has tests': () => Array.isArray(historyBody?.tests),
    });
    sleep(25 + Math.random() * 10);
  } else {
    // Simulated typing takes place on the client, with no per-keystroke API calls.
    sleep(25 + Math.random() * 10);
    const body = {
      duration: 30, wordsTyped: 25, charactersTyped: 125, mistakes: 0,
      rawWpm: 50, netWpm: 50, accuracy: 100,
      language: 'english', mode: 'time-30', wpmHistory: Array(30).fill(50),
    };
    const r = http.post(`${base}/api/tests`, JSON.stringify(body), params('save', token));
    const saved = json(r);
    check(r, {
      'save returns 201': r => r.status === 201,
      'save returns result ID': () => typeof saved?._id === 'string',
      'save preserves submitted metrics': () => saved?.netWpm === 50 && saved?.duration === 30,
    });
    // Do not retry POST automatically: the current backend has no idempotency key.
  }
}
