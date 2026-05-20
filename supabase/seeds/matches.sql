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
