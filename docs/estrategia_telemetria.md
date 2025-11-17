# Estrategia de Telemetría - PharmaGo

## 1. Introducción

En este documento definimos la estrategia de observabilidad implementada en PharmaGo mediante telemetría. El objetivo es proporcionar visibilidad del comportamiento del sistema en producción a través de logs y métricas, permitiendo detectar problemas y tomar decisiones basadas en datos.


## 2. Métricas Implementadas

### 2.1 Métricas de Negocio

Estas métricas miden el valor que el sistema entrega a los usuarios y el comportamiento del negocio.

#### Métrica 1: Compras Completadas

**Nombre:** `pharmago_purchases_completed_total`  
**Tipo:** Counter  
**Labels:** ninguno  
**Descripción:** Total de compras completadas exitosamente en el sistema.

**Justificación:**
- Indicador directo del valor entregado a clientes (farmacias comprando medicamentos)
- Permite detectar caídas en ventas que pueden llevar a problemas técnicos o del negocio
- Fundamental para correlacionar problemas técnicos con impacto en el negocio

#### Métrica 2: Tasa de Éxito de Solicitudes de Medicamentos

**Nombre:** `pharmago_drug_requests_total`  
**Tipo:** Counter  
**Labels:** `status` (success, failed)  
**Descripción:** Total de solicitudes de medicamentos realizadas, etiquetadas por resultado.

**Justificación:**
- Las solicitudes de medicamentos son una funcionalidad core del sistema
- Permite identificar problemas de disponibilidad o validación de medicamentos
- Correlaciona con experiencia del usuario (empleados de farmacia)

### 2.2 Métricas de Aplicación

Estas métricas miden el comportamiento y performance de la aplicación desde la perspectiva técnica.

#### Métrica 3: Duración de Requests HTTP

**Nombre:** `pharmago_http_request_duration_seconds` 
**Tipo:** Histogram  
**Labels:** `method`, `endpoint`, `status_code`  
**Buckets:** [0.01, 0.05, 0.1, 0.5, 1, 2, 5] segundos  
**Descripción:** Distribución del tiempo de respuesta de endpoints HTTP.
**Aclaración**: La misma se divide en 3 submétricas generadas por Prometheus, que son pharmago_http_request_duration_seconds_bucket (cantidad de requests que cayeron en cada rango de duración (bucket)), pharmago_http_request_duration_seconds_count (contador total de requests observados por el histograma) y pharmago_http_request_duration_seconds_sum (suma total de la duración de todos los requests observados).

**Justificación:**
- La latencia es crítica para la experiencia del usuario
- Permite identificar endpoints lentos antes de que impacten a usuarios
- Fundamental para cumplir SLOs de performance

#### Métrica 4: Total de Requests HTTP por Status Code

**Nombre:** `pharmago_http_requests_total`  
**Tipo:** Counter  
**Labels:** `method`, `endpoint`, `status_code`  
**Descripción:** Total de requests HTTP procesados, categorizados por status code.

**Justificación:**
- Permite calcular tasa de errores (4xx, 5xx) del sistema
- Identifica endpoints problemáticos con alta tasa de errores
- Esencial para monitoreo de disponibilidad del servicio

### 2.3 Métricas de Infraestructura

Estas métricas miden el estado de los recursos del sistema (CPU, memoria, base de datos).

#### Métrica 5: Uso de Memoria del Proceso

**Nombre:** `pharmago_process_memory_bytes`  
**Tipo:** Gauge  
**Labels:** `type` (working_set, private)  
**Descripción:** Memoria utilizada por el proceso de la aplicación en bytes.

**Justificación:**
- Detectar memory leaks antes de que causen crashes
- Identificar si el sistema necesita más recursos
- Correlacionar problemas de performance con uso de memoria

#### Métrica 6: Conexiones Activas a Base de Datos

**Nombre:** `pharmago_db_connections_active`  
**Tipo:** Gauge  
**Labels:** ninguno  
**Descripción:** Número de conexiones activas al pool de conexiones de la base de datos.

**Justificación:**
- El pool de conexiones es un recurso limitado y crítico
- Si se agota, el sistema no puede procesar requests (timeouts)
- Permite identificar connection leaks o configuración inadecuada del pool


## 3. Logging Estructurado

### 3.1 Configuración de Logs

**Ubicación:** `logs/pharmago-{date}.log`  
**Formato:** JSON estructurado  
**Rotación:** Diaria  
**Niveles:** Information, Warning, Error  

### 3.2 Información Registrada

Cada log incluye:
- **Timestamp**: Fecha y hora del evento
- **Level**: Nivel de severidad (Info, Warning, Error)
- **Message**: Descripción del evento
- **Context**: Información contextual (RequestId, UserId, etc.)
- **Exception**: Stack trace si aplica (solo en errores)

### 3.3 Eventos Logueados

**Nivel Information:**
- Inicio y fin de aplicación
- Requests HTTP recibidos (método, path, duración)
- Operaciones de negocio completadas (compra, solicitud de medicamento)

**Nivel Warning:**
- Validaciones fallidas
- Timeouts de operaciones
- Uso alto de recursos (CPU > 80%, Memoria > 1GB)

**Nivel Error:**
- Excepciones no controladas
- Errores de base de datos
- Fallos en integraciones externas

### 3.4 Ejemplo de Log

```json
{
  "Timestamp": "2025-11-09T10:30:45.123Z",
  "Level": "Information",
  "MessageTemplate": "Purchase completed successfully",
  "Properties": {
    "PurchaseId": "12345",
    "PharmacyId": "67890",
    "TotalAmount": 150.50,
    "ItemCount": 3,
    "Duration": 245
  }
}
```

## 4. Relación con la Segunda Vía de DevOps

### Amplificar los Ciclos de Retroalimentación

La telemetría implementada es una manifestación directa de la **Segunda Vía de DevOps: Amplificar los Ciclos de Retroalimentación**. 

**Cómo contribuye cada componente:**

**Métricas de Negocio:**
- Feedback inmediato sobre el impacto de cambios técnicos en el negocio
- Permiten medir el valor real entregado a usuarios
- Conectan las acciones del equipo técnico con resultados de negocio

**Métricas de Aplicación:**
- Feedback rápido sobre estado de salud del sistema
- Detectan problemas antes de que llegue a usuarios finales

**Métricas de Infraestructura:**
- Feedback sobre la capacidad del sistema para soportar la carga
- Previenen problemas antes de que ocurran (alertas proactivas)
- Informan decisiones de escalamiento

**Logs:**
- Contexto detallado para investigar incidentes
- Trazabilidad de operaciones de negocio

## 5. Resumen

| Requisito | Estado | Detalles |
|-----------|--------|----------|
| **Logs en texto plano** | Implementado | Serilog → `logs/pharmago-{fecha}.log` |
| **2 Métricas de Negocio** | Implementado | `pharmago_purchases_completed_total`, `pharmago_drug_requests_total` |
| **2 Métricas de Aplicación** | Implementado | `pharmago_http_request_duration_seconds`, `pharmago_http_requests_total` |
| **2 Métricas de Infraestructura** | Implementado | `pharmago_process_memory_bytes`, `pharmago_db_connections_active` |
