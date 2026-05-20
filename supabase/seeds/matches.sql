-- Seed: Grupos A y B — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 1-12 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)
-- Ejecutar DESPUÉS de las migraciones. Agregar los 92 partidos restantes antes de abrir registro.

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO A: Mexico · South Africa · South Korea · Czechia
  -- ============================================================
  (1,  'groups', 'A', 'Mexico',       'South Africa', '🇲🇽', '🇿🇦', '2026-06-11 15:00:00-04:00', 'Estadio Azteca, Mexico City',    'scheduled'),
  (2,  'groups', 'A', 'South Korea',  'Czechia',      '🇰🇷', '🇨🇿', '2026-06-11 22:00:00-04:00', 'Estadio Akron, Zapopan',         'scheduled'),
  (5,  'groups', 'A', 'Czechia',      'South Africa', '🇨🇿', '🇿🇦', '2026-06-18 12:00:00-04:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled'),
  (6,  'groups', 'A', 'Mexico',       'South Korea',  '🇲🇽', '🇰🇷', '2026-06-18 21:00:00-04:00', 'Estadio Akron, Zapopan',         'scheduled'),
  (9,  'groups', 'A', 'South Africa', 'South Korea',  '🇿🇦', '🇰🇷', '2026-06-24 21:00:00-04:00', 'Estadio BBVA, Monterrey',        'scheduled'),
  (10, 'groups', 'A', 'Czechia',      'Mexico',       '🇨🇿', '🇲🇽', '2026-06-24 21:00:00-04:00', 'Estadio Azteca, Mexico City',    'scheduled'),

  -- ============================================================
  -- GRUPO B: Canada · Switzerland · Qatar · Bosnia & Herzegovina
  -- ============================================================
  (3,  'groups', 'B', 'Canada',               'Bosnia & Herzegovina', '🇨🇦', '🇧🇦', '2026-06-12 15:00:00-04:00', 'BMO Field, Toronto',           'scheduled'),
  (4,  'groups', 'B', 'Qatar',                'Switzerland',          '🇶🇦', '🇨🇭', '2026-06-13 15:00:00-04:00', 'Levi''s Stadium, Santa Clara', 'scheduled'),
  (7,  'groups', 'B', 'Switzerland',          'Bosnia & Herzegovina', '🇨🇭', '🇧🇦', '2026-06-18 15:00:00-04:00', 'SoFi Stadium, Los Angeles',    'scheduled'),
  (8,  'groups', 'B', 'Canada',               'Qatar',                '🇨🇦', '🇶🇦', '2026-06-18 18:00:00-04:00', 'BC Place, Vancouver',          'scheduled'),
  (11, 'groups', 'B', 'Switzerland',          'Canada',               '🇨🇭', '🇨🇦', '2026-06-24 15:00:00-04:00', 'BC Place, Vancouver',          'scheduled'),
  (12, 'groups', 'B', 'Bosnia & Herzegovina', 'Qatar',                '🇧🇦', '🇶🇦', '2026-06-24 15:00:00-04:00', 'Lumen Field, Seattle',         'scheduled');

-- Seed: Grupos C y D — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 13-24 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO C: Brazil · Morocco · Haiti · Scotland
  -- ============================================================
  (13, 'groups', 'C', 'Brazil',   'Morocco',  '🇧🇷', '🇲🇦', '2026-06-13 18:00:00-04:00', 'MetLife Stadium, East Rutherford',      'scheduled'),
  (14, 'groups', 'C', 'Haiti',    'Scotland', '🇭🇹', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '2026-06-13 21:00:00-04:00', 'Gillette Stadium, Foxboro',             'scheduled'),
  (17, 'groups', 'C', 'Scotland', 'Morocco',  '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🇲🇦', '2026-06-19 18:00:00-04:00', 'Gillette Stadium, Foxboro',             'scheduled'),
  (18, 'groups', 'C', 'Brazil',   'Haiti',    '🇧🇷', '🇭🇹', '2026-06-19 20:30:00-04:00', 'Lincoln Financial Field, Philadelphia', 'scheduled'),
  (21, 'groups', 'C', 'Scotland', 'Brazil',   '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🇧🇷', '2026-06-24 18:00:00-04:00', 'Hard Rock Stadium, Miami',              'scheduled'),
  (22, 'groups', 'C', 'Morocco',  'Haiti',    '🇲🇦', '🇭🇹', '2026-06-24 18:00:00-04:00', 'Mercedes-Benz Stadium, Atlanta',        'scheduled'),

  -- ============================================================
  -- GRUPO D: United States · Paraguay · Australia · Türkiye
  -- ============================================================
  (15, 'groups', 'D', 'United States', 'Paraguay',       '🇺🇸', '🇵🇾', '2026-06-12 21:00:00-04:00', 'SoFi Stadium, Los Angeles',     'scheduled'),
  (16, 'groups', 'D', 'Australia',     'Türkiye',        '🇦🇺', '🇹🇷', '2026-06-13 00:00:00-04:00', 'BC Place, Vancouver',           'scheduled'),
  (19, 'groups', 'D', 'United States', 'Australia',      '🇺🇸', '🇦🇺', '2026-06-19 15:00:00-04:00', 'Lumen Field, Seattle',          'scheduled'),
  (20, 'groups', 'D', 'Türkiye',       'Paraguay',       '🇹🇷', '🇵🇾', '2026-06-19 23:00:00-04:00', 'Levi''s Stadium, Santa Clara',  'scheduled'),
  (23, 'groups', 'D', 'Türkiye',       'United States',  '🇹🇷', '🇺🇸', '2026-06-25 22:00:00-04:00', 'SoFi Stadium, Los Angeles',     'scheduled'),
  (24, 'groups', 'D', 'Paraguay',      'Australia',      '🇵🇾', '🇦🇺', '2026-06-25 22:00:00-04:00', 'Levi''s Stadium, Santa Clara',  'scheduled');

-- Seed: Grupos E y F — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 25-36 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO E: Germany · Curaçao · Ivory Coast · Ecuador
  -- ============================================================
  (25, 'groups', 'E', 'Germany',     'Curaçao',     '🇩🇪', '🇨🇼', '2026-06-14 13:00:00-04:00', 'NRG Stadium, Houston',                  'scheduled'),
  (26, 'groups', 'E', 'Ivory Coast', 'Ecuador',     '🇨🇮', '🇪🇨', '2026-06-14 19:00:00-04:00', 'Lincoln Financial Field, Philadelphia', 'scheduled'),
  (29, 'groups', 'E', 'Germany',     'Ivory Coast', '🇩🇪', '🇨🇮', '2026-06-20 16:00:00-04:00', 'BMO Field, Toronto',                    'scheduled'),
  (30, 'groups', 'E', 'Ecuador',     'Curaçao',     '🇪🇨', '🇨🇼', '2026-06-20 19:00:00-04:00', 'Arrowhead Stadium, Kansas City',         'scheduled'),
  (33, 'groups', 'E', 'Curaçao',     'Ivory Coast', '🇨🇼', '🇨🇮', '2026-06-25 16:00:00-04:00', 'Lincoln Financial Field, Philadelphia', 'scheduled'),
  (34, 'groups', 'E', 'Ecuador',     'Germany',     '🇪🇨', '🇩🇪', '2026-06-25 16:00:00-04:00', 'MetLife Stadium, East Rutherford',      'scheduled'),

  -- ============================================================
  -- GRUPO F: Netherlands · Japan · Sweden · Tunisia
  -- ============================================================
  (27, 'groups', 'F', 'Netherlands', 'Japan',       '🇳🇱', '🇯🇵', '2026-06-14 16:00:00-04:00', 'AT&T Stadium, Arlington',               'scheduled'),
  (28, 'groups', 'F', 'Sweden',      'Tunisia',     '🇸🇪', '🇹🇳', '2026-06-14 22:00:00-04:00', 'Estadio BBVA, Monterrey',               'scheduled'),
  (31, 'groups', 'F', 'Netherlands', 'Sweden',      '🇳🇱', '🇸🇪', '2026-06-20 12:00:00-04:00', 'NRG Stadium, Houston',                  'scheduled'),
  (32, 'groups', 'F', 'Tunisia',     'Japan',       '🇹🇳', '🇯🇵', '2026-06-20 17:00:00-04:00', 'Estadio BBVA, Monterrey',               'scheduled'),
  (35, 'groups', 'F', 'Japan',       'Sweden',      '🇯🇵', '🇸🇪', '2026-06-25 19:00:00-04:00', 'AT&T Stadium, Arlington',               'scheduled'),
  (36, 'groups', 'F', 'Tunisia',     'Netherlands', '🇹🇳', '🇳🇱', '2026-06-25 19:00:00-04:00', 'Arrowhead Stadium, Kansas City',         'scheduled');
