// Backfill matches.api_match_id from API-Football fixtures.
//
// Matches each of the 104 DB rows to an API-Football fixture by kickoff
// timestamp, disambiguating same-kickoff slots by team name (with an alias
// map for naming differences between our seed and API-Football).
//
// Usage:
//   node scripts/backfill-api-match-ids.mjs --dry-run   # report only
//   node scripts/backfill-api-match-ids.mjs             # apply updates
//   node scripts/backfill-api-match-ids.mjs --force     # also overwrite existing ids
//
// Reads NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
// API_FOOTBALL_KEY from .env.local.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const WORLD_CUP_LEAGUE_ID = 1;
const SEASON = 2026;

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

loadEnvLocal();

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_FOOTBALL_KEY } = process.env;
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !API_FOOTBALL_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or API_FOOTBALL_KEY.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Team name normalization
// ---------------------------------------------------------------------------

// API-Football name → our seed name, after base normalization
// (lowercase, diacritics stripped, '&' → 'and', collapsed spaces).
const TEAM_ALIASES = {
  'czech republic': 'czechia',
  'korea republic': 'south korea',
  'usa': 'united states',
  'turkey': 'turkiye',
  "cote d'ivoire": 'ivory coast',
};

function normalizeTeam(name) {
  if (!name) return '';
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();
  return TEAM_ALIASES[base] ?? base;
}

// ---------------------------------------------------------------------------
// Data sources
// ---------------------------------------------------------------------------

async function fetchApiFixtures() {
  const url = `https://v3.football.api-sports.io/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}`;
  const res = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-apisports-key': API_FOOTBALL_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`API-Football request failed with status ${res.status}`);
  }
  const data = await res.json();
  const errors = data.errors;
  const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0;
  if (hasErrors) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(errors)}`);
  }
  return data.response;
}

async function fetchDbMatches(supabase) {
  const { data, error } = await supabase
    .from('matches')
    .select('id, match_number, phase, home_team, away_team, match_date, api_match_id')
    .order('match_number');
  if (error) throw new Error(`Failed to fetch matches: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

function matchFixture(dbMatch, fixturesByKickoff) {
  const kickoff = new Date(dbMatch.match_date).getTime();
  const candidates = fixturesByKickoff.get(kickoff) ?? [];

  if (candidates.length === 0) {
    return { fixture: null, reason: 'no fixture at this kickoff' };
  }

  const home = normalizeTeam(dbMatch.home_team);
  const away = normalizeTeam(dbMatch.away_team);

  const byName = candidates.filter(f =>
    normalizeTeam(f.teams.home.name) === home && normalizeTeam(f.teams.away.name) === away
  );
  if (byName.length === 1) return { fixture: byName[0], reason: 'kickoff + teams' };

  const swapped = candidates.filter(f =>
    normalizeTeam(f.teams.home.name) === away && normalizeTeam(f.teams.away.name) === home
  );
  if (swapped.length === 1) return { fixture: swapped[0], reason: 'kickoff + teams (home/away swapped)' };

  // Knockout slots are 'TBD' in our seed; fall back to kickoff alone when unambiguous.
  if (candidates.length === 1) return { fixture: candidates[0], reason: 'kickoff only (single fixture)' };

  return {
    fixture: null,
    reason: `ambiguous: ${candidates.length} fixtures at kickoff, none matching '${dbMatch.home_team}' vs '${dbMatch.away_team}'`,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const [apiFixtures, dbMatches] = await Promise.all([fetchApiFixtures(), fetchDbMatches(supabase)]);
  console.log(`API-Football fixtures: ${apiFixtures.length} · DB matches: ${dbMatches.length}\n`);

  const fixturesByKickoff = new Map();
  for (const f of apiFixtures) {
    const t = new Date(f.fixture.date).getTime();
    if (!fixturesByKickoff.has(t)) fixturesByKickoff.set(t, []);
    fixturesByKickoff.get(t).push(f);
  }

  const usedFixtureIds = new Set();
  const updates = [];
  const skipped = [];
  const unmatched = [];

  for (const dbMatch of dbMatches) {
    if (dbMatch.api_match_id && !FORCE) {
      skipped.push(dbMatch);
      continue;
    }

    const { fixture, reason } = matchFixture(dbMatch, fixturesByKickoff);

    if (!fixture) {
      unmatched.push({ dbMatch, reason });
      continue;
    }
    if (usedFixtureIds.has(fixture.fixture.id)) {
      unmatched.push({ dbMatch, reason: `fixture ${fixture.fixture.id} already assigned to another match` });
      continue;
    }

    usedFixtureIds.add(fixture.fixture.id);
    updates.push({ dbMatch, fixture, reason });
  }

  for (const { dbMatch, fixture, reason } of updates) {
    console.log(
      `#${String(dbMatch.match_number).padStart(3)} ${dbMatch.home_team} vs ${dbMatch.away_team}` +
      ` → fixture ${fixture.fixture.id} (${fixture.teams.home.name} vs ${fixture.teams.away.name}) [${reason}]`
    );
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped (api_match_id already set, use --force to overwrite): ${skipped.length}`);
  }

  if (unmatched.length > 0) {
    console.log('\nUNMATCHED — needs manual review:');
    for (const { dbMatch, reason } of unmatched) {
      console.log(`#${String(dbMatch.match_number).padStart(3)} ${dbMatch.home_team} vs ${dbMatch.away_team} @ ${dbMatch.match_date} — ${reason}`);
    }
  }

  console.log(`\nTotal: ${updates.length} to update, ${skipped.length} skipped, ${unmatched.length} unmatched.`);

  if (DRY_RUN) {
    console.log('Dry run — no changes written.');
    return;
  }

  let written = 0;
  for (const { dbMatch, fixture } of updates) {
    const { error } = await supabase
      .from('matches')
      .update({ api_match_id: fixture.fixture.id.toString() })
      .eq('id', dbMatch.id);
    if (error) {
      console.error(`Failed to update match #${dbMatch.match_number}: ${error.message}`);
    } else {
      written++;
    }
  }
  console.log(`Written: ${written}/${updates.length}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
