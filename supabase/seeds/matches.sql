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

-- Seed: Grupos G y H — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 37-48 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO G: France · Nigeria · South Korea · Iraq
  -- ============================================================
  (37, 'groups', 'G', 'France',      'Nigeria',     '🇫🇷', '🇳🇬', '2026-06-15 15:00:00-04:00', 'Lumen Field, Seattle',                  'scheduled'),
  (38, 'groups', 'G', 'South Korea', 'Iraq',        '🇰🇷', '🇮🇶', '2026-06-15 21:00:00-04:00', 'SoFi Stadium, Los Angeles',             'scheduled'),
  (41, 'groups', 'G', 'France',      'South Korea', '🇫🇷', '🇰🇷', '2026-06-21 15:00:00-04:00', 'SoFi Stadium, Los Angeles',             'scheduled'),
  (42, 'groups', 'G', 'Iraq',        'Nigeria',     '🇮🇶', '🇳🇬', '2026-06-21 18:00:00-04:00', 'BC Place, Vancouver',                   'scheduled'),
  (45, 'groups', 'G', 'Iraq',        'France',      '🇮🇶', '🇫🇷', '2026-06-26 23:00:00-04:00', 'BC Place, Vancouver',                   'scheduled'),
  (46, 'groups', 'G', 'Nigeria',     'South Korea', '🇳🇬', '🇰🇷', '2026-06-26 23:00:00-04:00', 'Lumen Field, Seattle',                  'scheduled'),

  -- ============================================================
  -- GRUPO H: Spain · Colombia · Morocco · Canada
  -- ============================================================
  (39, 'groups', 'H', 'Spain',       'Colombia',    '🇪🇸', '🇨🇴', '2026-06-15 12:00:00-04:00', 'Mercedes-Benz Stadium, Atlanta',        'scheduled'),
  (40, 'groups', 'H', 'Morocco',     'Canada',      '🇲🇦', '🇨🇦', '2026-06-15 18:00:00-04:00', 'Hard Rock Stadium, Miami',              'scheduled'),
  (43, 'groups', 'H', 'Spain',       'Morocco',     '🇪🇸', '🇲🇦', '2026-06-21 12:00:00-04:00', 'Mercedes-Benz Stadium, Atlanta',        'scheduled'),
  (44, 'groups', 'H', 'Canada',      'Colombia',    '🇨🇦', '🇨🇴', '2026-06-21 18:00:00-04:00', 'Hard Rock Stadium, Miami',              'scheduled'),
  (47, 'groups', 'H', 'Canada',      'Spain',       '🇨🇦', '🇪🇸', '2026-06-26 20:00:00-04:00', 'Estadio Akron, Zapopan',                'scheduled'),
  (48, 'groups', 'H', 'Colombia',    'Morocco',     '🇨🇴', '🇲🇦', '2026-06-26 20:00:00-04:00', 'NRG Stadium, Houston',                  'scheduled');

-- Seed: Grupos I y J — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 49-60 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO I: Italy · Denmark · Saudi Arabia · Benin
  -- ============================================================
  (49, 'groups', 'I', 'Italy',        'Denmark',      '🇮🇹', '🇩🇰', '2026-06-16 15:00:00-04:00', 'MetLife Stadium, East Rutherford',      'scheduled'),
  (50, 'groups', 'I', 'Saudi Arabia', 'Benin',        '🇸🇦', '🇧🇯', '2026-06-16 18:00:00-04:00', 'Gillette Stadium, Foxboro',             'scheduled'),
  (53, 'groups', 'I', 'Italy',        'Saudi Arabia', '🇮🇹', '🇸🇦', '2026-06-22 17:00:00-04:00', 'Lincoln Financial Field, Philadelphia', 'scheduled'),
  (54, 'groups', 'I', 'Benin',        'Denmark',      '🇧🇯', '🇩🇰', '2026-06-22 20:00:00-04:00', 'MetLife Stadium, East Rutherford',      'scheduled'),
  (57, 'groups', 'I', 'Benin',        'Italy',        '🇧🇯', '🇮🇹', '2026-06-26 15:00:00-04:00', 'Gillette Stadium, Foxboro',             'scheduled'),
  (58, 'groups', 'I', 'Denmark',      'Saudi Arabia', '🇩🇰', '🇸🇦', '2026-06-26 15:00:00-04:00', 'BMO Field, Toronto',                    'scheduled'),

  -- ============================================================
  -- GRUPO J: Belgium · Chile · Algeria · Jamaica
  -- ============================================================
  (51, 'groups', 'J', 'Belgium',      'Chile',        '🇧🇪', '🇨🇱', '2026-06-16 21:00:00-04:00', 'Arrowhead Stadium, Kansas City',         'scheduled'),
  (52, 'groups', 'J', 'Algeria',      'Jamaica',      '🇩🇿', '🇯🇲', '2026-06-17 00:00:00-04:00', 'Levi''s Stadium, Santa Clara',           'scheduled'),
  (55, 'groups', 'J', 'Belgium',      'Algeria',      '🇧🇪', '🇩🇿', '2026-06-22 13:00:00-04:00', 'AT&T Stadium, Arlington',               'scheduled'),
  (56, 'groups', 'J', 'Jamaica',      'Chile',        '🇯🇲', '🇨🇱', '2026-06-22 23:00:00-04:00', 'Levi''s Stadium, Santa Clara',           'scheduled'),
  (59, 'groups', 'J', 'Jamaica',      'Belgium',      '🇯🇲', '🇧🇪', '2026-06-27 22:00:00-04:00', 'AT&T Stadium, Arlington',               'scheduled'),
  (60, 'groups', 'J', 'Chile',        'Algeria',      '🇨🇱', '🇩🇿', '2026-06-27 21:00:00-04:00', 'Arrowhead Stadium, Kansas City',         'scheduled');

-- Seed: Grupos K y L — FIFA World Cup 2026
-- Fuente: Sky Sports full fixture (match numbers 61-72 oficiales)
-- Timestamps en UTC-4 (hora Colombia/Venezuela)

INSERT INTO matches (match_number, phase, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES

  -- ============================================================
  -- GRUPO K: Portugal · Ghana · Uruguay · Iceland
  -- ============================================================
  (61, 'groups', 'K', 'Portugal',    'Ghana',       '🇵🇹', '🇬🇭', '2026-06-17 13:00:00-04:00', 'NRG Stadium, Houston',                  'scheduled'),
  (62, 'groups', 'K', 'Uruguay',     'Iceland',     '🇺🇾', '🇮🇸', '2026-06-17 22:00:00-04:00', 'Estadio Azteca, Mexico City',           'scheduled'),
  (65, 'groups', 'K', 'Portugal',    'Uruguay',     '🇵🇹', '🇺🇾', '2026-06-23 13:00:00-04:00', 'NRG Stadium, Houston',                  'scheduled'),
  (66, 'groups', 'K', 'Iceland',     'Ghana',       '🇮🇸', '🇬🇭', '2026-06-23 22:00:00-04:00', 'Estadio Akron, Zapopan',                'scheduled'),
  (69, 'groups', 'K', 'Iceland',     'Portugal',    '🇮🇸', '🇵🇹', '2026-06-27 19:30:00-04:00', 'Hard Rock Stadium, Miami',              'scheduled'),
  (70, 'groups', 'K', 'Ghana',       'Uruguay',     '🇬🇭', '🇺🇾', '2026-06-27 19:30:00-04:00', 'Mercedes-Benz Stadium, Atlanta',        'scheduled'),

  -- ============================================================
  -- GRUPO L: Argentina · Ukraine · Cameroon · New Zealand
  -- ============================================================
  (63, 'groups', 'L', 'Argentina',   'Ukraine',     '🇦🇷', '🇺🇦', '2026-06-17 16:00:00-04:00', 'AT&T Stadium, Arlington',               'scheduled'),
  (64, 'groups', 'L', 'Cameroon',    'New Zealand', '🇨🇲', '🇳🇿', '2026-06-17 19:00:00-04:00', 'BMO Field, Toronto',                    'scheduled'),
  (67, 'groups', 'L', 'Argentina',   'Cameroon',    '🇦🇷', '🇨🇲', '2026-06-23 16:00:00-04:00', 'Gillette Stadium, Foxboro',             'scheduled'),
  (68, 'groups', 'L', 'New Zealand', 'Ukraine',     '🇳🇿', '🇺🇦', '2026-06-23 19:00:00-04:00', 'BMO Field, Toronto',                    'scheduled'),
  (71, 'groups', 'L', 'New Zealand', 'Argentina',   '🇳🇿', '🇦🇷', '2026-06-27 17:00:00-04:00', 'MetLife Stadium, East Rutherford',      'scheduled'),
  (72, 'groups', 'L', 'Ukraine',     'Cameroon',    '🇺🇦', '🇨🇲', '2026-06-27 17:00:00-04:00', 'Lincoln Financial Field, Philadelphia', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Dieciseisavos de Final (r32) - 16 partidos
  -- ============================================================
  (73, 'r32', null, '1A', '2B', null, null, '2026-06-28 15:00:00-04:00', 'TBD', 'scheduled'),
  (74, 'r32', null, '1B', '3C/D/E', null, null, '2026-06-28 19:00:00-04:00', 'TBD', 'scheduled'),
  (75, 'r32', null, '1C', '2D', null, null, '2026-06-29 15:00:00-04:00', 'TBD', 'scheduled'),
  (76, 'r32', null, '1D', '3E/F/G', null, null, '2026-06-29 19:00:00-04:00', 'TBD', 'scheduled'),
  (77, 'r32', null, '1E', '2F', null, null, '2026-06-30 15:00:00-04:00', 'TBD', 'scheduled'),
  (78, 'r32', null, '1F', '3G/H/I', null, null, '2026-06-30 19:00:00-04:00', 'TBD', 'scheduled'),
  (79, 'r32', null, '1G', '2H', null, null, '2026-07-01 15:00:00-04:00', 'TBD', 'scheduled'),
  (80, 'r32', null, '1H', '3J/K/L', null, null, '2026-07-01 19:00:00-04:00', 'TBD', 'scheduled'),
  (81, 'r32', null, '1I', '2J', null, null, '2026-07-02 15:00:00-04:00', 'TBD', 'scheduled'),
  (82, 'r32', null, '1J', '3A/B/C', null, null, '2026-07-02 19:00:00-04:00', 'TBD', 'scheduled'),
  (83, 'r32', null, '1K', '2L', null, null, '2026-07-03 15:00:00-04:00', 'TBD', 'scheduled'),
  (84, 'r32', null, '1L', '3D/E/F', null, null, '2026-07-03 19:00:00-04:00', 'TBD', 'scheduled'),
  (85, 'r32', null, '2A', '2C', null, null, '2026-07-03 19:00:00-04:00', 'TBD', 'scheduled'),
  (86, 'r32', null, '2E', '2G', null, null, '2026-07-03 19:00:00-04:00', 'TBD', 'scheduled'),
  (87, 'r32', null, '2I', '2K', null, null, '2026-07-03 19:00:00-04:00', 'TBD', 'scheduled'),
  (88, 'r32', null, '3H/I/J', '3K/L/A', null, null, '2026-07-03 19:00:00-04:00', 'TBD', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Octavos de Final (r16) - 8 partidos
  -- ============================================================
  (89, 'r16', null, 'W73', 'W74', null, null, '2026-07-04 15:00:00-04:00', 'TBD', 'scheduled'),
  (90, 'r16', null, 'W75', 'W76', null, null, '2026-07-04 19:00:00-04:00', 'TBD', 'scheduled'),
  (91, 'r16', null, 'W77', 'W78', null, null, '2026-07-05 15:00:00-04:00', 'TBD', 'scheduled'),
  (92, 'r16', null, 'W79', 'W80', null, null, '2026-07-05 19:00:00-04:00', 'TBD', 'scheduled'),
  (93, 'r16', null, 'W81', 'W82', null, null, '2026-07-06 15:00:00-04:00', 'TBD', 'scheduled'),
  (94, 'r16', null, 'W83', 'W84', null, null, '2026-07-06 19:00:00-04:00', 'TBD', 'scheduled'),
  (95, 'r16', null, 'W85', 'W86', null, null, '2026-07-07 15:00:00-04:00', 'TBD', 'scheduled'),
  (96, 'r16', null, 'W87', 'W88', null, null, '2026-07-07 19:00:00-04:00', 'TBD', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Cuartos de Final (qf) - 4 partidos
  -- ============================================================
  (97, 'qf', null, 'W89', 'W90', null, null, '2026-07-09 15:00:00-04:00', 'TBD', 'scheduled'),
  (98, 'qf', null, 'W91', 'W92', null, null, '2026-07-09 19:00:00-04:00', 'TBD', 'scheduled'),
  (99, 'qf', null, 'W93', 'W94', null, null, '2026-07-10 15:00:00-04:00', 'TBD', 'scheduled'),
  (100, 'qf', null, 'W95', 'W96', null, null, '2026-07-10 19:00:00-04:00', 'TBD', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Semifinales (sf) - 2 partidos
  -- ============================================================
  (101, 'sf', null, 'W97', 'W98', null, null, '2026-07-14 19:00:00-04:00', 'TBD', 'scheduled'),
  (102, 'sf', null, 'W99', 'W100', null, null, '2026-07-15 19:00:00-04:00', 'TBD', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Tercer Puesto (third) - 1 partido
  -- ============================================================
  (103, 'third', null, 'L101', 'L102', null, null, '2026-07-18 19:00:00-04:00', 'TBD', 'scheduled'),

  -- ============================================================
  -- ELIMINATORIA: Final (final) - 1 partido
  -- ============================================================
  (104, 'final', null, 'W101', 'W102', null, null, '2026-07-19 19:00:00-04:00', 'MetLife Stadium, East Rutherford', 'scheduled');
