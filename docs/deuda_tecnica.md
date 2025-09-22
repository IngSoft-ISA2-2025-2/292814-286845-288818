# Deuda tecnica 

Para la deuda tecnica nos basamos en el modelo de calidad que definimos previamente. Dicho esto hicimos un analisis del codigo en busqueda de puntos que no cumplan lo esperado en cuanto a mantenibilidad, seguridad y completitud funcional.

## 1) Mantenibilidad

**Métodos largos y lógica repetida:** Por ejemplo, el método [`CreateInvitation`](https://github.com/IngSoft-ISA2-2025-2/292814-286845-288818/blob/main/Obligatorio/Material/Codigo/Backend/PharmaGo.BusinessLogic/InvitationManager.cs) realiza validaciones, consultas y persistencia en un solo bloque, dificultando su mantenimiento y comprensión.

**Acoplamiento elevado:** En `DrugManager.cs`, la clase depende de varios repositorios (`_drugRepository`, `_pharmacyRepository`, etc.), lo que complica la refactorización y el testeo.

**Validaciones duplicadas:** En managers como `PurchasesManager.cs` y `PharmacyManager.cs`, se repiten validaciones de existencia y formato de entidades en varios métodos, generando código redundante.

**Conversión manual y repetitiva de entidades a DTOs:** En controllers como `DrugController.cs` y `PharmacyController.cs`, se observa que en los métodos `GetAll`, `User`, `Create`, `Update` y similares, se utiliza `.Select(...)` o la creación manual de modelos de respuesta para transformar entidades a DTOs en cada endpoint.  
Por ejemplo, en `DrugController.cs` los métodos `GetAll` y `User` convierten la lista de entidades `Drug` a `DrugBasicModel` usando `.Select(...)`, y en `PharmacyController.cs` ocurre lo mismo en `GetAll`, `Create` y `Update` con la conversión a `PharmacyBasicModel` o `PharmacyDetailModel`.  
Esta práctica genera duplicación de lógica y dificulta la evolución futura del modelo de datos.

- ApprobePurchaseDetail, generateTrackingCode formato de nombre de metodos inconsitentes
 
En cada punto encontrado decidimos brindar ejemplos a forma de evidenciar la presencia de las deudas tecnicas mencionadas, eso no significa que se pueda encontrar la misma deuda tecnica multiples veces.

## 2) Seguridad 

**Contraseñas en texto plano:** En `UsersManager.cs` y `LoginManager.cs`, las contraseñas se almacenan y comparan directamente, sin ningún tipo de hash o cifrado.

**Sin control de acceso:** Algunos endpoints en controllers como `RolesController.cs` y `UnitMeasuresController.cs` no tienen filtros de autorización, permitiendo potencialmente operaciones no autorizadas.

**Validación insuficiente de tokens y sesiones:** En varios managers y controllers, como `PurchasesManager.cs` y `ExportController.cs`, se asume que el token recibido es válido y bien formado, sin manejo de errores si el formato es incorrecto.

**Mensajes de error detallados:** En managers como `PharmacyManager.cs` y `PurchasesManager.cs`, los mensajes de excepción pueden revelar información interna del sistema (por ejemplo, "Pharmacy not found"), lo que puede ser explotado por atacantes.

**Mensajes de error en login que revelan información:**  
- Por ejemplo, `Error Login failed: The user does not exist` puede revelar información sobre la existencia de usuarios, lo que puede ser explotado en ataques de enumeración.

## 3) Usabilidad

**Acceso al registro:** Falta un botón "No tengo cuenta" en la pantalla de login para facilitar el acceso al registro.

**Mensajes de error y formato claro en registro:**  
En la pantalla de registro, los mensajes de error no son claros respecto al formato requerido:
- Ejemplo: `Error Create User failed: Invalid UserCode` (el formato requerido es `^[0-9]{6}$`).
- Ejemplo: `Error Create User failed: Invalid Password` (no se indica el formato requerido, que es `^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*-]).{8,}$`).

- el mensaje de error deberia desaparecer una vez que te vas de la pagina o haces otra cosa.

- No funciono creacion de drug: Error Create Drug failed: undefined, mensaje de error no explicativo

- cuando se achica la pantalla el boton de logout desaparece en employee

## 4) Completitud funcional

**No hay logging:** Ningún controller ni manager registra acciones o errores, por ejemplo, en `LoginController.cs` y `PurchasesController.cs` no se registra ningún intento de login o compra.

**Respuestas HTTP poco informativas:** En controllers como `UsersController.cs` y `PharmacyController.cs`, siempre se retorna `Ok`, sin diferenciar entre éxito, error de validación o recurso no encontrado.

**Falta de manejo de errores inesperados:** En managers como `PurchasesManager.cs` y `StockRequestManager.cs`, no se implementa manejo de excepciones para errores no previstos (por ejemplo, fallos de base de datos).

**Validaciones incompletas:** En `UsersManager.cs`, no se valida si el usuario está activo o bloqueado antes de permitir la creación o login.

**Eliminación física vs. lógica:** En `PharmacyManager.cs`, la eliminación de farmacias es física, lo que puede causar pérdida de información relevante.

**Cobertura de casos borde:** En la validación de contraseñas en `UsersManager.cs`, se exige un formato más estricto que el solicitado en la consigna, lo que puede generar confusión y errores funcionales.

- No se pueden ver los purcheses como un employee: Error Get Purchases failed: Object reference not set to an instance of an object.

Durante el correr de las siguientes entregas continuaremos probando y analizando distintos casos bordes para asegurar la completitud funcional.
