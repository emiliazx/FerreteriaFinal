// @vitest-environment jsdom

import { test, expect, vi, describe, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import BotonAgregar from "../components/atoms/BotonAgregar";
import BotonVolver from "../components/atoms/BotonVolver";
import Estado from "../components/atoms/Estado";
import CardProducto from "../components/molecules/CardProducto";
import ItemCarrito from "../components/molecules/ItemCarrito";
import Carrito from "../components/pages/Carrito";
import Checkout from "../components/pages/Checkout";
import Productos from "../components/pages/Productos";
import Login from "../components/pages/Login";
import Contacto from "../components/pages/Contacto";
import NoEncontrado from "../components/pages/NoEncontrado";
import Gracias from "../components/pages/Gracias";
import Admin from "../components/pages/Admin";

afterEach(() => {
 cleanup();
 vi.restoreAllMocks();
});

function EnRuta() {
 const location = useLocation();
 return <span data-testid="ruta-actual">{location.pathname}</span>;
}

function conRouter(
 ui: React.ReactNode,
 initialEntries = ["/"]
) {
 return render(
  <MemoryRouter initialEntries={initialEntries}>
   <Routes>
    <Route path="/categoria/:slug" element={<>{ui}<EnRuta /></>} />
    <Route path="*" element={<>{ui}<EnRuta /></>} />
   </Routes>
  </MemoryRouter>
 );
}

const producto = {
 id: 1,
 categoria: "herramientas",
 titulo: "Martillo de acero",
 descripcion: "Martillo resistente para construcción",
 precio: 5990,
 imagen: "/martillo.jpg",
};

const categorias = [
 { slug: "herramientas", nombre: "Herramientas", nombreCorto: "Herramientas" },
 { slug: "construccion", nombre: "Construcción", nombreCorto: "Construcción" },
];

describe("Componentes atómicos", () => {
 test("Estado muestra el texto recibido", () => {
  render(<Estado texto="Activo" />);
  expect(screen.getByText("Activo")).toBeTruthy();
 });

 test("BotonAgregar llama a onAgregar con el id y cambia su texto", () => {
  const onAgregar = vi.fn();
  render(<BotonAgregar id={7} onAgregar={onAgregar} />);
  fireEvent.click(screen.getByRole("button", { name: "Añadir" }));
  expect(onAgregar).toHaveBeenCalledOnce();
  expect(onAgregar).toHaveBeenCalledWith(7);
  expect(screen.getByRole("button", { name: /Añadido/ })).toBeTruthy();
 });

 test("BotonVolver apunta a productos por defecto", () => {
  conRouter(<BotonVolver />);
  expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe("/productos");
 });

 test("BotonVolver permite personalizar el destino", () => {
  conRouter(<BotonVolver to="/inicio" />);
  expect(screen.getByRole("link", { name: "Volver" }).getAttribute("href")).toBe("/inicio");
 });
});

describe("Tarjetas y catálogo", () => {
 test("CardProducto muestra nombre, descripción, precio y enlaces", () => {
  conRouter(<CardProducto {...producto} onAgregar={vi.fn()} />);
  expect(screen.getByRole("heading", { name: producto.titulo })).toBeTruthy();
  expect(screen.getByText(producto.descripcion)).toBeTruthy();
  expect(screen.getByText(/5\.990/)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Ver detalle" }).getAttribute("href")).toBe("/productos/1");
  expect(screen.getByRole("button", { name: "Añadir" })).toBeTruthy();
 });

 test("Productos muestra los productos recibidos y permite agregarlos", () => {
  const onAgregar = vi.fn();
  conRouter(<Productos productos={[producto]} categorias={categorias} onAgregar={onAgregar} />, ["/productos"]);
  expect(screen.getByRole("heading", { name: "Catálogo de Productos" })).toBeTruthy();
  expect(screen.getByText(producto.titulo)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Añadir" }));
  expect(onAgregar).toHaveBeenCalledWith(1);
 });

 test("Productos filtra por la categoría de la URL", () => {
  const otro = { ...producto, id: 2, categoria: "construccion", titulo: "Cemento" };
  conRouter(<Productos productos={[producto, otro]} categorias={categorias} onAgregar={vi.fn()} />, ["/categoria/herramientas"]);
  expect(screen.getByRole("link", { name: "Herramientas" })).toBeTruthy();
  expect(screen.getByText("Martillo de acero")).toBeTruthy();
  expect(screen.queryByText("Cemento")).toBeNull();
 });

 test("NoEncontrado ofrece volver al catálogo", () => {
  conRouter(<NoEncontrado />);
  expect(screen.getByRole("heading", { name: "No encontramos lo que buscas" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Ver catálogo" }).getAttribute("href")).toBe("/productos");
 });
});

describe("Carrito de compras", () => {
 const item = { id: 1, titulo: "Martillo", precio: 5000, imagen: "/martillo.jpg", cantidad: 2 };

 test("ItemCarrito muestra producto, cantidad y total por artículo", () => {
  render(<MemoryRouter><ItemCarrito item={item} onCambiarCantidad={vi.fn()} onEliminar={vi.fn()} /></MemoryRouter>);
  expect(screen.getByRole("link", { name: "Martillo" })).toBeTruthy();
  expect(screen.getByLabelText("Cantidad de Martillo")).toBeTruthy();
  expect(screen.getByText(/10\.000/)).toBeTruthy();
 });

 test("ItemCarrito informa cambios de cantidad", () => {
  const onCambiarCantidad = vi.fn();
  render(<MemoryRouter><ItemCarrito item={item} onCambiarCantidad={onCambiarCantidad} onEliminar={vi.fn()} /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Cantidad de Martillo"), { target: { value: "3" } });
  expect(onCambiarCantidad).toHaveBeenCalledWith(1, 3);
 });

 test("ItemCarrito informa cuando se elimina un producto", () => {
  const onEliminar = vi.fn();
  render(<MemoryRouter><ItemCarrito item={item} onCambiarCantidad={vi.fn()} onEliminar={onEliminar} /></MemoryRouter>);
  fireEvent.click(screen.getByTitle(/Eliminar producto/i));
  expect(onEliminar).toHaveBeenCalledWith(1);
 });

 test("Carrito vacío muestra el mensaje y enlace al catálogo", () => {
  conRouter(<Carrito items={[]} subtotal={0} onCambiarCantidad={vi.fn()} onEliminar={vi.fn()} />);
  expect(screen.getByText("Tu carro está vacío.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Ver catálogo" }).getAttribute("href")).toBe("/productos");
  expect(screen.getByRole("button", { name: "Ir a Pagar" })).toHaveProperty("disabled", true);
 });

 test("Carrito muestra los artículos y habilita pagar si tiene productos", () => {
  conRouter(<Carrito items={[item]} subtotal={10000} onCambiarCantidad={vi.fn()} onEliminar={vi.fn()} />);
  expect(screen.getByText("Martillo")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Ir a Pagar" })).toHaveProperty("disabled", false);
  expect(screen.getByText("Resumen de la Orden")).toBeTruthy();
 });

 test("Checkout solicita datos de contacto, despacho y método de pago", () => {
  conRouter(<Checkout items={[item]} subtotal={10000} onPedidoRealizado={vi.fn()} />, ["/checkout"]);
  expect(screen.getByRole("heading", { name: "Datos de despacho y pago" })).toBeTruthy();
  expect(screen.getByLabelText("Nombre y apellido")).toBeTruthy();
  expect(screen.getByLabelText("Dirección")).toBeTruthy();
  expect(screen.getByRole("combobox")).toBeTruthy();
  expect(screen.getByRole("radio", { name: /Chilexpress/i })).toBeTruthy();
  expect(screen.getByRole("radio", { name: /Starken/i })).toBeTruthy();
  expect(screen.getByText("× 2")).toBeTruthy();
 });

 test("Checkout actualiza el despacho y el total según el transportista", () => {
  conRouter(<Checkout items={[item]} subtotal={10000} onPedidoRealizado={vi.fn()} />, ["/checkout"]);
  fireEvent.click(screen.getByRole("radio", { name: /Chilexpress/i }));
  expect(screen.getByText("3-4 días hábiles")).toBeTruthy();
  expect(screen.getByText("$14.990")).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: /Starken/i }));
  expect(screen.getByText("6-7 días hábiles")).toBeTruthy();
  expect(screen.getByText("$12.990")).toBeTruthy();
 });

 test("Checkout marca los campos pendientes al intentar confirmar y revalida al completarlos", () => {
  const onPedidoRealizado = vi.fn();
  conRouter(<Checkout items={[item]} subtotal={10000} onPedidoRealizado={onPedidoRealizado} />, ["/checkout"]);
  fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR PEDIDO" }));
  expect(screen.getByRole("alert").textContent).toMatch(/Revisa los campos marcados/);
  expect(screen.getByText("Ingresa tu nombre y apellido (mínimo 3 letras).")).toBeTruthy();
  expect(screen.getByText("Selecciona un transportista para continuar.")).toBeTruthy();
  expect(onPedidoRealizado).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Nombre y apellido"), { target: { value: "María González" } });
  fireEvent.click(screen.getByRole("radio", { name: /Chilexpress/i }));
  expect(screen.queryByText("Ingresa tu nombre y apellido (mínimo 3 letras).")).toBeNull();
  expect(screen.queryByText("Selecciona un transportista para continuar.")).toBeNull();
 });

 test("Checkout confirma el pedido y vacía el carrito", () => {
  const onPedidoRealizado = vi.fn();
  render(
   <MemoryRouter initialEntries={["/checkout"]}>
    <Routes>
     <Route path="/checkout" element={<Checkout items={[item]} subtotal={10000} onPedidoRealizado={onPedidoRealizado} />} />
     <Route path="/gracias" element={<h2>¡Pedido realizado!</h2>} />
    </Routes>
   </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Nombre y apellido"), { target: { value: "María González" } });
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "maria@correo.cl" } });
  fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "+56912345678" } });
  fireEvent.change(screen.getByLabelText("Dirección"), { target: { value: "Av. Central 123" } });
  fireEvent.change(screen.getByLabelText("Comuna"), { target: { value: "Santiago" } });
  fireEvent.change(screen.getByLabelText("Región"), { target: { value: "Metropolitana" } });
  fireEvent.click(screen.getByRole("radio", { name: /Chilexpress/i }));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "transferencia" } });
  
  fireEvent.click(screen.getByRole("button", { name: "CONFIRMAR PEDIDO" }));
  expect(onPedidoRealizado).toHaveBeenCalledOnce();
 });
});

describe("Inicio de sesión", () => {
 test("muestra error si los campos están vacíos", () => {
  conRouter(<Login />);
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Debe completar todos los campos")).toBeTruthy();
 });

 test("valida el formato del correo", () => {
  conRouter(<Login />);
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "correo-invalido" } });
  fireEvent.change(screen.getByLabelText("Clave", { selector: "input" }), { target: { value: "1234" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Ingrese un correo válido")).toBeTruthy();
 });

 test("valida que la clave tenga cuatro caracteres", () => {
  conRouter(<Login />);
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@maestro.cl" } });
  fireEvent.change(screen.getByLabelText("Clave", { selector: "input" }), { target: { value: "12" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("La clave debe tener exactamente 4 caracteres")).toBeTruthy();
 });

 test("muestra error con credenciales incorrectas", () => {
  conRouter(<Login />);
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@maestro.cl" } });
  fireEvent.change(screen.getByLabelText("Clave", { selector: "input" }), { target: { value: "9999" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Correo o clave incorrectos")).toBeTruthy();
 });

 test("admin inicia sesión y navega a su panel", () => {
  render(
   <MemoryRouter initialEntries={["/login"]}>
    <Routes>
     <Route path="/login" element={<Login />} />
     <Route path="/admin" element={<p>Panel admin prueba</p>} />
    </Routes>
   </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "admin@maestro.cl" } });
  fireEvent.change(screen.getByLabelText("Clave", { selector: "input" }), { target: { value: "1234" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Panel admin prueba")).toBeTruthy();
 });

 test("el botón mostrar clave alterna el tipo del campo", () => {
  conRouter(<Login />);
  const clave = screen.getByLabelText("Clave", { selector: "input" }) as HTMLInputElement;
  expect(clave.type).toBe("password");
  fireEvent.click(screen.getByRole("button", { name: "Mostrar clave" }));
  expect(clave.type).toBe("text");
  fireEvent.click(screen.getByRole("button", { name: "Ocultar clave" }));
  expect(clave.type).toBe("password");
 });
});

describe("Formulario de contacto", () => {
 test("marca errores al enviar el formulario vacío", () => {
  const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
  conRouter(<Contacto />);
  fireEvent.click(screen.getByRole("button", { name: "ENVIAR" }));
  expect(alert).toHaveBeenCalledWith("Debe ingresar su correo electrónico");
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.getByText("Ingresa tu nombre y apellido (mínimo 3 letras).")).toBeTruthy();
  expect(screen.getByText("Ingresa un teléfono válido (mínimo 8 dígitos).")).toBeTruthy();
  expect(screen.getByText("Ingresa un correo con formato válido.")).toBeTruthy();
  expect(screen.getByText("Cuéntanos un poco más (mínimo 10 caracteres).")).toBeTruthy();
 });

 test("envía datos válidos y navega a gracias", () => {
  render(
   <MemoryRouter initialEntries={["/contacto"]}>
    <Routes>
     <Route path="/contacto" element={<Contacto />} />
     <Route path="/gracias" element={<p>Mensaje recibido correctamente</p>} />
    </Routes>
   </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "María González" } });
  fireEvent.change(screen.getByLabelText("Teléfono"), { target: { value: "+56912345678" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "maria@correo.cl" } });
  fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Necesito cotizar materiales" } });
  fireEvent.click(screen.getByRole("button", { name: "ENVIAR" }));
  expect(screen.getByText("Mensaje recibido correctamente")).toBeTruthy();
 });
});

describe("Páginas informativas y panel", () => {
 test("Gracias muestra confirmación y enlace al inicio", () => {
  conRouter(<Gracias />);
  expect(screen.getByRole("heading", { name: "¡Gracias por contactarte!" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "VOLVER AL INICIO" }).getAttribute("href")).toBe("/");
 });

 test("Admin muestra resumen, tabla y acciones administrativas", () => {
  conRouter(<Admin />);
  expect(screen.getByRole("heading", { name: "Panel de administración" })).toBeTruthy();
  expect(screen.getByText("Usuarios activos")).toBeTruthy();
  expect(screen.getByText("128")).toBeTruthy();
  expect(screen.getByText("Gestión de usuarios y roles")).toBeTruthy();
  expect(screen.getByText("María González")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Cerrar sesión" }).getAttribute("href")).toBe("/login");
 });
});