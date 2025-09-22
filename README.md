# PharmaGo - Sistema de Gestión de Farmacias

## Descripción del Proyecto

PharmaGo es un sistema integral de gestión de farmacias desarrollado como proyecto académico. El sistema incluye funcionalidades para la gestión de medicamentos, usuarios, y exportación de datos, implementado con arquitectura de microservicios utilizando .NET Core para el backend y Angular para el frontend.

## Estructura del Proyecto

```
PharmaGo/
├── Backend/           # API REST en .NET Core
├── Frontend/          # Aplicación Angular
├── docs/              # Documentación del proyecto
└── Obligatorio/       # Material académico y entregas
```

## Índice de Documentación

### Gestión del Proyecto y Metodología

| Requerimiento | Documento | Descripción |
|---------------|-----------|-------------|
| **Marco de gestión basado en Kanban** | [Kanban y Roles](docs/kanban_y_roles.md) | Definición del marco Kanban, roles del equipo y ceremonias. Rotación de roles y responsabilidades de desarrollador/tester para todos los miembros |
| **Proceso de ingeniería** | [Proceso de Ingeniería](docs/proceso_ingenieria.md) | Definición del primer proceso de ingeniería del software, metodologías y prácticas adoptadas |
| **Configuración del repositorio** | [Reglas de Trabajo y Configuración](docs/reglas_de_trabajo_y_configuracion_repo.md) | Configuración de GitHub, estrategia de branching, estándares de nomenclatura, y reglas de trabajo del equipo |

### Calidad y Deuda Técnica

| Requerimiento | Documento | Descripción |
|---------------|-----------|-------------|
| **Modelo de calidad** | [Modelo de Calidad](docs/modelo_de_calidad.md) | Definición del modelo de calidad basado en ISO 25010, métricas y criterios de evaluación |
| **Análisis de deuda técnica** | [Deuda Técnica](docs/deuda_tecnica.md) | Análisis completo de la deuda técnica identificada en base al modelo de calidad definido |
| **Issues y clasificación** | [Clasificación de Issues](docs/issues_clasificacion.md) | Definición y clasificación de issues siguiendo Definition of Ready (DoR) con escenarios y prioridades |

## Tecnologías Utilizadas

### Backend
- **.NET Core 6.0+** - Framework principal
- **Entity Framework Core** - ORM para base de datos
- **SQL Server** - Base de datos principal
- **Docker** - Contenedorización
- **OpenTelemetry** - Observabilidad y métricas

### Frontend
- **Angular 15+** - Framework de frontend
- **TypeScript** - Lenguaje principal
- **Bootstrap** - Framework CSS
- **NgRx** - Gestión de estado

### DevOps y Herramientas
- **Docker Compose** - Orquestación de contenedores
- **GitHub Actions** - CI/CD
- **Prometheus** - Métricas y monitoreo
- **Postman** - Testing de API

## Arquitectura del Sistema

El sistema está diseñado siguiendo principios de arquitectura limpia:

- **Capa de Presentación**: WebAPI REST
- **Capa de Lógica de Negocio**: Managers y servicios
- **Capa de Acceso a Datos**: Repositorios y Entity Framework
- **Capa de Dominio**: Entidades y reglas de negocio

## Instalación y Configuración

### Prerrequisitos
- .NET Core 6.0 SDK
- Node.js 16+ y npm
- SQL Server
- Docker Desktop

### Configuración de Base de Datos
1. Restaurar la base de datos desde `Obligatorio/Material/Base de Datos/`
2. Configurar la cadena de conexión en `appsettings.json`

### Ejecución con Docker
```bash
docker-compose up -d
```

### Ejecución Manual
```bash
# Backend
cd Backend
dotnet restore
dotnet run

# Frontend
cd Frontend
npm install
ng serve
```

## Equipo de Desarrollo

- **Estudiante 292814** - Desarrollador/Tester
- **Estudiante 286845** - Desarrollador/Tester  
- **Estudiante 288818** - Desarrollador/Tester

*Nota: Todos los miembros rotan en roles de Scrum Master, Product Owner, y otros roles según se define en el documento de Kanban y Roles.*

## Estado del Proyecto

### Entrega 1 - Completada
- [x] Análisis y diseño inicial
- [x] Implementación del backend básico
- [x] Definición de API REST
- [x] Pruebas unitarias y de integración

### Entrega 2 - En Progreso
- [x] Frontend Angular
- [x] Integración completa
- [x] Análisis de calidad y deuda técnica
- [x] Documentación de procesos

## Documentación Adicional

- **Material del Obligatorio**: Ver carpeta `Obligatorio/Material/`
- **Documentación de Entregas**: Ver carpeta `Obligatorio/Documentación/`
- **Exportaciones de Ejemplo**: Ver carpeta `Obligatorio/Exportations/`

## Enlaces Útiles

- [Issues del Proyecto](../../issues)
- [Tablero Kanban](../../projects)
- [Wiki del Proyecto](../../wiki)

---

*Este proyecto es desarrollado como parte del curso de Ingeniería de Software Ágil 2 - Universidad ORT Uruguay - 2025*
