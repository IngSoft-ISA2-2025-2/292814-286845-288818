# Modelo de Calidad (ISO/IEC 25010) - E1
Para nuestro modelo de calidad tomamos como referencia el estándar ISO/IEC 25010, con este definimos las principales características para evaluar la calidad del software. Seleccionamos los atributos más relevantes para el proyecto, a fin de guiar el análisis y la mejora continua.

## Propósito y alcance
Definir cómo se medirá y mejorará la **calidad** del producto durante el proyecto. El modelo aplica a backend, frontend e infraestructura del repositorio.

## Atributos priorizados y cómo se evaluarán

1) **Mantenibilidad**  
- *Justificación*: reduce el costo de cambio y acelera los tiempos de entrega.  
- **Indicadores**:  
  - Ausencia de violaciones críticas en lints y analizadores.  
  - Nivel de cobertura de pruebas.  
  - Baja duplicación y clases/métodos de tamaño reducido.  
  - Dependencias actualizadas.  

2) **Confiabilidad**  
- *Justificación*: evita regresiones y asegura estabilidad.  
- **Indicadores**:  
  - Pruebas de rutas críticas en estado correcto.  
  - Manejo uniforme de errores en la API y registros adecuados de logs.  

3) **Rendimiento**  
- *Justificación*: garantizar tiempos de respuesta adecuados para la experiencia de usuario y cumplir con objetivos de nivel de servicio.  
- **Indicadores previstos**: latencia percentil 95/99 y tasa de errores 5xx por endpoint.  
- *Nota*: estas métricas se medirán mediante telemetría en etapas posteriores.  

4) **Seguridad**  
- *Justificación*: proteger datos y usuarios.  
- **Indicadores**:  
  - Ausencia de vulnerabilidades críticas reportadas en dependencias.  
  - Configuración de CORS acotada.  
  - No existencia de secretos expuestos en el repositorio.  

5) **Usabilidad**  
- *Justificación*: reduce errores funcionales y retrabajo.  
- **Indicadores**:  
  - Validaciones consistentes en formularios.  
  - Mensajes de error claros y comprensibles.  
  - Consistencia en la interfaz de usuario.  

## Baseline E1

- **Backend (.NET)**  
  - Analyzers/format: pendiente de medición inicial (resultado esperado: sin violaciones críticas).  
  - Dependencias desactualizadas: pendiente de medición inicial.  
  - Cobertura de pruebas unitarias: pendiente de medición inicial.  

- **Frontend (Angular)**  
  - Lint: pendiente de medición inicial.  
  - Dependencias desactualizadas: pendiente de medición inicial.  
  - Vulnerabilidades reportadas por npm audit: pendiente de medición inicial.  
  - Cobertura de pruebas unitarias: pendiente de medición inicial.  

- **Repositorio/Infraestructura**  
  - Presencia de secretos en el repositorio: pendiente de revisión.  
  - Presencia de rutas con espacios o acentos: pendiente de revisión.  

## Compromisos de mejora (a validar en retrospectiva)  
- Incrementar la cobertura de pruebas en el backend en la Entrega 2 (TDD aplicado a corrección de bugs).  
- Eliminar vulnerabilidades críticas detectadas en dependencias para la Entrega 2.  
- Mantener el análisis estático y lints sin errores en backend y frontend.  
- Implementar la medición de latencia p95/99 y tasa de errores 5xx con telemetría en la Entrega 4.  

## Trazabilidad  
- Issues etiquetados por atributo:  
  `quality:mantenibilidad | quality:confiabilidad | quality:rendimiento | quality:seguridad | quality:usabilidad`
