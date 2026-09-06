import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import * as motion from "framer-motion/client";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCF0] text-slate-900 font-sans selection:bg-[#397245] selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#FDFCF0]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#1B2945]">
              <Image src="/images/logo.png" alt="Casa & Campo Barinas Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-lg md:text-xl text-[#1B2945] uppercase tracking-tight">Casa & Campo</span>
          </div>
          <a
            href="https://wa.link/58ll3r"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1B2945] hover:bg-[#397245] text-white px-5 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 text-sm md:text-base shadow-sm"
          >
            <Phone size={18} />
            <span className="hidden sm:inline">RESERVA AQUÍ</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Casa y Campo Paisaje"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2945]/90 via-[#1B2945]/50 to-transparent" />
        </div>

        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight drop-shadow-lg"
          >
            El Placer de Sentirse Bien
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-stone-100 mb-10 max-w-2xl mx-auto font-medium"
          >
            Tu oasis natural en Barinas. Piscina, eventos privados, gastronomía llanera y hospedaje para desconectar de la rutina.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a
              href="https://wa.link/58ll3r"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#397245] hover:bg-[#2d5a36] text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl"
            >
              <Phone size={24} />
              PLANIFICA TU VISITA
            </a>
          </motion.div>
        </div>
      </section>

      {/* SERVICIOS / EXPERIENCIAS */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-[#397245] uppercase tracking-widest mb-2">Descubre</h2>
            <h3 className="text-3xl md:text-5xl font-black text-[#1B2945]">Nuestras Experiencias</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Piscina */}
            <div className="group rounded-2xl overflow-hidden bg-[#FDFCF0] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="relative h-48 overflow-hidden">
                <Image src="/images/pool.jpg" alt="Piscina Casa y Campo" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#1B2945] mb-2 uppercase">Domingos de Piscina</h4>
                <p className="text-slate-600 text-sm leading-relaxed">El mejor ambiente familiar de Barinas. Date un CHAPUZÓN y disfruta del sol con seguridad y confort.</p>
              </div>
            </div>

            {/* Eventos */}
            <div className="group rounded-2xl overflow-hidden bg-[#FDFCF0] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="relative h-48 bg-[#1B2945] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/images/hero.jpg')] bg-cover bg-center" />
                <span className="relative text-white font-bold text-2xl uppercase tracking-widest">Cumpleaños</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#1B2945] mb-2 uppercase">Eventos Privados</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Instalaciones exclusivas para tus celebraciones. Desde reuniones íntimas hasta grandes fiestas.</p>
              </div>
            </div>

            {/* Comida */}
            <div className="group rounded-2xl overflow-hidden bg-[#FDFCF0] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="relative h-48 bg-[#397245] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/images/hero.jpg')] bg-cover bg-center" />
                <span className="relative text-white font-bold text-2xl uppercase tracking-widest">Sabor Llanero</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#1B2945] mb-2 uppercase">Gastronomía</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Deleita tu paladar con nuestra auténtica comida llanera. Sancocho, parrilla y el mejor GUARAPO.</p>
              </div>
            </div>

            {/* Hospedaje */}
            <div className="group rounded-2xl overflow-hidden bg-[#FDFCF0] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="relative h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/images/pool.jpg')] bg-cover bg-center" />
                <span className="relative text-white font-bold text-2xl uppercase tracking-widest">Descanso</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#1B2945] mb-2 uppercase">Hospedaje</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Conecta con la naturaleza y disfruta de un REMANSO de paz quedándote con nosotros.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / FOOTER */}
      <footer className="bg-[#1B2945] text-stone-300 py-16 border-t-8 border-[#397245]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12 bg-white rounded-full p-1">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image src="/images/logo.png" alt="Logo" fill className="object-cover" />
                  </div>
                </div>
                <span className="text-2xl font-black text-white uppercase tracking-tight">Casa & Campo</span>
              </div>
              <p className="text-sm leading-relaxed mb-6 opacity-80">
                El lugar ideal en Barinas para desconectar de la rutina y disfrutar del verdadero placer de sentirse bien en familia. Atendido directamente por su dueño Alirio Arévalo.
              </p>
              <div className="flex gap-4">
                <a href="https://instagram.com/casacampobarinas1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#397245] transition-colors text-white">
                  <span className="text-xs font-bold">IG</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#397245] transition-colors text-white">
                  <span className="text-xs font-bold">FB</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 uppercase">Visítanos</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-[#397245] shrink-0 mt-0.5" />
                  <a href="https://share.google/YFvxYNzo1vyFo3w5u" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                    Barinas, Venezuela. <br/>(Ver en Google Maps)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6 uppercase">Reservaciones</h4>
              <p className="text-sm mb-6 opacity-80">Atención personalizada vía WhatsApp para garantizar tu mejor experiencia.</p>
              <a
                href="https://wa.link/58ll3r"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#397245] hover:bg-white hover:text-[#1B2945] text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors w-full justify-center"
              >
                <Phone size={18} />
                CONTÁCTANOS AHORA
              </a>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs opacity-60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Casa & Campo Barinas. Todos los derechos reservados.</p>
            <p>Desarrollado con WEBKIT by CEINCA-AI-OS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
