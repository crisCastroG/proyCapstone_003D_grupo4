BEGIN;

-- =========================================================
-- 1. INSERTS PARA LA TABLA REGION 
-- =========================================================
INSERT INTO public.region (nombre_region) VALUES
    ('Región de Arica y Parinacota'),
    ('Región de Tarapacá'),
    ('Región de Antofagasta'),
    ('Región de Atacama'),
    ('Región de Coquimbo'),
    ('Región de Valparaíso'),
    ('Región Metropolitana de Santiago'),
    ('Región del Libertador General Bernardo O''Higgins'),
    ('Región del Maule'),
    ('Región de Ñuble'),
    ('Región del Biobío'),
    ('Región de La Araucanía'),
    ('Región de Los Ríos'),
    ('Región de Los Lagos'),
    ('Región de Aysén del General Carlos Ibáñez del Campo'),
    ('Región de Magallanes y de la Antártica Chilena')
ON CONFLICT (nombre_region) DO NOTHING;

-- =========================================================
-- 2. INSERTAR LAS CIUDADES DIRECTO EN public.ciudad
-- =========================================================
INSERT INTO public.ciudad (nombre_ciudad, region_id_region) VALUES
    -- 1: Arica y Parinacota
    ('Arica', 1),
    ('Putre', 1),
    -- 2: Tarapacá
    ('Iquique', 2),
    ('Alto Hospicio', 2),
    ('Pozo Almonte', 2),
    -- 3: Antofagasta
    ('Antofagasta', 3),
    ('Calama', 3),
    ('Tocopilla', 3),
    ('Mejillones', 3),
    -- 4: Atacama
    ('Copiapó', 4),
    ('Vallenar', 4),
    ('Caldera', 4),
    ('Chañaral', 4),
    -- 5: Coquimbo
    ('La Serena', 5),
    ('Coquimbo', 5),
    ('Ovalle', 5),
    ('Illapel', 5),
    -- 6: Valparaíso
    ('Valparaíso', 6),
    ('Viña del Mar', 6),
    ('Quilpué', 6),
    ('Villa Alemana', 6),
    ('San Antonio', 6),
    ('Quillota', 6),
    ('Los Andes', 6),
    ('San Felipe', 6),
    -- 7: Metropolitana
    ('Santiago', 7),
    ('Providencia', 7),
    ('Las Condes', 7),
    ('Maipú', 7),
    ('Puente Alto', 7),
    ('Ñuñoa', 7),
    ('La Florida', 7),
    ('San Bernardo', 7),
    ('Colina', 7),
    ('Melipilla', 7),
    ('Talagante', 7),
    -- 8: O'Higgins
    ('Rancagua', 8),
    ('San Fernando', 8),
    ('Rengo', 8),
    ('Pichilemu', 8),
    ('Santa Cruz', 8),
    -- 9: Maule
    ('Talca', 9),
    ('Curicó', 9),
    ('Linares', 9),
    ('Cauquenes', 9),
    ('Constitución', 9),
    ('Molina', 9),
    -- 10: Ñuble
    ('Chillán', 10),
    ('Chillán Viejo', 10),
    ('San Carlos', 10),
    ('Bulnes', 10),
    ('Quirihue', 10),
    -- 11: Biobío
    ('Concepción', 11),
    ('Talcahuano', 11),
    ('Chiguayante', 11),
    ('San Pedro de la Paz', 11),
    ('Hualpén', 11),
    ('Coronel', 11),
    ('Lota', 11),
    ('Tomé', 11),
    ('Penco', 11),
    ('Los Ángeles', 11),
    ('Lebu', 11),
    ('Arauco', 11),
    -- 12: La Araucanía
    ('Temuco', 12),
    ('Padre Las Casas', 12),
    ('Villarrica', 12),
    ('Pucón', 12),
    ('Angol', 12),
    ('Victoria', 12),
    -- 13: Los Ríos
    ('Valdivia', 13),
    ('La Unión', 13),
    ('Río Bueno', 13),
    ('Panguipulli', 13),
    -- 14: Los Lagos
    ('Puerto Montt', 14),
    ('Osorno', 14),
    ('Puerto Varas', 14),
    ('Castro', 14),
    ('Ancud', 14),
    ('Frutillar', 14),
    -- 15: Aysén
    ('Coyhaique', 15),
    ('Puerto Aysén', 15),
    ('Chile Chico', 15),
    -- 16: Magallanes
    ('Punta Arenas', 16),
    ('Puerto Natales', 16),
    ('Porvenir', 16)
ON CONFLICT (region_id_region, nombre_ciudad) DO NOTHING;

COMMIT;