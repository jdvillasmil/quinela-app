-- ============================================================
-- Migration 20260701000003: r32_onward_venues
--
-- Loads real venues for matches 73-104 (R32 through Final),
-- replacing the 'TBD' placeholder from the original seed now
-- that FIFA has confirmed all venues through the final.
-- Mapped 1:1 by match_number, which already aligns with FIFA's
-- official match numbering (verified: match_number 73 = Sudáfrica
-- v Canadá = Estadio Los Ángeles in both seed and source).
-- ============================================================

update matches set venue = 'Estadio Los Ángeles' where match_number = 73;
update matches set venue = 'Estadio Boston' where match_number = 74;
update matches set venue = 'Estadio Monterrey' where match_number = 75;
update matches set venue = 'Estadio Houston' where match_number = 76;
update matches set venue = 'Estadio Nueva York Nueva Jersey' where match_number = 77;
update matches set venue = 'Estadio Dallas' where match_number = 78;
update matches set venue = 'Estadio Ciudad de México' where match_number = 79;
update matches set venue = 'Estadio Atlanta' where match_number = 80;
update matches set venue = 'Estadio Bahía de San Francisco' where match_number = 81;
update matches set venue = 'Estadio Seattle' where match_number = 82;
update matches set venue = 'Estadio Toronto' where match_number = 83;
update matches set venue = 'Estadio Los Ángeles' where match_number = 84;
update matches set venue = 'Estadio BC Place Vancouver' where match_number = 85;
update matches set venue = 'Estadio Miami' where match_number = 86;
update matches set venue = 'Estadio Kansas City' where match_number = 87;
update matches set venue = 'Estadio Dallas' where match_number = 88;
update matches set venue = 'Estadio Filadelfia' where match_number = 89;
update matches set venue = 'Estadio Houston' where match_number = 90;
update matches set venue = 'Estadio Nueva York Nueva Jersey' where match_number = 91;
update matches set venue = 'Estadio Ciudad de México' where match_number = 92;
update matches set venue = 'Estadio Dallas' where match_number = 93;
update matches set venue = 'Estadio Seattle' where match_number = 94;
update matches set venue = 'Estadio Atlanta' where match_number = 95;
update matches set venue = 'Estadio BC Place Vancouver' where match_number = 96;
update matches set venue = 'Estadio Boston' where match_number = 97;
update matches set venue = 'Estadio Los Ángeles' where match_number = 98;
update matches set venue = 'Estadio Miami' where match_number = 99;
update matches set venue = 'Estadio Kansas City' where match_number = 100;
update matches set venue = 'Estadio Dallas' where match_number = 101;
update matches set venue = 'Estadio Atlanta' where match_number = 102;
update matches set venue = 'Estadio Miami' where match_number = 103;   -- tercer puesto
update matches set venue = 'Estadio Nueva York Nueva Jersey' where match_number = 104; -- final