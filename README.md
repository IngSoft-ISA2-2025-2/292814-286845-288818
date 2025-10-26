# Proyecto DevOps

## Descripción del Proyecto

El objetivo del obligatorio es la aplicación de prácticas de ingeniería de software ágil y DevOps para mejorar la calidad de una aplicación. Se implementarán prácticas de CI/CD, QA y testing ágil sobre una base de código existente. El proyecto que se usará como base utiliza lenguajes y tecnologías del semestre anterior de la carrera.

En el informe final del proyecto se debe evaluar la mejora en la calidad del software y la performance del equipo usando métricas de DevOps. Se debe reflexionar sobre el impacto de las prácticas de ingeniería de software ágil y DevOps.

## Estructura del Proyecto

```
Proyecto-DevOps/
├── docs/              # Documentación del proyecto DevOps
└── Obligatorio/       # Base de datos, Codigo, Documentacion, Exportaciones y Consignas
```

## Índice de Documentación

### Entrega 1 - Gestión del Proyecto y Metodología (2 semanas)

| Requerimiento | Documento | Puntos |
|---------------|-----------|--------|
| **Marco de gestión basado en Kanban** | [Kanban y Roles](docs/kanban_y_roles.md) | Definición del marco Kanban, roles del equipo y ceremonias. Rotación de roles y responsabilidades de desarrollador/tester para todos los miembros |
| **Proceso de ingeniería** | [Proceso de Ingeniería](docs/proceso_ingenieria.md) | Definición del primer proceso de ingeniería del software, metodologías y prácticas adoptadas |
| **Configuración del repositorio** | [Reglas de Trabajo y Configuración](docs/reglas_de_trabajo_y_configuracion_repo.md) | Configuración de GitHub, estrategia de branching, estándares de nomenclatura, y reglas de trabajo del equipo |
| **Modelo de calidad** | [Modelo de Calidad](docs/modelo_de_calidad.md) | Definición del modelo de calidad basado en ISO 25010, métricas y criterios de evaluación |
| **Análisis de deuda técnica** | [Deuda Técnica](docs/deuda_tecnica.md) | Análisis completo de la deuda técnica identificada en base al modelo de calidad definido |
| **Issues y clasificación** | [Clasificación de Issues](docs/issues_clasificacion.md) | Definición y clasificación de issues siguiendo Definition of Ready (DoR) con escenarios y prioridades |

---

### Entrega 2 (2 semanas)

| Requerimiento | Documento | Puntos |
|---------------|-----------|--------|
| **Configuración del pipeline CI/CD** | [Pipeline CI/CD](docs/pipeline.md) | Configuración del pipeline CI/CD en función del marco de gestión y procesos de ingeniería. Documentar pipeline con pasos automáticos y manuales. |
| **Selección de bugs** | [Bugs Seleccionados](docs/bugs_seleccionados.md) | Elección de dos bugs registrados como issues en GitHub, fundamentando la elección. Los bugs deben ser de la mayor severidad. Al menos uno debe ser funcional. |
| **Reparación de bugs con TDD** | Historial de commits y tests en backend | Reparación de ambos bugs utilizando TDD en el backend. Commits rotulados en etapas [Green] y [Refactor]. No debe haber actualizaciones de código en el servidor sin actualización de pruebas que lo respalden. |
| **Testing y calidad** | - | Tests unitarios backend: (≥ 85%)<br>Tests unitarios frontend: (≥ 80%)<br>Análisis estático: (integrado en pipeline) |

---

### Entrega 3 (3 semanas)

| Requerimiento | Documento | Puntos |
|---------------|-----------|--------|
| **Adaptación de procesos para BDD** | [Proceso BDD Detallado](docs/bdd_proceso.md), [Proceso de Ingeniería E2](docs/proceso_ingenieria.md) | Adaptación de los procesos de gestión e ingeniería para aplicar BDD. |
| **US, criterios de aceptación y escenarios BDD** | [Nuevas Features - Sistema de Reservas](docs/nuevas-features.md) | Escritura de US, criterios de aceptación y escenarios de prueba BDD para las nuevas funcionalidades. El comportamiento debe especificarse en forma colaborativa: PO, tester, desarrollador. |
| **Implementación de nuevas funcionalidades** | Historial de commits y features en frontend/backend | Implementación de nuevas funcionalidades. Primero en el front-end con BDD, luego en el back-end con TDD. Commits rotulados: [TDD-GREEN], [TDD-REFACTOR], [BDD-GREEN], [BDD-REFACTOR]. |
| **Vista de procesos 4+1 y diagrama de componentes** | [Documentación de Entregas](Obligatorio/Documentación/) | Vista de procesos 4+1 para las dos funcionalidades nuevas. Diagrama de componentes para toda la solución. |
| **Testing y calidad** | - | Tests E2E (BDD): Cypress + Cucumber (4 features, 32 escenarios)<br>Estructura de tests BDD:<br>Frontend/cypress/e2e/<br>├── create-reservation/     # 8 escenarios<br>├── manage-reservation/     # 8 escenarios<br>├── state-management/       # 11 escenarios<br>└── secure-reservation/     # 5 escenarios |

## Marco de Gestión

El proyecto se realizará en el marco de gestión **Kanban**. Se espera que cada integrante dedique un **mínimo de 5 horas semanales** a las actividades de ingeniería del proyecto (sin incluir gestión y retrospectivas).

Antes de cada entrega, el equipo realizará una **retrospectiva** y confeccionará un **informe de avance**. La retrospectiva deberá considerar algún método conocido (por ej. DAKI) y su análisis debe estar basado en datos.

## Instalación y Configuración

### Prerrequisitos
- .NET Core 6.0 SDK
- Node.js 16+ y npm
- SQL Server
- Docker Desktop

### Configuración de Base de Datos
Luego de conectarse, restaurar la base de datos con el .bak ubicado en `Obligatorio/Material/Base de Datos/`

### Ejecución con Docker
```bash
docker-compose up -d
```
- Con este comando ya podremos tener acceso a todas las partes ya compiladas, como son backend, frontend y el acceso a la base de datos con el registro correspondiente.

## Equipo de Desarrollo

- **Christian Ingrey** - Desarrollador/Tester (rotación de roles según entrega)
- **Juan Pedro Michelini** - Desarrollador/Tester (rotación de roles según entrega)
- **Juan Diego Fagnoni** - Desarrollador/Tester y PO (rotación de roles según entrega)

**Nota**: Todos los miembros del equipo deben ser desarrollador y tester en todas las entregas. Los demás roles (Product Owner) deben rotar según se define en el documento de Kanban y Roles.

### Contenido de Informes de Avance
- Registro de actividades realizadas (fecha, actividad, horas, integrante)
- Evidencia de resultados de la entrega
- Referencias a documentos que respalden actividades particulares
- Mejoras en la calidad y evidencia de revisión con el PO
- Retrospectiva y acciones de mejora

## Documentación Adicional

- **Material del Obligatorio**: Ver carpeta `Obligatorio/Material/`
- **Documentación de Entregas**: Ver carpeta `Obligatorio/Documentación/`
- **Rúbrica de Evaluación**: Ver documentación del curso

---

*Este proyecto está siendo desarrollado por Juan Diego Fagnoni, Christian Ingrey y Juan Pedro Michelini como parte del curso de Ingeniería de Software Ágil 2*
