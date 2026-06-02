import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api, formatoUSD } from '../../lib/api';
import Logo from '../../components/Logo';

export default function NotaVentaPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    // POST genera si no existe, y devuelve la existente si ya hay
    api(`/notas/pedido/${id}`, { method: 'POST' }).then(setData);
  }, [id]);

  if (!data) return <p className="text-amasa-700">Cargando…</p>;

  const { pedido } = data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/admin/pedidos" className="btn-ghost">
          <ArrowLeft size={18} /> Volver
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={18} /> Imprimir / Descargar
        </button>
      </div>

      <div className="card !p-8">
        <div className="flex items-center justify-between mb-8 border-b border-amasa-100 pb-6">
          <Logo />
          <div className="text-right">
            <p className="text-sm text-amasa-700">Nota de venta</p>
            <p className="text-2xl font-extrabold text-amasa-900">{data.numero}</p>
            <p className="text-sm text-amasa-700">
              {new Date(data.fecha).toLocaleDateString('es-EC', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-amasa-600 uppercase font-semibold mb-1">Cliente</p>
            <p className="font-bold">{pedido.cliente.nombre}</p>
            <p className="text-sm text-amasa-700">{pedido.cliente.telefono}</p>
            <p className="text-sm text-amasa-700">{pedido.cliente.direccion || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-amasa-600 uppercase font-semibold mb-1">Pedido</p>
            <p className="font-bold">#{pedido.id}</p>
            <p className="text-sm text-amasa-700">Hora de entrega: {pedido.horaEntrega}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left border-b-2 border-amasa-200">
              <th className="py-2">Producto</th>
              <th className="py-2 text-center">Cant.</th>
              <th className="py-2 text-right">Precio</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((it: any) => (
              <tr key={it.id} className="border-b border-amasa-100">
                <td className="py-3 font-semibold">{it.producto.nombre}</td>
                <td className="py-3 text-center">{it.cantidad}</td>
                <td className="py-3 text-right">{formatoUSD(it.precioUnitario)}</td>
                <td className="py-3 text-right font-semibold">
                  {formatoUSD(it.cantidad * it.precioUnitario)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 space-y-2">
            <div className="flex justify-between text-2xl font-extrabold border-t-2 border-amasa-200 pt-3">
              <span>Total</span>
              <span className="text-amasa-600">{formatoUSD(data.total)}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-amasa-600 mt-8">
          Gracias por confiar en Amasa · Loja, Ecuador
        </p>
      </div>
    </div>
  );
}
