# Selección y Fundamentación de Bugs para Reparación con TDD

## Introducción

Este documento fue creado para fundamentar la elección de dos bugs de alta prioridad para así repararlos durante la entrega 2 utilizando TDD. La elección se realizó siguiendo ciertos criterios que nos apatecion apropiados y priorizando el impacto en el software según el modelo de calidad que definimos para la entrega 1.

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
- **Impacto en Seguridad**: Violación directa del atributo Seguridad del modelo de calidad definido.
- **Riesgo de Datos**: Exposición de credenciales de los usuarios por filtración de datos.
- **Cumplimiento**: Incumplimiento de estándares de protección de datos (ISO 25010).
- **Clasificación P0**: Requiere resolución inmediata antes de cualquier deploy a producción.

**2. Impacto en Modelo de Calidad**
- **Seguridad**: Afecta directamente la confidencialidad e integridad de datos.
- **Mantenibilidad**: Implementación incorrecta que debe ser refactorizada con urgencia.
- **Usabilidad**: Potencial pérdida de confianza del usuario.

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
    user.PasswordHash = HashPassword(password); // HASH ✓
}
```

#### Plan de Reparación TDD
1. **[RED]** Crear test que falle verificando que password no se almacena en texto plano
2. **[GREEN]** Implementar hashing básico para pasar el test
3. **[REFACTOR]** Mejorar implementación con salt.

## Justificación Final

### Cumplimiento de Requisitos

**Dos bugs de mayor severidad**: Ambos clasificados P0  
**Al menos uno funcional**: Issue #13 es bug funcional visible  
**Registrados como issues**: Ambos en GitHub con documentación completa  
**Viables para TDD**: Ambos permiten ciclos RED-GREEN-REFACTOR claros  

### Valor Estratégico

1. **Cobertura Completa**: Un bug técnico (seguridad) + un bug funcional (UX)
2. **Impacto Máximo**: Ambos P0 con impacto crítico en calidad
3. **Aprendizaje TDD**: Diferentes tipos de testing (unit tests vs integration tests)
4. **Modelo de Calidad**: Abordan 2 de los 4 atributos críticos definidos

### Riesgo de No Reparación

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

## Conclusión

La selección de estos dos bugs está estratégicamente fundamentada en:

- **Criticidad técnica** (P0 en ambos casos)
- **Diversidad de impacto** (técnico + funcional)
- **Viabilidad TDD** comprobada
- **Alineación con modelo de calidad** definido
- **Maximización del valor** de aprendizaje y mejora

Esta selección garantiza que la reparación con TDD abarque tanto aspectos críticos de seguridad como funcionalidad, demostrando la aplicación efectiva de metodologías ágiles de desarrollo en escenarios reales de alta prioridad.