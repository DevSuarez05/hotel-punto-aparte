-- ============================================================================
-- HOTEL PUNTO APARTE - SCHEMA & SEED MIGRATION (PostgreSQL / Supabase / MySQL)
-- Total inventario físico: 23 Habitaciones
-- ============================================================================

-- 1. Tabla de Tipos / Categorías de Habitación
CREATE TABLE IF NOT EXISTS room_categories (
    id VARCHAR(50) PRIMARY KEY, -- 'doble-ac', 'doble-ventilador', 'sencilla-ac', 'sencilla-ventilador'
    category_code CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
    name VARCHAR(150) NOT NULL,
    category_label VARCHAR(100) NOT NULL,
    tagline TEXT,
    price_numeric NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'COP',
    capacity_label VARCHAR(50) NOT NULL,
    max_capacity INT NOT NULL,
    room_size VARCHAR(20) NOT NULL,
    bed_type VARCHAR(100) NOT NULL,
    bed_category VARCHAR(20) NOT NULL CHECK (bed_category IN ('doble', 'sencilla')),
    climate_control VARCHAR(10) NOT NULL CHECK (climate_control IN ('ac', 'fan')),
    climate_label VARCHAR(100) NOT NULL,
    total_stock INT NOT NULL CHECK (total_stock >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Unidades Físicas de Habitación (Inventario Individual 1..23)
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES room_categories(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. INSERCIÓN DE DATOS DE SEED / CATEGORÍAS
-- ============================================================================

INSERT INTO room_categories (
    id, category_code, name, category_label, tagline, 
    price_numeric, currency, capacity_label, max_capacity, room_size, 
    bed_type, bed_category, climate_control, climate_label, total_stock, image_url
) VALUES 
(
    'doble-ac', 'A', 'Habitación Doble con Aire Acondicionado', 'Categoría A · Doble Confort A/C',
    'Amplitud y máxima frescura climatizada para viajes compartidos, corporativos o descanso familiar en Quibdó.',
    140000.00, 'COP', '2 - 4 Personas', 4, '36 m²',
    '2 Camas Dobles / Queen Size', 'doble', 'ac', 'Aire Acondicionado Climatizado', 5,
    '/assets/images/hotel/habitacion-matrimonial.jpg'
),
(
    'doble-ventilador', 'B', 'Habitación Doble con Ventilador', 'Categoría B · Doble Estándar Ventilador',
    'Excelente relación calidad-precio con ventilación continua y ambiente amplio y acogedor.',
    100000.00, 'COP', '2 - 4 Personas', 4, '34 m²',
    '2 Camas Matrimoniales Dobles', 'doble', 'fan', 'Ventilador de Alta Potencia', 3,
    '/assets/images/hotel/habitacion-doble-sencilla.jpg'
),
(
    'sencilla-ac', 'C', 'Habitación Sencilla con Aire Acondicionado', 'Categoría C · Sencilla Ejecutiva A/C',
    'El espacio ideal e insonorizado para el viajero de negocios o descanso individual de primer nivel.',
    80000.00, 'COP', '1 - 2 Personas', 2, '24 m²',
    '1 Cama Queen / Cama Sencilla', 'sencilla', 'ac', 'Aire Acondicionado', 8,
    '/assets/images/hotel/habitacion-matrimonial.jpg'
),
(
    'sencilla-ventilador', 'D', 'Habitación Sencilla con Ventilador', 'Categoría D · Sencilla Estándar Ventilador',
    'Alojamiento práctico, limpio y acogedor para estancias ejecutivas o estadías de paso.',
    70000.00, 'COP', '1 - 2 Personas', 2, '22 m²',
    '1 Cama Sencilla Confortable', 'sencilla', 'fan', 'Ventilador Potente', 7,
    '/assets/images/hotel/habitacion-doble-sencilla.jpg'
)
ON CONFLICT (id) DO UPDATE SET 
    price_numeric = EXCLUDED.price_numeric,
    total_stock = EXCLUDED.total_stock,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 4. SEED DE LAS 23 HABITACIONES FÍSICAS INDIVIDUALES
-- ============================================================================

-- Categoría A (5 Habitaciones): 101, 102, 103, 104, 105
INSERT INTO hotel_rooms (room_number, category_id, floor_number, status)
VALUES 
('101', 'doble-ac', 1, 'available'),
('102', 'doble-ac', 1, 'available'),
('103', 'doble-ac', 1, 'available'),
('104', 'doble-ac', 1, 'available'),
('105', 'doble-ac', 1, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- Categoría B (3 Habitaciones): 106, 107, 108
INSERT INTO hotel_rooms (room_number, category_id, floor_number, status)
VALUES 
('106', 'doble-ventilador', 1, 'available'),
('107', 'doble-ventilador', 1, 'available'),
('108', 'doble-ventilador', 1, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- Categoría C (8 Habitaciones): 201, 202, 203, 204, 205, 206, 207, 208
INSERT INTO hotel_rooms (room_number, category_id, floor_number, status)
VALUES 
('201', 'sencilla-ac', 2, 'available'),
('202', 'sencilla-ac', 2, 'available'),
('203', 'sencilla-ac', 2, 'available'),
('204', 'sencilla-ac', 2, 'available'),
('205', 'sencilla-ac', 2, 'available'),
('206', 'sencilla-ac', 2, 'available'),
('207', 'sencilla-ac', 2, 'available'),
('208', 'sencilla-ac', 2, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- Categoría D (7 Habitaciones): 301, 302, 303, 304, 305, 306, 307
INSERT INTO hotel_rooms (room_number, category_id, floor_number, status)
VALUES 
('301', 'sencilla-ventilador', 3, 'available'),
('302', 'sencilla-ventilador', 3, 'available'),
('303', 'sencilla-ventilador', 3, 'available'),
('304', 'sencilla-ventilador', 3, 'available'),
('305', 'sencilla-ventilador', 3, 'available'),
('306', 'sencilla-ventilador', 3, 'available'),
('307', 'sencilla-ventilador', 3, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- ============================================================================
-- 5. VALIDACIÓN SQL AUTOMÁTICA DE STOCK (DEBE RETORNAR 23)
-- ============================================================================
SELECT 
    COUNT(*) AS total_physical_rooms,
    SUM(CASE WHEN rc.climate_control = 'ac' THEN 1 ELSE 0 END) AS ac_rooms,
    SUM(CASE WHEN rc.climate_control = 'fan' THEN 1 ELSE 0 END) AS fan_rooms,
    SUM(CASE WHEN rc.bed_category = 'doble' THEN 1 ELSE 0 END) AS doble_rooms,
    SUM(CASE WHEN rc.bed_category = 'sencilla' THEN 1 ELSE 0 END) AS sencilla_rooms
FROM hotel_rooms hr
JOIN room_categories rc ON hr.category_id = rc.id;
