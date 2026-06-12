-- ============================================================
--  PENCA DEL MUNDIAL 2026 — Script 01: Crear Base de Datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS penca_mundial2026
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE penca_mundial2026;

-- -------------------------
-- Tabla: participantes
-- -------------------------
CREATE TABLE IF NOT EXISTS participantes (
    id_participante INT           AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    es_admin        BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_registro  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE
);

-- -------------------------
-- Tabla: equipos
-- -------------------------
CREATE TABLE IF NOT EXISTS equipos (
    id_equipo      INT          AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    nombre_corto   VARCHAR(50)  NOT NULL,
    codigo_fifa    CHAR(3)      NOT NULL UNIQUE,
    confederacion  VARCHAR(10)  NOT NULL,
    grupo          CHAR(1)      NOT NULL,
    bandera_url    VARCHAR(255)
);

-- -------------------------
-- Tabla: partidos
-- -------------------------
CREATE TABLE IF NOT EXISTS partidos (
    id_partido    INT          AUTO_INCREMENT PRIMARY KEY,
    id_local      INT          NOT NULL,
    id_visitante  INT          NOT NULL,
    fecha_hora    DATETIME     NOT NULL,
    grupo         CHAR(1),
    estadio       VARCHAR(150),
    ciudad        VARCHAR(100),
    pais_sede     VARCHAR(50),
    fase          ENUM('grupos','octavos','cuartos','semi','tercer_lugar','final') NOT NULL DEFAULT 'grupos',
    numero_partido INT,
    FOREIGN KEY (id_local)     REFERENCES equipos(id_equipo) ON UPDATE CASCADE,
    FOREIGN KEY (id_visitante) REFERENCES equipos(id_equipo) ON UPDATE CASCADE
);

-- -------------------------
-- Tabla: resultados
-- -------------------------
CREATE TABLE IF NOT EXISTS resultados (
    id_resultado     INT     AUTO_INCREMENT PRIMARY KEY,
    id_partido       INT     NOT NULL UNIQUE,
    goles_local      TINYINT UNSIGNED NOT NULL,
    goles_visitante  TINYINT UNSIGNED NOT NULL,
    estado           ENUM('programado','en_juego','finalizado') NOT NULL DEFAULT 'programado',
    ingresado_por    INT,
    ingresado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_partido)    REFERENCES partidos(id_partido)       ON UPDATE CASCADE,
    FOREIGN KEY (ingresado_por) REFERENCES participantes(id_participante) ON UPDATE CASCADE
);

-- -------------------------
-- Tabla: pronosticos
-- -------------------------
CREATE TABLE IF NOT EXISTS pronosticos (
    id_pronostico    INT     AUTO_INCREMENT PRIMARY KEY,
    id_participante  INT     NOT NULL,
    id_partido       INT     NOT NULL,
    goles_local      TINYINT UNSIGNED NOT NULL,
    goles_visitante  TINYINT UNSIGNED NOT NULL,
    fecha_ingreso    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_part_partido (id_participante, id_partido),
    FOREIGN KEY (id_participante) REFERENCES participantes(id_participante) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_partido)      REFERENCES partidos(id_partido)           ON UPDATE CASCADE
);

-- -------------------------
-- Tabla: puntajes
-- -------------------------
CREATE TABLE IF NOT EXISTS puntajes (
    id_puntaje       INT         AUTO_INCREMENT PRIMARY KEY,
    id_participante  INT         NOT NULL,
    id_partido       INT         NOT NULL,
    puntos           TINYINT     NOT NULL DEFAULT 0,
    tipo_acierto     ENUM('exacto','diferencia','ganador','incorrecto') NOT NULL,
    calculado_en     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pts_part_partido (id_participante, id_partido),
    FOREIGN KEY (id_participante) REFERENCES participantes(id_participante) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_partido)      REFERENCES partidos(id_partido)           ON UPDATE CASCADE
);

-- =========================================================
-- Vista: v_ranking  (clasificación general)
-- =========================================================
CREATE OR REPLACE VIEW v_ranking AS
SELECT
    p.id_participante,
    p.nombre,
    p.email,
    COALESCE(SUM(pt.puntos), 0)                                                   AS total_puntos,
    COUNT(CASE WHEN pt.tipo_acierto = 'exacto'      THEN 1 END)                   AS exactos,
    COUNT(CASE WHEN pt.tipo_acierto = 'diferencia'  THEN 1 END)                   AS diferencias,
    COUNT(CASE WHEN pt.tipo_acierto = 'ganador'     THEN 1 END)                   AS ganadores,
    COUNT(CASE WHEN pt.tipo_acierto = 'incorrecto'  THEN 1 END)                   AS incorrectos,
    COUNT(pt.id_puntaje)                                                           AS partidos_jugados,
    CASE WHEN COUNT(pt.id_puntaje) > 0
         THEN ROUND(COUNT(CASE WHEN pt.tipo_acierto != 'incorrecto' THEN 1 END)
                    * 100.0 / COUNT(pt.id_puntaje), 1)
         ELSE 0 END                                                                AS pct_acierto,
    RANK() OVER (ORDER BY COALESCE(SUM(pt.puntos), 0) DESC)                       AS posicion
FROM participantes p
LEFT JOIN puntajes pt ON p.id_participante = pt.id_participante
WHERE p.activo = TRUE AND p.es_admin = FALSE
GROUP BY p.id_participante, p.nombre, p.email;

-- =========================================================
-- Vista: v_partidos_completos  (partidos con nombres)
-- =========================================================
CREATE OR REPLACE VIEW v_partidos_completos AS
SELECT
    pa.id_partido,
    pa.numero_partido,
    el.nombre          AS equipo_local,
    el.codigo_fifa     AS codigo_local,
    ev.nombre          AS equipo_visitante,
    ev.codigo_fifa     AS codigo_visitante,
    pa.fecha_hora,
    pa.grupo,
    pa.estadio,
    pa.ciudad,
    pa.pais_sede,
    pa.fase,
    r.goles_local,
    r.goles_visitante,
    r.estado
FROM partidos pa
JOIN equipos el ON pa.id_local      = el.id_equipo
JOIN equipos ev ON pa.id_visitante  = ev.id_equipo
LEFT JOIN resultados r ON pa.id_partido = r.id_partido
ORDER BY pa.fecha_hora;

-- =========================================================
-- Stored Procedure: calcular_puntajes_partido
-- =========================================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS calcular_puntajes_partido(IN p_id_partido INT)
BEGIN
    DECLARE v_gl_real INT;
    DECLARE v_gv_real INT;

    SELECT goles_local, goles_visitante
      INTO v_gl_real, v_gv_real
      FROM resultados
     WHERE id_partido = p_id_partido AND estado = 'finalizado';

    IF v_gl_real IS NOT NULL THEN
        INSERT INTO puntajes (id_participante, id_partido, puntos, tipo_acierto)
        SELECT
            pr.id_participante,
            pr.id_partido,
            CASE
                WHEN pr.goles_local = v_gl_real AND pr.goles_visitante = v_gv_real
                     THEN 3
                WHEN (pr.goles_local - pr.goles_visitante) = (v_gl_real - v_gv_real)
                     AND pr.goles_local != v_gl_real
                     THEN 2
                WHEN SIGN(pr.goles_local - pr.goles_visitante)
                   = SIGN(v_gl_real - v_gv_real)
                     THEN 1
                ELSE 0
            END AS puntos,
            CASE
                WHEN pr.goles_local = v_gl_real AND pr.goles_visitante = v_gv_real
                     THEN 'exacto'
                WHEN (pr.goles_local - pr.goles_visitante) = (v_gl_real - v_gv_real)
                     AND pr.goles_local != v_gl_real
                     THEN 'diferencia'
                WHEN SIGN(pr.goles_local - pr.goles_visitante)
                   = SIGN(v_gl_real - v_gv_real)
                     THEN 'ganador'
                ELSE 'incorrecto'
            END AS tipo_acierto
        FROM pronosticos pr
        WHERE pr.id_partido = p_id_partido
        ON DUPLICATE KEY UPDATE
            puntos       = VALUES(puntos),
            tipo_acierto = VALUES(tipo_acierto),
            calculado_en = CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;
