"use client";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/registro" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad y Protección de Datos</h1>
          <p className="text-sm text-gray-400">Última actualización: 22 de mayo de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 text-sm text-gray-600 leading-relaxed card p-8">

        <div className="bg-primary-light border border-primary/20 rounded-xl p-4 flex gap-3">
          <Shield size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-primary text-xs font-medium">
            En cumplimiento de la <strong>Ley 1581 de 2012</strong> (Ley de Protección de Datos Personales de Colombia)
            y el <strong>Decreto 1377 de 2013</strong>, Sueños Dorados informa su política de tratamiento de datos personales.
          </p>
        </div>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">1. Responsable del tratamiento</h2>
          <p>
            <strong>Sueños Dorados S.A.S.</strong><br />
            NIT: 900.XXX.XXX-X<br />
            Dirección: Calle 10 #3-4, Cali, Valle del Cauca, Colombia<br />
            Correo: datospersonales@suenosdorados.co<br />
            Teléfono: +57 300 000 0000
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">2. Datos personales que recopilamos</h2>
          <p>Recopilamos los siguientes datos personales:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Datos de identificación:</strong> nombre completo, número de documento de identidad.</li>
            <li><strong>Datos de contacto:</strong> correo electrónico, número de teléfono, dirección de entrega.</li>
            <li><strong>Datos de transacción:</strong> historial de compras, métodos de pago (no almacenamos datos completos de tarjetas).</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de dispositivo, páginas visitadas, cookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">3. Finalidades del tratamiento</h2>
          <p>Sus datos personales serán utilizados para:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Gestionar su cuenta de usuario y autenticación.</li>
            <li>Procesar y entregar sus pedidos.</li>
            <li>Enviar confirmaciones de compra y actualizaciones de envío.</li>
            <li>Brindar atención al cliente y soporte postventa.</li>
            <li>Enviar comunicaciones comerciales y promocionales (con su consentimiento).</li>
            <li>Cumplir obligaciones legales y fiscales.</li>
            <li>Mejorar nuestros productos y servicios mediante análisis estadísticos.</li>
            <li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">4. Base legal del tratamiento</h2>
          <p>
            El tratamiento de sus datos se realiza con base en:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Consentimiento:</strong> otorgado al aceptar esta política durante el registro.</li>
            <li><strong>Ejecución contractual:</strong> necesario para procesar sus compras y entregas.</li>
            <li><strong>Obligación legal:</strong> para cumplir con normativas tributarias y comerciales colombianas.</li>
            <li><strong>Interés legítimo:</strong> para prevención de fraudes y seguridad de la plataforma.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">5. Derechos del titular</h2>
          <p>
            De conformidad con la Ley 1581 de 2012, usted tiene los siguientes derechos:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre usted.</li>
            <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de sus datos cuando no sean necesarios.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines específicos.</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y legible.</li>
            <li><strong>Revocación:</strong> retirar el consentimiento otorgado en cualquier momento.</li>
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos, envíe su solicitud a: <strong>datospersonales@suenosdorados.co</strong>
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">6. Transferencia de datos a terceros</h2>
          <p>
            Sus datos podrán ser compartidos con:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Operadores logísticos:</strong> para gestionar la entrega de sus pedidos.</li>
            <li><strong>Pasarelas de pago:</strong> para procesar transacciones de forma segura.</li>
            <li><strong>Proveedores de tecnología:</strong> que nos ayudan a operar la plataforma.</li>
            <li><strong>Autoridades competentes:</strong> cuando sea requerido por ley.</li>
          </ul>
          <p className="mt-2">
            No vendemos ni cedemos sus datos personales a terceros con fines comerciales propios.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">7. Conservación de datos</h2>
          <p>
            Sus datos personales serán conservados durante el tiempo que mantenga su cuenta activa y
            por el período adicional requerido por obligaciones legales (mínimo 5 años para datos
            de transacciones comerciales según la legislación colombiana).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">8. Seguridad de la información</h2>
          <p>
            Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales
            contra acceso no autorizado, pérdida, destrucción o divulgación. Esto incluye cifrado SSL/TLS,
            control de acceso y auditorías periódicas de seguridad.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">9. Cookies y tecnologías similares</h2>
          <p>
            Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación, analizar
            el tráfico y personalizar contenido. Puede gestionar sus preferencias de cookies desde la
            configuración de su navegador.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">10. Comunicaciones comerciales</h2>
          <p>
            Si otorga su consentimiento, le enviaremos comunicaciones sobre ofertas, promociones y
            novedades de Sueños Dorados. Puede cancelar la suscripción en cualquier momento haciendo
            clic en "Cancelar suscripción" en cualquier correo recibido o contactándonos directamente.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">11. Autoridad de control</h2>
          <p>
            Si considera que el tratamiento de sus datos no cumple con la normativa vigente, puede
            presentar una reclamación ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong>,
            autoridad de protección de datos en Colombia: www.sic.gov.co
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-900 text-base mb-2">12. Cambios en la política</h2>
          <p>
            Nos reservamos el derecho de actualizar esta Política de Privacidad. Le notificaremos
            cualquier cambio significativo por correo electrónico o mediante un aviso destacado en
            la Plataforma con al menos 10 días de anticipación.
          </p>
        </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-primary" />
              <h3 className="font-bold text-gray-800 text-sm">Contenido</h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-500">
              {["Responsable","Datos recopilados","Finalidades","Base legal","Derechos","Transferencia","Conservación","Seguridad","Cookies","Comunicaciones","Autoridad de control","Cambios"].map((t, i) => (
                <li key={t} className="hover:text-primary cursor-pointer transition-colors">
                  {i+1}. {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-primary-light rounded-xl">
              <p className="text-xs text-primary font-medium">Ley 1581 de 2012</p>
              <p className="text-xs text-gray-500 mt-0.5">Protección de Datos Personales — Colombia</p>
            </div>
            <Link href="/registro" className="btn-primary text-sm py-2.5 mt-4 block text-center">
              Volver al registro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
