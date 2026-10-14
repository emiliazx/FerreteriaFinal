import Panel from "../organism/Panel";
import Estado from "../atoms/Estado";

function Usuario(){

    return(
        <Panel
            titulo="Área de cliente registrado"
            descripcion="Consulta tus pedidos, cotizaciones y cuenta corriente."
            resumen={[
                { titulo: 'Pedidos realizados', valor: 12 },
                { titulo: 'Cotizaciones guardadas', valor: 3 },
                { titulo: 'Saldo pendiente', valor: '$0' },
            ]}
            tablaTitulo="Historial de pedidos"
            columnas={['Pedido', 'Fecha', 'Total', 'Estado']}
            filas={[
                ['#FM-1048', '06/09/2026', '$85.990', <Estado texto="En despacho" />],
                ['#FM-1029', '28/08/2026', '$42.500', <Estado texto="Entregado" />],
            ]}
            accionesTitulo="Acciones rápidas"
            acciones={[
                { texto: 'Ver catálogo', to: '/productos' },
                { texto: 'Revisar carrito', to: '/carrito' },
                { texto: 'Solicitar cotización', to: '/contacto', secundaria: true },
            ]}
        />
    )
}
export default Usuario
