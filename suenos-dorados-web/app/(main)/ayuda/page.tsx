"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "¿Cuánto tarda el envío?",
    a: "El envío tarda entre 3 y 5 días hábiles según tu ciudad.",
  },
  {
    q: "¿Puedo devolver un producto?",
    a: "Sí, tienes 30 días para hacer la devolución sin costo si el producto tiene defecto de fábrica.",
  },
  {
    q: "¿Cómo hago seguimiento a mi pedido?",
    a: 'En la sección "Mis pedidos" podrás ver el estado actualizado de tu pedido.',
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas Visa, Mastercard, PSE, Nequi y pago contra entrega.",
  },
  {
    q: "¿Tiene garantía los productos?",
    a: "Los productos tienen garantía de 6 meses por defecto de fábrica.",
  },
  {
    q: "¿Hacen envíos a todo Colombia?",
    a: "Sí, hacemos envíos a todas las ciudades principales y municipios de Colombia.",
  },
];

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/perfil" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ayuda y soporte</h1>
      </div>

      {/* Contact options */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Contáctanos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: MessageCircle,
              label: "Chat en vivo",
              sub: "Respuesta en minutos",
              color: "bg-green-100 text-green-600",
            },
            {
              icon: Mail,
              label: "Enviar un correo",
              sub: "soporte@suenosdorados.co",
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Phone,
              label: "Llamar al soporte",
              sub: "+57 300 000 0000",
              color: "bg-primary-light text-primary",
            },
          ].map(({ icon: Icon, label, sub, color }) => (
            <button
              key={label}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Preguntas frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
