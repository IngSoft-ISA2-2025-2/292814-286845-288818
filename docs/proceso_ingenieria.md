# Primer Proceso de Ingenieria

## Estrategia de branching
- Elegimos utilizar un modelo simplificado de Git Flow o GitHub Flow.
- main: Siempre debe estar en un estado estable y lista para ser desplegada en producción.
- **Ramificación de tareas**: por cada tarea que el equipo toma del tablero Kanban, se crea una nueva rama a partir de main.

### Nomenclatura de Ramas
El nombre de una rama debe comunicar su propósito de manera inmediata.
- Cada rama debe tener **prefijos de tipo**
  - feature/: Para nuevas funcionalidades o características.
  - bugfix/: Para la corrección de errores.
  - hotfix/: Para correcciones de errores urgentes en producción.
  - chore/: Para tareas de mantenimiento que no cambian la lógica de la aplicación (ej., actualizar dependencias, refactorizar código sin cambiar el comportamiento).
- **Nombre Descriptivo**: Después del prefijo, se usa un nombre que describe la tarea de forma concisa, usando guiones en lugar de espacios.
- Ejemplos:
  ```
  feature/crear-formulario-contacto
  bugfix/solucionar-problema-login
  chore/actualizar-dependencias-npm
  hotfix/parche-critico-pagos
  ```
### Nomenclatura de Commits
El formato que se utilizara es el sigiente: 
```
tipo(ámbito): descripción
```
- **Tipo**: El tipo de cambio
  - feat: Una nueva funcionalidad.
  - fix: Una corrección de error.
  - docs: Cambios en la documentación.
  - style: Cambios de formato (sin cambios en el código).
  - refactor: Refactorización de código (sin cambios de funcionalidad).
  - test: Añadir o corregir pruebas.
  - chore: Tareas de mantenimiento.
- **Ámbito**: Indica la parte del código que se ha modificado.
- **Descripción**: Un mensaje corto y conciso en tiempo presente e imperativo.
- Ejemplos:
  ```
  feat(auth): agregar validación al formulario de registro
  fix(login): solucionar bug que no permite recordar contraseña
  refactor: simplificar función de cálculo de precios
  docs: actualizar README con instrucciones de instalación
  ```

