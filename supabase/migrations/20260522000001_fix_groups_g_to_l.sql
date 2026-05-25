-- Migración: corrige equipos en grupos G–L (match_numbers 37–72)
-- Los equipos originales del seed eran incorrectos.
-- Equipos correctos confirmados contra el sorteo FIFA World Cup 2026.
-- Patrón de fixture mantenido: A vs B, C vs D, A vs C, D vs B, D vs A, B vs C

-- ============================================================
-- GRUPO G: Belgium · Egypt · Iran · New Zealand
-- matches: 37, 38, 41, 42, 45, 46
-- ============================================================
UPDATE matches SET home_team = 'Belgium',     away_team = 'Egypt',       home_flag = '🇧🇪', away_flag = '🇪🇬' WHERE match_number = 37;
UPDATE matches SET home_team = 'Iran',         away_team = 'New Zealand', home_flag = '🇮🇷', away_flag = '🇳🇿' WHERE match_number = 38;
UPDATE matches SET home_team = 'Belgium',     away_team = 'Iran',        home_flag = '🇧🇪', away_flag = '🇮🇷' WHERE match_number = 41;
UPDATE matches SET home_team = 'New Zealand', away_team = 'Egypt',       home_flag = '🇳🇿', away_flag = '🇪🇬' WHERE match_number = 42;
UPDATE matches SET home_team = 'New Zealand', away_team = 'Belgium',     home_flag = '🇳🇿', away_flag = '🇧🇪' WHERE match_number = 45;
UPDATE matches SET home_team = 'Egypt',       away_team = 'Iran',        home_flag = '🇪🇬', away_flag = '🇮🇷' WHERE match_number = 46;

-- ============================================================
-- GRUPO H: Spain · Cape Verde · Saudi Arabia · Uruguay
-- matches: 39, 40, 43, 44, 47, 48
-- ============================================================
UPDATE matches SET home_team = 'Spain',        away_team = 'Cape Verde',   home_flag = '🇪🇸', away_flag = '🇨🇻' WHERE match_number = 39;
UPDATE matches SET home_team = 'Saudi Arabia', away_team = 'Uruguay',      home_flag = '🇸🇦', away_flag = '🇺🇾' WHERE match_number = 40;
UPDATE matches SET home_team = 'Spain',        away_team = 'Saudi Arabia', home_flag = '🇪🇸', away_flag = '🇸🇦' WHERE match_number = 43;
UPDATE matches SET home_team = 'Uruguay',      away_team = 'Cape Verde',   home_flag = '🇺🇾', away_flag = '🇨🇻' WHERE match_number = 44;
UPDATE matches SET home_team = 'Uruguay',      away_team = 'Spain',        home_flag = '🇺🇾', away_flag = '🇪🇸' WHERE match_number = 47;
UPDATE matches SET home_team = 'Cape Verde',   away_team = 'Saudi Arabia', home_flag = '🇨🇻', away_flag = '🇸🇦' WHERE match_number = 48;

-- ============================================================
-- GRUPO I: France · Senegal · Iraq · Norway
-- matches: 49, 50, 53, 54, 57, 58
-- ============================================================
UPDATE matches SET home_team = 'France',  away_team = 'Senegal', home_flag = '🇫🇷', away_flag = '🇸🇳' WHERE match_number = 49;
UPDATE matches SET home_team = 'Iraq',    away_team = 'Norway',  home_flag = '🇮🇶', away_flag = '🇳🇴' WHERE match_number = 50;
UPDATE matches SET home_team = 'France',  away_team = 'Iraq',    home_flag = '🇫🇷', away_flag = '🇮🇶' WHERE match_number = 53;
UPDATE matches SET home_team = 'Norway',  away_team = 'Senegal', home_flag = '🇳🇴', away_flag = '🇸🇳' WHERE match_number = 54;
UPDATE matches SET home_team = 'Norway',  away_team = 'France',  home_flag = '🇳🇴', away_flag = '🇫🇷' WHERE match_number = 57;
UPDATE matches SET home_team = 'Senegal', away_team = 'Iraq',    home_flag = '🇸🇳', away_flag = '🇮🇶' WHERE match_number = 58;

-- ============================================================
-- GRUPO J: Argentina · Algeria · Austria · Jordan
-- matches: 51, 52, 55, 56, 59, 60
-- ============================================================
UPDATE matches SET home_team = 'Argentina', away_team = 'Algeria', home_flag = '🇦🇷', away_flag = '🇩🇿' WHERE match_number = 51;
UPDATE matches SET home_team = 'Austria',   away_team = 'Jordan',  home_flag = '🇦🇹', away_flag = '🇯🇴' WHERE match_number = 52;
UPDATE matches SET home_team = 'Argentina', away_team = 'Austria', home_flag = '🇦🇷', away_flag = '🇦🇹' WHERE match_number = 55;
UPDATE matches SET home_team = 'Jordan',    away_team = 'Algeria', home_flag = '🇯🇴', away_flag = '🇩🇿' WHERE match_number = 56;
UPDATE matches SET home_team = 'Jordan',    away_team = 'Argentina', home_flag = '🇯🇴', away_flag = '🇦🇷' WHERE match_number = 59;
UPDATE matches SET home_team = 'Algeria',   away_team = 'Austria', home_flag = '🇩🇿', away_flag = '🇦🇹' WHERE match_number = 60;

-- ============================================================
-- GRUPO K: Portugal · DR Congo · Uzbekistan · Colombia
-- matches: 61, 62, 65, 66, 69, 70
-- ============================================================
UPDATE matches SET home_team = 'Portugal',   away_team = 'DR Congo',   home_flag = '🇵🇹', away_flag = '🇨🇩' WHERE match_number = 61;
UPDATE matches SET home_team = 'Uzbekistan', away_team = 'Colombia',   home_flag = '🇺🇿', away_flag = '🇨🇴' WHERE match_number = 62;
UPDATE matches SET home_team = 'Portugal',   away_team = 'Uzbekistan', home_flag = '🇵🇹', away_flag = '🇺🇿' WHERE match_number = 65;
UPDATE matches SET home_team = 'Colombia',   away_team = 'DR Congo',   home_flag = '🇨🇴', away_flag = '🇨🇩' WHERE match_number = 66;
UPDATE matches SET home_team = 'Colombia',   away_team = 'Portugal',   home_flag = '🇨🇴', away_flag = '🇵🇹' WHERE match_number = 69;
UPDATE matches SET home_team = 'DR Congo',   away_team = 'Uzbekistan', home_flag = '🇨🇩', away_flag = '🇺🇿' WHERE match_number = 70;

-- ============================================================
-- GRUPO L: England · Croatia · Ghana · Panama
-- matches: 63, 64, 67, 68, 71, 72
-- ============================================================
UPDATE matches SET home_team = 'England', away_team = 'Croatia', home_flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag = '🇭🇷' WHERE match_number = 63;
UPDATE matches SET home_team = 'Ghana',   away_team = 'Panama',  home_flag = '🇬🇭', away_flag = '🇵🇦' WHERE match_number = 64;
UPDATE matches SET home_team = 'England', away_team = 'Ghana',   home_flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag = '🇬🇭' WHERE match_number = 67;
UPDATE matches SET home_team = 'Panama',  away_team = 'Croatia', home_flag = '🇵🇦', away_flag = '🇭🇷' WHERE match_number = 68;
UPDATE matches SET home_team = 'Panama',  away_team = 'England', home_flag = '🇵🇦', away_flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿' WHERE match_number = 71;
UPDATE matches SET home_team = 'Croatia', away_team = 'Ghana',   home_flag = '🇭🇷', away_flag = '🇬🇭' WHERE match_number = 72;
