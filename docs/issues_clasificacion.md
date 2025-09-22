# Issues Clasificados según DoR

A continuación se presentan las tarjetas de issues, cada una cumpliendo con el formato DoR (Definition of Ready) y los criterios Gherkin (Como/Quiero/Para, Dado/Cuando/Entonces), ordenadas por prioridad dentro de cada atributo de calidad.

---

## Mantenibilidad

### PRIORIDAD ALTA

### Issue: Rutas de archivos hardcodeadas
**Como** desarrollador
**Quiero** que las rutas de archivos sean configurables
**Para** evitar errores en diferentes entornos y facilitar el despliegue

**Prioridad:** Alta

**Escenario Positivo:** Configuración exitosa de rutas
**Dado** que las rutas están configuradas mediante variables de entorno
**Cuando** se despliega en un entorno diferente
**Entonces** la aplicación debe funcionar sin errores de rutas

**Escenario Negativo:** Error por ruta hardcodeada
**Dado** que una funcionalidad utiliza una ruta absoluta hardcodeada
**Cuando** se ejecuta en un entorno donde esa ruta no existe
**Entonces** debe mostrar un error descriptivo y no fallar silenciosamente

---

### Issue: Conversión manual y repetitiva de entidades a DTOs
**Como** desarrollador
**Quiero** que la conversión de entidades a DTOs sea reutilizable
**Para** evitar duplicación y facilitar la evolución del modelo

**Prioridad:** Alta

**Escenario Positivo:** Mapper automático funcionando
**Dado** que se implementa un sistema de mappers automáticos
**Cuando** se agrega o modifica un campo en el modelo
**Entonces** el cambio debe reflejarse automáticamente en todos los endpoints

**Escenario Negativo:** Falta de mapper
**Dado** que no existe un mapper para una entidad
**Cuando** se intenta convertir a DTO
**Entonces** debe mostrar un error claro indicando la ausencia del mapper

---

### PRIORIDAD MEDIA

### Issue: Validaciones duplicadas
**Como** desarrollador
**Quiero** evitar la duplicación de validaciones en managers
**Para** reducir el código redundante y facilitar cambios futuros

**Prioridad:** Media

**Escenario Positivo:** Validación centralizada
**Dado** que las validaciones están centralizadas
**Cuando** se modifica una regla de validación
**Entonces** solo debe cambiarse en un lugar y aplicarse en todos los métodos

**Escenario Negativo:** Validación duplicada inconsistente
**Dado** que existen validaciones duplicadas
**Cuando** se actualiza una pero no las otras
**Entonces** debe detectarse la inconsistencia y reportarse

---

### Issue: Acoplamiento elevado
**Como** desarrollador
**Quiero** que las clases tengan bajo acoplamiento
**Para** facilitar la refactorización y el testeo

**Prioridad:** Media

**Escenario Positivo:** Baja dependencia
**Dado** una clase con máximo 3 dependencias bien definidas
**Cuando** se requiere testing o refactoring
**Entonces** debe ser fácil de mockear y modificar

**Escenario Negativo:** Alto acoplamiento
**Dado** una clase con más de 5 repositorios inyectados
**Cuando** se intenta testear
**Entonces** debe ser complejo de configurar y mockear

---

### Issue: Métodos largos y lógica repetida
**Como** desarrollador
**Quiero** que los métodos sean cortos y con responsabilidades claras
**Para** facilitar el mantenimiento y la comprensión del código

**Prioridad:** Media

**Escenario Positivo:** Método refactorizado
**Dado** un método dividido en métodos más pequeños
**Cuando** se necesita modificar una responsabilidad específica
**Entonces** debe ser fácil localizar y cambiar sin afectar otras funciones

**Escenario Negativo:** Método demasiado largo
**Dado** un método que supera 50 líneas
**Cuando** se intenta entender o modificar
**Entonces** debe ser difícil de seguir y propenso a errores

---

### PRIORIDAD BAJA

### Issue: Inconsistencia en el formato de nombres de métodos
**Como** desarrollador
**Quiero** que los métodos sigan una convención uniforme
**Para** mejorar la legibilidad y evitar confusiones

**Prioridad:** Baja

**Escenario Positivo:** Nomenclatura consistente
**Dado** que todos los métodos siguen la convención PascalCase
**Cuando** se revisa el código
**Entonces** debe ser fácil de leer y entender

**Escenario Negativo:** Nomenclatura inconsistente
**Dado** que existen métodos con nombres como "ApprobePurchase" (error ortográfico)
**Cuando** se busca funcionalidad relacionada
**Entonces** puede generar confusión y dificultad para encontrar métodos

---

## Seguridad

### PRIORIDAD ALTA

### Issue: Contraseñas en texto plano
**Como** usuario
**Quiero** que mis contraseñas estén protegidas
**Para** evitar el acceso no autorizado a mi cuenta

**Prioridad:** Alta

**Escenario Positivo:** Contraseña hasheada
**Dado** que el sistema almacena contraseñas con hash seguro
**Cuando** se crea o actualiza una contraseña
**Entonces** nunca debe guardarse en texto plano

**Escenario Negativo:** Contraseña en texto plano
**Dado** que una contraseña se almacena sin hash
**Cuando** alguien accede a la base de datos
**Entonces** puede leer las contraseñas directamente

---

### Issue: Sin control de acceso
**Como** usuario
**Quiero** que solo usuarios autorizados accedan a ciertas funcionalidades
**Para** proteger la información y operaciones sensibles

**Prioridad:** Alta

**Escenario Positivo:** Autorización correcta
**Dado** un endpoint con filtro de autorización
**Cuando** un usuario autorizado intenta acceder
**Entonces** debe permitir el acceso

**Escenario Negativo:** Acceso no autorizado
**Dado** un endpoint sin filtro de autorización
**Cuando** un usuario no autorizado intenta acceder
**Entonces** debe denegar el acceso con código 401 o 403

---

### PRIORIDAD MEDIA

### Issue: Validación insuficiente de tokens y sesiones
**Como** usuario
**Quiero** que mi sesión sea validada correctamente
**Para** evitar el uso indebido de tokens inválidos

**Prioridad:** Media

**Escenario Positivo:** Token válido
**Dado** que se recibe un token válido y bien formado
**Cuando** se valida la sesión
**Entonces** debe permitir el acceso

**Escenario Negativo:** Token inválido
**Dado** que se recibe un token inválido o mal formado
**Cuando** se intenta validar
**Entonces** debe rechazar la petición con error 401

---

### Issue: Mensajes de error detallados
**Como** usuario
**Quiero** que los mensajes de error no revelen información interna
**Para** evitar posibles ataques y proteger la seguridad del sistema

**Prioridad:** Media

**Escenario Positivo:** Mensaje genérico
**Dado** que ocurre una excepción interna
**Cuando** se retorna un mensaje de error
**Entonces** debe ser genérico sin revelar detalles del sistema

**Escenario Negativo:** Información expuesta
**Dado** que ocurre un error y se muestra "Pharmacy not found with ID 123"
**Cuando** un atacante ve el mensaje
**Entonces** puede obtener información sobre la estructura interna

---

### Issue: Mensajes de error en login que revelan información
**Como** sistema seguro
**Quiero** no revelar si un usuario existe o no
**Para** evitar ataques de enumeración de usuarios

**Prioridad:** Media

**Escenario Positivo:** Mensaje genérico en login
**Dado** que el usuario no existe o la contraseña es incorrecta
**Cuando** se intenta loguear
**Entonces** debe mostrar "Credenciales inválidas" sin especificar cuál

**Escenario Negativo:** Revelación de información
**Dado** que el usuario no existe
**Cuando** se intenta loguear
**Entonces** no debe mostrar "The user does not exist"

---

## Usabilidad

### PRIORIDAD ALTA

### Issue: Mensajes de error y formato claro en registro
**Como** usuario
**Quiero** recibir mensajes de error claros y específicos
**Para** saber cómo corregir mis datos y completar el registro

**Prioridad:** Alta

**Escenario Positivo:** Error descriptivo
**Dado** que ingreso una contraseña que no cumple los requisitos
**Cuando** intento registrarme
**Entonces** debe mostrar exactamente qué requisitos faltan

**Escenario Negativo:** Error genérico
**Dado** que ingreso datos inválidos
**Cuando** recibo "Invalid Password"
**Entonces** no sé qué formato se requiere

---

### Issue: Desaparición del botón de logout en modo employee al achicar la pantalla
**Como** usuario employee
**Quiero** poder cerrar sesión en cualquier tamaño de pantalla
**Para** mantener la seguridad y usabilidad en dispositivos móviles

**Prioridad:** Alta

**Escenario Positivo:** Logout siempre visible
**Dado** que la pantalla se reduce a tamaño móvil
**Cuando** soy employee
**Entonces** el botón de logout debe seguir siendo accesible

**Escenario Negativo:** Logout desaparece
**Dado** que reduzco el tamaño de pantalla
**Cuando** soy employee
**Entonces** no puedo encontrar cómo cerrar sesión

---

### PRIORIDAD MEDIA

### Issue: Redirección al login
**Como** usuario
**Quiero** ser redirigido automáticamente al login si no estoy autenticado
**Para** evitar confusión y acceder rápidamente a la aplicación

**Prioridad:** Media

**Escenario Positivo:** Redirección automática
**Dado** que no estoy autenticado
**Cuando** accedo a una página protegida
**Entonces** debe redirigirme al login automáticamente

**Escenario Negativo:** Sin redirección
**Dado** que no estoy autenticado
**Cuando** accedo a la aplicación
**Entonces** no debería quedarme en una página vacía o de error

---

### Issue: Acceso al registro
**Como** usuario nuevo
**Quiero** acceder fácilmente al registro desde el login
**Para** poder crear mi cuenta sin dificultad

**Prioridad:** Media

**Escenario Positivo:** Registro accesible
**Dado** que estoy en la pantalla de login
**Cuando** no tengo cuenta
**Entonces** debe haber un botón claro "Registrarse" o "Crear cuenta"

**Escenario Negativo:** Sin acceso a registro
**Dado** que estoy en el login sin cuenta
**Cuando** busco cómo registrarme
**Entonces** no debería tener que adivinar la URL o navegar manualmente

---

### Issue: Persistencia innecesaria de mensajes de error en la interfaz
**Como** usuario
**Quiero** que los mensajes de error desaparezcan cuando navego o corrijo la acción
**Para** evitar confusión y mejorar la experiencia de usuario

**Prioridad:** Media

**Escenario Positivo:** Error dinámico
**Dado** que se muestra un mensaje de error
**Cuando** navego a otra página o corrijo el error
**Entonces** el mensaje debe desaparecer automáticamente

**Escenario Negativo:** Error persistente
**Dado** que hay un mensaje de error visible
**Cuando** navego fuera de la página
**Entonces** no debería seguir viendo el error anterior

---

### PRIORIDAD BAJA

### Issue: Mensaje de error no explicativo al crear un drug
**Como** usuario
**Quiero** saber por qué falló la creación de un drug
**Para** poder corregir el error y completar la acción

**Prioridad:** Baja

**Escenario Positivo:** Error específico
**Dado** que intento crear un drug con precio negativo
**Cuando** falla la validación
**Entonces** debe mostrar "El precio debe ser mayor a 0"

**Escenario Negativo:** Error indefinido
**Dado** que intento crear un drug con datos inválidos
**Cuando** falla
**Entonces** no debería mostrar "Error Create Drug failed: undefined"

---

## Completitud funcional

### PRIORIDAD ALTA

### Issue: Referencias nulas no controladas
**Como** usuario
**Quiero** que el sistema maneje correctamente los objetos nulos
**Para** evitar errores y caídas inesperadas

**Prioridad:** Alta

**Escenario Positivo:** Manejo de null
**Dado** que una consulta retorna null
**Cuando** se intenta acceder a una propiedad
**Entonces** debe validar y manejar el caso null apropiadamente

**Escenario Negativo:** Null reference exception
**Dado** que no se valida un objeto null
**Cuando** se accede a sus propiedades
**Entonces** genera "Object reference not set to an instance of an object"

---

### Issue: No es posible visualizar compras como empleado
**Como** usuario employee
**Quiero** poder consultar mis compras correctamente
**Para** tener acceso a la información relevante de mi rol

**Prioridad:** Alta

**Escenario Positivo:** Consulta exitosa
**Dado** que accedo a la vista de compras como empleado
**Cuando** el sistema tiene datos válidos
**Entonces** debe mostrar las compras correspondientes

**Escenario Negativo:** Error en consulta
**Dado** que accedo a la vista de compras como empleado
**Cuando** ocurre un error de referencia nula
**Entonces** no debería mostrar "Get Purchases failed"

---

### Issue: Falta de manejo de errores inesperados
**Como** desarrollador
**Quiero** que los errores inesperados sean manejados y reportados
**Para** evitar caídas y mejorar la robustez del sistema

**Prioridad:** Alta

**Escenario Positivo:** Error capturado
**Dado** que ocurre un error no previsto en la base de datos
**Cuando** se ejecuta una operación
**Entonces** debe capturarlo y mostrar un mensaje amigable

**Escenario Negativo:** Error no manejado
**Dado** que ocurre una excepción inesperada
**Cuando** no hay manejo global
**Entonces** la aplicación puede fallar completamente

---

### PRIORIDAD MEDIA

### Issue: Validación insuficiente en frontend
**Como** usuario
**Quiero** que los formularios validen correctamente los datos
**Para** evitar errores y asegurar la calidad de la información

**Prioridad:** Media

**Escenario Positivo:** Validación correcta
**Dado** que ingreso una dirección con formato válido
**Cuando** intento registrarme
**Entonces** debe aceptar y procesar los datos

**Escenario Negativo:** Validación insuficiente
**Dado** que ingreso "abc" como dirección
**Cuando** el sistema no valida
**Entonces** permite datos inconsistentes

---

### Issue: Respuestas HTTP poco informativas
**Como** usuario
**Quiero** recibir respuestas HTTP que indiquen claramente el resultado
**Para** saber si mi acción fue exitosa o si hubo un error

**Prioridad:** Media

**Escenario Positivo:** Respuesta específica
**Dado** que realizo una acción válida
**Cuando** se procesa correctamente
**Entonces** debe retornar 200 con información relevante

**Escenario Negativo:** Respuesta genérica
**Dado** que ocurre un error de validación
**Cuando** siempre se retorna Ok
**Entonces** no puedo distinguir entre éxito y error

---

### Issue: Validaciones incompletas
**Como** usuario
**Quiero** que el sistema valide si el usuario está activo o bloqueado
**Para** evitar accesos indebidos y mejorar la seguridad

**Prioridad:** Media

**Escenario Positivo:** Usuario activo
**Dado** que el usuario está activo
**Cuando** intenta loguearse
**Entonces** debe permitir el acceso

**Escenario Negativo:** Usuario bloqueado
**Dado** que el usuario está bloqueado o inactivo
**Cuando** intenta loguearse
**Entonces** debe impedir el acceso con mensaje claro

---

### Issue: Se permiten auto-invitaciones
**Como** usuario logueado
**Quiero** que el sistema impida que me invite a mí mismo
**Para** evitar datos inconsistentes y confusión en el flujo de uso

**Prioridad:** Media

**Escenario Positivo:** Invitación a otro usuario
**Dado** que intento invitar a un usuario diferente
**Cuando** se procesa la invitación
**Entonces** debe crearse correctamente

**Escenario Negativo:** Auto-invitación
**Dado** que intento crear una invitación para mi propio usuario
**Cuando** se valida la acción
**Entonces** debe rechazarla con mensaje "No puedes invitarte a ti mismo"

---

### PRIORIDAD BAJA

### Issue: No hay logging
**Como** desarrollador
**Quiero** que las acciones y errores sean registrados
**Para** facilitar el monitoreo y la resolución de problemas

**Prioridad:** Baja

**Escenario Positivo:** Log registrado
**Dado** que ocurre una acción importante
**Cuando** se ejecuta un endpoint crítico
**Entonces** debe quedar registrado en el log

**Escenario Negativo:** Sin logging
**Dado** que ocurre un error en producción
**Cuando** no hay logs
**Entonces** es difícil diagnosticar el problema

---

### Issue: Eliminación física vs. lógica
**Como** administrador
**Quiero** que la eliminación de farmacias sea lógica
**Para** mantener la trazabilidad y evitar pérdida de información

**Prioridad:** Baja

**Escenario Positivo:** Eliminación lógica
**Dado** que elimino una farmacia
**Cuando** se ejecuta la acción
**Entonces** debe marcarse como inactiva pero mantenerse en BD

**Escenario Negativo:** Eliminación física
**Dado** que se elimina físicamente una farmacia
**Cuando** se necesita auditoría histórica
**Entonces** la información se ha perdido permanentemente

---

### Issue: Cobertura de casos borde
**Como** desarrollador
**Quiero** que las validaciones cubran todos los casos borde
**Para** evitar errores funcionales y mejorar la robustez

**Prioridad:** Baja

**Escenario Positivo:** Validación flexible
**Dado** que se ingresa una contraseña con formato válido según consigna
**Cuando** se valida
**Entonces** debe aceptarla

**Escenario Negativo:** Validación muy estricta
**Dado** que la validación es más estricta que lo requerido
**Cuando** se ingresa un formato válido según documentación
**Entonces** no debería rechazarlo por ser muy estricto

---

### Issue: Click en configuración no responde
**Como** usuario
**Quiero** que el botón de configuración funcione correctamente
**Para** poder acceder a las opciones de configuración

**Prioridad:** Baja

**Escenario Positivo:** Configuración accesible
**Dado** que hago click en el símbolo de configuración
**Cuando** la funcionalidad está implementada
**Entonces** debe abrirse el menú correspondiente

**Escenario Negativo:** Click sin respuesta
**Dado** que hago click en configuración
**Cuando** no hay funcionalidad implementada
**Entonces** no debería aparecer el botón o debe mostrar "Próximamente"

---
