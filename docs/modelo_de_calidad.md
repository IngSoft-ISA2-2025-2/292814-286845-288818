# Modelo de Calidad (ISO 25010) - E2
Para nuestro modelo de calidad tomamos como referencia el estándar ISO 25010, con este definimos las principales características para evaluar la calidad del software. Seleccionamos los atributos más relevantes para el proyecto, a fin de guiar el análisis y la mejora continua.

## Propósito y alcance del modelo
Definir cómo se medirá y mejorará la calidad del producto durante el proyecto. El modelo aplica a backend, frontend y repositorio.

## Atributos priorizados y cómo se evaluarán

1) **Completitud Funcional**
- *Por qué lo elegimos*: el sistema debe cumplir con los requerimientos definidos y entregar valor real al usuario final.
- **Lo mediremos basándonos en**:  
  - Porcentaje de requisitos funcionales implementados respecto al backlog definido.
  - Cantidad de bugs funcionales abiertos frente a los cerrados en cada entrega.
  - Evidencia de pruebas de aceptación (BDD) que validen los criterios de usuario definidios con el PO.
  - Cobertura de escenarios de negocio clave en tests end-to-end (frontend y backend).

2) **Seguridad**  
- *Por qué lo elegimos*: es clave proteger los datos y garantizar la confianza de los usuarios.
- **Lo mediremos basándonos en**:  
  - Que no existan vulnerabilidades críticas en dependencias.
  - Que la configuración de CORS sea la adecuada según el entorno.  
  - Que no se expongan secretos en el repositorio.

3) **Mantenibilidad**  
- *Por qué lo elegimos*: nos permite reducir el costo de realizar cambios y facilita entregar nuevas.  
- **Lo mediremos basándonos en**:  
  - Cobertura de pruebas alcanzada.  
  - Nivel de duplicación de código y tamaño de clases/métodos.
  - Dependencias actualizadas.

4) **Usabilidad**
- *Por qué lo elegimos*: la experiencia del usuario es fundamental y para ello priorizamos que la aplicación sea fácil de utilizar, intuitiva y atractiva.
- **Lo mediremos basándonos en**:  
  - Descripciones claras de mensajes de error mostrados al usuario.
  - Flujo intuitivo de navegación entre funcionalidades principales.
  - Consistencia en la interfaz de usuario (botones, formularios, validaciones).
  - Facilidad de acceso a funcionalidades según el rol del usuario.

En resumen, este modelo de calidad nos da un marco de referencia claro para evaluar el estado actual del producto y orientar las mejoras en cada entrega.
 
## Compromisos de mejora (a validar en retrospectiva)  
- Incrementar la cobertura de pruebas en el backend en la Entrega 2 (TDD aplicado a corrección de bugs).  
- Eliminar vulnerabilidades críticas detectadas en dependencias para la Entrega 2.  
- Mantener el análisis estático y lints sin errores en backend y frontend.
- Mejorar la claridad de mensajes de error y flujo de navegación en frontend para la Entrega 2.
- Implementar la medición de latencia p95/99 y tasa de errores 5xx con telemetría en la Entrega 4.  

## Trazabilidad  
- Issues etiquetados por atributo:  
  `quality:mantenibilidad | quality:seguridad | quality:completitud | quality:usabilidad`
