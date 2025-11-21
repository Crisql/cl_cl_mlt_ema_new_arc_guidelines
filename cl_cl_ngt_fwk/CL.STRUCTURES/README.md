> ### Acerca de CL.STRUCTURES
> Contiene todas aquellas estructuras que se han considerado estandar
> en todos los procesos que pueden presentar las aplicaciones.

> ### ¿Qué resuelve?
> Cada vez que tenemos que lidiar con la creación de esctructuras de datos,
> como clases, interfaces, exisite un conjunto de estos que son muy
> similiar en cuanto comportamiento y al no existir un estandar
> los desarrolladores declaran clases como por ejemplo user o User
> y con las propiedades Nombre o nombre, incluso en inglés Name o name.
> La idea con este nuget es poder agrupar todas estas estructuras para
> que en la mayoría de proyectos tengamos esta consistencia al momento
> de implementar nuevas funcionalidades.

> ### Resumen de versión
> Caracteristicas (Features)
> > - Nueva estructuras agregadas para el manejo de procesamiento por lotes.
> > - Nueva estructuras agregadas para el manejo de respuestas de SL sin necesidad de mapeo a un objeto.
 
> ### Clases
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.Exceptions
> > > #### CLException
> > >
> > > ###### Descripción
> > > Tipo de excepción personalizada
> > >
> > > ###### Propiedades
> > >
> > > - **Code** [`System.Net.HttpStatusCode`]: El código que será utilizado para devolver en el endpoint del controlador.
> > >
> > > ###### Ejemplo:
> > > ```csharp
> > > public BusinessPartner MyFunction(string pCardCode)
> > > {
> > >   if(string.IsNullOrEmpty(pCardCode))
> > >   {
> > >       throw new CLException("The card code cannot be null or empty.", System.Net.HttpStatusCode.BadRequest);
> > >   }
> > > 
> > >   // ...more code
> > > }
> > > ```
> >
> > #### Namespace 
> > CL.STRUCTURES.CLASSES.Rebound
> >
> > > #### CLSLResponse
> > > ###### Descripción
> > > Utilizada para mapear las respuestas de error de service layer.
> > >
> > > ###### Propiedades
> > >
> > > - **error** [`CL.STRUCTURES.CLASSES.ServiceLayer.error`]: Representa el modelo de error de una consulta a service layer.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public async void MyMethod()
> > > {
> > >   System.Net.HttpClient httpClient = new System.Net.HttpClient();
> > >   
> > >   // ...your http client configuration  
> > > 
> > >   System.Net.Http.HttpRequestMessage request = new System.Net.HttpRequestMessage("GET", "https://myslurl/b1s/v1/Items");
> > >   
> > >   // ...your request configuration
> > > 
> > >   System.Net.Http.HttpResponseMessage response = await httpClient.SendAsync(request);
> > > 
> > >   if(!response.IsSuccessStatusCode)
> > >   {
> > >       CL.STRUCTURES.CLASSES.Rebound.CLSLResponse oSlResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.Rebound.CLSLResponse>(response.Content.ReadAsStringAsync().Result);
> > >       
> > >       // ...handle service layer error response
> > >   }
> > >   
> > >   // ...
> > > }
> > > ```
> > >
> >
> > > #### Response<T\>
> > > ###### Descripción
> > > Esta clase es usada por la clase CLContext, la cual representa el modelo estandar de respuestas de los metodos de nuestros nuget.
> > > ###### Propiedades
> > > - **Data** [`T`, `Optional`]: Contine la informacion que se requiere retornar, ya sea un array, un objeto o un valor primitivo como un string.
> > > - **Message** [`System.String`, `Optional`]: Utilizada para enviar detalles del proceso al UI.
> > > - **Reponse(System.Exception)** [`Constructor`]: Contructor que nos permite de manera automática mapear una excepción y retornarla al UI.
> > > ###### Ejemplo:
> > > ```csharp
> > > public HttpResponseMessage MyEndpoint()
> > > {
> > >   List<BusinessPartner> businessPartners = Process.GetBusinessPartners();
> > >   
> > >   Response<List<BusinessPartner>> response = new Response<List<BusinessPartner>>()
> > >   {
> > >       Data = businessPartners,
> > >       Message = "Business partners was successful obtained."
> > >   };
> > > 
> > >   return Request.CreateResponse(System.Net.HttpStatusCode.OK, response);
> > > }
> > > ```
> > >
> >
> > > #### CLContext<T\>
> > > ###### Descripción
> > > Es el modelo estandar de respuestas de los metodos de nuestros nuget y tambien el estandar de respuesta que esperan recibir los nuestros componentes de Angular. 
> > > ###### Propiedades
> > > - **Response** [`CL.STRUCTURES.CLASSES.Response<T>`]: Objeto genérico que contiene la información a retornar.
> > > - **Code** [`System.Net.HttpStatusCode`]: Representa el codigo de estado del proceso que se llevo a cabo, este código es utilizado en el UI para mapear los errores y los mensajes enviados desde el API.
> > > ###### Ejemplo:
> > > ```csharp
> > > public HttpResponseMessage MyEndpoint()
> > > {
> > >   List<BusinessPartner> businessPartners = Process.GetBusinessPartners();
> > > 
> > >   CLContext<List<BusinessPartner>> clContext = new CLContext<List<BusinessPartner>>()
> > >   {
> > >       Code = System.Net.HttpStatusCode.OK,
> > >       Response = new Response<List<BusinessPartner>>()
> > >       {
> > >           Data = businessPartners,
> > >           Message = "Business partners was successful obtained."
> > >       }
> > >   };
> > > 
> > >   return CL.COMMON.Core.ContextBroker(clContext);
> > > }
> > > ```
> > >
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.PinPad
> > > #### CLTerminal
> > > ###### Descripción
> > > Modelo estadar de una terminal usada para el dispositivo PinPad
> > > 
> > > ###### Propiedades
> > >
> > > - **TerminalCode** [`System.String`]: Código de la terminal que será usado para realizar las transacciones con PinPad.
> > > - **Description** [`System.String`]: Descripción de la terminal, meramente informativo.
> > > - **Status** [`System.String`]: Estado de la terminal, puede ser cualquier valor.
> > > - **Currency** [`System.String`]: Código de moneda de la teminal, indica que tipo de montos se estan procesando.
> > > - **QuickPayAmount** [`System.Double`]: Se utiliza para imprimir un doble comprobante cuando la transacción alcanza o supera este monto.
> > >
> > > ###### Ejemplo:
> > >```csharp
> > >public void MyMethod()
> > >{
> > >   CLTerminal terminal = new CLTerminal()
> > >   {
> > >     TerminalCode = "TERMCODE01",
> > >     Description = "Terminal de colones",
> > >     Status = "AVAILABLE",
> > >     Currency = "COL",
> > >     QuickPayAmount = 50000  
> > >   };
> > >}
> > >```
> >
> > > #### CLStoredTransaction
> > > ###### Descripción
> > > Modelo de tracciones de realizadas por PinPad
> > >
> > > ###### Propiedades
> > > 
> > > - **Id** [`System.Int32`]: Identificador de la trasacción, generado por la base de datos donde se almacene o por el desarrollador.
> > > - **CompanyId** [`System.Int32`]: Representa el identificador de la compañía en la que se creó esta transacción, este campo es comunmente utilizado en aplicaciones multicompañía.
> > > - **StorageKey** [`System.String`]: Clave con la que se guarda la transacción en el local storage a nivel de UI.
> > > - **Data** [`System.String`]: Representa la información de la transacción de PinPad.
> > > - **StateType** [`System.String`]: Representa el estado en que quedó la transacción, valores validos [`STG`, `CMT`, `CHK`, `SRT`, `HRT`].
> > > - **TransactionType** [`System.String`]: Representa el tipo de la transacción, valores validos [`SL`, `VD`]
> > > - **SyncUser** [`System.String`]: Correo del usuario que sincronizó la transacción con el API.
> > > - **DocumentKey** [`System.String`]: Clave generada por el desarrollador para identificar el documento al que se le aplicó la transacción.
> > > - **TerminalId** [`System.String`]: Representa el código de la terminal con la que se aplicó la transacción.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLStoredTransaction storedTransaction = new CLStoredTransaction()
> > >   {
> > >       Id = 1,
> > >       CompanyId = 2,
> > >       StorageKey = "CMT1231312312",
> > >       Data = "<serialized-transction-info>",
> > >       StateType = "CMT",
> > >       TransactionType = "SL",
> > >       SyncUser = "myemal@hotmail.com",
> > >       DocumentKey = "U12232R34WER",
> > >       TerminalId = "TERMCODE01"
> > >   };
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.LocalEntities
> >
> > > #### CLSingleValue<T\>
> > > ###### Descripción
> > > Utilizado comunmente para retornar un valor primitivo de una consulta a base de datos.
> > > 
> > > ###### Propiedades
> > >
> > > - **Value** [`T`] Valor devuelto por la consulta de a base de datos.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod(int pUserId)
> > > {
> > >   CLContext<CLSingleValue<int>> clContextResponse = CL.DB.Services.Execute<CLSingleValue<int>, DBContext, int, ICLSingle>("GetUserAssigmentsCount", pUserId);
> > > 
> > >   int assigmentsCount = clContextResponse.Response.Data.Value;
> > > }
> > > ```
> >
> > > #### CLPermission
> > > ###### Descripción
> > > Modelo estandar de permisos para aplicación
> > >
> > > ###### Propiedades
> > >
> > > - **Name** [`System.String`]: Nombre identificador del permisos, es el que será utilizado en las validaciones de la aplicación. Estandar de nombre recomendado: `Module_View_Action`
> > > - **Description** [`System.String`]: Descripción de lo que permite hacer el permiso si se es asignado.
> > > - **PermissionType** [`CL.STRUCTURES.PermissionType`]: Indica de que tipo es el permiso.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLPermission permission = new CLPermission()
> > >   {
> > >       Name = "Sales_Invoice_ChangeSalesPerson",
> > >       Description = "Permite cambiar el vendedor en la vista de factura del modulo de ventas",
> > >       PermissionType = CL.STRUCTURES.PermissionType.Update
> > >   };
> > > }
> > > ```
> >
> > > #### CLRole
> > > ###### Descripción
> > > Modelo estandar de los roles para aplicación, representa un conjunto de permisos de aplicación los cuales al asignar el role a un usuario, el usuario pasa a tener todos los permisos asignados al rol.
> > >
> > > ###### Propiedades
> > > 
> > > - **Name** [`System.String`]: Nombre del rol
> > > - **Description** [`System.String`]: Descripción de lo que permite hacer el rol.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLRole role = new CLRole()
> > >   {
> > >       Name = "Documentos de ventas",
> > >       Description = "Permite crear todos los tipos de documentos de ventas"
> > >   };
> > > }
> > > ```
> >
> > > #### CLSetting
> > > ###### Descripción
> > > Modelo estandar para definir configuraciones generales de la aplicación
> > >
> > > ###### Propiedades
> > > 
> > > - **Code** [`System.String`]: Código de la configuración, tambien idenficador utilizado en la aplicación para aplicar las configuraciones.
> > > - **View** [`System.String`]: Campo informativo para indicar en que vistas se utilizará la configuración.
> > > - **Json** [`System.String`]: Objeto serializado que contiene la información de la configuración.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLSetting setting = new CLSetting()
> > >   {
> > >       Code = "DocumentAmountsDecimalsCount",
> > >       View = "Invoices",
> > >       Json = "{ \"DocumentTotalDecimals\": 2, \"LineTotalDecimals\": 2, \"LinePriceDecimals\": 2 }"
> > >   };
> > > }
> > > ```
> >
> > > #### CLUser
> > > ###### Descripción
> > > Modelo estandar de un usuario de la apliación.
> > >
> > > ###### Propiedades
> > >
> > > - **Name** [`System.String`]: Nombre de usuario.
> > > - **LastName** [`System.String`]: Apellido del usuario.
> > > - **Email** [`System.String`]: Correo electrónico del usuario.
> > > - **Password** [`System.String`]: Contraseña de usuario para ingresar a la aplicación.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLUser user = new CLUser()
> > >   {
> > >       Name = "Isaac",
> > >       LastName = "Herrera",
> > >       Email = "isaacherrara@hotmail.com",
> > >       Password = "IH23dg30ms"
> > >   };
> > > }
> > > ```
> >  
> > > #### CLAssignment
> > > ###### Descripción
> > > Modelo estandar de asignaciones de usuario, comunmente utilizado cuando es una aplicación multicompañía
> > > ###### Propiedades
> > >
> > > - **SlpCode** [`System.String`]: Representa el código del vendedor de SAP al que esta relacionado el usuario.
> > > - **CenterCost** [`System.String`]: Representa el centro de costos de SAP al que esta relacionado el usuario.
> > > - **WhsCode** [`System.String`]: Representa el almacén de SAP al que esta relacionado el usuario.
> > > - **Discount** [`System.Double`]: Representa el descuento máximo que puede aplicar un usuario a una linea de un documento.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLAssigment
> > > }
> > > ```
> >
> > > #### CLLicense
> > > ###### Descripción
> > > Modelo estandar para licencias de SAP.
> > > ###### Propiedades
> > >
> > > - **User** [`System.String`]: Nombre de usuario de la licencia.
> > > - **Password** [`System.String`]: Contraseña de la licencia.
> > > 
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLLicense license = new CLLicense()
> > >   {
> > >       User = "cl.my.license",
> > >       Password = "iHs32BGs"
> > >   };
> > > }
> > > ```
> >
> > > #### CLMenu
> > > ###### Descripción
> > > Modelo estandar para opciones de menú de aplicación.
> > > ###### Propiedades
> > > 
> > > - **Key** [`System.String`]: Contiene el identificador de la opción del menú.
> > > - **Description** [`System.String`]: Descripción que se va a mostrar en el menú en el UI.
> > > - **Icon** [`System.String`]: Nombre del icono de que será usado, comunmente es un nombre de los iconos de angular material por la compatibilidad con los componentes NPM.
> > > - **Route** [`System.String`]: Ruta a la que debe navegar al presionar la opción del menú.
> > > - **Visible** [`System.Boolean`]: Indica si la opción del menú es visible en el UI.
> > > - **Nodes** [`System.Collections.Generic.List<CLMenu>`]: Sub-opciones de la opción del menú.
> > > - **Category** [`System.String`]: Utilizada para agrupar las opciones del menú (_Se suele utilizar si el menú es definido en una vista de base de datos_)
> > > - **NextId** [`System.Int32`]: Utilizado para el ordenamiento de las opciones del menú (_Se suele utilizar si el menú es definido en una vista de base de datos_).
> > > ###### Ejemplo
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   List<CLMenu> menu = new List<CLMenu>()
> > >   {
> > >       new CLMenu() 
> > >       {
> > >           Description = "Ventas",
> > >           Id = 1, // This Id is inherit from BaseEntity class
> > >           Icon = "receipt",
> > >           Route = "",
> > >           Visible = true,
> > >           Category = "A"
> > >           Nodes = new List<CLMenu>()
> > >           {
> > >               new CLMenu()
> > >               {
> > >                   Description = "Factura",
> > >                   Id = 2,
> > >                   Icon = "receipt",
> > >                   Route = "invoice",
> > >                   Visible = true,
> > >                   Category = "A"
> > >               }
> > >           }
> > >       };
> > >   }
> > > }
> > > ```
> >
> > > #### CLDBResource
> > > ###### Descripción
> > > Representa un recurso de base de datos, hace referencia a un objeto de base de datos o endpoint de service layer y es utilizado para todo lo que este relacionado con acceso a una base de datos.
> > > ###### Propiedades
> > > 
> > > - **Code** [`System.String`]: Código del recurso y el que se usara por la aplicacion para hacer las operaciones de acceso a bases de datos.
> > > - **Description** [`System.String`, `Optional`]: Descripción de lo que hace el recurso y para que debe ser usado.
> > > - **DBObject** [`System.String`]: Objeto de base de datos o endpoint de service layer.
> > > - **QueryString** [`System.String`, `Optional`]: Filtros y restricciones que se le van a aplicar a la consulta de service layer, debe mantener el formato definido por la version de `OData` que utilice de service layer.
> > > - **PageSize** [`System.Int32`, `Optional`]: Cantidad máxima de registros que va a obtener la consulta de service layer.
> > > - **Type** [`System.String`]: Indica el tipo de recurso. Valores validos: 
> > >   - Cadena de consulta (`QS`)
> > >   - Función (`FN`)
> > >   - Procedimiento almacenado (`SP`)
> > >   - SAP Writer (`SW`)
> > >   - Vista (`V`)
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   List<CLDBResource> resources = new List<CLDBResource>()
> > >   {
> > >       new CLDBResource()
> > >       {
> > >           Code = "GetBusinessPartners",
> > >           Description = "Obtiene todos los socios de negocios de la compañía que esten activos",
> > >           DBObject = "CLVS_D_MLT_SLT_BUSINESSPARTNERS_B1SLQuery",
> > >           QueryString = "$select=CardCode,CardName&$filter=validFor eq 'Y' and frozenFor eq 'N'",
> > >           PageSize = 0, // When zero, all records will be retrieved
> > >           Type = "QS"
> > >       },
> > >       new CLDBResource()
> > >       {
> > >           Code = "GetItems",
> > >           Description = "Obtiene de los items",
> > >           DBObject = "Items",
> > >           QueryString = "",
> > >           PageSize = 0,
> > >           Type = "SW"
> > >       }
> > >   };
> > > }
> > > ```
> >
> > > #### CLConnection
> > > ###### Descripción
> > > Modelo estandar para conexiones a base de datos.
> > > ###### Propiedades
> > > 
> > > - **Name** [`System.String`]: Nombre de la conexión
> > > - **Odbctype** [`System.String`]: Tipo de ODBC. Valores validos:
> > >   - HDBODBC (`x64`)
> > >   - HDBODBC32 (`x86`)
> > >   - SQL Server
> > > - **Server** [`System.String`]: Código de servidor al que se va a realizar la conexión.
> > > - **User** [`System.String`]: Nombre de usuario para la autenticación con el servidor.
> > > - **Pass** [`System.String`]: Contraseña de usuario para la autenticación con el servidor.
> > > - **ServerType** [`System.String`]: Indica el tipo del servidor al que se va a conectar. Valores validos:
> > >   - SQL
> > >   - HANA
> > > - **SLUrl** [`System.String`]: URL del service layer a la que se va a conectar.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLConnection connection = new CLConnection()
> > >   {
> > >       Name = "Conexión 1",
> > >       Odbctype = "HDBODBC",
> > >       Server = "hanaserver:30015",
> > >       Pass = "password1",
> > >       User = "user1",
> > >       ServerType = "HANA",
> > >       SLUrl = "https://<my-service-layer>/b1s/v1/"
> > >   };
> > > }
> > > ```
> >
> > > #### CLCompany
> > > ###### Descripción
> > > Modelo estandar para compañías en una aplicación.
> > > ###### Propiedades
> > > - **Name** [`System.String`]:  Nombre de la compañía.
> > > - **DatabaseCode** [`System.String`]: Código de base de datos de la compañía en SAP.
> > > ###### Ejemplo: 
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLCompany company = new CLCompany()
> > >   {
> > >       Name = "DemoCR",
> > >       DatabaseCode = "DEMOCR_DB"
> > >   };
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.PresentationEntities
> > > #### BaseEntity
> > > ###### Descripción
> > > Clase entidad base, todos los modelos de entidad heredan de ella, contiene todos los campos de auditoria.
> > > ###### Propiedades
> > > - **Id** [`System.Int32`]: Identificador del registro en base de datos.
> > > - **CreatedDate** [`System.DateTime`]: Fecha en la que el registro fue creado en base de datos.
> > > - **CreateBy** [`System.String`]: Correo del usuario que creó el registro.
> > > - **UpdateDate** [`System.DateTime`, `Optional`]: Fecha de actualización del registro.
> > > - **UpdatedBy** [`System.String`, `Optional`]: Correo del usuario que modificó el registro.
> > > - **IsActive** [`System.Boolean`]: Indica si el registro esta disponible o activo.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLUser user = new CLUser()
> > >   {
> > >       Name = "Isaac",
> > >       LastName = "Herrera",
> > >       Email = "isaacherrara@hotmail.com",
> > >       Password = "IH23dg30ms",
> > >       Id = 1,
> > >       CreatedDate = DateTime.Now,
> > >       CreatedBy = "clvsuser@clavisco.com",
> > >       UpdateDate = DateTime.Now,
> > >       UpdatedBy = "clvsuser@clavisco.com",
> > >       IsActive = true
> > >   };
> > > } 
> > > ```
> >
> > > #### CLDbConnectionOptions
> > > ###### Descripción
> > > Utilizada para realizar consultas a bases de datos HANA y SQL mediante ODBC.
> > > ###### Propiedades
> > > - **Parameters** [`System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>`, `Optional`]: En caso de que le objeto sea un procedimiento almacenado se le enviaran estos parametros.
> > > - **DbObjectName** [`System.String`]: Objeto de base de datos que se va a ejecutar.
> > > - **DbName** [`System.String`]: Nombre de base de datos donde se encuentra el objeto que se va a ejecutar.
> > > - **CommandType** [`System.Data.CommandType`]: Indica el tipo de objeto que se va a ejecutar.
> > > - **CommandText** [`System.String`]: En caso de que no sea un procedimiento almacenado, se puede especificar una sentencia SQL.
> > > - **ConnectionString** [`System.String`]: Cadena de conexión que se va a utilizar para realizar la conexión con base de datos.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLDbConnectionOptions dbConnectionOptions1 = new CLDbConnectionOptions()
> > >   {
> > >       Parameters = new List<OdbcParameter>()
> > >       {
> > >           new OdbcParameter("@Parameter1", "Value1")
> > >       },
> > >       DbObjectName = "CLVS_D_MLT_SLT_BUSINESSPARTNERS",
> > >       DbName = "MY_DATABASE_NAME",
> > >       CommandType = CommandType.StoredProcedure,
> > >       ConnectionString = "myConnectionString"
> > >   };
> > > 
> > >   CLDbConnectionOptions dbConnectionOptions2 = new CLDbConnectionOptions()
> > >   {
> > >       DbObjectName = "CLVS_D_MLT_SLT_BUSINESSPARTNERS",
> > >       DbName = "MY_DATABASE_NAME",
> > >       CommandType = CommandType.Text,
> > >       ConnectionString = "myConnectionString",
> > >       CommandText = "SELECT * FROM"
> > >   };
> > > }
> > > ```
> >
> > > #### CLCredentialHolder
> > > ###### Descripción
> > > Contiene la informacion necesaria para realizar una conexión a una base de datos, comunmente utilizado para consultas con ODBC o Service Layer.
> > > ###### Propiedades
> > > - **DBCode** [`System.String`]: Código de base de datos a la que se va conectar.
> > > - **Server** [`System.String`]: Código de servidor en el que esta la base de datos.
> > > - **SLUrl** [`System.String`]: URL de service layer
> > > - **DST** [`System.String`]: Tipo de fuente de datos. Posibles valores:
> > >   - dst_HANADB
> > >   - dst_MSSQL2019
> > > - **License** [`System.String`, `Optional`]: Licencia o usuario para realizar la autenticación con el servidor
> > > - **Password** [`System.String`, `Optional`]: Contraseña de licencia o usuario para realizar la autenticación con el servidor.
> > > - **Email** [`System.String`, `Deprecated`]: Correo electrónico del usuario. 
> > > - **ODBCUser** [`System.String`]: Usuario para realizar la autenticación con el servidor.
> > > - **ODBCPass** [`System.String`]: Contraseña de usuario para realizar la autenticación con el servidor. 
> > > - **ODBCType** [`System.String`]: Tipo de ODBC. Valores validos:
> > >   - HDBODBC (`x64`)
> > >   - HDBODBC32 (`x86`)
> > >   - SQL Server
> > > - **ServerType** [`System.String`]: Tipo de servidor al que se va a conectar. Valores validos:
> > >   - SQL
> > >   - HANA
> > > - **Resource** [`System.String`]: Recurso que se va a ejecutar mediante Service Layer.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CLCredentialHolder credentials = new CLCredentialsHolder() 
> > >   {
> > >       ODBCType = "HDBODBC",
> > >       Server = "hanaserver:30015",
> > >       ODBCPass = "password1",
> > >       ODBCUser = "user1",
> > >       ServerType = "HANA",
> > >       SLUrl = "https://<my-service-layer>/b1s/v1/",
> > >       Resource = 'view.svc/CLVS_D_MLT_SLT_BUSINESSPARTNERS_B1SLQuery'
> > >   };
> > > }
> > > ```
> >
> > > #### ClUserContext
> > > ###### Descripción
> > > Utilizada comunmente para realizar consultas a Service Layer, continene información de conexión, y recurso que se va a consultar.
> > > ###### Propiedades
> > > - **DBCode** [`System.String`]: Código de base de datos a la que se va conectar.
> > > - **Server** [`System.String`]: Código de servidor en el que esta la base de datos.
> > > - **SLUrl** [`System.String`]: URL de service layer
> > > - **DST** [`System.String`]: Tipo de fuente de datos. Posibles valores:
> > >   - dst_HANADB
> > >   - dst_MSSQL2019
> > > - **License** [`System.String`, `Optional`]: Licencia o usuario para realizar la autenticación con el servidor
> > > - **Password** [`System.String`, `Optional`]: Contraseña de licencia o usuario para realizar la autenticación con el servidor.
> > > - **Email** [`System.String`, `Deprecated`]: Correo electrónico del usuario.
> > > - **ODBCUser** [`System.String`]: Usuario para realizar la autenticación con el servidor.
> > > - **ODBCPass** [`System.String`]: Contraseña de usuario para realizar la autenticación con el servidor.
> > > - **ODBCType** [`System.String`]: Tipo de ODBC. Valores validos:
> > >   - HDBODBC (`x64`)
> > >   - HDBODBC32 (`x86`)
> > >   - SQL Server
> > > - **ServerType** [`System.String`]: Tipo de servidor al que se va a conectar. Valores validos:
> > >   - SQL
> > >   - HANA
> > > - **Resource** [`System.String`]: Recurso que se va a ejecutar mediante Service Layer.
> > > - **ResourceType** [`System.String`]: Tipo de recurso que se va a ejecutar. Valores validos:
> > >   - Cadena de consulta (`QS`)
> > >   - Función (`FN`)
> > >   - Procedimiento almacenado (`SP`)
> > >   - SAP Writer (`SW`)
> > >   - Vista (`V`)
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   ClUserContext userContext = new ClUserContext() 
> > >   {
> > >       ODBCType = "HDBODBC",
> > >       Server = "hanaserver:30015",
> > >       ODBCPass = "password1",
> > >       ODBCUser = "user1",
> > >       ServerType = "HANA",
> > >       SLUrl = "https://<my-service-layer>/b1s/v1/",
> > >       Resource = "view.svc/CLVS_D_MLT_SLT_BUSINESSPARTNERS_B1SLQuery",
> > >       ResourceType = "QS"
> > >   };
> > > }
> > > ```
> > 
> > > #### CartesianEntity<T, ..., Y>
> > > ###### Descripción
> > > Utilizada para realizar consultas a base de datos local, ofrece un total de 6 posibles valores a enviar como parametro a un procedimiento almacenado.
> > > ###### Propiedades
> > > - **AKey** [`T`] Valor 1
> > > - **BKey** [`U`] Valor 2
> > > - **CKey** [`V`] Valor 3
> > > - **DKey** [`W`] Valor 4
> > > - **EKey** [`X`] Valor 5
> > > - **YKey** [`Y`] Valor 6
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CartesianEntity<int, string> cartesianEntity = new CartesianEntity<int, string>()
> > >   {
> > >       AKey = 1, // User Id,
> > >       BKey = "Isaac" // User name
> > >   };
> > > 
> > >   CLContext<CLUser> contextResponse = CL.DB.Services.Execute<CLUser, CartesianEntity<int, string>, DBContext, ICLSingle>("GetUserByIdAndName", cartesianEntity);
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.ServiceLayer
> >
> > > #### BatchRequest
> > > ###### Descripción:
> > > Representa la transacción que vamos a ejecutar en el lote creado en SL.
> > >
> > > ###### Propiedades
> > >
> > > - **Id** [`System.Int32`]: Identificador para la solicitud en el lote.
> > > - **Method** [`CL.STRUCTURES.VERBS`]: Representa el tipo de solicitud que se va a ejecutar.
> > > - **Url** [`System.String`]: Endpoint de Service Layer al cual se va a realizar la petición.
> > > - **Content** [`System.String`, `Optional`]: Contenido serializado que sera enviado en la petición.
> > > - **ChangeSetNumber** [`System.Int32`]: Requerido solamente si la solicitud va a cambiar algo a nivel de SAP, como lo es `PATCH` o `POST`.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   BatchRequest batchRequest = new BatchRequest()
> > >   {
> > >       Id = 1,
> > >       Verb = CL.STRUCTURES.VERBS.POST,
> > >       ChangeSetNumber = 1,
> > >       Url = "BusinessPartners",
> > > 
> > >       Content = "{ \"CardCode\": \"C0001\", \"CardName\": \"ISAAC MOISES HERRERA SANDI\" }"
> > >   }
> > > }
> > > ```
> > >
> >
> > > #### UnmappedResponse
> > > ###### Descripción
> > > Representa el modelo de respuesta que se recibira por parte del nuget al completar todas las peticiones del lote.
> > > 
> > > ###### Propiedades
> > > 
> > > - **StringResponse** [`System.String`]: Contiene de manera serializada todas las respuestas devueltas por las peticiones del lote.
> > > ###### Ejemplo:
> > > ```csharp
> > > public async void MyMethod()
> > > {
> > > 
> > >   List<BatchRequest> batchRequests = new List<BatchRequest>()
> > >   {
> > >       {
> > >           Id = 1,
> > >           Verb = CL.STRUCTURES.VERBS.POST,
> > >           ChangeSetNumber = 1,
> > >           Url = "BusinessPartners",
> > >           Content = "{ \"CardCode\": \"C0001\", \"CardName\": \"ISAAC MOISES HERRERA SANDI\" }"
> > >       },
> > >       {
> > >           Id = 2,
> > >           Verb = CL.STRUCTURES.VERBS.GET,
> > >           ChangeSetNumber = 0,
> > >           Url = "Items",
> > >           Content = ""
> > >       }
> > >   };
> > > 
> > >   ClUserContext context = new ClUserContext()
> > >   {
> > >       DBCode = "MY_SAP_DATABASE_NAME",
> > >       Password = "mySapLicensePassword",
> > >       License = "mySapLicense",
> > >       SLUrl = "https://<my-sl-domain>/b1s/v1/"
> > >   };
> > > 
> > >   SLRequestObject requestObject = context.BatchOperation(batchRequests);
> > > 
> > >   CLContext<UnmappedResponse> oClContextResponse = await requestObject.SendAsync<UnmappedResponse>();
> > > }
> > > ```
> >
> > > #### Login
> > > ###### Descripción
> > > Utilizada para realizar Login en Service Layer.
> > > ###### Propiedades
> > > - **Url** [`System.String`]: Endpoint de login en Service Layer
> > > - **Method** [`System.String`]: Metodo HTTP que requiere el endpoint
> > > - **Content** [`CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent`]: Credenciales que serán usadas para realizar el Login.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Login login = new Login()
> > >   {
> > >       Url = "Login",
> > >       Method = "POST",
> > >       Content = new LoginContent() 
> > >       {
> > >           CompanyDB = "MY_DATABASE_NAME",
> > >           UserName = "cl.my.license",
> > >           Password = "iH32sd78"
> > >       }
> > >   };
> > > }
> > > ```
> >
> > > #### LoginContent
> > > ###### Descripción
> > > Modelo de credenciales para realizar login en Service Layer.
> > > ###### Propiedades
> > > - **CompanyDB** [`System.String`: Nombre de la base de datos a la que se va a conectar
> > > - **UserName** [`System.String`]: Nombre de usuario (licencia) que se va a utilizar para la autenticación.
> > > - **Password** [`System.String`]: Contraseña para realizar la autenticación a Service Layer.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   LoginContent loginContent = new LoginContent()
> > >   {
> > >           CompanyDB = "MY_DATABASE_NAME",
> > >           UserName = "cl.my.license",
> > >           Password = "iH32sd78"
> > >   };
> > > }
> > > ```
> > 
> > > #### CookieResponse
> > > ###### Descripción
> > > Utilizada como token de autorización a Service Layer mediante el balanceador de cargas.
> > > ###### Propiedades
> > > - **GetTime** [`System.DateTime`]: Fecha en la que se obtuvo la el token.
> > > - **SessionId** [`System.String`]: Token de autorización para Service Layer.
> > > - **ROUTEID** [`System.String`]: Contiene el identificador de la ruta. Es utilizado por el balanceador de cargas. 
> > > - **Version** [`System.String`]: La versión del sistema SAP Business One.
> > > - **SessionTimeout** [`System.Int32`]: Indica cuánto tiempo (Minutos) permanecerá activa la sesión antes de que expire automáticamente si no hay actividad.
> > > - **error** [`CL.STRUCTURES.CLASSES.ServiceLayer.error`, `Optional`]: Contiene el error de la consulta.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   CookieResponse cookieResponse = new CookieResponse()
> > >   {
> > >       GetTime = "2024-08-09 09:38:45 AM",
> > >       SessionId = "6f243r0c-5663-11ef-8000-e2321be34v7f",
> > >       ROUTEID = ".node3",
> > >       Version = "1000180",
> > >       SessionTimeout = 30
> > >   };
> > > }
> > > ```
> >
> > > #### message
> > > ###### Descripción
> > > Modelo de mensaje en un error de una consulta de Service Layer.
> > > ###### Propiedades
> > > - **lang** [`System.String`]: Lenguage del mensaje
> > > - **value** [`System.String`]: Texto del mensaje
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   message mgs = new message()
> > >   {
> > >       lang = "en-us",
> > >       message = "The username or password you entered is incorrect\n"
> > >   };
> > > }
> > > ```
> >
> > > #### error
> > > ###### Descripción
> > > Modelo de respuesta de un error de Service Layer
> > > ###### Propiedades
> > > - **code** [`System.String`] Código del error de Service Layer
> > > - **message** [`CL.STRUCTURES.CLASSES.ServiceLayer.message`] Mensaje del error de Service Layer.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   error err = new error()
> > >   {
> > >       code = -314,
> > >       message = new message()
> > >       {
> > >           lang = "en-us",
> > >           message = "The username or password you entered is incorrect\n"
> > >       };
> > >   };
> > > }
> > > ```
> >
> > > #### SLRequestObject
> > > ###### Descripción
> > > Utilizado para construir la consulta que previamente será enviada a Service Layer.
> > > ###### Propiedades
> > > - **Login** [`CL.STRUCTURES.CLASSES.ServiceLayer.Login`]: Información para realizar el login a Service Layer.
> > > - **Url_Base** [`System.String`]: URL base de Service Layer.
> > > - **Url_Request** [`System.String`]: URL a la que se va a realizar la consulta.
> > > - **Method** [`System.String`]: Metodo HTTP con el que se va a enviar la consulta.
> > > - **Content** [`System.String`]: Contenido serializado que sera enviado en el cuerpo de la consulta.
> > > - **BatchBoundary** [`System.String`]: Contiene el identificador del lote.
> > > - **Headers** [`System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<System.String, System.String>>`, `Optional`]: Contiene los headers que serán enviados por la solicitud.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   SLRequestObject slRequestObject = new SLRequestObject()
> > >   {
> > >       Login = new Login()
> > >       {
> > >           Url = "Login",
> > >           Method = "POST",
> > >           Content = new LoginContent() 
> > >           {
> > >               CompanyDB = "MY_DATABASE_NAME",
> > >               UserName = "cl.my.license",
> > >               Password = "iH32sd78"
> > >           }
> > >       },
> > >       Url_Base = "https://<my-service-layer-domain>/b1s/v1/",
> > >       Url_Request = "https://<my-service-layer-domain>/b1s/v1/Items('1000')",
> > >       Method = "PATCH",
> > >       Content = "{\"ItemName\": \"PRODUCTO 1\"}",
> > >       Headers = new List<KeyValuePair<string, string>>() 
> > >       { 
> > >           new KeyValuePair<string,string>("Content-Type", "application/json") 
> > >       },
> > >       BatchBoundary = "batch_1_0adfcc18-c2cf-47ca-896e-8f37573f685d"
> > >   };
> > > }
> > > ```
> >
> > > #### SLGet<T\>
> > > ###### Descripción
> > > Utilizada para consultas GET a Service Layer, mapea valores de la respuesta y los asigna a las propiedades.
> > > ###### Propiedades
> > > - **value** [`T`]: Resultado de la consulta.
> > > - **OdataMetadata** [`System.String`]: URL de metadatos de la solicitud.
> > > - **OdataNextLink** [`System.String`]: Siguiente URL a la que se debe consultar si se quiere obtener los siguientes registros paginados.
> > > - **RecordsCount** [`System.Int32`]: Cantidad de registros que existen en base de datos.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   SLGet<List<StockTransfer>> slGetStockTransfer = new SLGet<List<StockTransfer>>()
> > >   {
> > >       OdataMetadata = "https://<my-service-layer-domain>/b1s/v1/$metadata#StockTransfers",
> > >       value = [{...}, {...}, {...}, {...}, {...}],
> > >       OdataNextLink = "StockTransfers?$inlinecount=allpages&$skip=5",
> > >       RecordsCount = 15
> > >   };
> > > }
> > > ```
> 
> > #### Namespace 
> > CL.STRUCTURES.CLASSES.SAP
> > > #### SalesMan
> > > ###### Descripción
> > > Modelo simplificado de un empleado de ventas de SAP.
> > > ###### Propiedades
> > > - **SlpCode** [`System.Int32`]: Código del empleado de ventas.
> > > - **SlpName** [`System.String`]: Nombre del empleado de ventas.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   SalesMan salesMan = new SalesMan()
> > >   {
> > >       SlpCode = 1,
> > >       SlpName = "Ricardo Arjona"
> > >   };
> > > }
> > > ```
> > 
> > > #### BusinessPartner
> > > ###### Descripción
> > > Modelo simplificado de un socio de negocios de SAP.
> > > ###### Propiedades
> > > - **CardCode** [`System.String`]: Código de socio de negocios.
> > > - **CardName** [`System.String`]: Nombre del socio de negocios.
> > > - **Address** [`System.String`]: Dirección del socio de negocios.
> > > - **Phone1** [`System.String`]: Teléfono del socio de negocios.
> > > - **Balance** [`System.String`]: Saldo del socio de negocios.
> > > - **GroupNum** [`System.String`]: Grupo del socio de negocios.
> > > - **Discount** [`System.String`]: Descuento que se puede aplicar al socio de negocios.
> > > - **ListNum** [`System.String`]: Lista de precios del socio de negocios.
> > > - **Currency** [`System.String`]: Moneda del socio de negocios.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   BusinessPartner businessPartner = new BusinessPartner()
> > >   {
> > >       CardCode = "C0001",
> > >       CardName = "ISAAC MOISES HERRERA SANDI",
> > >       Address = "San José, Costa Rica.",
> > >       Phone1 = "63524145",
> > >       Balance = "105000.56",
> > >       Discount = "9",
> > >       GroupNum = "100",
> > >       ListNum = "1",
> > >       Currency = "COL"
> > >   };
> > > }
> > > ```
> >
> > > #### Account
> > > ###### Descripción
> > > Modelo simplificado de las cuentas para transacciones de SAP.
> > > ###### Propiedades
> > > - **AcctName** [`System.String`]: Nombre de la cuenta
> > > - **AcctCode** [`System.String`]: Código de la cuenta
> > > - **ActCurr** [`System.String`]: Moneda de la cuenta.
> > > - **Type** [`System.Int32`]: Indica si es una cuenta para efectivo, tarjeta o transferencia. Valore validos:
> > >   - Efectivo (`1`)
> > >   - Tarjeta (`2`)
> > >   - Transferencia (`3`)
> > > ###### Ejemplo
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Account account = new Account()
> > >   {
> > >       AcctName = "City Bank",
> > >       AcctCode = "_SYS00000000001",
> > >       ActCurr = "USD",
> > >       Type = 1
> > >   };
> > > }
> > > ```
> > 
> > > #### Bank
> > > ###### Descripción
> > > Modelo simplificado de bancos de SAP.
> > > ###### Propiedades
> > > - **BankCode** [`System.String`]: Código del banco.
> > > - **BankName** [`System.String`]: Nombre del banco.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Bank bank = new Bank()
> > >   {
> > >       BankCode = "BSJ",
> > >       BankName = "Banco BAC - San José"
> > >   };
> > > }
> > > ```
> >
> > > #### Card
> > > ###### Descripción
> > > Modelo simplificado de una tarjeta en SAP.
> > > ###### Propiedades
> > > - **CardName** [`System.String`]: Nombre de la tarjeta.
> > > - **AcctCode** [`System.String`]: Código de la tarjeta.
> > > - **Currency** [`System.String`]: Moneda de la tarjeta.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Card card = new Card()
> > >   {
> > >       CardName = "Master Card",
> > >       AcctCode = "_SYS00000000312",
> > >       Currency = "##"
> > >   };
> > > }
> > > ```
> > 
> > > #### Item
> > > ###### Descripción
> > > Modelo simplificado de un artículo de SAP.
> > > ###### Propiedades
> > > - **ItemCode** [`System.String`]: Código del artículo.
> > > - **ItemName** [`System.String`]: Nombre del artículo.
> > > - **InventoryItem** [`System.String`]: Indica si el artículo es de inventario.
> > > - **SalesItem** [`System.String`]: Indica si el artículo es de venta.
> > > - **PurchaseItem** [`System.String`]: Indica si el artículo es de compra.
> > > - **TaxRate** [`System.Double`]: Tasa de impuesto del artículo.
> > > - **TaxCode** [`System.String`]: Código de impuesto del artículo.
> > > - **UnitPrice** [`System.Double`]: Precio del artículo.
> > > - **TaxOnly** [`System.String`]: Indica si el artículo es bonificacion.
> > > - **UoMEntry** [`System.String`]: Unidad de medida del artículo.
> > > - **OnHand** [`System.Double`]: Stock del artículo.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Item item = new Item()
> > >   {
> > >       ItemCode = "ITM0001",
> > >       ItemName = "PRODUCTO 1",
> > >       InventoryItem = "Y",
> > >       SalesItem = "Y",
> > >       PurchaseItem = "N",
> > >       TaxRate = 13,
> > >       TaxCode = "IVA",
> > >       UnitPrice = 1500
> > >       TaxOnly = "tNO",
> > >       UoMEntry = 1,
> > >       OnHand = 456
> > >   };
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.LogManager
> > > #### ClLogManagerOption
> > > ###### Descripción
> > > Utilizada para configuraciones de log manager.
> > > ###### Propiedades
> > > - **Key** [`System.String`] Clave de la configuración.
> > > - **Value** [`System.String`] Valor de la configuración.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   ClLogManagerOption option = new ClLogManagerOption()
> > >   { 
> > >       Key = "FilePrefix",
> > >       Value = "POST_"
> > >   };
> > > }
> > > ```
>  
> > #### Namespace
> > CL.STRUCTURES.CLASSES.Udf
> > > #### UdfContext
> > > ###### Descripción
> > > Utilizado para mostrar información y campos dinamicamente.
> > > ###### Propiedades
> > > - **TableId** [`System.String`]: Nombre de la tabla a la que hacer referencia.
> > > - **Name** [`System.String`]: Nombre del UDF.
> > > - **Description** [`System.String`]: Descripción sobre le UDF
> > > - **FieldType** [`System.String`]: Tipo de dato de valor del UDF
> > > - **Values** [`System.String`]: Valores validos serializados del UDF.
> > > - **MappedValues** [`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>`]: Valores validos deserializados del UDF.
> > > - **DataSource** [`System.String`, `Optional`]: Nombre de la vista de la cual se van a obtener los valores validos para el UDF. 
> > > - **TargetToOverride** [`System.String`, `Optional`]: Nombre del UDF que se va a completar con la informacion devuelta por el procedimiento almacenado especificado en _PostTransactionObject_
> > > - **PostTransactionObject** [`System.String`, `Optional`]: Nombre de objeto de base de datos que se va a ejecutar al seleccionar uno de los valores validos del UDF.
> > > - **IsActive** [`System.Boolean`]: Indica si el UDF configurado esta activo.
> > > - **IsRequired** [`System.Boolean`]: Indica si el UDF configurado es requerido de completar.
> > > - **IsRendered** [`System.Boolean`]: Indica si el UDF configurado debe ser renderizado en el UI.
> > > - **IsTypehead** [`System.Boolean`]: Indica si el UDF configurado va a hacer un typeahead o autocomplete en caso de usar angular material.
> > > - **FieldID** [`System.Int32`]: Id del UDF en SAP.
> > > - **HeaderId** [`System.Int32`, `Optional`]: Id de la cabecera.
> > > - **LinesId** [`System.Int32`, `Optional`]: Id de la linea
> > > - **DescriptionLines** [`System.String`, `Optional`]: Descripcion de las lineas
> > > - **Group** [`System.String`, `Optional`]: Indica a que grupo de UDFs pertenece.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   UdfContext udfContext = new UdfContext()
> > >   {
> > >       TableId = "OINV",
> > >       Name = "U_provincia",
> > >       Description = "Clave de documento",
> > >       FieldType = "System.String",
> > >       Values = "[{\"Value\": \"01\", \"Description\": \"San José\"}, {\"Value\": \"04\", \"Description\": \"Cartago\"}]",
> > >       MappedValues = new List<UdfInvoke>()
> > >       {
> > >           new UdfInvoke() { Value = "01", Description = "San José" },
> > >           new UdfInvoke() { Value = "04", Description = "Cartago" }
> > >       },
> > >       DataSource = "CLVS_D_MLT_SLT_PROVINCES",
> > >       TargetToOverride = "U_canton",
> > >       PostTransactionObject = "CLVS_D_MLT_SLT_CANTONS",
> > >       IsActive = true,
> > >       IsRequired = true,
> > >       IsRendered = true,
> > >       FieldID = 11,
> > >       Group = "Ubicación"
> > >   };
> > > }
> > > ```
> > 
> > > #### UdfInvoke
> > > ###### Descripción
> > > Modelo de valores validos para un UDF.
> > > ###### Propiedades
> > > - **Value** [`System.String`]: Valor que se le seteara al UDF al seleccionar esta opción.
> > > - **Description** [`System.String`]: Descripción que se mostrar en el UI.
> > > - **IsActive** [`System.Boolean`]: Indica si el valor valido debe mostrarse.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   UdfInvoke validValue = new UdfInvoke()
> > >   {
> > >       Value = "01",
> > >       Description = "San José",
> > >       IsActive = true
> > >   };
> > > }
> > > ```
> > 
> > > #### Udf
> > > ###### Descripción
> > > Utilizada para agregar UDFs como propiedades de objetos.
> > > ###### Propiedades
> > > - **Name** [`System.String`]: Nombre del UDF.
> > > - **FieldType** [`System.String`]: Tipo de dato del UDF.
> > > - **Value** [`System.String`]: Valor del UDF.
> > > ###### Ejemplo
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   Udf myUdf = new Udf()
> > >   {
> > >       Name = "U_DocumentKey",
> > >       FieldType = "String",
> > >       Value = "U89929333293939"
> > >   };
> > > }
> > > ```
> > > 
> >
> > > #### UdfCategory
> > > ###### Descripción
> > > Representa las categorias de UDFs que se pueden configurar.
> > > ###### Propiedades
> > > - **Name** [`System.String`]: Nombre de la tabla en SAP de donde se van a obtener los UDFs.
> > > - **Description** [`System.String`]: Descripción de la categories/tabla.
> > > - **Key** [`System.String`]: Nombre de propiedad de identificación de la tabla.
> > > - **KeyLine** [`System.String`]: Nombre de propiedad de identificación de la tabla de lineas.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   UdfCategory category = new UdfCategory()
> > >   {
> > >       Name = "OINV",
> > >       Description = "Facturación",
> > >       Key = "DocEntry",
> > >       KeyLine = "LineNum"
> > >   };
> > > }
> > > ```
> > 
> > > #### CLUdf 
> > > ###### Descripción
> > > Modelo entidad usado para configuracion de UDFs.
> > > ###### Propiedades
> > > - **CompanyId** [`System.Int32`]: Identificador de compañía en la cual se configuró el UDF.
> > > - **TableId** [`System.String`]: Nombre de tabla/category de donde pertenece UDF.
> > > - **Udfs** [`System.String`]: Lista serializada de objetos UdfContext configurados.
> > > - **Groups** [`System.String`]: Lista serializada de grupos de UDFs.
> > > ###### Ejemplo:
> > > ```csharp 
> > > public void MyMethod()
> > > {
> > >   CLUdf configuredUdfs = new CLUdf()
> > >   {
> > >       CompanyId = 2,
> > >       TableId = "OINV",
> > >       Udfs = "[{...}, ...]",
> > >       Groups = "[{"Name":"test","Description":"test","IsActive":true}]"
> > >   };
> > > }
> > > ```
> > 
> > > #### UdfTransfer
> > > ###### Descripción
> > > Utilizada para guardado y consulta de UDFs configurados.
> > > ###### Propiedades
> > > - **UDFList** [`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>`]: Lista de UDFs configurados.
> > > - **GroupList** [`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.GroupContext>`]: Lista de gropos configurados.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   UdfTransfer udfTransfer = new UdfTransfer()
> > >   {
> > >       UDFList = new List<UdfContext>() { ... },
> > >       GroupList = new List<GroupContext>() { ... }
> > >   };
> > > }
> > > ```
> >
> > > #### UdfSource
> > > ###### Descripción
> > > Utilizada comunmente para consulta de valores de UDFs en documentos.
> > > ###### Propiedades
> > > - **CompanyId** [`System.Int32`]: Id de la compañia en la que se va a consulta la información del UDF.
> > > - **TableId** [`System.String`]: Nombre del recurso/tabla de donde se va a obtener la información del UDF.
> > > - **Key** [`System.String`]: Nombre de propriedad identificadora de lineas del documento.
> > > - **Value** [`System.String`]: Valor con el que se va a filtrar el documento.
> > > - **Udf** [`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>`] Lista de UDFs a los que se les va a consultar el valor en el documento.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   UdfSource source = new UdfSource()
> > >   {
> > >       CompanyId = 1,
> > >       TableId = "OINV", // This is the code of the DBResource
> > >       Key = "LineNum",
> > >       Value = "456",
> > >       Udf = new List<UdfContext>()
> > >       {
> > >           new UdfContext() { Name = "U_ProductUdf1", ... }
> > >       }
> > >   };
> > > }
> > > ```
> > 
> > > #### GroupContext
> > > ###### Descripción
> > > Modelo de grupos de UDFs.
> > > ###### Propiedades
> > > - **Name** [`System.String`]: Nombre identificador del grupo.
> > > - **Description** [`System.String`]: Descripción del grupo.
> > > - **IsActive** [`System.Boolean`]: Indica si el grupo esta activo.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   GroupContext groupContext = new GroupContext()
> > >   {
> > >       Name = "LOCATIONS",
> > >       Description = "Grupo de ubicación",
> > >       IsActive = true
> > >   };
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.Email
> > > #### EmailCredential
> > > ###### Descripción
> > > Representa las credenciales y configuración del correo.
> > > ###### Propiedades
> > > - **Subject** [`System.String`]: El asunto del correo electrónico.
> > > - **Account** [`System.String`]: La dirección de correo electrónico desde la cual se enviará el mensaje.
> > > - **Password** [`System.String`]: La contraseña asociada con la cuenta de correo electrónico que se utilizará para enviar el mensaje.
> > > - **Host** [`System.String`]: El servidor de correo (SMTP) que gestionará el envío del correo electrónico.
> > > - **Port** [`System.Int32`]: El número de puerto que se utilizará para conectarse al servidor SMTP.
> > > - **Ssl** [`System.Boolean`]: Indica si la conexión al servidor SMTP debe utilizar SSL (Secure Sockets Layer) para encriptar la comunicación.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   EmailCredential credential = new EmailCredential()
> > >   {
> > >       Subject = "Correo de prueba",
> > >       Account = "correo@outlook.com",
> > >       Password = "correo1234",
> > >       Host = "smtp.office365.com",
> > >       Port = 587,
> > >       Ssl = false
> > >   };
> > > }
> > > ```
> > 
> > > #### EmailDetails
> > > ###### Descripción
> > > Contiene los detalles de correo.
> > > ###### Propiedades
> > > - **EmailsTo** [`System.Collections.Generic.List<System.String>`]: Lista de direcciones de correo electrónico a quienes se les va a enviar el mensaje. 
> > > - **Body** [`System.String`]: Cuerpo del correo electrónico. Puede ser en formato HTML.
> > > - **Subject** [`System.String`]: Asunto del correo electrónico.
> > > - **EmailsCC** [`System.Collections.Generic.List<System.String>`]: Lista de direcciones de correo electrónico a quienes se les enviara una copia del mensaje.
> > > - **EmailFiles** [`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Email.EmailFile>`]: Lista de archivos adjuntos del correo electrónico.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   EmailDetails details = new EmailDetails()
> > >   {
> > >       EmailsTo = new List<string>()
> > >       {
> > >           "correo1@outlook.com",
> > >           "correo2@outlook.com"
> > >       },
> > >       Body = "Estimado Sr Lee, ...", 
> > >       Subject = "Aviso de pago",
> > >       EmailsCC = new List<string>()
> > >       {
> > >           "correocopia1@outlook.com",
> > >           "correocopia2@outlook.com"
> > >       },
> > >       EmailFiles = new List<EmailFile>()
> > >       {
> > >           new EmailFile()
> > >           {
> > >               Base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/eqpTwAAAABJRU5ErkJggg==",
> > >               FileName = "image1",
> > >               Extention = "png",
> > >               FileType = "image/png"
> > >           }
> > >       }
> > >   };
> > > }
> > > ```
> > > 
> >  
> > > #### EmailFile
> > > ###### Descripción
> > > Utilizada para envio de archivos en correos electrónicos.
> > > ###### Propiedades
> > > - **Base64** [`System.String`] Archivo a enviar codificado a base 64.
> > > - **FileName** [`System.String`] Nombre del archivo.
> > > - **Extention** [`System.String`] Extension del archivo.
> > > - **FileType** [`System.String`] Tipo de archivo.
> > > ###### Ejemplo
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   EmailFile emailFile = new EmailFile()
> > >   {
> > >      Base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/eqpTwAAAABJRU5ErkJggg==",
> > >      FileName = "image1",
> > >      Extention = "png",
> > >      FileType = "image/png"
> > >   };
> > > }
> > > ```
> > > 
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.Azure
> > > #### AzureFile
> > > ###### Descripción
> > > Representa la información del archivo que se va a cargar a Azure.
> > > ###### Propiedades
> > > - **Name** [`System.String`]: Nombre con el que se va a guardar el archivo en Azure.
> > > - **Stream** [`System.IO.MemoryStream`]: Información del archivo.
> > > - **StoragePath** [`System.String`]: Ruta de Azure en la que se va a guardar el archivo.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   System.IO.FileStream file = System.IO.File.OpenRead("C:/Users/PRUEBA/Desktop/File1.txt");
> > > 
> > >   MemoryStream memoryStream = new MemoryStream();
> > > 
> > >   file.CopyTo(memoryStream);
> > > 
> > >   AzureFile azureFile = new AzureFile()
> > >   {
> > >       Name = "Parrafo.txt",
> > >       Stream = memoryStream,
> > >       StoragePath = "GrupoClavisco/Interno/Parrafos"
> > >   };
> > > }
> > > ```
> > 
> > > #### AzureCredentials
> > > ###### Descripción
> > > Representa la información para realizar la conexión con Azure.
> > > ###### Propiedades
> > > - **Account** [`System.String`]: Cuenta de Azure a la que se va a conectar. 
> > > - **AccessKey** [`System.String`]: Clave de acceso a cuenta de Azure.
> > > - **Container** [`System.String`]: Contenedor de la cuenta de Azure.
> > > - **Root** [`System.String`]: Espacio de trabajo.
> > > ###### Ejemplo:
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   AzureCredentials credentials = new AzureCredentials()
> > >   {
> > >       Account = "clvsazure",
> > >       AccessKey = "jKhAol1...",
> > >       Container = "appscontainer",
> > >       Root = "Clavisco/Interno"
> > >   };
> > > }
> > > ```
> 
> > #### Namespace
> > CL.STRUCTURES.CLASSES.Schema
> > > #### SchemaContext
> > > ###### Descripción
> > > Esta clase es un contenedor para datos relacionados con esquemas, específicamente esquemas XML (XSD), que se utilizan para validar modelos en la aplicación. Almacena tanto el nombre del archivo de esquema como el contenido del esquema como un `XmlSchemaSet`, lo que facilita el proceso de asociación de modelos con sus respectivos esquemas y garantiza que su estructura cumpla con los estándares definidos.
> > > ###### Propiedades
> > > - **Name** [`System.String`]: Esta propiedad contiene el nombre base del archivo XSD, que se utiliza como identificador para localizar el esquema correcto para un modelo determinado durante la validación. Se espera que el nombre coincida con el nombre del tipo del modelo que valida.
> > > - **Schema** [`System.Xml.Schema.XmlSchemaSet`]: Esta propiedad contiene el conjunto compilado de esquemas XML (`XmlSchemaSet`) cargados desde el archivo XSD. El conjunto de esquemas lo utiliza el método `ValidateSchema` para validar la estructura y los datos de los modelos.
> > > ###### Ejemplo: 
> > > ```csharp
> > > public void MyMethod()
> > > {
> > >   SchemaContext schemaContext = new SchemaContext()
> > >   {
> > >       Name = "ItemSchema"
> > >   };
> > >   
> > >   XmlSchemaSet schemaSet = new XmlSchemaSet();
> > > 
> > >   schemaSet.Add(null, "ruta/del/archivo/ItemSchema.xsd");
> > > 
> > >   schemaContext.Schema = schemaSet;
> > > }
> > > ```

> ### Interfaces
> 
> > #### Namespace
> > CL.STRUCTURES.INTERFACES
> > > #### ICLMaster
> > > ###### Descripción
> > > Define una interfaz base genérica que se utiliza para representar diferentes modos de recuperación o filtrado de datos. Las clases implementadoras especifican cómo se deben incluir o excluir las propiedades de un objeto durante las operaciones de datos.
> > > - `ICLSingle`: representa un modo en el que solo se recupera un único registro.
> > > - `ICLInclude`: especifica que solo las propiedades enumeradas de un objeto se deben incluir en la operación.
> > > - `ICLExclude`: especifica que solo las propiedades enumeradas de un objeto se deben excluir de la operación.
> >
> > > #### IClDatabaseServices
> > > ###### Descripción
> > > Esta interfaz se utiliza para proporcionar métodos de extensión a los modelos de entidad de base de datos, facilitando la creación y actualización de registros de manera más sencilla.
> > > ###### Métodos
> > > - **Post**<`TObjectToMap`, `TDbContext`, `TMaster`, `TSingle`>(`TObjectToMap` _model, `System.String` _dbObjectToken, `params System.String[]` _fields) Este método realiza una operación de creación (POST) para el modelo proporcionado, mapeando los datos a la base de datos especificada.
> > >   - Parámetros:
> > >     - _model: Instancia del modelo a ser creado. Debe implementar ICLDatabaseServices.
> > >     - _dbObjectToken: Token que identifica el objeto de base de datos donde se realizará la operación.
> > >     - _fields: Campos específicos del modelo que deben ser mapeados (opcional).
> > >   - Retorno:
> > >     - CLContext<TObjectToMap>: Contexto de la operación que incluye el resultado de la misma.
> > > - **Post**<`TObjectToMap`, `TDbContext`>(`TObjectToMap` _model, `System.String` _dbObjectToken) Variante simplificada del método Post que no requiere especificar campos. 
> > >   - Parámetros:
> > >     - _model: Instancia del modelo a ser creado.
> > >     - _dbObjectToken: Token que identifica el objeto de base de datos.
> > >   - Retorno:
> > >     - CLContext<TObjectToMap>: Contexto de la operación que incluye el resultado de la misma.
> > > - **Patch**<`TObjectToMap`, `TDbContext`, `TMaster`, `TSingle`>(`TObjectToMap` _model, `System.String` _dbObjectToken, `params System.String[]` _fields) Este método realiza una operación de actualización parcial (PATCH) para el modelo proporcionado, permitiendo modificar solo los campos especificados.
> > >   - Parámetros:
> > >     - _model: Instancia del modelo a ser actualizado. Debe implementar ICLDatabaseServices.
> > >     - _dbObjectToken: Token que identifica el objeto de base de datos.
> > >     - _fields: Campos específicos del modelo que deben ser actualizados.
> > >   - Retorno:
> > >     - CLContext<TObjectToMap>`: Contexto de la operación que incluye el resultado de la misma.
> > > - **Patch**<`TObjectToMap`, `TDbContext`>(`TObjectToMap` _model, `System.String` _dbObjectToken) Variante simplificada del método Patch que no requiere especificar campos, permitiendo actualizar el modelo completo.
> > >   - Parámetros:
> > >     - _model: Instancia del modelo a ser actualizado.
> > >     - _dbObjectToken: Token que identifica el objeto de base de datos.
> > >   - Retorno:
> > >     - CLContext<TObjectToMap>: Contexto de la operación que incluye el resultado de la misma.
> >
> > > #### IStorageHandler
> > > ###### Descripción
> > > La interfaz IStorageHandler está diseñada para gestionar operaciones de almacenamiento en Azure. Proporciona métodos para subir, descargar y eliminar archivos de forma sencilla y eficiente.
> > > ###### Métodos:
> > > - **UploadFile** (`CL.STRUCTURES.CLASSES.Azure.AzureFile` _file) Sube un archivo a Azure. El objeto _file debe contener la información necesaria para la carga, incluyendo el nombre, la ruta de almacenamiento y el flujo de datos.
> > >   - Parámetros:
> > >     - _file: Objeto AzureFile que contiene los datos requeridos para la carga del archivo.
> > >   - Retorno:
> > >     - Task<string>: Devuelve un string con la información del archivo subido.
> > > - **UploadFiles** (`System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile>` _files) Sube una lista de archivos a Azure.
> > >   - Parámetros: 
> > >     - _files: Lista de objetos AzureFile con la información necesaria para la carga de los archivos.
> > >   - Retorno: 
> > >     - Task<List<string>>: Devuelve una lista de strings en el mismo orden en que se recibieron los archivos.
> > > - **DownLoadFileAsBase64** (`System.String` _filePath) Descarga un archivo desde Azure y lo devuelve como una cadena en formato Base64.
> > >   - Parámetros:
> > >     - _filePath: URL del archivo en el contenedor de Azure.
> > >   - Retorno:
> > >     - string: Cadena en formato Base64 del archivo descargado.
> > > - **DownLoadFileAsStream** (`System.String` _filePath) Descarga un archivo desde Azure y lo devuelve como un flujo de memoria (MemoryStream).
> > >   - Parámetros:
> > >     - _filePath: URL del archivo en el contenedor de Azure.
> > >   - Retorno:
> > >     - Task<MemoryStream>: Flujo de memoria del archivo descargado.
> > > - **DownloadFilesAsStream** (`System.Collections.Generic.List<System.String>` _paths) Descarga una lista de archivos desde Azure y los devuelve como una lista de flujos de memoria (MemoryStream).
> > >   - Parámetros:
> > >     - _paths: Lista de URLs de los archivos en el contenedor de Azure.
> > >   - Retorno:
> > >     - Task<List<MemoryStream>>: Lista de flujos de memoria de los archivos descargados.
> > > - **DownloadFilesAsBase64** (`System.Collections.Generic.List<System.String>` _paths) Descarga una lista de archivos desde Azure y los devuelve como una lista de cadenas en formato Base64.
> > >   - Parámetros:
> > >     - _paths: Lista de URLs de los archivos en el contenedor de Azure.
> > >   - Retorno:
> > >     - Task<List<string>>: Lista de cadenas en formato Base64 de los archivos descargados.
> > > - **DeleteFile** (`System.String` _path) Elimina un archivo de Azure.
> > >   - Parámetros:
> > >     - _path: Ruta del archivo que se va a eliminar.
> > >   - Retorno:
> > >     - Task<bool>: Devuelve true si el archivo fue eliminado con éxito, false en caso contrario.
> > > - **DeleteFiles** (`System.Collections.Generic.List<System.String>` _path) Elimina una lista de archivos de Azure.
> > >   - Parámetros:
> > >     - _path: Lista de rutas de los archivos que se van a eliminar.
> > >   - Retorno:
> > >     - Task<bool>: Devuelve true si todos los archivos fueron eliminados con éxito, false en caso contrario.
> > 
> 
> > #### Namespace
> > CL.STRUCTURES.INTERFACES.ServiceLayer
> > > #### ISlInternals
> > > ###### Descripción
> > > Ofrece un conjunto de firmas de metodos utilitarios para facilitar los procesos de Service Layer.
> > > ###### Métodos
> > > - **ValidateUserContext** (`CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext` _userContext) Valida que la información para construir la consulta de Service Layer exista.
> > >   - Parametros:
> > >     - _userContext: Objeto con información necesaria para crear una conexion con Service Layer y realizar la consulta requerida.
> > > - **ServiceLayerUrlPatcher**<`TObject`\>(`TObject` _target, `System.String` _resource) Utilizado para la búsqueda del valor MasterKey idenficido mediante el atributo de tipo `CL.STRUCTURES.ATTRIBUTES.MasterKey`.
> > >   - Parametros
> > >     - _target: Objeto que se va a enviar a Service Layer.
> > >     - _resource: Recurso/URL Service Layer a la que se va a agregar como parametro el valor identificador del objeto.
> > >   - Retorno
> > >     - System.String: Recurso con valor de propiedad MasterKey concatenado.
> > > - **ServiceLayerWriter**<`TObject` \> (`ClUserContext` _userContext, `String` _method, `TObject` _target, `String` _fieldsToRemoveInHeaders, `String` _fieldsToRemoveInLines, `List<Udf>` _headerUdfs, `List<Udf>` _lineUdfs, `String` _lineObjectName, `Dictionary<String, Func<JProperty, Boolean>>` _headerFlushConditions, `Dictionary<String, Func<JProperty, Boolean>>` _lineFlushConditions) Genera el objeto y la URL final que se enviaran a Service Layer  
> > >   - Parametros
> > >     - _userContext: Objeto con información necesaria para crear una conexion con Service Layer y realizar la consulta requerida.
> > >     - _method: Método HTTP que se va a utilizar.
> > >     - _target: Objeto que se va a enviar como contenido de la solicitud de Service Layer.
> > >     - _fieldsToRemoveInHeaders: Representan las propriedades del objeto que se van a remover.
> > >     - _fieldsToRemoveInLines: Representan las propiedades del array de lineas del objeto que se van a remover.
> > >     - _headerUdfs: Representan los UDFs que van a formar parte del objeto.
> > >     - _lineUdfs: Representan los UDFs que van a formar parte de las lineas del objeto.
> > >     - _lineObjectName: Indica el nombre de la propiedad de lineas del objeto.
> > >     - _headerFlushConditions: Condiciones para eliminar propiedades del objeto.
> > >     - _lineFlushConditions: Condiciones para eliminar propiedades de las lineas del objeto.
> > >   - Retorno
> > >     - SLRequestObject: Objeto con informacion necesaria para realizar la consulta a Service Layer.
> > > - **QueryStringReader**<`TObject` \>() Lee el QueryString de una solicitud almacenado y lo devuelve deserialziado.
> > >   - Retorno
> > >     - TObject: Query string deserializado.
> > > - **SlResolve**<`TObject`\>(`System.Net.HttpResponseMessage` _httpResponseMessage, `System.Reflection.MethodBase` _invoker, `System.String` _method) Mapea las respuesta de Service Layer.
> > >   - Parametros
> > >     - _httpResponseMessage: Respuesta de Service Layer.
> > >     - _invoker: Método donde se llamo a este método..
> > >     - _method: Método HTTP con el que se envio la solicitud.
> > >   - Retorno
> > >     - TObject: Objeto de respuesta deserializado.
> > > - **BuildWithoutQueryString**(`CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext` _clUserContext) Genera un objeto de `SLRequestObject` sin la necesidad de haber mapeado el query string de la solicitud del API anteriormente.
> > >   - Parametros
> > >     - _clUserContext: Objeto con la información necesaria para generar el objeto SLRequestObject
> > >   - Retorno
> > >     - CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject: Objeto con información necesaria para realizar la consulta a Service Layer.
> > > - **BuildFromQueryString**<`TObject`\>(`CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext` _clUserContext, `TObject` _target) Genera un objeto de `SLRequestObject`, requiere el uso de `CL.COMMON.ActionFilters.QueryStringExposer` para su funcionamiento.
> > >   - Parametros
> > >     - _clUserContext: Objeto con la información necesaria para generar el objeto SLRequestObject
> > >     - _target: Objeto que se enviara a Service Layer, si no se envia se tomara el Query string mapeado para generar un objeto del tipo indicado.
> > >   - Retorno
> > >     - CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject: Objeto con información necesaria para realizar la consulta a Service Layer.
> > > - **CheckUserContext**(`CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext` _userContext) Valida si toda la información requerida para realizar la consulta a Service Layer esta completada.
> > >   - Parametros
> > >     - _userContext: Contiene toda la información requerida para realizar la consulta a Service Layer.
> > > - **BuildServiceLayerObject**<`TObject`\>(`TObject` _slDocument, `System.String[]` _propertiesToFlushOnHeader, `System.String[]` _propertiesToFlushOnLines, `System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf>` _headerUdfs, `System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf>` _lineUdfs, `System.String` _lineObjectName, `System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>>` _headerFlushConditions, `System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>>` _lineFlushConditions) Utilizado para mapear un objeto que va a ser enviado a Service Layer. 
> > >   - Parametros
> > >     - _slDocument: Objeto que será modificado.
> > >     - _propertiesToFlushOnHeader Propiedades que se van a eliminar el del objeto.
> > >     - _propertiesToFlushOnLines Propiedades que se van a eliminar de las lineas del objeto.
> > >     - _headerUdfs UDFs que se van a agregar como propiedades del objeto.
> > >     - _lineUdfs UDFs que se van a agregar como propiedades de las lineas del objeto.
> > >     - _lineObjectName Nombre de la propiedad de lineas del objeto.
> > >     - _headerFlushConditions Condiciones para eliminar propiedades del objeto.
> > >     - _lineFlushConditions Condiciones para eliminar propiedades de las lineas del objeto.
> > >   - Retorno
> > >     - Newtonsoft.Json.Linq.JObject: Objeto modificado.
> > > - **LocalExecutor**<`TObject`\>(`CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject` _slRequestObject, `System.String` _method, `CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse` _cookie) Envia las consultas a Service Layer.
> > >   - Parametros
> > >     - _slRequestObject Objeto con información necesaria para realizar la consulta a Service Layer.
> > >     - _method Método HTTP con la que se va a enviar la consulta.
> > >     - _cookie Representa la información de autorización, evita realizar el login a Service Layer nuevamente.
> > >   - Retorno
> > >     - CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>: Objeto de respuesta de Service Layer.
>
> > #### Namespace
> > CL.STRUCTURES.INTERFACES.SchemaValidator
> > > #### ISchemaValidator
> > > ###### Descripción
> > > Utilizada para habilitar métodos de extensión.
> 

> ### Enums
> > #### Namespace
> > CL.STRUCTURES
> > > #### EmailDomains
> > > ###### Descripción
> > > Usado para representar tipos de correos electrónicos.
> > > ###### Opciones
> > > - **Outlook**:  Indica que un correo es del dominio de Outlook.
> > > - **Gmail**: Indica que un correo es del dominio de Gmail.
> > > 
> > 
> > > #### DaysOfWeek
> > > ###### Descripción
> > > Usado para representar los dias de la semana.
> > > ###### Opciones
> > > - **Su**: Domingo
> > > - **Mo**: Lunes
> > > - **Tu**: Martes
> > > - **We**: Miércoles
> > > - **Tj**: Jueves
> > > - **Fr**: Viernes
> > > - **Sa**: Sábado
> > > 
> > 
> > > #### UdfType
> > > ###### Descripción
> > > Usado para representar los tipos de datos que pueden tener los UDFs.
> > > ###### Opciones
> > > - **Numeric**: Tipo de dato numerico.
> > > - **Alpha**: Tipo de datos de texto.
> > > - **MultipleOption**: Tipo de dato de texto, pero en la consulta de UDFs representa que es un campo con multiples opciones para seleccionar.
> > > - **Date**: Tipo de dato fecha.
> > > - **Decimal**: Tipo de datos numerico con decimal.
> > > 
> 
> > > #### ObjectTypes
> > > ###### Descripción
> > > Usado para representar los tipo de documentos de SAP, contiene el codigo de tipo de documento original de SAP.
> > > ###### Opciones
> > > - **BusinessPartner**: Socios de negocios
> > > - **Items**: Artículos
> > > - **PriceLists**: Listas de precios
> > > - **ARInvoice**: Factura de crédito
> > > - **ARCreditMemo**: Nota de Crédito de Clientes
> > > - **Delivery**: Entrega
> > > - **SalesOrder**: Orden de compra
> > > - **APInvoice**: Factura de proveedor
> > > - **APCreditMemo**: Nota de crédito proveedor
> > > - **GoodsReceiptPO**: Ingreso de Mercancías basado en una Orden de Compra
> > > - **GoodsReturn**: Devolución de Mercancías
> > > - **PurchaseOrder**: Orden de compra
> > > - **SalesQuotation**: Oferta de venta
> > > - **IncomingPayment**: Pago recibido
> > > - **GoodsReceipt**: Entrada de mercancias
> > > - **GoodsIssue**: Salida de Mercancías
> > > - **Drafts**: Preliminares
> > > - **ARDownPayment**: Anticipo de Clientes
> > > - **APDownPayment**: Anticipo de Proveedores
> > > - **CreditMemo**: Nota de Crédito
> > > - **BarCodeMasterData**: Codigos de barra
> > > - **ARInvoicePlusPayment**: Factura de contado
> > 
> > > #### PermissionType
> > > ###### Descripción
> > > Usado para representar los tipos de permisos.
> > > ###### Opciones
> > > - **Create**: Indica que es un permiso para permitir crear algo.
> > > - **Read**: Indica que es un permiso para acceder a informacion, vistas, etc.
> > > - **Update**: Indica que es un permiso para editar algo.
> > > - **Delete**: Indica que es un permiso para eliminar algo.
> > > 
> >
> > > #### TabLevel
> > > ###### Descripción
> > > Usado para agregar tabulaciones a los logs impresos por log manager.
> > > ###### Opciones
> > > - **One**: Agrega una tabulación al log.
> > > - **Two**: Agrega dos tabulaciones al log.
> > > - **Three**: Agrega tres tabulaciones al log.
> > > - **Four**: Agrega cuatro tabulaciones al log.
> > > 
> 
> > > #### VERBS
> > > ###### Descripción
> > > Representa verbos HTTP.
> > > ###### Opciones
> > > - **POST**: Indica que se va a enviar a crear algo.
> > > - **PATCH**: Indica que se va a enviar a actualizar algo.
> > > - **GET**: Indica que se va a consultar algo.
> > > 
> >
> > > #### HttpContextItems
> > > ###### Descripción
> > > Contiene las claves de la información guardada por los NuGet en `HttpContext.Items`.
> > > ###### Opciones
> > > - **CompanyKey**: Identificador de compañía.
> > > 
> 

> ### Atributos
> > #### Namespace
> > CL.STRUCTURES.ATTRIBUTES
> > > #### MasterKey
> > > ###### Descripción
> > > Utilizado para identifica a la propiedad identificadora de un objeto.
> > > 
>

---

> [ClavisCo ©](https://www.clavisco.com/)  