import Panel from "../organism/Panel";
import Estado from "../atoms/Estado";

function Vendedor(){

    return(
        <Panel
            titulo="Panel de vendedor / empleado"
            descripcion="Actualiza el inventario y controla el estado de los pedidos."
            resumen={[
                { titulo: 'Pedidos pendientes', valor: 8 },
                { titulo: 'Productos con bajo stock', valor: 14 },
                { titulo: 'Ventas del día', valor: '$428.500' },
            ]}
            tablaTitulo="Pedidos por gestionar"
            columnas={['Pedido', 'Cliente', 'Total', 'Estado']}
            filas={[
                ['#FM-1051', 'Constructora Norte', '$156.900', <Estado texto="Por preparar" />],
                ['#FM-1048', 'Juan Pérez', '$85.990', <Estado texto="En despacho" />],
                ['#FM-1044', 'Obras La Serena', '$213.700', <Estado texto="Listo para retirar" />],
            ]}
            accionesTitulo="Acciones de vendedor"
            acciones={[
                { texto: 'Actualizar inventario', to: '/categoria/construccion' },
                { texto: 'Revisar pedidos', to: '/carrito' },
                { texto: 'Contactar cliente', to: '/contacto', secundaria: true },
            ]}
        />
    )
}
export default Vendedor
