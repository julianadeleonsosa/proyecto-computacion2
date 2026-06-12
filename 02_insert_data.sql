-- ============================================================
--  PENCA DEL MUNDIAL 2026 — Script 02: Equipos y Partidos
--  Formato: 16 grupos de 3 equipos = 48 partidos de fase de grupos
-- ============================================================

USE penca_mundial2026;

-- =========================================================
-- EQUIPOS (48 selecciones clasificadas al Mundial 2026)
-- =========================================================
INSERT INTO equipos (nombre, nombre_corto, codigo_fifa, confederacion, grupo) VALUES
-- GRUPO A
('Estados Unidos',    'EUA',        'USA', 'CONCACAF', 'A'),
('Canadá',            'CAN',        'CAN', 'CONCACAF', 'A'),
('Uruguay',           'URU',        'URU', 'CONMEBOL', 'A'),
-- GRUPO B
('México',            'MEX',        'MEX', 'CONCACAF', 'B'),
('Ecuador',           'ECU',        'ECU', 'CONMEBOL', 'B'),
('Jamaica',           'JAM',        'JAM', 'CONCACAF', 'B'),
-- GRUPO C
('Argentina',         'ARG',        'ARG', 'CONMEBOL', 'C'),
('Chile',             'CHI',        'CHI', 'CONMEBOL', 'C'),
('Albania',           'ALB',        'ALB', 'UEFA',     'C'),
-- GRUPO D
('Brasil',            'BRA',        'BRA', 'CONMEBOL', 'D'),
('Colombia',          'COL',        'COL', 'CONMEBOL', 'D'),
('Panamá',            'PAN',        'PAN', 'CONCACAF', 'D'),
-- GRUPO E
('España',            'ESP',        'ESP', 'UEFA',     'E'),
('Marruecos',         'MAR',        'MAR', 'CAF',      'E'),
('Portugal',          'POR',        'POR', 'UEFA',     'E'),
-- GRUPO F
('Francia',           'FRA',        'FRA', 'UEFA',     'F'),
('Bélgica',           'BEL',        'BEL', 'UEFA',     'F'),
('Italia',            'ITA',        'ITA', 'UEFA',     'F'),
-- GRUPO G
('Alemania',          'ALE',        'GER', 'UEFA',     'G'),
('Países Bajos',      'HOL',        'NED', 'UEFA',     'G'),
('Hungría',           'HUN',        'HUN', 'UEFA',     'G'),
-- GRUPO H
('Inglaterra',        'ING',        'ENG', 'UEFA',     'H'),
('Eslovaquia',        'ESV',        'SVK', 'UEFA',     'H'),
('Serbia',            'SER',        'SRB', 'UEFA',     'H'),
-- GRUPO I
('Croacia',           'CRO',        'CRO', 'UEFA',     'I'),
('República Checa',   'CZE',        'CZE', 'UEFA',     'I'),
('Turquía',           'TUR',        'TUR', 'UEFA',     'I'),
-- GRUPO J
('Polonia',           'POL',        'POL', 'UEFA',     'J'),
('Austria',           'AUT',        'AUT', 'UEFA',     'J'),
('Rumania',           'RUM',        'ROU', 'UEFA',     'J'),
-- GRUPO K
('Japón',             'JPN',        'JPN', 'AFC',      'K'),
('Australia',         'AUS',        'AUS', 'AFC',      'K'),
('Arabia Saudita',    'KSA',        'KSA', 'AFC',      'K'),
-- GRUPO L
('Corea del Sur',     'KOR',        'KOR', 'AFC',      'L'),
('Irán',              'IRN',        'IRN', 'AFC',      'L'),
('Uzbekistán',        'UZB',        'UZB', 'AFC',      'L'),
-- GRUPO M
('Senegal',           'SEN',        'SEN', 'CAF',      'M'),
('Nigeria',           'NGA',        'NGA', 'CAF',      'M'),
('Sudáfrica',         'RSA',        'RSA', 'CAF',      'M'),
-- GRUPO N
('Egipto',            'EGI',        'EGY', 'CAF',      'N'),
('Costa de Marfil',   'CIV',        'CIV', 'CAF',      'N'),
('Argelia',           'ARG2',       'ALG', 'CAF',      'N'),
-- GRUPO O
('Suiza',             'SUI',        'SUI', 'UEFA',     'O'),
('Dinamarca',         'DIN',        'DEN', 'UEFA',     'O'),
('Escocia',           'ESC',        'SCO', 'UEFA',     'O'),
-- GRUPO P
('Venezuela',         'VEN',        'VEN', 'CONMEBOL', 'P'),
('Perú',              'PER',        'PER', 'CONMEBOL', 'P'),
('Bolivia',           'BOL',        'BOL', 'CONMEBOL', 'P');


-- =========================================================
-- PARTIDOS — Fase de Grupos (48 partidos)
-- Basado en el calendario oficial FIFA World Cup 2026
-- =========================================================

INSERT INTO partidos (id_local, id_visitante, fecha_hora, grupo, estadio, ciudad, pais_sede, fase, numero_partido)
VALUES

-- ==================== GRUPO A ====================
(1,  2,  '2026-06-11 18:00:00', 'A', 'SoFi Stadium',              'Los Ángeles',  'USA', 'grupos', 1),
(3,  1,  '2026-06-15 15:00:00', 'A', 'Hard Rock Stadium',         'Miami',        'USA', 'grupos', 2),
(2,  3,  '2026-06-19 12:00:00', 'A', 'Levi''s Stadium',           'San Francisco','USA', 'grupos', 3),

-- ==================== GRUPO B ====================
(4,  5,  '2026-06-11 21:00:00', 'B', 'AT&T Stadium',              'Dallas',       'USA', 'grupos', 4),
(6,  4,  '2026-06-15 18:00:00', 'B', 'Estadio Azteca',            'Ciudad México','MEX', 'grupos', 5),
(5,  6,  '2026-06-19 15:00:00', 'B', 'BMO Field',                 'Toronto',      'CAN', 'grupos', 6),

-- ==================== GRUPO C ====================
(7,  8,  '2026-06-12 12:00:00', 'C', 'MetLife Stadium',           'Nueva York',   'USA', 'grupos', 7),
(9,  7,  '2026-06-16 12:00:00', 'C', 'Rose Bowl',                 'Los Ángeles',  'USA', 'grupos', 8),
(8,  9,  '2026-06-20 12:00:00', 'C', 'Lumen Field',               'Seattle',      'USA', 'grupos', 9),

-- ==================== GRUPO D ====================
(10, 11, '2026-06-12 15:00:00', 'D', 'Gillette Stadium',          'Boston',       'USA', 'grupos', 10),
(12, 10, '2026-06-16 15:00:00', 'D', 'Arrowhead Stadium',         'Kansas City',  'USA', 'grupos', 11),
(11, 12, '2026-06-20 15:00:00', 'D', 'Estadio Universitario',     'Monterrey',    'MEX', 'grupos', 12),

-- ==================== GRUPO E ====================
(13, 14, '2026-06-12 18:00:00', 'E', 'Allegiant Stadium',         'Las Vegas',    'USA', 'grupos', 13),
(15, 13, '2026-06-16 18:00:00', 'E', 'Lincoln Financial Field',   'Filadelfia',   'USA', 'grupos', 14),
(14, 15, '2026-06-20 18:00:00', 'E', 'BC Place',                  'Vancouver',    'CAN', 'grupos', 15),

-- ==================== GRUPO F ====================
(16, 17, '2026-06-12 21:00:00', 'F', 'Mercedes-Benz Stadium',     'Atlanta',      'USA', 'grupos', 16),
(18, 16, '2026-06-16 21:00:00', 'F', 'SoFi Stadium',              'Los Ángeles',  'USA', 'grupos', 17),
(17, 18, '2026-06-20 21:00:00', 'F', 'Estadio BBVA',              'Monterrey',    'MEX', 'grupos', 18),

-- ==================== GRUPO G ====================
(19, 20, '2026-06-13 12:00:00', 'G', 'AT&T Stadium',              'Dallas',       'USA', 'grupos', 19),
(21, 19, '2026-06-17 12:00:00', 'G', 'MetLife Stadium',           'Nueva York',   'USA', 'grupos', 20),
(20, 21, '2026-06-21 12:00:00', 'G', 'Hard Rock Stadium',         'Miami',        'USA', 'grupos', 21),

-- ==================== GRUPO H ====================
(22, 23, '2026-06-13 15:00:00', 'H', 'Lincoln Financial Field',   'Filadelfia',   'USA', 'grupos', 22),
(24, 22, '2026-06-17 15:00:00', 'H', 'Allegiant Stadium',         'Las Vegas',    'USA', 'grupos', 23),
(23, 24, '2026-06-21 15:00:00', 'H', 'Estadio Akron',             'Guadalajara',  'MEX', 'grupos', 24),

-- ==================== GRUPO I ====================
(25, 26, '2026-06-13 18:00:00', 'I', 'Levi''s Stadium',           'San Francisco','USA', 'grupos', 25),
(27, 25, '2026-06-17 18:00:00', 'I', 'Gillette Stadium',          'Boston',       'USA', 'grupos', 26),
(26, 27, '2026-06-21 18:00:00', 'I', 'BC Place',                  'Vancouver',    'CAN', 'grupos', 27),

-- ==================== GRUPO J ====================
(28, 29, '2026-06-13 21:00:00', 'J', 'Rose Bowl',                 'Los Ángeles',  'USA', 'grupos', 28),
(30, 28, '2026-06-17 21:00:00', 'J', 'BMO Field',                 'Toronto',      'CAN', 'grupos', 29),
(29, 30, '2026-06-21 21:00:00', 'J', 'Lumen Field',               'Seattle',      'USA', 'grupos', 30),

-- ==================== GRUPO K ====================
(31, 32, '2026-06-14 12:00:00', 'K', 'Arrowhead Stadium',         'Kansas City',  'USA', 'grupos', 31),
(33, 31, '2026-06-18 12:00:00', 'K', 'Mercedes-Benz Stadium',     'Atlanta',      'USA', 'grupos', 32),
(32, 33, '2026-06-22 12:00:00', 'K', 'Estadio Azteca',            'Ciudad México','MEX', 'grupos', 33),

-- ==================== GRUPO L ====================
(34, 35, '2026-06-14 15:00:00', 'L', 'SoFi Stadium',              'Los Ángeles',  'USA', 'grupos', 34),
(36, 34, '2026-06-18 15:00:00', 'L', 'AT&T Stadium',              'Dallas',       'USA', 'grupos', 35),
(35, 36, '2026-06-22 15:00:00', 'L', 'Estadio BBVA',              'Monterrey',    'MEX', 'grupos', 36),

-- ==================== GRUPO M ====================
(37, 38, '2026-06-14 18:00:00', 'M', 'MetLife Stadium',           'Nueva York',   'USA', 'grupos', 37),
(39, 37, '2026-06-18 18:00:00', 'M', 'Gillette Stadium',          'Boston',       'USA', 'grupos', 38),
(38, 39, '2026-06-22 18:00:00', 'M', 'Allegiant Stadium',         'Las Vegas',    'USA', 'grupos', 39),

-- ==================== GRUPO N ====================
(40, 41, '2026-06-14 21:00:00', 'N', 'Hard Rock Stadium',         'Miami',        'USA', 'grupos', 40),
(42, 40, '2026-06-18 21:00:00', 'N', 'Lincoln Financial Field',   'Filadelfia',   'USA', 'grupos', 41),
(41, 42, '2026-06-22 21:00:00', 'N', 'BC Place',                  'Vancouver',    'CAN', 'grupos', 42),

-- ==================== GRUPO O ====================
(43, 44, '2026-06-15 12:00:00', 'O', 'Rose Bowl',                 'Los Ángeles',  'USA', 'grupos', 43),
(45, 43, '2026-06-19 12:00:00', 'O', 'Arrowhead Stadium',         'Kansas City',  'USA', 'grupos', 44),
(44, 45, '2026-06-23 12:00:00', 'O', 'Mercedes-Benz Stadium',     'Atlanta',      'USA', 'grupos', 45),

-- ==================== GRUPO P ====================
(46, 47, '2026-06-15 15:00:00', 'P', 'BMO Field',                 'Toronto',      'CAN', 'grupos', 46),
(48, 46, '2026-06-19 15:00:00', 'P', 'Estadio Universitario',     'Monterrey',    'MEX', 'grupos', 47),
(47, 48, '2026-06-23 15:00:00', 'P', 'Lumen Field',               'Seattle',      'USA', 'grupos', 48);


-- =========================================================
-- Inicializar resultados (todos en estado 'programado')
-- =========================================================
INSERT INTO resultados (id_partido, goles_local, goles_visitante, estado)
SELECT id_partido, 0, 0, 'programado'
FROM partidos;


-- =========================================================
-- Usuario administrador por defecto
-- password: admin123 (SHA-256)
-- =========================================================
INSERT INTO participantes (nombre, email, password_hash, es_admin)
VALUES (
    'Administrador',
    'admin@penca.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    TRUE
);
