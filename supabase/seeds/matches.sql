-- Seed: Grupos A y B — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 1-12 oficiales)
-- Timestamps en UTC-5 (hora centro México / CDT)
-- Ejecutar DESPUÉS de las migraciones. Agregar los 92 partidos restantes antes de abrir registro.

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO A: Mexico · South Africa · South Korea · Czechia
  -- ============================================================
  (1,  'groups', 'A', 'Mexico',       'South Africa', '🇲🇽', '🇿🇦', '2026-06-11 14:00:00-05:00', 'Estadio Azteca, Mexico City',    'scheduled'),
  (2,  'groups', 'A', 'South Korea',  'Czechia',      '🇰🇷', '🇨🇿', '2026-06-11 21:00:00-05:00', 'Estadio Akron, Zapopan',         'scheduled'),
  (5,  'groups', 'A', 'Czechia',      'South Africa', '🇨🇿', '🇿🇦', '2026-06-18 11:00:00-05:00', 'Mercedes-Benz Stadium, Atlanta', 'scheduled'),
  (6,  'groups', 'A', 'Mexico',       'South Korea',  '🇲🇽', '🇰🇷', '2026-06-18 20:00:00-05:00', 'Estadio Akron, Zapopan',         'scheduled'),
  (9,  'groups', 'A', 'South Africa', 'South Korea',  '🇿🇦', '🇰🇷', '2026-06-24 20:00:00-05:00', 'Estadio BBVA, Monterrey',        'scheduled'),
  (10, 'groups', 'A', 'Czechia',      'Mexico',       '🇨🇿', '🇲🇽', '2026-06-24 20:00:00-05:00', 'Estadio Azteca, Mexico City',    'scheduled'),

  -- ============================================================
  -- GRUPO B: Canada · Switzerland · Qatar · Bosnia & Herzegovina
  -- ============================================================
  (3,  'groups', 'B', 'Canada',               'Bosnia & Herzegovina', '🇨🇦', '🇧🇦', '2026-06-12 14:00:00-05:00', 'BMO Field, Toronto',           'scheduled'),
  (4,  'groups', 'B', 'Qatar',                'Switzerland',          '🇶🇦', '🇨🇭', '2026-06-13 14:00:00-05:00', 'Levi''s Stadium, Santa Clara', 'scheduled'),
  (7,  'groups', 'B', 'Switzerland',          'Bosnia & Herzegovina', '🇨🇭', '🇧🇦', '2026-06-18 14:00:00-05:00', 'SoFi Stadium, Los Angeles',    'scheduled'),
  (8,  'groups', 'B', 'Canada',               'Qatar',                '🇨🇦', '🇶🇦', '2026-06-18 17:00:00-05:00', 'BC Place, Vancouver',          'scheduled'),
  (11, 'groups', 'B', 'Switzerland',          'Canada',               '🇨🇭', '🇨🇦', '2026-06-24 14:00:00-05:00', 'BC Place, Vancouver',          'scheduled'),
  (12, 'groups', 'B', 'Bosnia & Herzegovina', 'Qatar',                '🇧🇦', '🇶🇦', '2026-06-24 14:00:00-05:00', 'Lumen Field, Seattle',         'scheduled');
