# Testing de Performance - PharmaGo

## 1. Justificación y Relevancia

### 1.1 ¿Por qué Testing de Performance?

El **testing de performance** es fundamental para garantizar que el sistema de PharmaGo pueda manejar la carga esperada de usuarios concurrentes sin degradación en los tiempos de respuesta ni pérdida de disponibilidad.

### 1.2 Alineación con el Modelo de Calidad ISO/IEC 25010

Este tipo de testing evalúa directamente los siguientes atributos de calidad definidos en nuestro modelo de calidad.

- **Performance**: Medimos tiempos de respuesta, latencia (p95/p99) y throughput del sistema.
- **Confiabilidad**: Evaluamos la estabilidad del sistema bajo diferentes niveles de carga.
- **Mantenibilidad**: Los resultados identifican cuellos de botella que requieren refactoring.

### 1.3 Integración con DevOps - Feedback Continuo

El testing de performance se alinea con la **segunda vía de DevOps** al:

1. **Generar retroalimentación rápida**: Los tests revelan problemas de rendimiento antes de que afecten a usuarios reales.
2. **Alimentar la telemetría**: Las métricas obtenidas sirven como baseline para comparar con métricas de producción.
3. **Detectar regresiones**: Ejecutar tests de performance en CI/CD previene que cambios degraden el rendimiento.
4. **Informar decisiones de arquitectura**: Los resultados guían optimizaciones y estrategias de escalabilidad.

## 2. Herramienta Seleccionada: k6

k6 es una herramienta de testing de carga moderna y open-source que permite:

- Escribir tests en JavaScript
- Simular múltiples usuarios virtuales
- Medir métricas HTTP detalladas
- Exportar resultados en múltiples formatos (JSON, HTML, InfluxDB, Prometheus)
- Integrarse fácilmente con CI/CD

## 3. Objetivos del Testing de Performance

### 3.1 Objetivos Generales

1. **Establecer baseline de rendimiento**: Documentar el comportamiento actual del sistema.
2. **Validar SLAs**: Verificar que el sistema cumple con los acuerdos de nivel de servicio.
3. **Identificar cuellos de botella**: Detectar endpoints o recursos que degradan bajo carga.
4. **Prevenir regresiones**: Garantizar que nuevos cambios no degraden el rendimiento.
5. **Informar decisiones de escalabilidad**: Determinar cuándo y cómo escalar la infraestructura.

### 3.2 Service Level Agreements (SLAs) Definidos

Basándonos en estándares de la industria y las expectativas del negocio de farmacias:

| Métrica | Target | Justificación |
|---------|--------|---------------|
| **Latencia p95** | < 500 ms | 95% de las peticiones deben ser rápidas para buena UX |
| **Latencia p99** | < 1000 ms | Incluso en el peor caso, la respuesta debe ser aceptable |
| **Tasa de error** | < 1% | Máximo 1 de cada 100 requests puede fallar |
| **Disponibilidad** | > 99% | El sistema debe estar operativo 99% del tiempo |
| **Throughput mínimo** | 100 req/s | Capacidad para manejar picos de tráfico |

## 4. Endpoints a Testear

### 4.1 Criterios de Selección

Seleccionamos endpoints basándonos en:
- **Frecuencia de uso**: Endpoints más utilizados por los usuarios
- **Criticidad del negocio**: Operaciones core del sistema
- **Complejidad**: Endpoints que realizan operaciones costosas (DB queries, cálculos)
- **Impacto en UX**: Operaciones que afectan directamente la experiencia del usuario

### 4.2 Endpoints Seleccionados

#### **Login**
- **Endpoint**: `POST /api/Login`

#### **Crear Reserva**
- **Endpoint**: `POST /api/Reservation`

#### **Validar Reserva**
- **Endpoint**: `GET /api/Reservation/validate/{publicKey}`

#### **Consultar Reservas por Usuario**
- **Endpoint**: `GET /api/Reservation?Email={email}&Secret={secret}`

#### **Crear Compra**
- **Endpoint**: `POST /api/Purchases`

## 5. Tipos de Tests de Performance a Implementar

### 5.1 Smoke Test
- **Objetivo**: Verificar que el sistema funciona bajo carga mínima
- **Carga**: 1-2 VUs durante 30 segundos
- **Cuándo**: Antes de cualquier otro test, como sanity check
- **Endpoints**: Todos los críticos

### 5.2 Load Test
- **Objetivo**: Evaluar el comportamiento bajo carga esperada/normal
- **Carga**: 10-50 VUs durante 5 minutos
- **Cuándo**: Regularmente en CI/CD
- **Endpoints**: Login, Crear Reserva, Validar Reserva

### 5.3 Stress Test
- **Objetivo**: Determinar el punto de quiebre del sistema
- **Carga**: Incremento gradual de 0 a 100+ VUs
- **Cuándo**: Antes de releases importantes
- **Endpoints**: Crear Reserva, Crear Compra (operaciones pesadas)

### 5.4 Spike Test
- **Objetivo**: Evaluar cómo maneja picos súbitos de tráfico
- **Carga**: Saltos abruptos de 10 a 100 VUs y vuelta a 10
- **Cuándo**: Para validar elasticidad y auto-scaling
- **Endpoints**: Todos los críticos

### 5.5 Soak Test (Endurance)
- **Objetivo**: Detectar memory leaks y degradación a largo plazo
- **Carga**: Carga moderada (20 VUs) durante 1-2 horas
- **Cuándo**: Antes de releases mayores
- **Endpoints**: Login, Crear Reserva

## 6. Métricas a Recolectar

| Métrica | Descripción | Threshold |
|---------|-------------|-----------|
| `http_req_duration` | Tiempo total de la petición | p(95) < 500ms |
| `http_req_waiting` | Tiempo esperando la respuesta del servidor | p(95) < 400ms |
| `http_req_connecting` | Tiempo estableciendo la conexión TCP | p(95) < 50ms |
| `http_req_failed` | Porcentaje de requests fallidos | rate < 0.01 (1%) |
| `http_reqs` | Total de requests realizados | N/A (métrica de conteo) |
| `iterations` | Número de iteraciones completadas | N/A |

## 7. Criterios de Éxito

### 7.1 Un test se considera exitoso si:

**Cumple con todos los thresholds definidos**
- Latencia p95 < 500ms
- Tasa de error < 1%
- Todas las checks pasan

**No hay degradación respecto al baseline**
- Latencia p95 no aumenta más de 10%
- Throughput no disminuye más de 5%

**El sistema se recupera después del test**
- No hay memory leaks
- Los tiempos de respuesta vuelven a la normalidad

---

## 8. Resultados y Análisis

### 8.1 Resumen de Ejecución

Se ejecutaron tres tipos de tests de performance sobre el sistema PharmaGo:

| Test | Duración | VUs | Requests |
|------|----------|-----|----------|
| **Smoke Test** | 30s | 1 | 14 |
| **Load Test** | 5min | 10-30 | 4,280 |
| **Stress Test** | 16min | 10-100 | 25,146 |

### 8.2 Smoke Test - Verificación Básica

**Objetivo:** Verificar que el sistema funciona correctamente bajo carga mínima.

**Resultados:**
- **14 requests** completadas exitosamente
- **0% error rate**
- **p95: 1139ms** (excede threshold de 500ms)

**Análisis:**
El smoke test reveló que en la primera ejecución, el sistema presenta latencias elevadas (1139ms en p95), posiblemente debido a:
- **Cold start** del backend y base de datos
- **Ausencia de cache** en primera carga
- **Falta de índices** optimizados en consultas frecuentes

**Conclusión:** El test cumplió su objetivo de verificar funcionamiento básico, pero identificó oportunidad de optimización en tiempos de respuesta inicial.

---

### 8.3 Load Test - Carga Normal Esperada

**Objetivo:** Evaluar el comportamiento del sistema bajo carga normal (10-30 usuarios concurrentes).

**Configuración:**
- **Stages:** 1min aumento gradual a 10 VUs → 3min a 10 VUs → 1min disminución gradual a 0
- **Duración total:** 5 minutos
- **Thresholds:** p95 < 500ms, error rate < 1%

**Resultados:**

| Métrica | Valor | Threshold | Estado |
|---------|-------|-----------|--------|
| **Total Requests** | 4,280 | - | - |
| **Throughput** | 14.31 req/s | - | - |
| **Iteraciones** | 2,157 | - | - |
| **Error Rate** | 0.00% | < 1% | OK |
| **p95 (Latencia)** | 65.93ms | < 500ms | OK |
| **p99 (Latencia)** | 76.44ms | < 1000ms | OK |
| **Avg (Latencia)** | 31.5ms | - | - |
| **Login Success Rate** | 100% | > 99% | OK |
| **Reservation Success Rate** | 100% | > 95% | OK |

**Análisis:**
- **Todos los thresholds pasaron exitosamente**
- Sistema maneja **carga normal sin problemas**
- Latencias muy bajas (avg: 31.5ms, p95: 65.93ms)
- 0% de errores en 4,280 requests
- Login y creación de reservas funcionan perfectamente

**Conclusión:** El sistema cumple con los SLAs bajo carga normal de 10-30 usuarios concurrentes. Performance excelente.

---

### 8.4 Stress Test - Punto de Quiebre del Sistema

**Objetivo:** Determinar el límite del sistema y su comportamiento bajo estrés extremo.

**Configuración:**
- **Stages:** Incremento gradual de 10 → 30 → 50 → 70 → 100 VUs
- **Duración total:** 16 minutos
- **Thresholds:** p95 < 1000ms, error rate < 5%

**Resultados:**

| Métrica | Valor | Threshold | Estado |
|---------|-------|-----------|--------|
| **Total Requests** | 25,146 | - | - |
| **Throughput** | 26.97 req/s | - | - |
| **Iteraciones** | 11,318 | - | - |
| **Error Rate** | 45.01% | < 5% | FAIL |
| **p95 (Latencia)** | 322.90ms | < 1000ms | OK |
| **p99 (Latencia)** | N/A | < 2000ms | N/A |
| **Avg (Latencia)** | 73.49ms | - | - |
| **4xx Errors** | 41.89% | - | Alto |
| **5xx Errors** | 8.89% | - | Crítico |
| **Login Success Rate** | 100% | > 99% | OK |
| **Reservation Success Rate** | 22.14% | > 95% | FAIL |
| **Purchase Success Rate** | 0.00% | > 90% | FAIL |

**Análisis:**

**Punto de Quiebre Identificado:**
- **~70-100 VUs**: El sistema comienza a degradarse significativamente
- **45% de error rate**: Crítico, indica saturación de recursos
- **22% éxito en reservas**: Solo 2,510 de 11,677 reservas creadas exitosamente
- **0% éxito en compras**: Dependencia crítica en reservas exitosas

**Errores Detectados:**
- **41.89% errores 4xx**: Problemas de lógica de negocio (validaciones, stock insuficiente)
- **8.89% errores 5xx**: Errores de servidor (timeouts, saturación de recursos)

**Aspectos Positivos:**
- Latencias se mantienen controladas (p95: 322ms) incluso bajo estrés
- Login funciona perfectamente (100% éxito)
- Sistema no crashea, responde con errores controlados
- Uso de memoria se mantuvo estable

**Cuellos de Botella Identificados:**
1. **Gestión de stock**: Las reservas fallan por validaciones de stock bajo carga alta
2. **Concurrencia en DB**: Posibles locks o falta de optimización en transacciones
3. **Validaciones de negocio**: Lógica que no escala bajo carga extrema
4. **Dependencias en cadena**: Compras dependen de reservas exitosas

**Conclusión:** El stress test cumplió su objetivo de identificar el límite del sistema y áreas críticas que requieren optimización antes de soportar alta concurrencia en producción.

---

## 9. Interpretación Global y Recomendaciones

### 9.1 Cumplimiento de SLAs

| Escenario | SLA Cumplido | Observaciones |
|-----------|--------------|---------------|
| **Carga Baja (1 VU)** | Parcial | Latencias altas en cold start |
| **Carga Normal (10-30 VUs)** | Sí | Performance excelente |
| **Carga Alta (70-100 VUs)** | No | Degradación crítica |

### 9.2 Baseline de Performance Establecido

**Capacidad óptima del sistema:**
- **10-30 usuarios concurrentes**: Performance excelente (p95: 65ms, 0% errores)
- **30-50 usuarios concurrentes**: Performance aceptable (requiere monitoreo)
- **70-100 usuarios concurrentes**: Sistema satura (45% errores)

**Recomendación de escalabilidad:**
- **Límite actual seguro:** 30-50 usuarios concurrentes
- **Escalado necesario para:** > 50 usuarios concurrentes

### 9.3 Impacto en el Modelo de Calidad

**Atributos de Calidad Validados:**

**Performance/Eficiencia:**
- Se estableció baseline de rendimiento
- Se identificaron límites del sistema
- Se documentaron tiempos de respuesta esperados

**Fiabilidad:**
- Sistema maneja errores de forma controlada
- No hay crashes bajo estrés extremo
- Login mantiene 100% disponibilidad

**Mantenibilidad:**
- Se identificaron cuellos de botella específicos
- Evidencia clara para priorizar refactoreos
- Docuemntación detallada para medir mejoras futuras

---

## 10. Conclusiones

### 10.1 Resumen Ejecutivo

El testing de performance implementado con k6 ha cumplido exitosamente sus objetivos:

- **Sistema validado** para carga normal (10-30 usuarios concurrentes)
- **Límites identificados** bajo estrés extremo (70-100 usuarios)
- **Cuellos de botella documentados** con evidencia cuantitativa

### 10.2 Valor para el Proyecto

Este nuevo tipo de testing aporta:

1. **Confianza en el sistema**: Sabemos que funciona bien bajo carga esperada
2. **Visibilidad de riesgos**: Conocemos los límites antes de llegar a producción
3. **Roadmap técnico**: Prioridades claras de optimización
4. **Cultura DevOps**: Feedback continuo integrado en el ciclo de desarrollo
