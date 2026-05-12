# RetaiLink API — Documentación Completa de Endpoints

## URL Base
```
http://<HOST>:<PORT>/retailink-api
```

## Módulos
| Prefijo | Descripción |
|---------|-------------|
| `/retailink-api/superadmin` | Superadministrador (gestión global de plataforma) |
| `/retailink-api/admin` | Administrador de cliente (gestión por cliente) |
| `/retailink-api/mobile` | App móvil del promotor |

## Autenticación
Los endpoints marcados con 🔒 requieren header:
```
Authorization: Bearer <token>
```
El token se obtiene en el endpoint de login correspondiente.

---

# MÓDULO SUPERADMIN
> Base: `/retailink-api/superadmin`
> Sin autenticación requerida en la mayoría de endpoints (gestión interna).

## Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/register-user` | Crear un superadmin |
| POST | `/login` | Login de superadmin |

### POST `/register-user`
**Body:**
```json
{ "email": "string", "password": "string", "name": "string", "lastname": "string" }
```

### POST `/login`
**Body:**
```json
{ "email": "string", "password": "string" }
```
**Respuesta:** `{ data: { user, token } }`

---

## Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/create-client` | Crear cliente |
| GET | `/get_clients_list` | Listar todos los clientes |
| GET | `/get_client/:id` | Obtener cliente por ID |

### POST `/create-client`
**Body:**
```json
{
  "id_user": number,
  "name": "string",
  "rfc": "string",
  "email": "string",
  "phone": "string",
  "id_pais": number,
  "id_estado": number,
  "id_ciudad": number,
  "street": "string",
  "ext_number": "string",
  "int_number": "string",
  "zip_code": "string",
  "neighborhood": "string",
  "address_references": "string",
  "adiccional_notes": "string"
}
```

---

## Tiendas (SuperAdmin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/stores` | Crear tienda global |
| GET | `/stores` | Listar todas las tiendas |
| GET | `/stores/:id_store` | Obtener tienda por ID |
| PUT | `/stores/:id_store` | Actualizar tienda |
| DELETE | `/stores/:id_store` | Eliminar tienda (soft delete) |
| POST | `/stores/:id_store/clients/:id_client` | Asignar tienda a cliente |
| DELETE | `/stores/:id_store/clients/:id_client` | Desasignar tienda de cliente |
| GET | `/stores/clients/:id_client` | Tiendas de un cliente |
| GET | `/stores/:id_store/clients/` | Clientes de una tienda |
| GET | `/stores/clients/available-stores/:id_client` | Tiendas disponibles para asignar a cliente |

### POST `/stores`
**Body:** `{ "id_user": number, "name": "string", ...storeData }`

### PUT `/stores/:id_store`
**Body:** `{ "id_user": number, ...campos a actualizar }`

### DELETE `/stores/:id_store`
**Body:** `{ "id_user": number }`

### POST `/stores/:id_store/clients/:id_client`
**Body:** `{ "id_user_creator": number }`

---

## Preguntas (SuperAdmin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/questions` | Listar todas las preguntas |
| GET | `/questions/:id_question` | Obtener pregunta por ID |
| POST | `/questions` | Crear pregunta |
| PUT | `/questions/:id_question` | Actualizar pregunta |
| DELETE | `/questions/:id_question` | Eliminar pregunta (soft delete) |
| POST | `/questions/:id_question/clients/:id_client` | Asignar pregunta a cliente |
| DELETE | `/questions/:id_question/clients/:id_client` | Desasignar pregunta de cliente |
| PUT | `/questions-client/:id_question_client` | Actualizar precios de asignación pregunta-cliente |
| GET | `/questions/clients/:id_client` | Preguntas asignadas a un cliente |
| GET | `/questions/:id_question/clients` | Clientes de una pregunta |
| GET | `/questions/clients/available/:id_client` | Preguntas disponibles para asignar a cliente |
| GET | `/questions-client/:id_question_client` | Detalle de asignación pregunta-cliente |

### POST `/questions` y POST `/create-question` (legacy)
**Body:**
```json
{
  "id_user": number,
  "question": "string",
  "question_type": "open" | "options" | "numeric" | "photo",
  "base_price": number,
  "promoter_earns": number,
  "i_status": boolean,
  "is_multiple": boolean,
  "min_value": number,
  "max_value": number,
  "max_photos": number,
  "options": [{ "option_text": "string", "option_value_numeric": number, "option_order": number }]
}
```

### POST `/questions/:id_question/clients/:id_client`
**Body:**
```json
{ "id_user": number, "client_price": number, "client_promoter_earns": number }
```

### PUT `/questions-client/:id_question_client`
**Body:**
```json
{ "id_user": number, "client_price": number, "client_promoter_earns": number }
```

### POST `/assign-question-to-client` (legacy)
**Body:**
```json
{ "id_user": number, "id_question": number, "id_client": number, "client_price": number, "client_promoter_earns": number }
```

---

## Analytics (SuperAdmin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/analytics/dashboard?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD` | Dashboard analytics global |

---

## Utilidades (SuperAdmin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/test-push-notification` | Enviar push notification de prueba |

### POST `/test-push-notification`
**Body:** `{ "fcm_token": "string", "title": "string", "body": "string" }`

---
---

# MÓDULO ADMIN
> Base: `/retailink-api/admin`

## Autenticación de Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | ❌ | Login de admin |
| POST | `/restore-password` | ❌ | Solicitar email de recuperación de contraseña |
| POST | `/reset-password` | ❌ | Cambiar contraseña con token de recuperación |
| GET | `/profile` | 🔒 | Ver perfil del usuario autenticado |
| POST | `/change-password` | 🔒 | Cambiar contraseña (requiere contraseña actual) |

### POST `/login`
**Body:** `{ "vc_username": "string", "vc_password": "string" }`
**Respuesta:** `{ data: { user, token } }`

### POST `/restore-password`
**Body:** `{ "email": "string" }`
Envía email con link de recuperación.

### POST `/reset-password`
**Body:** `{ "token": "string", "newPassword": "string" }`

### GET `/profile` 🔒
**Respuesta:**
```json
{
  "ok": true,
  "data": {
    "id_user": number, "email": "string", "name": "string",
    "lastname": "string", "i_rol": number, "i_status": number,
    "dt_register": "timestamp", "dt_updated": "timestamp"
  }
}
```

### POST `/change-password` 🔒
**Body:** `{ "currentPassword": "string", "newPassword": "string" }`

---

## Gestión de Usuarios (Admin)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users/client/:id_client` | 🔒 | Listar usuarios de un cliente |
| PUT | `/users/:id/email` | 🔒 | Actualizar email de usuario |
| PUT | `/users/:id/profile` | 🔒 | Actualizar nombre y apellido |
| PUT | `/users/:id/rol` | 🔒 | Cambiar rol de usuario |
| PUT | `/users/:id/password` | 🔒 | Resetear contraseña (admin, sin contraseña actual) |
| DELETE | `/users/:id` | 🔒 | Desactivar usuario (i_status = 0) |
| PUT | `/users/:id/activate` | 🔒 | Activar usuario (i_status = 1) |
| POST | `/create-user-in-client` | ❌ | Crear usuario y asociarlo a un cliente (envía email de bienvenida) |

### PUT `/users/:id/email` 🔒
**Body:** `{ "email": "string" }`

### PUT `/users/:id/profile` 🔒
**Body:** `{ "name": "string", "lastname": "string" }`

### PUT `/users/:id/rol` 🔒
**Body:** `{ "i_rol": number }`
Roles: `1` = SuperAdmin, `2` = Admin (default), etc.

### PUT `/users/:id/password` 🔒
**Body:** `{ "newPassword": "string" }` (mínimo 6 caracteres)

### POST `/create-user-in-client`
**Body:**
```json
{ "name": "string", "lastname": "string", "email": "string", "id_client": number, "id_user_creator": number }
```

---

## Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/products` | Crear producto |
| GET | `/products/client/:id_client` | Productos de un cliente |
| GET | `/products/:id_product` | Obtener producto por ID |
| POST | `/products/:id_product/image` | Subir imagen de producto (multipart/form-data) |
| PUT | `/products/:id_product` | Actualizar producto |
| DELETE | `/products/:id_product` | Eliminar producto (soft delete) |

### POST `/products`
**Body:**
```json
{ "id_user": number, "id_client": number, "name": "string", "description": "string", "vc_image": "string" }
```

### PUT `/products/:id_product`
**Body:** `{ "id_user": number, "name": "string", "description": "string" }`

### DELETE `/products/:id_product`
**Body:** `{ "id_user": number }`

### POST `/products/:id_product/image`
**Form-data:** campo `image` (archivo) + `id_client` (number)

---

## Establecimientos (Admin — tiendas por cliente)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/store` | Crear establecimiento para un cliente |
| GET | `/stores/:id_client` | Listar establecimientos de un cliente |
| GET | `/store-client/:id_store_client` | Obtener establecimiento por ID |
| PUT | `/store-client/:id_store_client` | Actualizar establecimiento |
| DELETE | `/store-client/:id_store_client` | Eliminar establecimiento |
| POST | `/stores/import-excel` | Importar establecimientos desde Excel (multipart/form-data) |

### POST `/store`
**Body:**
```json
{
  "id_client": number, "id_user_creator": number, "name": "string",
  "store_code": "string", "street": "string", "ext_number": "string",
  "int_number": "string", "neighborhood": "string", "municipality": "string",
  "state": "string", "postal_code": "string", "country": "string",
  "latitude": number, "longitude": number
}
```

### DELETE `/store-client/:id_store_client`
**Body:** `{ "id_user": number }`

### POST `/stores/import-excel`
**Form-data:** campo `file` (archivo .xlsx) + `id_client` + `id_user`

---

## Preguntas (Admin — solo lectura)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/questions/:id_client` | Preguntas asignadas al cliente |
| GET | `/questions/:id_client/:id_question_client` | Detalle de pregunta del cliente |
| GET | `/questions/:id_client/search/:search_term` | Buscar preguntas por texto |
| POST | `/questions/search` | Buscar preguntas por texto (body) |
| GET | `/questions/:id_client/stats` | Estadísticas de preguntas del cliente |

### POST `/questions/search`
**Body:** `{ "id_client": number, "search": "string" }`

---

## Cotizaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/quotations` | Crear cotización |
| GET | `/quotations/:id_client` | Cotizaciones de un cliente |
| GET | `/quotations/:id_client/:id_quotation` | Detalle de cotización |
| GET | `/quotations/:id_client/:id_quotation/preview` | Preview de precios |
| PUT | `/quotations/:id_client/:id_quotation` | Actualizar cotización |
| DELETE | `/quotations/:id_client/:id_quotation` | Eliminar cotización |
| GET | `/quotations/:id_client/:id_quotation/logs` | Logs de cotización |

### POST `/quotations`
**Body:**
```json
{
  "id_client": number, "id_user": number, "quotation_name": "string",
  "products": [{ "id_product": number, "questions": [...] }],
  "questions": [...],
  "stores": [number]
}
```

### PUT `/quotations/:id_client/:id_quotation`
**Body:**
```json
{ "id_user": number, "quotation_name": "string", "products": [...], "questions": [...], "stores": [...], "i_status": number }
```

### DELETE `/quotations/:id_client/:id_quotation`
**Body:** `{ "id_user": number }`

---

## Órdenes de Servicio

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/service-orders/confirm` | Confirmar cotización y crear orden + tickets |
| GET | `/service-orders/:id_client` | Órdenes de servicio de un cliente |
| GET | `/service-orders/:id_client/:id_service_order` | Detalle de orden |
| POST | `/service-orders/:id_client/:id_service_order/pay` | Marcar orden como pagada |
| GET | `/service-orders/:id_client/:id_service_order/logs` | Logs de orden |
| GET | `/service-orders/:id_client/stats` | Estadísticas de órdenes del cliente |

### POST `/service-orders/confirm`
**Body:** `{ "id_quotation": number, "id_client": number, "id_user": number }`

### POST `/service-orders/:id_client/:id_service_order/pay`
**Body:** `{ "id_user": number }`

---

## Tickets

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tickets/:id_client?ticket_status=N&id_store=N` | Tickets de un cliente (con filtros opcionales) |
| GET | `/tickets/:id_client/:id_ticket` | Detalle de ticket |
| GET | `/tickets/:id_client/:id_ticket/logs` | Logs de ticket |

**Query params opcionales para GET `/tickets/:id_client`:**
- `ticket_status`: `0`=Pendiente, `1`=En proceso, `2`=Completado, `3`=Rechazado
- `id_store`: filtrar por tienda

---

## Servicios

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/service` | Registrar servicio para cliente |

### POST `/service`
**Body:** `{ "id_client": number, "id_user": number }`

---

## Solicitudes (Requests)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/requests` | Crear solicitud |
| GET | `/requests/client/:id_client` | Solicitudes de un cliente |
| GET | `/requests/:id_request` | Detalle de solicitud |
| PUT | `/requests/:id_request/full` | Actualizar solicitud completa |
| DELETE | `/requests/:id_request` | Eliminar solicitud (soft delete) |

### POST `/requests`
**Body:**
```json
{
  "id_user": number, "id_cliente": number,
  "nombre_solicitud": "string", "costo_total": number,
  "productos": [{ "id_product": number, "cantidad": number, ... }]
}
```

### PUT `/requests/:id_request/full`
**Body:** mismo formato que POST `/requests`

---

## Pedidos (Orders)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/orders` | Crear pedido (asigna tiendas a una solicitud) |
| GET | `/orders/client/:id_client` | Pedidos de un cliente |
| GET | `/orders/:id_order` | Detalle de pedido con tareas |
| PUT | `/admin/task/:id_task/assign` | Asignar promotor a tarea |
| PUT | `/admin/task/:id_task/reject` | Rechazar tarea (admin) |

### POST `/orders`
**Body:**
```json
{ "id_user": number, "id_client": number, "id_request": number, "stores": [number] }
```

### PUT `/admin/task/:id_task/assign`
**Body:** `{ "id_promoter": number }`

---

## Promotores

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/promoters` | Crear promotor |
| GET | `/promoters` | Listar todos los promotores |
| GET | `/promoters/:id` | Obtener promotor por ID |
| PUT | `/promoters/:id` | Actualizar promotor |
| DELETE | `/promoters/:id` | Eliminar promotor (soft delete) |
| POST | `/promoters/login` | Login del promotor (devuelve token) |

### POST `/promoters`
**Body:**
```json
{ "vc_name": "string", "vc_email": "string", "vc_password": "string", "vc_phone": "string" }
```

### PUT `/promoters/:id`
**Body:** `{ "vc_name": "string", "vc_phone": "string", "b_active": boolean }`

### POST `/promoters/login`
**Body:**
```json
{ "vc_phone": "string", "vc_password": "string", "vc_fcm_token": "string", "f_latitude": number, "f_longitude": number }
```
**Respuesta:** `{ ok: true, data: { promoter, token } }`

---

## Ubicación Geográfica

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/countries` | Lista de países activos |
| GET | `/states/:id_country` | Estados de un país |
| GET | `/cities/:id_country/:id_state` | Ciudades de un estado |

---
---

# MÓDULO MOBILE (App Promotor)
> Base: `/retailink-api/mobile`
> Sin autenticación JWT — se usa `id_promoter` en el body/query.

## Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Verificar que la API móvil funciona |

---

## Ubicación del Promotor

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/update-location` | Actualizar coordenadas GPS del promotor |

### POST `/update-location`
**Body:** `{ "id_promoter": number, "f_latitude": number, "f_longitude": number }`

---

## Tareas del Promotor

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tasks?id_promoter=N&id_status=N` | Listar tareas del promotor |
| GET | `/tasks/:id_task` | Detalle completo de tarea (tienda, productos, preguntas, opciones) |
| POST | `/tasks/:id_task/accept` | Aceptar tarea → status 2 (Asignado) |
| POST | `/tasks/:id_task/reject` | Rechazar tarea (no se le vuelve a notificar) |
| PATCH | `/tasks/:id_task/status` | Actualizar estatus de la tarea |
| POST | `/tasks/:id_task/answers` | Guardar respuestas del checklist |

### Estatus de tareas
| Valor | Significado | Quién lo asigna |
|-------|-------------|-----------------|
| 1 | Creado | Sistema |
| 2 | Asignado | Promotor / Admin |
| 3 | En camino | Promotor |
| 4 | En ejecución | Promotor |
| 5 | Enviado a validación | Promotor |
| 6 | Terminado | Admin |
| 7 | Rechazado | Admin |

### GET `/tasks`
**Query params:** `id_promoter` (requerido), `id_status` (opcional)

### POST `/tasks/:id_task/accept`
**Body:** `{ "id_promoter": number }`

### POST `/tasks/:id_task/reject`
**Body:** `{ "id_promoter": number }`

### PATCH `/tasks/:id_task/status`
**Body:** `{ "id_promoter": number, "id_status": 2 | 3 | 4 | 5 }`
(El promotor solo puede usar estatus 2, 3, 4 y 5)

### POST `/tasks/:id_task/answers`
**Body:**
```json
{
  "id_promoter": number,
  "arrangement_photo_url": "string (opcional)",
  "answers": [
    {
      "id_request_product_question": number,
      "value": "string o URL de foto (si empieza con http se guarda como imagen)"
    }
  ]
}
```

---

# Notas generales para el frontend

1. **Todos los tokens** tienen expiración. Guardar en AsyncStorage/localStorage y manejar 401 para redirect al login.
2. **Roles de usuario** (`i_rol`): `1` = SuperAdmin, `2` = Admin (por defecto).
3. **Soft deletes**: los recursos eliminados tienen `i_status = 0`, nunca se borran físicamente de la BD.
4. **Subida de imágenes**: usar `multipart/form-data` con el campo `image` o `file` según el endpoint.
5. **El superadmin** gestiona la plataforma globalmente (clientes, tiendas globales, preguntas catálogo).
6. **El admin** gestiona dentro del contexto de su cliente (establecimientos, cotizaciones, órdenes, tickets).
7. **El promotor** opera desde la app móvil usando su `id_promoter`, no JWT en la mayoría de endpoints.
