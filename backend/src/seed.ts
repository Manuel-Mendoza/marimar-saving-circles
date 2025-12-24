import { db } from './config/database.js';
import { users } from './db/tables/users.js';
import { products } from './db/tables/products.js';
import { hashPassword } from './utils/auth.js';
import * as dotenv from 'dotenv';

// Load environment variables from backend directory
dotenv.config({ path: './backend/.env' });
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Data generators for Venezuelan users
const nombres = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Isabel', 'Miguel', 'Teresa',
  'Antonio', 'Rosa', 'Francisco', 'Dolores', 'Manuel', 'Cristina', 'Pedro', 'Lucía', 'Jesús', 'Pilar',
  'Angel', 'Mercedes', 'Fernando', 'Virginia', 'Pablo', 'Concepción', 'Rafael', 'Esperanza', 'Diego', 'Trinidad',
  'Javier', 'Encarnación', 'David', 'Montserrat', 'Sergio', 'Asunción', 'Alberto', 'Natividad', 'Raúl', 'Milagros',
  'Roberto', 'Inmaculada', 'Daniel', 'Lourdes', 'Alejandro', 'Candelaria', 'Adrián', 'Visitación', 'Rubén', 'Anunciación'
];

const apellidos = [
  'Pérez', 'García', 'Rodríguez', 'González', 'Martínez', 'Sánchez', 'López', 'Hernández', 'Moreno', 'Jiménez',
  'Ruiz', 'Díaz', 'Morales', 'Ortiz', 'Ramírez', 'Torres', 'Flores', 'Silva', 'Ramos', 'Vargas',
  'Romero', 'Valdez', 'Mendoza', 'Santos', 'Castillo', 'Guerrero', 'Reyes', 'Fernández', 'Luna', 'Álvarez',
  'Molina', 'Rivera', 'Gutiérrez', 'Delgado', 'Aguilar', 'Medina', 'Vega', 'Santiago', 'Domínguez', 'Castro',
  'Ortega', 'Rubio', 'Morán', 'Serrano', 'Blanco', 'Moreno', 'Herrera', 'Medina', 'Cortés', 'Santos'
];

const ciudades = [
  'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Bolívar', 'Maturín', 'San Cristóbal',
  'Barcelona', 'Cumaná', 'Puerto La Cruz', 'Puerto Ordaz', 'Mérida', 'San Antonio de Los Altos', 'Guarenas',
  'Petare', 'Los Teques', 'Ciudad Guayana', 'Cabimas', 'Baruta', 'Santa Lucía', 'El Tigre', 'Guanare',
  'Carúpano', 'Anaco', 'Puerto Ayacucho', 'Cantaura', 'El Tocuyo', 'Villa de Cura', 'Acarigua'
];

const direccionesBase = [
  'Calle Principal', 'Avenida Bolívar', 'Calle Real', 'Avenida Miranda', 'Calle Comercio',
  'Avenida Libertador', 'Calle Independencia', 'Avenida Universidad', 'Calle San José', 'Avenida Caracas'
];

// Generate 150 users with varied data
function generateUsers(count: number) {
  const users = [];
  const usedEmails = new Set<string>();
  const usedCedulas = new Set<string>();

  for (let i = 1; i <= count; i++) {
    let nombre = '';
    let apellido = '';
    let email = '';
    let cedula = '';

    // Ensure unique email and cedula
    do {
      nombre = nombres[Math.floor(Math.random() * nombres.length)]!;
      apellido = apellidos[Math.floor(Math.random() * apellidos.length)]!;
      email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@email.com`;
    } while (usedEmails.has(email));

    do {
      const cedulaNum = Math.floor(Math.random() * 90000000) + 10000000;
      cedula = `V-${cedulaNum}`;
    } while (usedCedulas.has(cedula));

    usedEmails.add(email);
    usedCedulas.add(cedula);

    const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
    const direccion = `${direccionesBase[Math.floor(Math.random() * direccionesBase.length)]} ${Math.floor(Math.random() * 200) + 1}, ${ciudad}, Venezuela`;

    // Generate phone number
    const operadores = ['412', '414', '416', '424', '426'];
    const operador = operadores[Math.floor(Math.random() * operadores.length)];
    const numero = Math.floor(Math.random() * 9000000) + 1000000;
    const telefono = `+58-${operador}-${numero}`;

    users.push({
      nombre,
      apellido,
      cedula,
      telefono,
      direccion,
      correoElectronico: email,
      password: 'password123',
      tipo: 'USUARIO',
      estado: 'APROBADO',
      aprobadoPor: 1,
      fechaAprobacion: new Date(),
    });
  }

  return users;
}

const sampleUsers = generateUsers(150);

// Sample products data
const sampleProducts = [
  // Electrodomésticos y Línea Blanca
  {
    nombre: 'Campana Extractora Fensa',
    precioUsd: 180.00,
    precioVes: 7200000.00,
    tiempoDuracion: 7,
    imagen: 'https://via.placeholder.com/300x300?text=Campana+Fensa',
    descripcion: 'Campana extractora Fensa con filtro de carbón y 3 velocidades.',
    tags: ['electrodomésticos', 'cocinas'],
    activo: true,
  },
  {
    nombre: 'Refrigerador LG Double Door',
    precioUsd: 600.00,
    precioVes: 24000000.00,
    tiempoDuracion: 15,
    imagen: 'https://via.placeholder.com/300x300?text=Refrigerador+LG',
    descripcion: 'Refrigerador LG de dos puertas con dispenser de agua, sistema de enfriamiento lineal y tecnología inverter.',
    tags: ['electrodomésticos', 'línea blanca'],
    activo: true,
  },
  {
    nombre: 'Secadora Whirlpool 8kg',
    precioUsd: 350.00,
    precioVes: 14000000.00,
    tiempoDuracion: 10,
    imagen: 'https://via.placeholder.com/300x300?text=Secadora+Whirlpool',
    descripcion: 'Secadora Whirlpool con capacidad de 8kg, múltiples programas y sensor de humedad.',
    tags: ['electrodomésticos', 'línea blanca'],
    activo: true,
  },
  {
    nombre: 'Congelador Horizontal Samsung 400L',
    precioUsd: 500.00,
    precioVes: 20000000.00,
    tiempoDuracion: 14,
    imagen: 'https://via.placeholder.com/300x300?text=Congelador+Samsung',
    descripcion: 'Congelador horizontal Samsung de 400 litros con sistema de enfriamiento rápido.',
    tags: ['electrodomésticos', 'línea blanca'],
    activo: true,
  },
  {
    nombre: 'Lavavajillas Bosch 12 Servicios',
    precioUsd: 650.00,
    precioVes: 26000000.00,
    tiempoDuracion: 16,
    imagen: 'https://via.placeholder.com/300x300?text=Lavavajillas+Bosch',
    descripcion: 'Lavavajillas Bosch con capacidad para 12 servicios y tecnología de secado Zeolith.',
    tags: ['electrodomésticos', 'línea blanca'],
    activo: true,
  },
  {
    nombre: 'Cocina a Gas Whirlpool 5 Quemadores',
    precioUsd: 400.00,
    precioVes: 16000000.00,
    tiempoDuracion: 10,
    imagen: 'https://via.placeholder.com/300x300?text=Cocina+Whirlpool',
    descripcion: 'Cocina a gas Whirlpool con 5 quemadores, horno eléctrico y encendido electrónico.',
    tags: ['electrodomésticos', 'línea blanca', 'cocinas'],
    activo: true,
  },
  {
    nombre: 'Microondas LG 30L',
    precioUsd: 150.00,
    precioVes: 6000000.00,
    tiempoDuracion: 6,
    imagen: 'https://via.placeholder.com/300x300?text=Microondas+LG',
    descripcion: 'Microondas LG con capacidad de 30 litros, grill y función de descongelado inteligente.',
    tags: ['electrodomésticos'],
    activo: true,
  },
  {
    nombre: 'Horno Eléctrico Oster',
    precioUsd: 120.00,
    precioVes: 4800000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Horno+Oster',
    descripcion: 'Horno eléctrico Oster con capacidad de 20 litros y múltiples funciones de cocción.',
    tags: ['electrodomésticos'],
    activo: true,
  },
  {
    nombre: 'Licuadora Oster 5 Velocidades',
    precioUsd: 80.00,
    precioVes: 3200000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Licuadora+Oster',
    descripcion: 'Licuadora Oster con jarra de vidrio y 5 velocidades variables.',
    tags: ['electrodomésticos'],
    activo: true,
  },
  {
    nombre: 'Cafetera Espresso DeLonghi',
    precioUsd: 200.00,
    precioVes: 8000000.00,
    tiempoDuracion: 8,
    imagen: 'https://via.placeholder.com/300x300?text=Cafetera+DeLonghi',
    descripcion: 'Cafetera espresso DeLonghi automática con molinillo integrado.',
    tags: ['electrodomésticos'],
    activo: true,
  },

  // Electrónicos
  {
    nombre: 'Smart TV Samsung 55"',
    precioUsd: 800.00,
    precioVes: 32000000.00,
    tiempoDuracion: 18,
    imagen: 'https://via.placeholder.com/300x300?text=TV+Samsung+55',
    descripcion: 'Smart TV Samsung 4K UHD de 55 pulgadas con procesador Crystal 4K y sistema operativo Tizen.',
    tags: ['electrónicos', 'tv', 'smart tv'],
    activo: true,
  },
  {
    nombre: 'TV LED LG 43"',
    precioUsd: 450.00,
    precioVes: 18000000.00,
    tiempoDuracion: 12,
    imagen: 'https://via.placeholder.com/300x300?text=TV+LG+43',
    descripcion: 'TV LED LG de 43 pulgadas con resolución Full HD y tecnología IPS.',
    tags: ['electrónicos', 'tv'],
    activo: true,
  },
  {
    nombre: 'Smart TV TCL 65"',
    precioUsd: 700.00,
    precioVes: 28000000.00,
    tiempoDuracion: 16,
    imagen: 'https://via.placeholder.com/300x300?text=TV+TCL+65',
    descripcion: 'Smart TV TCL 4K UHD de 65 pulgadas con Android TV y control por voz.',
    tags: ['electrónicos', 'tv', 'smart tv'],
    activo: true,
  },
  {
    nombre: 'iPhone 15 Pro 256GB',
    precioUsd: 1200.00,
    precioVes: 48000000.00,
    tiempoDuracion: 24,
    imagen: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    descripcion: 'iPhone 15 Pro con chip A17 Pro, cámara de 48MP y Dynamic Island. Almacenamiento de 256GB.',
    tags: ['electrónicos', 'celulares'],
    activo: true,
  },
  {
    nombre: 'Samsung Galaxy S24 Ultra',
    precioUsd: 1100.00,
    precioVes: 44000000.00,
    tiempoDuracion: 22,
    imagen: 'https://via.placeholder.com/300x300?text=Galaxy+S24+Ultra',
    descripcion: 'Samsung Galaxy S24 Ultra con S Pen, cámara de 200MP y pantalla Dynamic AMOLED.',
    tags: ['electrónicos', 'celulares'],
    activo: true,
  },
  {
    nombre: 'iPhone 14 128GB',
    precioUsd: 800.00,
    precioVes: 32000000.00,
    tiempoDuracion: 18,
    imagen: 'https://via.placeholder.com/300x300?text=iPhone+14',
    descripcion: 'iPhone 14 con chip A15 Bionic, cámara dual de 12MP y modo cinematográfico.',
    tags: ['electrónicos', 'celulares'],
    activo: true,
  },
  {
    nombre: 'Laptop Dell Inspiron 15"',
    precioUsd: 700.00,
    precioVes: 28000000.00,
    tiempoDuracion: 16,
    imagen: 'https://via.placeholder.com/300x300?text=Laptop+Dell',
    descripcion: 'Laptop Dell Inspiron de 15.6" con procesador Intel Core i5, 8GB RAM y 512GB SSD.',
    tags: ['electrónicos', 'computadoras'],
    activo: true,
  },
  {
    nombre: 'MacBook Air M2 13"',
    precioUsd: 1200.00,
    precioVes: 48000000.00,
    tiempoDuracion: 24,
    imagen: 'https://via.placeholder.com/300x300?text=MacBook+Air+M2',
    descripcion: 'MacBook Air con chip M2, 8GB RAM unificada y SSD de 256GB.',
    tags: ['electrónicos', 'computadoras'],
    activo: true,
  },
  {
    nombre: 'PC Gamer ASUS ROG',
    precioUsd: 1500.00,
    precioVes: 60000000.00,
    tiempoDuracion: 30,
    imagen: 'https://via.placeholder.com/300x300?text=PC+Gamer+ASUS',
    descripcion: 'PC Gamer ASUS ROG con RTX 4070, Intel Core i7 y 16GB RAM.',
    tags: ['electrónicos', 'computadoras'],
    activo: true,
  },
  {
    nombre: 'iPad Pro 12.9" M2',
    precioUsd: 1100.00,
    precioVes: 44000000.00,
    tiempoDuracion: 22,
    imagen: 'https://via.placeholder.com/300x300?text=iPad+Pro+M2',
    descripcion: 'iPad Pro de 12.9" con chip M2, Liquid Retina XDR y Apple Pencil Pro.',
    tags: ['electrónicos', 'computadoras'],
    activo: true,
  },

  // Cocinas
  {
    nombre: 'Cocina Eléctrica Indurama 4 Hornillas',
    precioUsd: 300.00,
    precioVes: 12000000.00,
    tiempoDuracion: 8,
    imagen: 'https://via.placeholder.com/300x300?text=Cocina+Indurama',
    descripcion: 'Cocina eléctrica Indurama con 4 hornillas, horno y temporizador.',
    tags: ['electrodomésticos', 'cocinas'],
    activo: true,
  },
  {
    nombre: 'Campana Extractora Fensa',
    precioUsd: 180.00,
    precioVes: 7200000.00,
    tiempoDuracion: 7,
    imagen: 'https://via.placeholder.com/300x300?text=Campana+Fensa',
    descripcion: 'Campana extractora Fensa con filtro de carbón y 3 velocidades.',
    tags: ['electrodomésticos', 'cocinas'],
    activo: true,
  },

  // Aires Acondicionados
  {
    nombre: 'Aire Acondicionado Carrier 12000 BTU',
    precioUsd: 550.00,
    precioVes: 22000000.00,
    tiempoDuracion: 14,
    imagen: 'https://via.placeholder.com/300x300?text=Aire+Acondicionado',
    descripcion: 'Aire acondicionado Carrier split de 12000 BTU con tecnología inverter y control remoto.',
    tags: ['electrodomésticos', 'aires acondicionados'],
    activo: true,
  },
  {
    nombre: 'Aire Acondicionado LG 18000 BTU',
    precioUsd: 750.00,
    precioVes: 30000000.00,
    tiempoDuracion: 18,
    imagen: 'https://via.placeholder.com/300x300?text=Aire+LG+18000',
    descripcion: 'Aire acondicionado LG split de 18000 BTU con WiFi y control inteligente.',
    tags: ['electrodomésticos', 'aires acondicionados'],
    activo: true,
  },
  {
    nombre: 'Ventilador de Pie Panasonic',
    precioUsd: 60.00,
    precioVes: 2400000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Ventilador+Panasonic',
    descripcion: 'Ventilador de pie Panasonic con 3 velocidades y oscilación automática.',
    tags: ['electrodomésticos'],
    activo: true,
  },

  // Motos
  {
    nombre: 'Moto Yamaha YBR 125',
    precioUsd: 2500.00,
    precioVes: 100000000.00,
    tiempoDuracion: 48,
    imagen: 'https://via.placeholder.com/300x300?text=Moto+Yamaha+YBR',
    descripcion: 'Moto Yamaha YBR 125cc con motor monocilíndrico y frenos a disco.',
    tags: ['motos'],
    activo: true,
  },
  {
    nombre: 'Moto Honda CG 160',
    precioUsd: 2200.00,
    precioVes: 88000000.00,
    tiempoDuracion: 42,
    imagen: 'https://via.placeholder.com/300x300?text=Moto+Honda+CG',
    descripcion: 'Moto Honda CG 160 con motor OHC y sistema de combustible EFI.',
    tags: ['motos'],
    activo: true,
  },
  {
    nombre: 'Moto Suzuki GN 125',
    precioUsd: 2100.00,
    precioVes: 84000000.00,
    tiempoDuracion: 40,
    imagen: 'https://via.placeholder.com/300x300?text=Moto+Suzuki+GN',
    descripcion: 'Moto Suzuki GN 125 con motor de 4 tiempos y transmisión manual.',
    tags: ['motos'],
    activo: true,
  },

  // Bicicletas
  {
    nombre: 'Bicicleta MTB Giant Talon 29"',
    precioUsd: 400.00,
    precioVes: 16000000.00,
    tiempoDuracion: 10,
    imagen: 'https://via.placeholder.com/300x300?text=Bicicleta+Giant',
    descripcion: 'Bicicleta MTB Giant Talon de 29" con cuadro de aluminio y 21 velocidades.',
    tags: ['bicicletas'],
    activo: true,
  },
  {
    nombre: 'Bicicleta Urbana Specialized Wayfarer',
    precioUsd: 350.00,
    precioVes: 14000000.00,
    tiempoDuracion: 9,
    imagen: 'https://via.placeholder.com/300x300?text=Bicicleta+Specialized',
    descripcion: 'Bicicleta urbana Specialized Wayfarer con cesta y guardabarros.',
    tags: ['bicicletas'],
    activo: true,
  },
  {
    nombre: 'Bicicleta Eléctrica Xiaomi',
    precioUsd: 600.00,
    precioVes: 24000000.00,
    tiempoDuracion: 15,
    imagen: 'https://via.placeholder.com/300x300?text=Bicicleta+Electrica+Xiaomi',
    descripcion: 'Bicicleta eléctrica Xiaomi con batería de 250W y autonomía de 45km.',
    tags: ['bicicletas'],
    activo: true,
  },

  // Cama
  {
    nombre: 'Colchón Memory Foam King Size',
    precioUsd: 300.00,
    precioVes: 12000000.00,
    tiempoDuracion: 8,
    imagen: 'https://via.placeholder.com/300x300?text=Colchon+Memory+Foam',
    descripcion: 'Colchón de espuma viscoelástica king size con 25cm de altura.',
    tags: ['cama'],
    activo: true,
  },
  {
    nombre: 'Base Cama Box Spring Queen',
    precioUsd: 250.00,
    precioVes: 10000000.00,
    tiempoDuracion: 7,
    imagen: 'https://via.placeholder.com/300x300?text=Base+Cama+Box',
    descripcion: 'Base cama box spring queen con sistema de resortes ensacados.',
    tags: ['cama'],
    activo: true,
  },
  {
    nombre: 'Juego de Sábanas 180 Hilos',
    precioUsd: 80.00,
    precioVes: 3200000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Sabana+180+Hilos',
    descripcion: 'Juego de sábanas de algodón 180 hilos para cama king.',
    tags: ['cama'],
    activo: true,
  },

  // Ortopédicos
  {
    nombre: 'Silla Ergonómica para Oficina',
    precioUsd: 200.00,
    precioVes: 8000000.00,
    tiempoDuracion: 8,
    imagen: 'https://via.placeholder.com/300x300?text=Silla+Ergonomica',
    descripcion: 'Silla ergonómica con soporte lumbar ajustable y reposabrazos.',
    tags: ['ortopédicos'],
    activo: true,
  },
  {
    nombre: 'Almohada Cervical Memory Foam',
    precioUsd: 40.00,
    precioVes: 1600000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Almohada+Cervical',
    descripcion: 'Almohada cervical de espuma viscoelástica para dormir mejor.',
    tags: ['ortopédicos'],
    activo: true,
  },
  {
    nombre: 'Apoyo Lumbar Postural',
    precioUsd: 25.00,
    precioVes: 1000000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Apoyo+Lumbar',
    descripcion: 'Apoyo lumbar postural con diseño ergonómico para espalda baja.',
    tags: ['ortopédicos'],
    activo: true,
  },
  {
    nombre: 'Zapatos Ortopédicos Mujer',
    precioUsd: 120.00,
    precioVes: 4800000.00,
    tiempoDuracion: 5,
    imagen: 'https://via.placeholder.com/300x300?text=Zapatos+Ortopedicos',
    descripcion: 'Zapatos ortopédicos para mujer con plantilla anatómica.',
    tags: ['ortopédicos'],
    activo: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Hash passwords for users
    console.log('🔐 Hasheando contraseñas...');
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );

    // Insert users
    console.log('👥 Insertando usuarios...');
    await db.insert(users).values(usersWithHashedPasswords);
    console.log('✅ Usuarios insertados exitosamente');

    // Insert products
    console.log('📦 Insertando productos...');
    await db.insert(products).values(sampleProducts);
    console.log('✅ Productos insertados exitosamente');

    console.log('🎉 Seeding completado exitosamente!');
    console.log(`📊 Datos insertados:`);
    console.log(`   - ${sampleUsers.length} usuarios`);
    console.log(`   - ${sampleProducts.length} productos`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('🏁 Seeding finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal durante el seeding:', error);
    process.exit(1);
  });
