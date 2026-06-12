export interface ApiFootballFixtureResponse {
  errors?: Record<string, string> | unknown[];
  response: Array<{
    fixture: {
      id: number;
      status: {
        short: string;
        long: string;
      };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
  }>;
}

export type MappedMatchStatus = 'scheduled' | 'live' | 'finished';

// API-Football allows max 20 ids per fixtures?ids= request
const FIXTURE_IDS_BATCH_SIZE = 20;

/**
 * Maps API-Football status short codes to our MatchStatus enum.
 */
export function mapApiFootballStatus(shortStatus: string): MappedMatchStatus {
  const liveStatuses = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AWD', 'WO'];

  if (finishedStatuses.includes(shortStatus)) {
    return 'finished';
  }
  if (liveStatuses.includes(shortStatus)) {
    return 'live';
  }

  // Default to scheduled for NS, TBD, PST, CANC, ABD, etc.
  return 'scheduled';
}

/**
 * API-Football returns HTTP 200 even on auth/quota/param failures and reports
 * them in the `errors` field — as an object when populated, an empty array otherwise.
 */
function assertNoApiErrors(data: ApiFootballFixtureResponse): void {
  const errors = data.errors;
  if (!errors) return;

  const hasErrors = Array.isArray(errors)
    ? errors.length > 0
    : Object.keys(errors).length > 0;

  if (hasErrors) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(errors)}`);
  }
}

async function fetchFixturesBatch(ids: string[]): Promise<ApiFootballFixtureResponse> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY is not configured.');
  }

  const idsParam = ids.join('-');
  const response = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${idsParam}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-apisports-key': apiKey,
    },
    // Don't cache this request as we need fresh data for the cron job
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed with status: ${response.status}`);
  }

  const data = (await response.json()) as ApiFootballFixtureResponse;
  assertNoApiErrors(data);
  return data;
}

/**
 * Fetches match details from API-Football.
 * Batches requests in groups of 20 ids (API limit for the `ids` parameter).
 */
export async function getFixturesByIds(ids: string[]): Promise<ApiFootballFixtureResponse> {
  if (!ids || ids.length === 0) {
    return { response: [] };
  }

  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += FIXTURE_IDS_BATCH_SIZE) {
    batches.push(ids.slice(i, i + FIXTURE_IDS_BATCH_SIZE));
  }

  const results = await Promise.all(batches.map(fetchFixturesBatch));

  return { response: results.flatMap(r => r.response) };
}
