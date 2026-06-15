import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Constantes de estado (consistentes con la API).
const Rol = { CLIENTE: 'CLIENTE', PROVEEDOR: 'PROVEEDOR' } as const;
const EstadoPedido = {
  RECIBIDO: 'RECIBIDO',
  EN_PRODUCCION: 'EN_PRODUCCION',
  LISTO: 'LISTO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
} as const;
type EstadoPedido = typeof EstadoPedido[keyof typeof EstadoPedido];

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos Acopio...');

  // Limpiar (orden importa por FKs)
  await prisma.mensaje.deleteMany();
  await prisma.negociacionBono.deleteMany();
  await prisma.negociacion.deleteMany();
  await prisma.notaVenta.deleteMany();
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.recetaItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.afiliacion.deleteMany();
  await prisma.usuario.deleteMany();

  const hash = (s: string) => bcrypt.hashSync(s, 10);

  // ====== PROVEEDORES ======
  const maria = await prisma.usuario.create({
    data: {
      nombre: 'María Cueva',
      telefono: '0999000001',
      password: hash('acopio123'),
      rol: Rol.PROVEEDOR,
      nombreNegocio: 'Panadería Acopio',
      descripcion: 'Pan artesanal, empanadas, humitas. Entregamos mayoreo a tiendas de Loja desde 2010.',
      fotoUrl: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600',
      direccion: 'Av. Universitaria 14-50, Loja',
    },
  });

  const roberto = await prisma.usuario.create({
    data: {
      nombre: 'Roberto Yánez',
      telefono: '0999000010',
      password: hash('acopio123'),
      rol: Rol.PROVEEDOR,
      nombreNegocio: 'Distribuidora El Granero',
      descripcion: 'Granos, harinas y abarrotes al por mayor para tu negocio.',
      fotoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      direccion: 'Mercado Mayorista, Loja',
    },
  });

  // ====== CLIENTES (dueños de tiendas / negocios) ======
  const juan = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      telefono: '0999000002',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Tienda San Juan, Calle Bolívar 12-34, Loja',
    },
  });
  const lucia = await prisma.usuario.create({
    data: {
      nombre: 'Lucía Jaramillo',
      telefono: '0999000003',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Mini-market La Esperanza, San Sebastián, Loja',
    },
  });
  const carlos = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Ordóñez',
      telefono: '0999000004',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Cafetería Ordóñez, Av. Pío Jaramillo, Loja',
    },
  });
  const ana = await prisma.usuario.create({
    data: {
      nombre: 'Ana Tapia',
      telefono: '0999000005',
      password: hash('cliente123'),
      rol: Rol.CLIENTE,
      direccion: 'Tienda La Económica, Loja',
    },
  });

  // ====== AFILIACIONES ======
  // Afiliaciones aprobadas a María
  await prisma.afiliacion.createMany({
    data: [
      { clienteId: juan.id, proveedorId: maria.id, estado: 'APROBADA', origen: 'MANUAL', resueltoEn: new Date() },
      { clienteId: lucia.id, proveedorId: maria.id, estado: 'APROBADA', origen: 'SOLICITUD', resueltoEn: new Date() },
      // Carlos pendiente con María (para demo del flujo)
      { clienteId: carlos.id, proveedorId: maria.id, estado: 'PENDIENTE', origen: 'SOLICITUD', mensaje: 'Hola María, soy de Cafetería Ordóñez. Quisiera empezar a hacer pedidos.' },
      // Ana también pendiente
      { clienteId: ana.id, proveedorId: maria.id, estado: 'PENDIENTE', origen: 'SOLICITUD', mensaje: 'Buenas, somos una tienda nueva del centro.' },
      // Juan también afiliado a Roberto
      { clienteId: juan.id, proveedorId: roberto.id, estado: 'APROBADA', origen: 'SOLICITUD', resueltoEn: new Date() },
    ],
  });

  // ====== INSUMOS DE MARÍA ======
  const harina = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Harina de trigo', unidad: 'kg', stockActual: 25, stockMinimo: 10 },
  });
  const azucar = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Azúcar', unidad: 'kg', stockActual: 12, stockMinimo: 5 },
  });
  const huevos = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Huevos', unidad: 'unidades', stockActual: 60, stockMinimo: 30 },
  });
  const manteca = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Manteca', unidad: 'kg', stockActual: 4, stockMinimo: 5 },
  });
  const levadura = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Levadura', unidad: 'kg', stockActual: 1.2, stockMinimo: 0.5 },
  });
  const leche = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Leche', unidad: 'lt', stockActual: 8, stockMinimo: 4 },
  });
  const queso = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Queso fresco', unidad: 'kg', stockActual: 3, stockMinimo: 2 },
  });
  const chocolate = await prisma.insumo.create({
    data: { proveedorId: maria.id, nombre: 'Chocolate', unidad: 'kg', stockActual: 2, stockMinimo: 1 },
  });

  // ====== PRODUCTOS DE MARÍA ======
  const pan = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Pan de yema', descripcion: 'Pan tradicional lojano, suave y dorado.', precio: 0.20, imagenUrl: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600' },
  });
  const empanada = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Empanada de queso', descripcion: 'Empanada horneada rellena de queso fresco lojano.', precio: 0.50, imagenUrl: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600' },
  });
  const enrollado = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Enrollado de canela', descripcion: 'Bollo dulce con canela y azúcar.', precio: 0.60, imagenUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600' },
  });
  const croissant = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Croissant de mantequilla', descripcion: 'Hojaldrado, crocante por fuera y suave por dentro.', precio: 0.80, imagenUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600' },
  });
  const torta = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Torta de chocolate (porción)', descripcion: 'Bizcocho de chocolate con ganache.', precio: 1.50, imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600' },
  });
  const galleta = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Galleta de avena', descripcion: 'Galleta artesanal con avena y pasas.', precio: 0.35, imagenUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600' },
  });
  const humita = await prisma.producto.create({
    data: { proveedorId: maria.id, nombre: 'Humita', descripcion: 'Humita serrana al horno con queso.', precio: 0.75, imagenUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600' },
  });

  // ====== PRODUCTOS DE ROBERTO (para mostrar multi-proveedor) ======
  await prisma.producto.createMany({
    data: [
      { proveedorId: roberto.id, nombre: 'Quintal de arroz', descripcion: 'Saco de 45 kg de arroz blanco extra.', precio: 48.0, imagenUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
      { proveedorId: roberto.id, nombre: 'Saco de azúcar 50kg', descripcion: 'Azúcar refinada al por mayor.', precio: 52.0, imagenUrl: 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=600' },
      { proveedorId: roberto.id, nombre: 'Aceite girasol 5L', descripcion: 'Garrafa de aceite vegetal, caja x 4.', precio: 38.0, imagenUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600' },
    ],
  });

  // Recetas (solo productos de María)
  const receta = async (productoId: number, items: { insumoId: number; cantidad: number }[]) => {
    for (const it of items) {
      await prisma.recetaItem.create({ data: { productoId, ...it } });
    }
  };
  await receta(pan.id, [
    { insumoId: harina.id, cantidad: 0.05 }, { insumoId: azucar.id, cantidad: 0.005 },
    { insumoId: huevos.id, cantidad: 0.2 }, { insumoId: manteca.id, cantidad: 0.005 },
    { insumoId: levadura.id, cantidad: 0.002 },
  ]);
  await receta(empanada.id, [
    { insumoId: harina.id, cantidad: 0.06 }, { insumoId: queso.id, cantidad: 0.03 },
    { insumoId: huevos.id, cantidad: 0.1 }, { insumoId: manteca.id, cantidad: 0.01 },
  ]);
  await receta(enrollado.id, [
    { insumoId: harina.id, cantidad: 0.07 }, { insumoId: azucar.id, cantidad: 0.02 },
    { insumoId: manteca.id, cantidad: 0.015 }, { insumoId: leche.id, cantidad: 0.03 },
  ]);
  await receta(croissant.id, [
    { insumoId: harina.id, cantidad: 0.08 }, { insumoId: manteca.id, cantidad: 0.04 },
    { insumoId: leche.id, cantidad: 0.02 }, { insumoId: huevos.id, cantidad: 0.15 },
  ]);
  await receta(torta.id, [
    { insumoId: harina.id, cantidad: 0.04 }, { insumoId: azucar.id, cantidad: 0.04 },
    { insumoId: huevos.id, cantidad: 0.5 }, { insumoId: chocolate.id, cantidad: 0.05 },
    { insumoId: manteca.id, cantidad: 0.02 },
  ]);
  await receta(galleta.id, [
    { insumoId: harina.id, cantidad: 0.02 }, { insumoId: azucar.id, cantidad: 0.015 },
    { insumoId: manteca.id, cantidad: 0.01 },
  ]);
  await receta(humita.id, [
    { insumoId: harina.id, cantidad: 0.05 }, { insumoId: queso.id, cantidad: 0.04 },
    { insumoId: huevos.id, cantidad: 0.25 }, { insumoId: leche.id, cantidad: 0.02 },
  ]);

  // ====== PEDIDOS (todos a María) ======
  const hoy = new Date();
  const mkPedido = async (
    clienteId: number,
    horaEntrega: string,
    estado: EstadoPedido,
    items: { productoId: number; cantidad: number; precioUnitario: number; esBono?: boolean }[],
    fecha: Date = hoy,
    descuento: number = 0,
  ) => {
    const subtotal = items
      .filter((i) => !i.esBono)
      .reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
    const total = Math.max(0, subtotal - descuento);
    return prisma.pedido.create({
      data: {
        clienteId, proveedorId: maria.id, horaEntrega, estado,
        subtotal, descuento, total, fecha,
        items: { create: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad, precioUnitario: it.precioUnitario, esBono: !!it.esBono })) },
      },
    });
  };

  const p1 = await mkPedido(juan.id, '07:30', EstadoPedido.RECIBIDO, [
    { productoId: pan.id, cantidad: 20, precioUnitario: pan.precio },
    { productoId: empanada.id, cantidad: 6, precioUnitario: empanada.precio },
  ]);
  const p2 = await mkPedido(lucia.id, '08:00', EstadoPedido.EN_PRODUCCION, [
    { productoId: croissant.id, cantidad: 12, precioUnitario: croissant.precio },
    { productoId: enrollado.id, cantidad: 8, precioUnitario: enrollado.precio },
  ]);
  const p3 = await mkPedido(juan.id, '09:00', EstadoPedido.LISTO, [
    { productoId: torta.id, cantidad: 8, precioUnitario: torta.precio },
    { productoId: galleta.id, cantidad: 24, precioUnitario: galleta.precio },
  ]);
  await mkPedido(lucia.id, '10:00', EstadoPedido.RECIBIDO, [
    { productoId: humita.id, cantidad: 10, precioUnitario: humita.precio },
    { productoId: pan.id, cantidad: 30, precioUnitario: pan.precio },
  ]);

  // Negociación SOLICITADA (Juan pide descuento en p1, María aún no responde)
  await prisma.negociacion.create({
    data: {
      pedidoId: p1.id,
      estado: 'SOLICITADA',
      mensajeCliente: 'María, somos clientes fijos. ¿Hay rebaja en este pedido?',
    },
  });

  // Pedido histórico ENTREGADO con negociación ACEPTADA (descuento 10%)
  const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
  const pAyer = await mkPedido(
    juan.id, '08:00', EstadoPedido.ENTREGADO,
    [{ productoId: pan.id, cantidad: 25, precioUnitario: pan.precio }],
    ayer, 0.5,
  );
  await prisma.negociacion.create({
    data: {
      pedidoId: pAyer.id, estado: 'ACEPTADA',
      mensajeCliente: 'Esta semana hago dos pedidos grandes.',
      tipo: 'PORCENTAJE', valor: 10, notaProveedor: 'Por cliente recurrente.',
      resueltoEn: ayer,
    },
  });

  // Pedido histórico con BONO (María regaló 2 panes extra)
  const haceTresDias = new Date(hoy); haceTresDias.setDate(haceTresDias.getDate() - 3);
  const pBono = await mkPedido(
    lucia.id, '07:30', EstadoPedido.ENTREGADO,
    [
      { productoId: empanada.id, cantidad: 10, precioUnitario: empanada.precio },
      { productoId: pan.id, cantidad: 2, precioUnitario: pan.precio, esBono: true },
    ],
    haceTresDias,
  );
  const negBono = await prisma.negociacion.create({
    data: {
      pedidoId: pBono.id, estado: 'ACEPTADA',
      mensajeCliente: '¿Algo extra de regalo?', tipo: 'BONO',
      notaProveedor: 'Gracias por la confianza 🙌', resueltoEn: haceTresDias,
    },
  });
  await prisma.negociacionBono.create({
    data: { negociacionId: negBono.id, productoId: pan.id, cantidad: 2 },
  });

  // Nota de venta para el LISTO
  await prisma.notaVenta.create({
    data: { pedidoId: p3.id, numero: 'NV-000001', total: p3.total },
  });

  // ====== MENSAJES ======
  // Conversación entre María y Juan
  const mkMsg = (remitenteId: number, destinatarioId: number, contenido: string, hace: number, leido = true) => {
    const f = new Date(hoy); f.setMinutes(f.getMinutes() - hace);
    return prisma.mensaje.create({ data: { remitenteId, destinatarioId, contenido, creadoEn: f, leido } });
  };
  await mkMsg(juan.id, maria.id, 'María buenas, ¿tienes pan de yema para mañana?', 60 * 5);
  await mkMsg(maria.id, juan.id, '¡Hola Juan! Sí, 30 unidades horneadas a las 7. Te las despacho.', 60 * 4 + 50);
  await mkMsg(juan.id, maria.id, 'Perfecto, gracias 🙌', 60 * 4 + 40);
  await mkMsg(maria.id, juan.id, '¿Por el descuento del pedido nuevo te respondo en la noche?', 30, false);

  // Mensaje pendiente de Lucía a María
  await mkMsg(lucia.id, maria.id, '¿Llegan los croissants a las 8 en punto?', 15, false);

  console.log('✅ Seed Acopio completado');
  console.log('   PROVEEDORES:');
  console.log('     María (Panadería Acopio):       0999000001 / acopio123');
  console.log('     Roberto (El Granero):           0999000010 / acopio123');
  console.log('   CLIENTES:');
  console.log('     Juan (Tienda San Juan):         0999000002 / cliente123');
  console.log('     Lucía (Mini-market):            0999000003 / cliente123');
  console.log('     Carlos (Cafetería) — PENDIENTE: 0999000004 / cliente123');
  console.log('     Ana (Tienda nueva)  — PENDIENTE: 0999000005 / cliente123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
