import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"
function Admin(){

    return(
        <Panel
            titulo="Panel de administración"
            descripcion="Gestiona usuarios, inventario y reportes del sistema."
            resumen={[
                { titulo: 'Usuarios activos', valor: 128 },
                { titulo: 'Productos publicados', valor: 846 },
                { titulo: 'Pedidos del mes', valor: 64 },
            ]}
            tablaTitulo="Gestión de usuarios y roles"
            columnas={['Usuario', 'Correo', 'Rol', 'Estado']}
            filas={[
                ['María González', 'maria@maestro.cl', 'Vendedor', <Estado texto="Activo" />],
                ['Juan Pérez', 'juan@maestro.cl', 'Contratista', <Estado texto="Activo" />],
                ['Cuenta demostración', 'usuario@maestro.cl', 'Cliente registrado', <Estado texto="Activo" />],
            ]}
            accionesTitulo="Acciones administrativas"
            acciones={[
                { texto: 'Gestionar inventario', to: '/categoria/herramientas' },
                { texto: 'Ver clientes', to: '/usuario' },
                { texto: 'Ver reportes', to: '/gracias', secundaria: true },
            ]}
        />
    )
}
export default Admin
