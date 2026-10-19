# Argentina Motorcycle Intelligence · Centro de reportes

Aplicación privada alojada en Vercel para actualizar los reportes desde la información vigente del Site y descargarlos directamente desde esta pantalla.

## Uso

1. Ingresar con el usuario y contraseña habilitados para el centro de reportes.
2. Elegir el tipo de reporte y pulsar **Actualizar reporte**.
3. Descargar el Excel maestro y los archivos del reporte en Excel, PDF o PowerPoint. Los nombres incluyen la fecha de generación.

La app consulta el Site en el servidor; no redirige al usuario ni expone las credenciales de integración al navegador. Los archivos temporales permanecen en el almacenamiento privado del Site y se sirven a través de endpoints autenticados de Vercel.

## Configuración del servidor

Vercel configura `AMI_REPORT_SYNC_SECRET` y `AMI_SITE_BYPASS_TOKEN` como variables sensibles. Las rutas `/api/report-sync` y `/api/report-download` validan la sesión de Supabase y el perfil activo antes de llamar al endpoint privado del Site. No agregar estos valores al repositorio ni al cliente.
