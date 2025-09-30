# Selección y Fundamentación de Bugs para Reparación con TDD

## Introducción

Creamos este documento para fundamentar la elección de dos bugs de alta prioridad y así repararlos durante la entrega 2 utilizando TDD. Realizamos la elección siguiendo ciertos criterios técnicos que consideramos apropiados y priorizando el impacto en el software según el modelo de calidad que definimos para la entrega 1.

## Criterios de Selección

### Criterios Técnicos Aplicados

1. **Prioridad (P0)**: Issues clasificados con prioridad alta
2. **Impacto Funcional**: Al menos uno debe afectar funcionalidad visible al usuario
3. **Impacto en Modelo de Calidad**: Bugs que afecten atributos críticos definidos
4. **Utilización de metodología TDD**: Problemas que permitan poder aplicar de manera efectiva TDD

## Issues Seleccionados

### Issue #2: Contraseñas en texto plano
**Tipo:** Bug  
**Prioridad:** P0 (Crítica)  
**Clasificación:** Técnico/Seguridad

#### Descripción del Problema
Las contraseñas se almacenan en texto plano en la base de datos, violando los principios fundamentales de seguridad y generando un riesgo crítico sobre la protección de datos sensibles de los usuarios.

#### Fundamentación de la Elección

**1. Prioridad Alta**
- **Impacto en Seguridad**: existe una violación directa del atributo Seguridad del modelo de calidad definido.
- **Riesgo de Datos**: se exponen credenciales de los usuarios por filtración de datos.
- **Cumplimiento**: incumplimiento de estándares de protección de datos (ISO 25010).
- **Clasificación P0**: se requiere resolución inmediata antes de cualquier deploy a producción.

**2. Impacto en Modelo de Calidad**
- **Seguridad**: afecta directamente la confidencialidad e integridad de datos.
- **Mantenibilidad**: es una implementación incorrecta que debe ser refactorizada con urgencia.
- **Usabilidad**: potencial pérdida de confianza del usuario.

**3. Viabilidad para TDD**
- **Testeable**: Fácil verificación de hashing de contraseñas.
- **Casos de prueba claros**: 
  - Password no debe almacenarse en texto plano.
  - Hash debe ser verificable con password original.
  - Salt (cadena de caracteres aleatoria) debe ser único por contraseña.
- **Refactorización incremental**: Permite aplicar ciclo RED-GREEN-REFACTOR.

**4. Impacto Técnico**
```csharp
// Estado Actual (Problemático)
public void CreateUser(string username, string password) {
    user.Password = password; // TEXTO PLANO 
}

// Estado Esperado (Seguro)
public void CreateUser(string username, string password) {
    user.PasswordHash = HashPassword(password); // HASH
}
```

#### Plan de Reparación TDD
1. **[RED]** Crear test que falle verificando que password no se almacena en texto plano
2. **[GREEN]** Implementar hashing básico para pasar el test
3. **[REFACTOR]** Mejorar implementación con salt.


### Issue #13: No es posible visualizar compras como empleado
**Tipo:** Bug Funcional  
**Severidad:** P0 (Crítica)  
**Clasificación:** Funcional/UI
 
#### Descripción del Problema
Los empleados no pueden visualizar el listado de compras realizadas, impidiendo funcionalidad core del sistema de gestión de farmacias y afectando operaciones diarias.
 
#### Fundamentación de la Elección
 
**1. Severidad Crítica**
- **Funcionalidad Core**: la visualización de compras es una función esencial del sistema
- **Impacto Operacional**: los empleados no pueden realizar tareas básicas de gestión
- **Bloqueo de Workflows**: impide procesos de negocio críticos
- **Clasificación P0**: funcionalidad inutilizable para rol específico
 
**2. Bug Funcional (Cumple Requisito)**
- **Visible al Usuario**: error directamente percibido por empleados
- **Impacto en UX**: degrada experiencia de usuario significativamente
- **Funcionalidad Esperada**: feature que debería funcionar correctamente y como se espera
 
**3. Impacto en Modelo de Calidad**
- **Completitud Funcional**: funcionalidad faltante
- **Usabilidad**: la interfaz no cumple expectativas del usuario
- **Mantenibilidad**: código con defectos en lógica de autorización/roles
 
**4. Viabilidad para TDD**
- **Casos de prueba claros**:
  - Empleado autenticado debe poder ver lista de compras
  - Respuesta debe contener datos de compras válidos
  - Autorización debe permitir acceso a empleados
- **Testeable en Backend**: Endpoints de API, servicios, y repositorios
- **Refactorización clara**: Separación de concerns entre autenticación/autorización
 
#### Plan de Reparación TDD
1. **[RED]** Crear test que falle verificando que empleado puede obtener lista de compras
2. **[GREEN]** Implementar lógica mínima para pasar test (endpoint, servicio, queries)
3. **[REFACTOR]** Mejorar arquitectura de autorización y separación de responsabilidades

## Justificación Final

### Cumplimiento de Requisitos

**Dos bugs de mayor severidad**: Ambos clasificados como P0 
**Al menos uno funcional**: Issue #13 es bug funcional visible  
**Registrados como issues**: Ambos en GitHub con documentación completa  
**Viables para TDD**: Ambos permiten ciclos RED-GREEN-REFACTOR claros  

### Valor Estratégico

1. **Cobertura Completa**: Un bug técnico (seguridad) + un bug funcional (UX)
2. **Impacto Máximo**: Ambos P0 con impacto crítico en calidad
3. **Aprendizaje TDD**: Diferentes tipos de testing (unit tests vs integration tests)
4. **Modelo de Calidad**: Abordan 2 de los 4 atributos críticos definidos

### Riesgo de No Repararlos

**Issue #2 (Contraseñas):**
- Vulnerabilidad de seguridad crítica
- Potencial filtración de datos
- Incumplimiento regulatorio
- Pérdida de confianza

**Issue #13 (Visualización):**
- Funcionalidad core inutilizable
- Degradación severa de UX
- Impacto en productividad operacional
- Posible pérdida de usuarios

### Metodología TDD Aplicada

**Para ambos issues:**
- Commits etiquetados: `[RED]`, `[GREEN]`, `[REFACTOR]`
- Tests unitarios exhaustivos
- Cobertura mínima 90% para código nuevo
- Integration tests para validar end-to-end
- No hay actualizaciones de código sin tests que lo respalden

La selección de estos dos issues garantiza que la reparación con TDD abarque tanto aspectos críticos de seguridad como de funcionalidad.