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
