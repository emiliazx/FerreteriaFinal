export type CatalogProduct = {
  name: string
  tag: string
  image: string
  price: string
  description: string
}

export type CartItem = CatalogProduct & { quantity: number }

export function getProductId(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getCatalogImage(path: string) {
  const filename = path.split('/').pop()
  if (!filename || filename === '.' || filename === '..') {
    throw new Error(`No se encontró la imagen del catálogo: ${path}`)
  }
  return `/img/${filename}`
}

function product(name: string, price: string, image: string, tag: string, description: string): CatalogProduct {
  return { name, price, image, tag, description }
}

export const catalogSections: { id: string; title: string; homeTitle: string; image: string; products: CatalogProduct[] }[] = [
  { id: 'materiales', title: 'Materiales de construcción', homeTitle: 'Construcción', image: '/construccion.jpg', products: [
    product('Saco Cemento de Alta Resistencia 25kg', '$4.990', '/contr1.jpg', 'Construcción', 'Cemento de fraguado rápido para obras estructurales, cimentaciones, pegado de ladrillos y preparación de morteros de alta durabilidad.'),
    product('Arena Gruesa para Construcción 1m³', '$18.900', '/contr3.jpg', 'Construcción', 'Arena procesada y limpia de impurezas, ideal para mezclas de hormigón, afrechado de muros y pega de albañilería en obra gruesa.'),
    product('Ladrillo Cerámico Hueco', '$650', '/contr2.jpg', 'Construcción', 'Ladrillo cerámico hueco diseñado para la edificación de muros perimetrales e interiores con excelente aislamiento térmico y acústico.'),
    product('Gravilla Seleccionada para Hormigón 1m³', '$22.900', '/contr4.jpg', 'Construcción', 'Árido chancado de alta dureza y granulometría homogénea para la confección de radieres, pilares, cadenas y vaciados de concreto.'),
  ] },
  { id: 'pinturas', title: 'Pinturas', homeTitle: 'Pinturas', image: '/pintura.jpg', products: [
    product('Impermeabilizante para Muros y Techos', '$38.990', '/pint2.jpg', 'Pinturas', 'Recubrimiento elástico sellador diseñado para proteger muros exteriores y techumbres contra filtraciones de agua, humedad y grietas.'),
    product('Esmalte al Agua Azul Profundo 1 Galón', '$14.990', '/pint3.jpg', 'Pinturas', 'Pintura decorativa de secado rápido, bajo olor y terminación satinada, ideal para transformar espacios interiores con aplicación a brocha o rodillo.'),
    product('Pintura Vinil Acrílica Blanca 19L', '$34.990', '/pint1.jpg', 'Pinturas', 'Pintura de acabado mate lavable para interiores y exteriores, con gran poder cubritivo y excelente resistencia al desgaste del tiempo.'),
    product('Esmalte Sintético Colores Variados 1/4 Galón', '$5.990', '/pint4.jpg', 'Pinturas', 'Pintura de alto brillo y resistencia superior para la protección y acabado de madera, fierros y superficies metálicas en exteriores.'),
  ] },
  { id: 'herramientas', title: 'Herramientas', homeTitle: 'Manuales', image: '/manuales.jpg', products: [
    {
      name: 'Set de Alicates Manuales 3 Piezas',
      price: '$11.990',
      image: '/herr1.jpg',
      tag: 'Herramientas',
      description: 'Juego esencial de alicates de corte, punta y universal con mangos ergonómicos antideslizantes para trabajos mecánicos y eléctricos en el hogar.',
    },
    {
      name: 'Kit Set de Herramientas Mecánicas',
      price: '$45.990',
      image: '/herr2.jpg',
      tag: 'Herramientas',
      description: 'Completo juego de llaves chicanas, dados, extensiones y llaves fijas organizadas en maletín rígido para reparaciones automotrices y del taller.',
    },
    {
      name: 'Cinta Métrica Profesional 8 Metros',
      price: '$6.990',
      image: '/herr3.jpg',
      tag: 'Herramientas',
      description: 'Huincha con gancho magnético, cuerpo resistente a caídas y sistema de freno para mediciones precisas en obras y carpintería.',
    },
    {
      name: 'Kit Taladro Inalámbrico 12V con Accesorios',
      price: '$32.990',
      image: '/herr4.jpg',
      tag: 'Herramientas',
      description: 'Set completo con taladro atornillador a batería, martillo, huincha, cutter y brocas en maletín portátil para todo tipo de instalaciones.',
    },
  ] },
  { id: 'gasfiteria', title: 'Gasfitería', homeTitle: 'Gasfitería', image: '/gasfiteria.jpg', products: [
    {
      name: 'Set de Válvulas y Conexiones de Bronce',
      price: '$9.990',
      image: '/gas1.jpg',
      tag: 'Gasfitería',
      description: 'Conjunto de llaves de paso y fitting de bronce de alta durabilidad, diseñados para regular el paso de agua o gas de manera segura y sin fugas.',
    },
    {
      name: 'Kit de Fittings PVC Alcantarillado',
      price: '$6.490',
      image: '/gas2.jpg',
      tag: 'Gasfitería',
      description: 'Variedad de coplas, codos y tees de PVC rígido ideados para la conducción eficaz de aguas residuales y desagües en proyectos de construcción.',
    },
    {
      name: 'Codos y Extensiones de PVC para Desagüe',
      price: '$4.990',
      image: '/gas3.jpg',
      tag: 'Gasfitería',
      description: 'Piezas de PVC livianas y de fácil acople mediante adhesivo, ideales para armar ramales de desagüe en lavaplatos, vanitorios y artefactos del hogar.',
    },
    {
      name: 'Conexiones de PVC Presión Hidráulica',
      price: '$7.890',
      image: '/gas4.jpg',
      tag: 'Gasfitería',
      description: 'Fitting reforzado de color oscuro para redes de agua potable a alta presión, excelente para sistemas de riego, piscinas e instalaciones industriales.',
    },
  ] },
  { id: 'electricidad', title: 'Electricidad', homeTitle: 'Eléctricas', image: '/electricas.jpg', products: [
    {
      name: 'Interruptor Automático Magnetotérmico',
      price: '$12.990',
      image: '/Elec1.jpg',
      tag: 'Electricidad',
      description: 'Dispositivo de protección eléctrica tripolar ideal para prevenir sobrecargas y cortocircuitos en instalaciones residenciales e industriales, garantizando la seguridad del cableado.',
    },
    {
      name: 'Alargador Múltiple con Switch',
      price: '$6.990',
      image: '/Elec4.jpg',
      tag: 'Electricidad',
      description: 'Zapatilla eléctrica de 5 tomas con cable reforzado, interruptor de encendido de seguridad e indicador luminoso para conectar múltiples dispositivos en interiores.',
    },
    {
      name: 'Multímetro Digital Escala Manual',
      price: '$8.990',
      image: '/Elec3.jpg',
      tag: 'Electricidad',
      description: 'Instrumento de medición indispensable con puntas de prueba para medir voltaje, corriente continua y resistencia en proyectos de electricidad y electrónica.',
    },
    {
      name: 'Regulador de Voltaje Automático',
      price: '$29.990',
      image: '/Elec2.jpg',
      tag: 'Electricidad',
      description: 'Equipo diseñado para estabilizar las variaciones de tensión de la red eléctrica y proteger electrodomésticos y equipos sensibles contra altos y bajos voltajes.',
    },
  ] },
  { id: 'tornillos', title: 'Tornillos', homeTitle: 'Tornillos', image: '/tornillos.jpg', products: [
    product('Tornillo Auto Perforante 3"', '$2.990', '/torn1.jpg', 'Tornillos', 'Tornillo de acero inoxidable con punta auto perforante, ideal para trabajos en madera, plástico y metales.'),
    product('Tornillo de Tuerca 2"', '$3.990', '/torn2.jpg', 'Tornillos', 'Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.'),
    product('Tornillo de Tuerca 3"', '$4.990', '/torn3.jpg', 'Tornillos', 'Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.'),
    product('Tornillo de Tuerca 4"', '$5.990', '/torn4.jpg', 'Tornillos', 'Tornillo de acero inoxidable con tuerca, ideal para trabajos en madera, plástico y metales.'),
  ] },
  { id: 'madera', title: 'Madera', homeTitle: 'Madera', image: '/madera.jpg', products: [
    {
      name: 'Piso Flotante Roble Natural 8mm',
      price: '$14.990 /m²',
      image: '/madera4.jpg',
      tag: 'Madera',
      description: 'Uso: Interior (dormitorios, living, pasillos). Tráfico: Residencial alto / Comercial moderado (AC4). Instalación: Sistema Click fácil de ensamblar. Rendimiento: Caja cubre 2.39 m².',
    },
    {
      name: 'Kit Muestras de Terciado y MDF',
      price: '$24.990',
      image: '/madera1.jpg',
      tag: 'Madera',
      description: 'Tipos incluidos: Terciado ranurado, MDF enchapado, Coigüe y Roble. Espesores: 15mm y 18mm. Uso: Fabricación de muebles, repisas y revestimiento de muros. Acabado: Superficie lijada lista para barniz o pintura.',
    },
    {
      name: 'Piso Vinílico SPC Texturizado',
      price: '$18.990',
      image: '/madera2.jpg',
      tag: 'Madera',
      description: 'Propiedad clave: 100% resistente al agua y humedad. Espesor: 4.2mm con manta acústica integrada. Uso: Apto para baños, cocinas y espacios comerciales. Garantía: 10 años uso residencial.',
    },
    {
      name: 'Panel Deco Wall Listonado Roble',
      price: '$2.100',
      image: '/madera3.jpg',
      tag: 'Madera',
      description: 'Medidas: 240 cm x 60 cm (Espesor 21mm). Material: Listones de MDF sobre fieltro acústico negro de alta densidad. Uso: Decoración de interiores y aislamiento acústico. Montaje: Adhesivo de montaje o atornillado directo a la pared.',
    },
  ] },
  { id: 'seguridad', title: 'Seguridad', homeTitle: 'Seguridad', image: '/seguridad.jpg', products: [
    product('Respirador Medio Rostro con Filtros y Lentes', '$18.990', '/seg1.jpg', 'Seguridad', 'Kit completo de protección respiratoria y ocular con filtros reemplazables para vapores orgánicos, gases y partículas de polvo en ambientes exigentes.'),
    product('Kit Seguridad Industrial Multiuso', '$24.990', '/seg2.jpg', 'Seguridad', 'Conjunto integral para faenas que incluye casco rígido de obra, guantes de cuero reforzados, antiparras y protectores auditivos de copa.'),
    product('Antiparras Antipolvo Profesional DeWalt', '$9.990', '/seg3.jpg', 'Seguridad', 'Lentes de seguridad sellados con cinta elástica ajustable y recubrimiento antirrayadura para protección completa contra impactos de esquirlas y polvo.'),
    product('Casco de Seguridad Industrial con Auriculares', '$21.990', '/seg4.jpg', 'Seguridad', 'Casco dieléctrico de alta densidad integrado con antiparras panorámicas y protectores auditivos acoplables para máxima seguridad laboral.'),
  ] },
  { id: 'jardin', title: 'Jardín', homeTitle: 'Jardín', image: '/jardin.jpg', products: [] },
]

export const benefits = [
  {
    title: 'Stock en Tiempo Real',
    text: 'Antes había que llamar y esperar a que alguien fuera a revisar la bodega. Hoy consultas la disponibilidad real de más de 800 productos desde tu celular, antes de subirte al auto rumbo a la tienda. Menos viajes en falso, más horas de trabajo en tu obra.',
  },
  {
    title: 'Todo tipo de pago',
    text: 'Recibimos efectivo, débito, crédito y transferencia. Si eres maestro o contratista registrado, además puedes comprar durante todo el mes con cuenta corriente y pagar todo junto a fin de mes, sin frenar la obra por falta de caja.',
  },
  {
    title: 'Despacho a obras',
    text: 'Cuando la faena no puede esperar, coordinamos el despacho de cemento, herramientas o pinturas directo en la dirección de tu obra dentro de La Serena y alrededores, para que sigas trabajando sin perder tiempo yendo y viniendo del local.',
  },
  {
    title: 'Cotización sin compromiso',
    text: 'Antes de comprar puedes armar tu pedido en la web, revisar precios actualizados y guardarlo como cotización para mostrarla al cliente o al jefe de obra, sin necesidad de pagar hasta confirmar que todo está correcto.',
  },
]

export const featuredBrands = [
  { name: 'Makita', image: '/Makita.jpg' },
  { name: 'Stanley', image: '/stanley.jpg' },
  { name: 'Polpaico', image: '/polpaico.jpg' },
  { name: 'Bticino', image: '/bticino.jpg' },
  { name: '3M', image: '/3m.jpg' },
  { name: 'Philips', image: '/philip.jpg' },
]
