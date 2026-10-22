import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/organism/NavBar";
import Footer from "./components/organism/Footer";
import ScrollArriba from "./components/organism/Cambios";
import Inicio from "./components/pages/Inicio";
import Productos from "./components/pages/Productos";
import Detalleproducto from "./components/pages/DetalleProducto";
import Carrito from "./components/pages/Carrito";
import Checkout from "./components/pages/Checkout";
import Contacto from "./components/pages/Contacto";
import Gracias from "./components/pages/Gracias";
import QuienesSomos from "./components/pages/QuienesSomos";
import Login from "./components/pages/Login";
import Usuario from "./components/pages/Usuario";
import Vendedor from "./components/pages/Vendedor";
import Admin from "./components/pages/Admin";
import NoEncontrado from "./components/pages/NoEncontrado";

interface Producto {
  id: number;
  categoria: string; 
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

interface Categoria {
  slug: string;
  nombre: string;       
  nombreCorto: string;  
}



const categorias: Categoria[] = [
  { slug: 'construccion', nombre: 'Materiales de Construcción', nombreCorto: 'Mat. Construcción' },
  { slug: 'pintura',      nombre: 'Pinturas',     nombreCorto: 'Pinturas' },
  { slug: 'herramientas', nombre: 'Herramientas', nombreCorto: 'Herramientas' },
  { slug: 'gasfiteria',   nombre: 'Gasfitería',   nombreCorto: 'Gasfitería' },
  { slug: 'electricidad', nombre: 'Electricidad', nombreCorto: 'Electricidad' },
  { slug: 'tornillos',    nombre: 'Tornillos',    nombreCorto: 'Tornillos' },
  { slug: 'madera',       nombre: 'Madera',       nombreCorto: 'Madera' },
  { slug: 'seguridad',    nombre: 'Seguridad',    nombreCorto: 'Seguridad' },
  { slug: 'jardin',       nombre: 'Jardín',       nombreCorto: 'Jardín' },
]

const productos: Producto[] = [
  {
    id: 701,
    categoria: "construccion",
    titulo: "Saco Cemento de Alta Resistencia 25kg",
    descripcion: "Cemento de fraguado rápido para obras estructurales, cimentaciones, pegado de ladrillos y preparación de morteros de alta durabilidad.",
    precio: 4990,
    imagen: "/img/contr1.jpg",
  },
  {
    id: 702,
    categoria: "construccion",
    titulo: "Arena Gruesa para Construcción 1m³",
    descripcion: "Arena procesada y limpia de impurezas, ideal para mezclas de hormigón, afrechado de muros y pega de albañilería en obra gruesa.",
    precio: 18900,
    imagen: "/img/contr3.jpg",
  },
  {
    id: 703,
    categoria: "construccion",
    titulo: "Ladrillo Macizo y Perforado",
    descripcion: "Ladrillo cerámico hueco diseñado para la edificación de muros perimetrales e interiores con excelente aislamiento térmico y acústico.",
    precio: 650,
    imagen: "/img/contr2.jpg",
  },
  {
    id: 704,
    categoria: "construccion",
    titulo: "Gravilla Seleccionada para Hormigón 1m³",
    descripcion: "Árido chancado de alta dureza y granulometría homogénea para la confección de radieres, pilares, cadenas y vaciados de concreto.",
    precio: 22900,
    imagen: "/img/contr4.jpg",
  },
  {
    id: 401,
    categoria: "pintura",
    titulo: "Impermeabilizante para Muros y Techos",
    descripcion: "Recubrimiento elástico sellador diseñado para proteger muros exteriores y techumbres contra filtraciones de agua, humedad y grietas.",
    precio: 38990,
    imagen: "/img/pint2.jpg",
  },
  {
    id: 402,
    categoria: "pintura",
    titulo: "Esmalte al Agua Azul Profundo 1 Galón",
    descripcion: "Pintura decorativa de secado rápido, bajo olor y terminación satinada, ideal para transformar espacios interiores con aplicación a brocha o rodillo.",
    precio: 14990,
    imagen: "/img/pint3.jpg",
  },
  {
    id: 403,
    categoria: "pintura",
    titulo: "Pintura Vinil Acrílica Blancas 19L",
    descripcion: "Pintura de acabado mate lavable para interiores y exteriores, con gran poder cubritivo y excelente resistencia al desgaste del tiempo.",
    precio: 34990,
    imagen: "/img/pint1.jpg",
  },
  {
    id: 404,
    categoria: "pintura",
    titulo: "Esmalte Sintético Colores Variados 1/4 Galón",
    descripcion: "Pintura de alto brillo y resistencia superior para la protección y acabado de madera, fierros y superficies metálicas en exteriores.",
    precio: 5990,
    imagen: "/img/pint4.jpg",
  },
  {
    id: 301,
    categoria: "herramientas",
    titulo: "Set de Alicates Manuales 3 Piezas",
    descripcion: "Juego esencial de alicates de corte, punta y universal con mangos ergonómicos antideslizantes para trabajos mecánicos y eléctricos en el hogar.",
    precio: 11990,
    imagen: "/img/herr1.jpg",
  },
  {
    id: 302,
    categoria: "herramientas",
    titulo: "Kit Set de Herramientas Mecánicas",
    descripcion: "Completo juego de llaves chicanas, dados, extensiones y llaves fijas organizadas en maletín rígido para reparaciones automotrices y del taller.",
    precio: 45990,
    imagen: "/img/herr2.jpg",
  },
  {
    id: 303,
    categoria: "herramientas",
    titulo: "Cinta Métrica Profesional 8 Metros",
    descripcion: "Huincha con gancho magnético, cuerpo resistente a caídas y sistema de freno para mediciones precisas en obras y carpintería.",
    precio: 6990,
    imagen: "/img/herr3.jpg",
  },
  {
    id: 304,
    categoria: "herramientas",
    titulo: "Kit Taladro Inalámbrico 12V con Accesorios",
    descripcion: "Set completo con taladro atornillador a batería, martillo, huincha, cutter y brocas en maletín portátil para todo tipo de instalaciones.",
    precio: 32990,
    imagen: "/img/herr4.jpg",
  },
  {
    id: 201,
    categoria: "gasfiteria",
    titulo: "Set de Válvulas y Conexiones de Bronce",
    descripcion: "Conjunto de llaves de paso y fitting de bronce de alta durabilidad, diseñados para regular el paso de agua o gas de manera segura y sin fugas.",
    precio: 9990,
    imagen: "/img/gas1.jpg",
  },
  {
    id: 202,
    categoria: "gasfiteria",
    titulo: "Kit de Fittings PVC Alcantarillado",
    descripcion: "Variedad de coplas, codos y tees de PVC rígido ideados para la conducción eficaz de aguas residuales y desagraces en proyectos de construcción.",
    precio: 6490,
    imagen: "/img/gas2.jpg",
  },
  {
    id: 203,
    categoria: "gasfiteria",
    titulo: "Codos y Extensiones de PVC para Desagüe",
    descripcion: "Piezas de PVC livianas y de fácil acople mediante adhesivo, ideales para armar ramales de desagüe en lavaplatos, vanitorios y artefactos del hogar.",
    precio: 4990,
    imagen: "/img/gas3.jpg",
  },
  {
    id: 204,
    categoria: "gasfiteria",
    titulo: "Conexiones de PVC Presión Hidráulica",
    descripcion: "Fitting reforzado de color oscuro para redes de agua potable a alta presión, excelente para sistemas de riego, piscinas e instalaciones industriales.",
    precio: 7890,
    imagen: "/img/gas4.jpg",
  },
  {
    id: 101,
    categoria: "electricidad",
    titulo: "Interruptor Automático Magnetotérmico",
    descripcion: "Dispositivo de protección eléctrica tripolar ideal para prevenir sobrecargas y cortocircuitos en instalaciones residenciales e industriales, garantizando la seguridad del cableado.",
    precio: 12990,
    imagen: "/img/elec1.jpg",
  },
  {
    id: 102,
    categoria: "electricidad",
    titulo: "Alargador Múltiple con Switch",
    descripcion: "Zapatilla eléctrica de 5 tomas con cable reforzado, interruptor de encendido de seguridad e indicador luminoso para conectar múltiples dispositivos en interiores.",
    precio: 6990,
    imagen: "/img/elec4.jpg",
  },
  {
    id: 103,
    categoria: "electricidad",
    titulo: "Multímetro Digital Escala Manual",
    descripcion: "Instrumento de medición indispensable con puntas de prueba para medir voltaje, corriente continua y resistencia en proyectos de electricidad y electrónica.",
    precio: 8990,
    imagen: "/img/elec3.jpg",
  },
  {
    id: 104,
    categoria: "electricidad",
    titulo: "Regulador de Voltaje Automático",
    descripcion: "Equipo diseñado para estabilizar las variaciones de tensión de la red eléctrica y proteger electrodomésticos y equipos sensibles contra altos y bajos voltajes.",
    precio: 29990,
    imagen: "/img/elec2.jpg",
  },
  {
    id: 901,
    categoria: "tornillos",
    titulo: "Tornillo Auto Perforante 3\"",
    descripcion: "Tornillo de acero inoxidable con punta auto perforante, ideal para trabajos en madera, plástico y metales.",
    precio: 2990,
    imagen: "/img/torn1.jpg",
  },
  {
    id: 902,
    categoria: "tornillos",
    titulo: "Tornillo de Tuerca 2\"",
    descripcion: "Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.",
    precio: 3990,
    imagen: "/img/torn2.jpg",
  },
  {
    id: 903,
    categoria: "tornillos",
    titulo: "Tornillo de Tuerca 3\"",
    descripcion: "Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.",
    precio: 4990,
    imagen: "/img/torn3.jpg",
  },
  {
    id: 904,
    categoria: "tornillos",
    titulo: "Tornillo de Tuerca 4\"",
    descripcion: "Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.",
    precio: 5990,
    imagen: "/img/torn4.jpg",
  },
  {
    id: 601,
    categoria: "madera",
    titulo: "Piso Flotante Roble Natural 8mm",
    descripcion: "Uso: Interior (dormitorios, living, pasillos), Tráfico: Residencial alto / Comercial moderado (AC4),Instalación: Sistema Click fácil de ensamblar,Rendimiento: Caja cubre 2.39 m².",
    precio: 14990,
    imagen: "/img/madera4.jpg",
  },
  {
    id: 602,
    categoria: "madera",
    titulo: "Kit Muestras de Terciado y MDF",
    descripcion: "Tipos incluidos: Terciado ranurado, MDF enchapado, Coigüe y Roble, Espesores: 15mm y 18mm, Uso: Fabricación de muebles, repisas y revestimiento de muros, Acabado: Superficie lijada lista para barniz o pintura.",
    precio: 24990,
    imagen: "/img/madera1.jpg",
  },
  {
    id: 603,
    categoria: "madera",
    titulo: "Piso Vinílico SPC Texturizado",
    descripcion: "Propiedad clave: 100% resistente al agua y humedad, Espesor: 4.2mm con manta acústica integrada, Uso: Apto para baños, cocinas y espacios comerciales, Garantía: 10 años uso residencial.",
    precio: 18990,
    imagen: "/img/madera2.jpg",
  },
  {
    id: 604,
    categoria: "madera",
    titulo: "Panel Deco Wall Listonado Roble",
    descripcion: "Medidas: 240 cm x 60 cm (Espesor 21mm), Material: Listones de MDF sobre fieltro acústico negro de alta densidad, Uso: Decoración de interiores y aislamiento acústico, Montaje: Adhesivo de montaje o atornillado directo a la pared.",
    precio: 2100,
    imagen: "/img/madera3.jpg",
  },
  {
    id: 801,
    categoria: "seguridad",
    titulo: "Respirador Medio Rostro con Filtros y Lentes",
    descripcion: "Kit completo de protección respiratoria y ocular con filtros reemplazables para vapores orgánicos, gases y partículas de polvo en ambientes exigentes.",
    precio: 18990,
    imagen: "/img/seg1.jpg",
  },
  {
    id: 802,
    categoria: "seguridad",
    titulo: "Kit Seguridad Industrial Multiuso",
    descripcion: "Conjunto integral para faenas que incluye casco rígido de obra, guantes de cuero reforzados, antiparras y protectores auditivos de copa.",
    precio: 24990,
    imagen: "/img/seg2.jpg",
  },
  {
    id: 803,
    categoria: "seguridad",
    titulo: "Antiparras Antipolvo Profesional DeWalt",
    descripcion: "Lentes de seguridad sellados con cinta elástica ajustable y recubrimiento antirrayadura para protección completa contra impactos de esquirlas y polvo.",
    precio: 9990,
    imagen: "/img/seg3.jpg",
  },
  {
    id: 804,
    categoria: "seguridad",
    titulo: "Casco de Seguridad Industrial con Auriculares",
    descripcion: "Casco dieléctrico de alta densidad integrado con antiparas panorámicas y protectores auditivos acoplables para máxima seguridad laboral.",
    precio: 21990,
    imagen: "/img/seg4.jpg",
  },
  {
    id: 501,
    categoria: "jardin",
    titulo: "Set Esencial de Jardinería y Cultivo",
    descripcion: "Kit integral para cuidado de plantas. Incluye regadera metálica, maceta de arcilla, guantes, herramientas de mano (pala, rastrillo, tijeras de podar), pulverizador de agua, paquetes de semillas y fertilizante orgánico líquido.",
    precio: 35000,
    imagen: "/img/jardin1.jpg",
  },
  {
    id: 502,
    categoria: "jardin",
    titulo: "Kit de Herramientas de Jardinería con Maletín",
    descripcion: "Juego completo de herramientas de jardín de color verde con mangos ergonómicos. Incluye tijeras de podar, palas, rastrillos de mano, rociador y un maletín rígido para un transporte y almacenamiento ordenado.",
    precio: 30000,
    imagen: "/img/jardin2.jpg",
  },
  {
    id: 503,
    categoria: "jardin",
    titulo: "Cortacésped a Gasolina con Bolsa Recolectora",
    descripcion: "Máquina cortacésped de empuje equipada con motor a combustión, chasis resistente de color rojo y negro, ruedas de alta tracción y bolsa trasera recolectora de pasto. Ideal para superficies medianas y grandes.",
    precio: 280000,
    imagen: "/img/jardin3.jpg",
  },
  {
    id: 504,
    categoria: "jardin",
    titulo: "Carretilla de Mano para Jardín y Construcción (Pretul)",
    descripcion: "Medidas:Carretilla de uso rudo con tolva metálica roja de marca Pretul, estructura de tubo de acero, empuñaduras de goma y rueda neumática frontal para transportar tierra, escombros o materiales pesados.",
    precio: 50000,
    imagen: "/img/jardin4.jpg",
  },
]

const CARRITO_KEY = 'carritoFerreteria'


interface Linea {
  id: number;
  cantidad: number;
}

function leerLineas(): Linea[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]')
    if (!Array.isArray(guardado)) return []
    return guardado.filter(
      (l): l is Linea =>
        typeof l?.id === 'number' &&
        typeof l?.cantidad === 'number' &&
        productos.some(p => p.id === l.id)
    )
  } catch {
    return []
  }
}

function App() {

  
  const [lineas, setLineas] = useState<Linea[]>(leerLineas)

  useEffect(() => {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(lineas))
  }, [lineas])

  const items = lineas.flatMap(linea => {
    const producto = productos.find(p => p.id === linea.id)
    return producto ? [{ ...producto, cantidad: linea.cantidad }] : []
  })

  const totalUnidades = items.reduce((suma, i) => suma + i.cantidad, 0)
  const subtotal = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  const agregar = (id: number) =>
    setLineas(actual =>
      actual.some(l => l.id === id)
        ? actual.map(l => l.id === id ? { ...l, cantidad: l.cantidad + 1 } : l)
        : [...actual, { id, cantidad: 1 }]
    )

  const cambiarCantidad = (id: number, cantidad: number) =>
    setLineas(actual =>
      actual.map(l =>
        l.id === id ? { ...l, cantidad: Math.max(1, Math.floor(cantidad) || 1) } : l
      )
    )

  const eliminar = (id: number) =>
    setLineas(actual => actual.filter(l => l.id !== id))

  return(
    <div className="d-flex flex-column min-vh-100">

      <ScrollArriba />
      <NavBar categorias={categorias} totalUnidades={totalUnidades} />

      <div className="flex-grow-1">
        <Routes>

          <Route path="/" element={<Inicio />} />

          <Route path="/productos" element={<Productos productos={productos} categorias={categorias} onAgregar={agregar} />} />

          <Route path="/categoria/:slug" element={<Productos productos={productos} categorias={categorias} onAgregar={agregar} />} />

          <Route path="/productos/:id" element={<Detalleproducto productos={productos} categorias={categorias} onAgregar={agregar} />} />

          <Route
            path="/carrito"
            element={
              <Carrito
                items={items}
                subtotal={subtotal}
                onCambiarCantidad={cambiarCantidad}
                onEliminar={eliminar}
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout
                items={items}
                subtotal={subtotal}
                onPedidoRealizado={() => setLineas([])}
              />
            }
          />

          <Route path="/contacto" element={<Contacto />} />

          <Route path="/gracias" element={<Gracias />} />

          <Route path="/quienes-somos" element={<QuienesSomos />} />

          <Route path="/login" element={<Login />} />

          <Route path="/usuario" element={<Usuario />} />

          <Route path="/vendedor" element={<Vendedor />} />

          <Route path="/admin" element={<Admin />} />

          <Route path="*" element={<NoEncontrado />} />

        </Routes>
      </div>

      <Footer />

    </div>
  )

}

export default App
