"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/registro" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
          <p className="text-sm text-gray-400">Última actualización: 22 de mayo de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 text-sm text-gray-600 leading-relaxed card p-8">
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar la plataforma web de <strong>Sueños Dorados</strong> (en adelante "la Plataforma"),
            usted acepta quedar vinculado por estos Términos y Condiciones de Uso. Si no está de acuerdo con alguno
            de estos términos, le pedimos que no utilice nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">2. Descripción del servicio</h2>
          <p>
            Sueños Dorados es una tienda en línea dedicada a la comercialización de productos para el hogar,
            especialmente ropa de cama, almohadas, edredones y artículos relacionados con el descanso y confort.
            Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en
            cualquier momento.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">3. Registro y cuenta de usuario</h2>
          <p>
            Para acceder a ciertas funcionalidades de la Plataforma, deberá crear una cuenta proporcionando
            información veraz, completa y actualizada. Usted es responsable de mantener la confidencialidad
            de su contraseña y de todas las actividades que ocurran bajo su cuenta.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">4. Uso aceptable</h2>
          <p>El usuario se compromete a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>No utilizar la Plataforma para fines ilegales o no autorizados.</li>
            <li>No intentar acceder a áreas restringidas del sistema.</li>
            <li>No reproducir, duplicar o copiar contenido sin autorización expresa.</li>
            <li>No transmitir virus, malware u otro código de naturaleza destructiva.</li>
            <li>Proporcionar información veraz en todos los formularios de la Plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">5. Compras y pagos</h2>
          <p>
            Al realizar una compra, usted garantiza que tiene autorización para usar el método de pago
            seleccionado. Los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplique.
            Sueños Dorados se reserva el derecho de cancelar pedidos en caso de errores de precio o
            disponibilidad de inventario.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">6. Envíos y entregas</h2>
          <p>
            Los tiempos de entrega son estimados y pueden variar según la ubicación geográfica y disponibilidad
            del transportista. Sueños Dorados no se hace responsable por demoras causadas por terceros,
            condiciones climáticas o situaciones de fuerza mayor.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">7. Devoluciones y garantías</h2>
          <p>
            Los productos cuentan con garantía de 6 meses por defectos de fábrica. Las devoluciones se
            aceptan dentro de los 30 días calendario siguientes a la entrega, siempre que el producto se
            encuentre en su estado original, sin uso y con empaque intacto.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">8. Propiedad intelectual</h2>
          <p>
            Todo el contenido de la Plataforma, incluyendo textos, imágenes, logotipos, diseños y software,
            es propiedad de Sueños Dorados o de sus licenciantes y está protegido por las leyes de propiedad
            intelectual colombianas e internacionales.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">9. Limitación de responsabilidad</h2>
          <p>
            Sueños Dorados no será responsable por daños indirectos, incidentales, especiales o consecuentes
            derivados del uso o la imposibilidad de uso de la Plataforma o los productos adquiridos.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">10. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento.
            Los cambios entrarán en vigor inmediatamente después de su publicación en la Plataforma.
            El uso continuado del servicio constituye la aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">11. Ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será
            sometida a la jurisdicción de los tribunales competentes de la ciudad de Cali, Colombia.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">12. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos Términos y Condiciones, puede contactarnos en:
            <br />
            📧 legal@suenosdorados.co
            <br />
            📞 +57 300 000 0000
          </p>
        </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Contenido</h3>
            <ul className="space-y-2 text-xs text-gray-500">
              {["Aceptación","Descripción","Registro","Uso aceptable","Compras","Envíos","Devoluciones","Propiedad intelectual","Responsabilidad","Modificaciones","Ley aplicable","Contacto"].map((t, i) => (
                <li key={t} className="hover:text-primary cursor-pointer transition-colors">
                  {i+1}. {t}
                </li>
              ))}
            </ul>
            <Link href="/registro" className="btn-primary text-sm py-2.5 mt-5 block text-center">
              Volver al registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
