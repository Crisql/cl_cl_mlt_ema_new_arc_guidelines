> ### Acerca de CL.AUTH
> Permite aplicar las funcionalidades de recuperación y cambio de contraseñas
> para un API estándar y con conexión a respectivo componente de login.

> ### ¿Qué resuelve?
> La implementación alineada y concisa de funcionalidades de recuperación y
> cambio de contraseñas.

> ### Resumen de versión
> Cambios (Changes)
> > - Ahora la versión mínima de framework es 4.6.2

> ### Rutinas
> > ### SendRecoveryEmail: System.String
> > - **System.Collections.Generic.Dictionary<System.String, System.String> claims**: permite incluir una lista de claims para incluir en el token generado.
> > - **CL.STRUCTURES.CLASSES.Email.EmailCredential _emailCredential**: modelo de credenciales usado para el envío del correo de recuperación.
> > - **CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>> _emailValidateResponse**: resultado de aplicar el método ValidateRecovery.
> > - **System.String _recoveryURL**: URL para UI a enviar en el correo de recuperación de contraseña.
> > ### Realiza la creación de token de validación y envío del correo de recuperación.
> > #### Ejemplo:
> > ```csharp
> > // Debe completar los datos de acceso al correo según los requisitos de su implementación.
> > string token = CL.AUTH.Services.SendRecoveryEmail(
> >    new System.Collections.Generic.Dictionary<System.String, System.String>(),
> >    new CL.STRUCTURES.CLASSES.Email.EmailCredential()
> >    {
> >        Subject = "Cambio de contraseña",
> >        User = "Clavisco",
> >        Account = "example@clavisco.com",
> >        Host = "outlook.office365.com",
> >        Password = "Contraseña de acceso al correo",
> >        Port = 587,
> >        Ssl = true,
> >        IdCompany = -1
> >    },
> >    CL.AUTH.Services.ValidateRecovery<MainDbContext>("resourceName", "example@clavisco.com"),
> >    "https://example.clavisco.com/login");
> > // El token resultante lo debe almacenar según los detalles de implementación que desee utilizar.
> > // Se recomienda guardarlo en la tabla de usuario junto con una fecha de expiración.
> > ```
>
> > ### ValidateRecovery<T>: CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.LocalEntities.CLSingleValue<System.String>>
> > - System.String _spValidateEmail: Nombre del recurso utilizado para validar que el correo exista en la base de datos.
> > - System.String _email: Correo que se verificará para la recuperación de contraseña.
> > ### Valida que el correo enviado exista en la base de datos para realizar la recuperación.
> > #### Ejemplo:
> > ```csharp
> > // El modelo retornado debe traer el correo en la Data si el mismo es válido.
> > CL.AUTH.Services.ValidateRecovery<MainDbContext>("resourceName", "example@clavisco.com");
> > ```
> > #### Parámetros del recurso
> > - @Email: NVARCHAR(MAX)
>
> > ### ChangePassword<T, U>: CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
> System.String _spChangePassword: Nombre del recurso utilizado para cambiar la contraseña mediante proceso de recuperación.
> System.String _token: Token utilizado para validar el cambio de contraseña recuperado.
> System.String _newPassword: Nueva contraseña para actualizar en el correo recuperado.
> > ### Realiza el cambio de contraseña basado en el token proporcionado.
> > #### Ejemplo:
> > ```csharp
> > CL.AUTH.Services.ChangePassword<User, MainDbContext>("resourceName", "Token creado al enviar correo de recuperación", "nueva contraseña");`
> > // El modelo "User" puede variar según las necesidades de retorno del proceso de cambio de contraseña de recuperación.
> > ```
> > #### Parámetros del recurso
> > - @Token: NVARCHAR(MAX)
> > - @Email: NVARCHAR(MAX)
> > - @NewPassword: NVARCHAR(MAX)
>
> > ### ChangePassword<T, U>: CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<T>>
> > - System.String _spChangePassword: Nombre del recurso utilizado para cambiar la contraseña.
> > - System.String _email: Correo al que se realiza el cambio de contraseña.
> > - System.String _oldPassword: Contraseña anterior.
> > - System.String _newPassword: Nueva contraseña.
> > ### Realiza el cambio de contraseña para el correo especificado.
> > #### Ejemplo:
> > ```csharp
> > CL.AUTH.Services.ChangePassword<User, MainDbContext>("resourceName", "example@clavisco.com", "contraseña anterior", "nueva contraseña");
> > // El modelo "User" puede variar según las necesidades de retorno del proceso de cambio de contraseña.
> > ```
> > #### Parámetros del recurso
> > - @Email: NVARCHAR(MAX)
> > - @OldPassword: NVARCHAR(MAX)
> > - @NewPassword: NVARCHAR(MAX)
>
> [Clavis Consultores ©](https://www.clavisco.com/)  