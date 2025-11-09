# Métricas DevOps DORA - PharmaGo

## 1. Introducción

Las métricas DORA son un conjunto de indicadores validados que miden la efectividad y madurez de las prácticas DevOps en equipos de desarrollo de software.

En este documento definimos las métricas DORA seleccionadas para el proyecto, justificamos su relevancia y establecemos la metodología de cálculo.

## 2. Métricas Seleccionadas

### 2.1 Deployment Frequency

**Definición:**
Frecuencia con la que se realizan despliegues exitosos a producción o a main

**Fórmula:**
DF = Número de deploys exitosos / Período de tiempo

**Unidades de medida:**
- Deploys por día
- Deploys por semana
- Deploys por mes

**Fuente de datos:**
- Merges a la rama `main`
- Ejecuciones exitosas del pipeline CI/CD en GitHub Actions
- Tags de releases

**Justificación para PharmaGo:**
La frecuencia de despliegue indica nuestra capacidad como equipo para entregar valor de forma continua. En un sistema crítico como PharmaGo (gestión de farmacias y medicamentos), una alta frecuencia de despliegues controlados permite:
- Entregar funcionalidades y correcciones más rápido a los usuarios
- Reducir el tamaño de los cambios por deploy, reduciendo riesgo
- Obtener feedback temprano del sistema en producción
- Mejorar la agilidad del equipo

**Relación con segunda vía de DevOps:**
La alta frecuencia de despliegue requiere ciclos de retroalimentación rápidos para detectar problemas tempranamente, lo cual es el núcleo de la segunda vía de DevOps.

### 2.2 Lead Time for Changes

**Definición:**
Tiempo transcurrido desde que se realiza un commit hasta que ese cambio está desplegado y funcionando en producción.

**Fórmula:**
LTC = Timestamp del deploy - Timestamp del primer commit del cambio

**Unidades de medida:**
- Horas
- Días

**Fuente de datos:**
- Timestamp del primer commit en una feature branch o PR
- Timestamp del merge a `main`
- Timestamp de finalización exitosa del pipeline de deploy

**Justificación para PharmaGo:**
El Lead Time mide la eficiencia del flujo de trabajo desde el desarrollo hasta producción. Un LTC bajo significa:
- Reducción del work-in-progress
- Identificación temprana de problemas de integración
- Mayor satisfacción del equipo y stakeholders
- Capacidad de respuesta rápida ante cambios del negocio

En PharmaGo, donde pueden surgir necesidades urgentes (nuevos medicamentos, cambios regulatorios), un LTC bajo es crítico.

**Relación con segunda vía de DevOps:**
Un Lead Time corto permite ciclos de aprendizaje más rápidos, facilitando la retroalimentación entre desarrollo y operaciones.

### 2.3 Change Failure Rate

**Definición:**
Porcentaje de cambios desplegados que resultan en degradación del servicio y requieren corrección inmediata (hotfix, rollback o parche).

**Fórmula:**
CFR = (Número de deploys fallidos / Total de deploys) × 100

**Unidades de medida:**
- Porcentaje (%)

**Criterios de fallo:**
Un deploy se considera fallido si:
- Requiere un rollback inmediato
- Genera un hotfix dentro de las 24 horas siguientes
- Causa un incidente reportado en GitHub Issues con label `incident` o `bug-critical`
- Causa caída del servicio o funcionalidad crítica inoperativa

**Fuente de datos:**
- Issues de GitHub con labels: `incident`, `bug-critical`, `hotfix`
- Commits de rollback (mensajes que incluyen "rollback", "revert")
- Análisis de commits posteriores al deploy

**Justificación para PharmaGo:**
El CFR mide la calidad y estabilidad del código que se despliega. Un CFR bajo indica:
- Procesos de testing efectivos
- Code reviews de calidad
- Arquitectura robusta
- Equipo maduro en prácticas de ingeniería

Para PharmaGo, mantener un CFR bajo es crítico porque errores en producción pueden afectar:
- Gestión de inventario de medicamentos
- Procesamiento de compras
- Experiencia de usuarios finales (empleados y clientes)

**Relación con segunda vía de DevOps:**
Un CFR bajo indica que el feedback de las pruebas automatizadas y manuales es efectivo, permitiendo detectar problemas antes de producción.

### 2.4 Mean Time To Recovery

**Definición:**
Tiempo promedio que tarda el equipo en restaurar el servicio después de un incidente que causa degradación o caída del sistema.

**Fórmula:**
MTTR = Σ(Tiempo de resolución de incidentes) / Número de incidentes

**Unidades de medida:**
- Minutos
- Horas

**Criterios de medición:**
- Inicio: Timestamp de creación del issue de incidente
- Fin: Timestamp de cierre del issue o timestamp del commit que resuelve el problema
- Solo se consideran incidentes que afectan producción

**Fuente de datos:**
- Issues de GitHub con label `incident` o `bug-critical`
- Timestamps de apertura y cierre de issues
- Commits vinculados a la resolución

**Justificación para PharmaGo:**
El MTTR mide la capacidad de resiliencia y respuesta del equipo ante fallos. Un MTTR bajo indica:
- Procesos de monitoreo efectivos
- Alertas bien configuradas
- Equipo preparado para responder a incidentes
- Arquitectura que facilita rollbacks rápidos

En PharmaGo, un MTTR bajo es esencial porque:
- El sistema gestiona operaciones críticas de farmacias
- Downtime afecta directamente las ventas y servicio al cliente
- La disponibilidad es un atributo de calidad prioritario (modelo ISO 25010)

**Relación con segunda vía de DevOps:**
Un MTTR bajo requiere excelentes mecanismos de retroalimentación (logs, métricas, alertas) para detectar y diagnosticar problemas rápidamente.

## 4. Metodología de Cálculo

### 4.1 Proceso de Recolección

1. **Extracción de datos**
   - Script automatizado que consulta GitHub API
   - Extrae: commits, PRs, merges, issues, workflow runs
   - Exporta a formato JSON/CSV

2. **Procesamiento**
   - Scripts de cálculo individuales por métrica
   - Aplicación de fórmulas definidas
   - Generación de estadísticas (promedio, mediana, percentiles)

3. **Visualización**
   - Generación de reportes en Markdown
   - Tablas comparativas
   - Gráficos de tendencias (opcional)

4. **Análisis**
   - Interpretación de resultados
   - Comparación con benchmarks
   - Identificación de áreas de mejora

## 5. Limitaciones y Consideraciones

### 5.1 Limitaciones Actuales

**Deployment Frequency:**
- Actualmente no hay despliegues automáticos a producción
- Se considerarán merges a `main` como proxy de deploys
- No hay ambiente de producción real externo al proyecto

**Change Failure Rate:**
- Requiere disciplina en etiquetado de issues
- Dependencia de que el equipo reporte incidents correctamente
- Puede subestimarse si no se reportan todos los problemas

**MTTR:**
- Requiere timestamps precisos en issues
- Depende de que los issues se cierren cuando realmente se resuelven
- Puede variar según la severidad del incidente

## 6. Vínculo con el Modelo de Calidad

Las métricas DORA se relacionan directamente con atributos del modelo de calidad ISO 25010 de PharmaGo:

| Métrica DORA | Atributo ISO 25010 | Justificación |
|--------------|-------------------|---------------|
| DF | Mantenibilidad | Alta frecuencia implica cambios pequeños y manejables |
| LTC | Eficiencia de Desempeño | Flujo optimizado reduce desperdicio |
| CFR | Confiabilidad | Baja tasa de fallos indica código estable |
| MTTR | Confiabilidad | Rápida recuperación mantiene disponibilidad |