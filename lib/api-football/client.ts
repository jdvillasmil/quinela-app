export interface ApiFootballFixtureResponse {
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

/**
 * Maps API-Football status short codes to our MatchStatus enum.
 */
export function mapApiFootballStatus(shortStatus: string): MappedMatchStatus {
  const liveStatuses = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT'];
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
 * Fetches match details from API-Football.
 * Supports passing multiple comma-separated IDs to optimize requests.
 */
export async function getFixturesByIds(ids: string[]): Promise<ApiFootballFixtureResponse> {
  if (!ids || ids.length === 0) {
    return { response: [] };
  }

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

  const data = await response.json();
  return data as ApiFootballFixtureResponse;
}
