# Ferretería Los Maestros

Tienda online de ferretería orientada a maestros y contratistas.  
Frontend en React + TypeScript + Vite + Bootstrap.

## Características

- Catálogo por categorías (construcción, pintura, herramientas, gasfitería, electricidad, tornillos, madera, seguridad, jardín)
- Carrito con persistencia en `localStorage`
- Checkout con validación de formulario, despacho (Chilexpress / Starken) y métodos de pago
- Páginas: inicio, catálogo, detalle, carrito, checkout, contacto, quiénes somos, login y paneles de rol (usuario / vendedor / admin)

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Bootstrap 5
- Vitest + Testing Library

## Estructura

```
src/
├── App.tsx                 # Rutas y layout
├── main.tsx
├── context/CartContext.tsx # Estado del carrito + localStorage
├── data/productos.ts       # Catálogo y categorías
├── components/
│   ├── atoms/              # Botones, estados
│   ├── molecules/          # Cards, filtros, ítems de carrito
│   ├── organism/           # NavBar, Footer, Hero, Resumen
│   └── pages/              # Páginas de la app
└── tests/
```

## Cómo ejecutar

```bash
npm install
npm run dev
```

Scripts útiles:

```bash
npm run build    # build de producción
npm run test     # tests en modo watch
npm run test:run # tests una vez
npm run lint
```

## Notas

- El carrito se guarda en `localStorage` bajo la clave `carritoFerreteria`.
- No hay backend: login y paneles de rol son estáticos/demo.
- Los precios están en pesos chilenos (CLP).
