import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFixturesByIds, mapApiFootballStatus } from '@/lib/api-football/client';
import { Database } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow more time for cron tasks if needed

export async function GET(request: Request) {
  try {
    // 1. Verify CRON_SECRET
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Initialize Supabase Admin Client
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Find matches that need updating
    // - scheduled for today (or past)
    // - or currently 'live'
    // - or 'scheduled' but match_date is in the past
    
    const now = new Date().toISOString();
    
    const { data, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select('id, api_match_id, status, match_date')
      .not('api_match_id', 'is', null)
      .or(`status.eq.live,and(status.eq.scheduled,match_date.lte.${now})`);
      
    const matchesToUpdate = data as unknown as import('@/types').Match[];

    if (fetchError) {
      throw new Error(`Failed to fetch matches: ${fetchError.message}`);
    }

    if (!matchesToUpdate || matchesToUpdate.length === 0) {
      return NextResponse.json({ message: 'No matches to update' });
    }

    const apiMatchIds = matchesToUpdate.map(m => m.api_match_id!).filter(Boolean);
    
    // 4. Fetch real status from API-Football
    const apiData = await getFixturesByIds(apiMatchIds);
    
    const results = [];

    // 5. Update matches and trigger recalculation if finished
    for (const apiMatch of apiData.response) {
      const matchDb = matchesToUpdate.find(m => m.api_match_id === apiMatch.fixture.id.toString());
      if (!matchDb) continue;

      const newStatus = mapApiFootballStatus(apiMatch.fixture.status.short);
      const homeScore = apiMatch.goals.home;
      const awayScore = apiMatch.goals.away;

      // Only update if there's a change or it's live (to update scores)
      if (
        matchDb.status !== newStatus || 
        (newStatus === 'live') ||
        (newStatus === 'finished')
      ) {
        const { error: updateError } = await (supabaseAdmin.from('matches') as any)
          .update({
            status: newStatus,
            home_score: homeScore ?? null,
            away_score: awayScore ?? null,
          })
          .eq('id', matchDb.id);

        if (updateError) {
          console.error(`Failed to update match ${matchDb.id}:`, updateError);
          results.push({ match_id: matchDb.id, status: 'error', message: updateError.message });
          continue;
        }

        // 6. If match changed to finished, calculate points
        if (newStatus === 'finished' && matchDb.status !== 'finished') {
          const { error: rpcError } = await supabaseAdmin
            .rpc('calculate_match_points' as any, { match_id: matchDb.id } as any);
            
          if (rpcError) {
            console.error(`Failed to calculate points for match ${matchDb.id}:`, rpcError);
            results.push({ match_id: matchDb.id, status: 'error_rpc', message: rpcError.message });
          } else {
            results.push({ match_id: matchDb.id, status: 'finished_and_calculated' });
          }
        } else {
          results.push({ match_id: matchDb.id, status: `updated_to_${newStatus}` });
        }
      }
    }

    return NextResponse.json({
      message: 'Cron job executed successfully',
      processed: matchesToUpdate.length,
      results
    });

  } catch (error) {
    console.error('CRON update-matches error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
