import { PrismaClient } from '@prisma/client';

// Como SQLite no soporta enums, usamos constantes de string.
const Rol = { CLIENTE: 'CLIENTE', DUENO: 'DUENO' } as const;
const EstadoPedido = {
  RECIBIDO: 'RECIBIDO',
  EN_PRODUCCION: 'EN_PRODUCCION',
  LISTO: 'LISTO',
  ENTREGADO: 'ENTREGADO',
} as const;
type EstadoPedido = typeof EstadoPedido[keyof typeof EstadoPedido];
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos Amasa...');

  // Limpiar
  await prisma.notaVenta.deleteMany();
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.recetaItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.usuario.deleteMany();

  const hash = (s: string) => bcrypt.hashSync(s, 10);

  // Usuarios
  const dueno = await prisma.usuario.create({
    data: {
      nombre: 'María Cueva',
      telefono: '0999000001',
      password: hash('amasa123'),
      rol: Rol.DUENO,
      direccion: 'Panadería Amasa, Av. Universitaria, Loja',
    },
  });

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      telefono: '0999000002',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Calle Bolívar 12-34, Loja',
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'Lucía Jaramillo',
      telefono: '0999000003',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Barrio San Sebastián, Loja',
    },
  });

  const cliente3 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Ordóñez',
      telefono: '0999000004',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Av. Pío Jaramillo, Loja',
    },
  });

  // Insumos
  const harina = await prisma.insumo.create({
    data: { nombre: 'Harina de trigo', unidad: 'kg', stockActual: 25, stockMinimo: 10 },
  });
  const azucar = await prisma.insumo.create({
    data: { nombre: 'Azúcar', unidad: 'kg', stockActual: 12, stockMinimo: 5 },
  });
  const huevos = await prisma.insumo.create({
    data: { nombre: 'Huevos', unidad: 'unidades', stockActual: 60, stockMinimo: 30 },
  });
  const manteca = await prisma.insumo.create({
    data: { nombre: 'Manteca', unidad: 'kg', stockActual: 4, stockMinimo: 5 },
  });
  const levadura = await prisma.insumo.create({
    data: { nombre: 'Levadura', unidad: 'kg', stockActual: 1.2, stockMinimo: 0.5 },
  });
  const leche = await prisma.insumo.create({
    data: { nombre: 'Leche', unidad: 'lt', stockActual: 8, stockMinimo: 4 },
  });
  const queso = await prisma.insumo.create({
    data: { nombre: 'Queso fresco', unidad: 'kg', stockActual: 3, stockMinimo: 2 },
  });
  const chocolate = await prisma.insumo.create({
    data: { nombre: 'Chocolate', unidad: 'kg', stockActual: 2, stockMinimo: 1 },
  });

  // Productos (imágenes Unsplash)
  const pan = await prisma.producto.create({
    data: {
      nombre: 'Pan de yema',
      descripcion: 'Pan tradicional lojano, suave y dorado.',
      precio: 0.20,
      imagenUrl: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600',
    },
  });
  const empanada = await prisma.producto.create({
    data: {
      nombre: 'Empanada de queso',
      descripcion: 'Empanada horneada rellena de queso fresco lojano.',
      precio: 0.50,
      imagenUrl: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600',
    },
  });
  const enrollado = await prisma.producto.create({
    data: {
      nombre: 'Enrollado de canela',
      descripcion: 'Bollo dulce con canela y azúcar.',
      precio: 0.60,
      imagenUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600',
    },
  });
  const croissant = await prisma.producto.create({
    data: {
      nombre: 'Croissant de mantequilla',
      descripcion: 'Hojaldrado, crocante por fuera y suave por dentro.',
      precio: 0.80,
      imagenUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
    },
  });
  const torta = await prisma.producto.create({
    data: {
      nombre: 'Torta de chocolate (porción)',
      descripcion: 'Bizcocho de chocolate con ganache.',
      precio: 1.50,
      imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
    },
  });
  const galleta = await prisma.producto.create({
    data: {
      nombre: 'Galleta de avena',
      descripcion: 'Galleta artesanal con avena y pasas.',
      precio: 0.35,
      imagenUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600',
    },
  });
  const humita = await prisma.producto.create({
    data: {
      nombre: 'Humita',
      descripcion: 'Humita serrana al horno con queso.',
      precio: 0.75,
      imagenUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600',
    },
  });

  // Recetas: cantidad de insumo por 1 unidad producida
  const receta = async (productoId: number, items: { insumoId: number; cantidad: number }[]) => {
    for (const it of items) {
      await prisma.recetaItem.create({ data: { productoId, ...it } });
    }
  };

  await receta(pan.id, [
    { insumoId: harina.id, cantidad: 0.05 },
    { insumoId: azucar.id, cantidad: 0.005 },
    { insumoId: huevos.id, cantidad: 0.2 },
    { insumoId: manteca.id, cantidad: 0.005 },
    { insumoId: levadura.id, cantidad: 0.002 },
  ]);
  await receta(empanada.id, [
    { insumoId: harina.id, cantidad: 0.06 },
    { insumoId: queso.id, cantidad: 0.03 },
    { insumoId: huevos.id, cantidad: 0.1 },
    { insumoId: manteca.id, cantidad: 0.01 },
  ]);
  await receta(enrollado.id, [
    { insumoId: harina.id, cantidad: 0.07 },
    { insumoId: azucar.id, cantidad: 0.02 },
    { insumoId: manteca.id, cantidad: 0.015 },
    { insumoId: leche.id, cantidad: 0.03 },
  ]);
  await receta(croissant.id, [
    { insumoId: harina.id, cantidad: 0.08 },
    { insumoId: manteca.id, cantidad: 0.04 },
    { insumoId: leche.id, cantidad: 0.02 },
    { insumoId: huevos.id, cantidad: 0.15 },
  ]);
  await receta(torta.id, [
    { insumoId: harina.id, cantidad: 0.04 },
    { insumoId: azucar.id, cantidad: 0.04 },
    { insumoId: huevos.id, cantidad: 0.5 },
    { insumoId: chocolate.id, cantidad: 0.05 },
    { insumoId: manteca.id, cantidad: 0.02 },
  ]);
  await receta(galleta.id, [
    { insumoId: harina.id, cantidad: 0.02 },
    { insumoId: azucar.id, cantidad: 0.015 },
    { insumoId: manteca.id, cantidad: 0.01 },
  ]);
  await receta(humita.id, [
    { insumoId: harina.id, cantidad: 0.05 },
    { insumoId: queso.id, cantidad: 0.04 },
    { insumoId: huevos.id, cantidad: 0.25 },
    { insumoId: leche.id, cantidad: 0.02 },
  ]);

  // Pedidos del día
  const hoy = new Date();
  const mkPedido = async (
    clienteId: number,
    horaEntrega: string,
    estado: EstadoPedido,
    items: { productoId: number; cantidad: number; precioUnitario: number }[]
  ) => {
    const total = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        horaEntrega,
        estado,
        total,
        fecha: hoy,
        items: { create: items },
      },
    });
    return pedido;
  };

  const p1 = await mkPedido(cliente1.id, '07:30', EstadoPedido.RECIBIDO, [
    { productoId: pan.id, cantidad: 20, precioUnitario: pan.precio },
    { productoId: empanada.id, cantidad: 6, precioUnitario: empanada.precio },
  ]);
  const p2 = await mkPedido(cliente2.id, '08:00', EstadoPedido.EN_PRODUCCION, [
    { productoId: croissant.id, cantidad: 12, precioUnitario: croissant.precio },
    { productoId: enrollado.id, cantidad: 8, precioUnitario: enrollado.precio },
  ]);
  const p3 = await mkPedido(cliente3.id, '09:00', EstadoPedido.LISTO, [
    { productoId: torta.id, cantidad: 8, precioUnitario: torta.precio },
    { productoId: galleta.id, cantidad: 24, precioUnitario: galleta.precio },
  ]);
  await mkPedido(cliente1.id, '10:00', EstadoPedido.RECIBIDO, [
    { productoId: humita.id, cantidad: 10, precioUnitario: humita.precio },
    { productoId: pan.id, cantidad: 30, precioUnitario: pan.precio },
  ]);

  // Nota de venta para el pedido entregado/listo
  await prisma.notaVenta.create({
    data: {
      pedidoId: p3.id,
      numero: 'NV-000001',
      total: p3.total,
    },
  });

  // Pedido histórico (ayer)
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  await prisma.pedido.create({
    data: {
      clienteId: cliente2.id,
      horaEntrega: '08:00',
      estado: EstadoPedido.ENTREGADO,
      total: 5.0,
      fecha: ayer,
      items: {
        create: [
          { productoId: pan.id, cantidad: 25, precioUnitario: pan.precio },
        ],
      },
    },
  });

  console.log('✅ Seed completado');
  console.log('   Dueño:   0999000001 / amasa123');
  console.log('   Cliente: 0999000002 / cliente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
