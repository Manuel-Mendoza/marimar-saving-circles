import { db } from './config/database.js';
import { users } from './db/tables/users.js';
import { products } from './db/tables/products.js';
import { hashPassword } from './utils/auth.js';

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
  {
    nombre: 'Lavadora Samsung 18kg',
    precioUsd: 450.00,
    precioVes: 18000000.00,
    tiempoDuracion: 12,
    imagen: 'https://via.placeholder.com/300x300?text=Lavadora+Samsung',
    descripcion: 'Lavadora automática Samsung con capacidad de 18kg, tecnología ecobubble y motor digital inverter.',
    tags: ['electrodomésticos', 'línea blanca', 'lavadoras'],
    activo: true,
  },
  {
    nombre: 'Refrigerador LG Double Door',
    precioUsd: 600.00,
    precioVes: 24000000.00,
    tiempoDuracion: 15,
    imagen: 'https://via.placeholder.com/300x300?text=Refrigerador+LG',
    descripcion: 'Refrigerador LG de dos puertas con dispenser de agua, sistema de enfriamiento lineal y tecnología inverter.',
    tags: ['electrodomésticos', 'línea blanca', 'refrigeradores'],
    activo: true,
  },
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
    nombre: 'iPhone 15 Pro 256GB',
    precioUsd: 1200.00,
    precioVes: 48000000.00,
    tiempoDuracion: 24,
    imagen: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
    descripcion: 'iPhone 15 Pro con chip A17 Pro, cámara de 48MP y Dynamic Island. Almacenamiento de 256GB.',
    tags: ['electrónicos', 'celulares', 'apple'],
    activo: true,
  },
  {
    nombre: 'Aire Acondicionado Carrier 12000 BTU',
    precioUsd: 550.00,
    precioVes: 22000000.00,
    tiempoDuracion: 14,
    imagen: 'https://via.placeholder.com/300x300?text=Aire+Acondicionado',
    descripcion: 'Aire acondicionado Carrier split de 12000 BTU con tecnología inverter y control remoto.',
    tags: ['electrodomésticos', 'aires acondicionados', 'climatización'],
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
    nombre: 'Laptop Dell Inspiron 15"',
    precioUsd: 700.00,
    precioVes: 28000000.00,
    tiempoDuracion: 16,
    imagen: 'https://via.placeholder.com/300x300?text=Laptop+Dell',
    descripcion: 'Laptop Dell Inspiron de 15.6" con procesador Intel Core i5, 8GB RAM y 512GB SSD.',
    tags: ['electrónicos', 'computadoras', 'laptops'],
    activo: true,
  },
  {
    nombre: 'Microondas LG 30L',
    precioUsd: 150.00,
    precioVes: 6000000.00,
    tiempoDuracion: 6,
    imagen: 'https://via.placeholder.com/300x300?text=Microondas+LG',
    descripcion: 'Microondas LG con capacidad de 30 litros, grill y función de descongelado inteligente.',
    tags: ['electrodomésticos', 'microondas', 'cocina'],
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
