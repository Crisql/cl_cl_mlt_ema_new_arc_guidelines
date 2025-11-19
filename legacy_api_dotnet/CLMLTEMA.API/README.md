> ### Acerca de CL.COMMON
> Ofrece una serie de funciones a modo de utilería las cuales nos permiten 
> realizar flujos que son habituales en todos los proyectos, como
> mapeo de genéricos, logs entre otros.

> ### ¿Qué resuelve?
> La creación repetitiva de código de uso común a través de los
> distintos proyectos de los clientes y que a su vez en cada implementación
> presentan la posibilidad de no replicar el código con exactitud generando
> errores.

> ### Resumen de versión
> Cambios (Changes)
> > - Ahora la versión mínima de framework es 4.6.2

> ### Rutinas de Core
> > **GetConfigKeyValue**( System.Reflection.MethodBase, System.String):System.Data.String
> > 
> > ***Descripcion***
> > 
> > Usado para acceder a configuraciones del web.config.
> >
> > ***Parametros***
> >
> > - _invoker(Requerido): Usado para determinar que función ha llamado este método
> > - _configKey(Requerido): Nombre de la llave en el config
> > 
> > ***Ejemplo:***
> > ```csharp
> > public static void MyFunction()
> > {
> >     System.String valor = CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(), "webConfigKey");
> > }
> > ``` 
> ---
> > **FileToBase64**( System.String ): System.String
> > 
> > ***Descripcion***
> > 
> > Usado para convertir un archivo en base64
> >
> > ***Parametros***
> >
> > - _filePath(Requerido): Ruta física del archivo
> > 
> > ***Ejemplo:***
> > ```csharp
> > public static void MyFunction()
> > {
> >  System.String base64pdf = CL.COMMON.Core.FileToBase64("C:\mipdf.pdf");
> > }
> > ```
> ---
> > 
> > **GetExceptionMessage**( System.Exception ): System.String
> > 
> > ***Descripcion***
> > 
> >  Obiene el detalle de la excepción y la retorna en un System.String.
> >
> > ***Parametros***
> >
> > -  _exception(Requerido): Objeto con la excepción a mapear
> > 
> > ***Ejemplo:***
> > 
> > ```csharp
> > public static void MyFunction()
> > {
> >     try
> >     {
> >         //Your code
> >     }
> >     catch(Exception ex)
> >     {
> >         System.String message = CL.COMMON.Core.GetExceptionMessage(ex)
> >     }
> > }
> > ```
> ---
> > **InflateObject**( System.Data.DataTable ): T
> > 
> > ***Descripcion***
> >
> > Los registros de un query cargados en System.Data.DataTable serán cargados en el objeto de tipo T.
> >
> > ***Parametros***
> > 
> > - _dt(Requerido): Origen de datos que van a ser cargados en T
> >
> > ***Ejemplo:***
> >
> > ```csharp
> > public class MyClass
> > {
> >     public string Name { get; set; }
> > }
> > 
> > public class Process
> > {
> >     public static void MyFunction()
> >     {
> >         //Your code where you execute the query and get a DataTable
> > 
> >         MyClass oT = CL.COMMON.Core.InflateObject<MyClass>(oDataTable);
> >     }
> > }
> > ```
> ---
> > **InflateList**( System.Data.DataTable ) :System.Collections.Generic.List<T\> 
> > 
> > ***Descripcion***
> > 
> > Los registros de un query serán mapeados a una lista de tipo T.
> >
> > ***Parametros***
> > 
> > - _dt(Requerido): Origen de datos que van a ser cargados en T.
> > 
> > ***Ejemplo:***
> > 
> > ```csharp
> > public class MyClass
> > {
> >     public string Name { get; set; }
> > }
> > 
> > public class Process
> > {
> >     public static void MyFunction()
> >     {
> >         //Your code where you execute the query and get a DataTable
> > 
> >         System.Collections.Generic.List<MyClass> tList = CL.COMMON.Core.InflateList<MyClass>(oDataTable);
> >     }
> > }
> > ``` 
> ---
> > **ParametersBuilder**( System.String, T, System.String[] ):System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>
> >
> > ***Descripcion***
> > 
> > Convierte las propieades de un objeto a una lista de string.
> > 
> > ***Parametros***
> > 
> > - _invoker(Requerido): Usado para determinar desde donde se ha realizado la llamada a la funcion.
> > - _object(Requerido): Objeto del cual se van a mapear las propieadas a una lista.
> > - _toIgnore(Opcional): Lista de propiedades a incluir/excluir según el tipo de inteface que indiquemos.
> > 
> > ***Ejemplo***
> > ```csharp
> > public class MyClass
> > {
> >     public string Name { get; set; }
> >     public string Name2 { get; set; }
> > }
> > 
> > public class Process
> > {
> >     public static void MyFunction()
> >     {
> >         MyClass _object = new MyClass()
> >         {
> >             Name = 'Clavis',
> >             Name2 = 'Consultores'
> >         };
> > 
> >         string[] _toIgnore = ['Name2'];
> >         
> >         // This example exclude the property 'Name2', so, the paremeters only will be '@Name' with the value 'Clavis'
> >         System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> paramerters = CL.COMMON.Core.ParametersBuilder<MyClass, ICLExclude>(System.Reflection.MethodBase.GetCurrentMethod().Name, _object, _toIgnore)
> >     
> >         // This example include the property 'Name2', so, the paremeter only will be '@Name2' with the value 'Consultores' 
> >         System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> paramerters2 = CL.COMMON.Core.ParametersBuilder<MyClass, ICLInclude>(System.Reflection.MethodBase.GetCurrentMethod().Name, _object, _toIgnore)
> > 
> >     }
> > }
> > ```
> >
> ---
> > **ContextBroker**:System.Net.Http.HttpResponseMessage
> >
> > ***Descripcion***
> > 
> > Mediador entre el contexto de la aplicación y el contexto de la respuesta para poder retornar el código http correcto. Es recomendado mandar las excepciones con CL.STRUCTURES.CLASES.CLException, para que el código de la respuesta se mapee de manera automática.
> >
> > ***Sobrecargas***
> > 1. ContextBroker(System.Exception _target)
> > 2. ContextBroker(System.Exception _target, System.Net.HttpStatusCode _code)
> > 3. ContextBroker<T\>(CL.STRUCTURES.CLASSES.Rebound.CLContext<T\> _target)
> >
> > ***Parametros***
> > - `Primera y segunda sobrecarga` _target(Requerido): Excepción que será mapeada
> > - `Segunda sobrecarga` _code: Código de la excepción.
> > - `Tercera sobrecarga` _target(Requerido): Respuesta que será mapeada
> > 
> > ***Ejemplo:***
> >
> > ```csharp
> > public HttpResponseMessage MyEndpoint()
> > {
> >     try
> >     {
> >         CL.STRUCTURES.CLASSES.Rebound.CLContext<MyType> response = new CL.STRUCTURES.CLASSES.Rebound.CLContext<MyType>
> >         {
> >             Code = HttpStatusCode.OK,
> >             Response = new CL.STRUCTURES.CLASSES.Rebound.Response<MyType>()
> >             {
> >                 Data = [1,2,3],
> >                 Message = "Successfully obtained numbers"
> >             }
> >         };
> > 
> >         return ContextBroker(response);
> >     }
> >     catch(Exception ex)
> >     {
> >         // We can use this
> >         return ContextBroker(ex);
> >         // Or this
> >         return ContextBroker(ex, HttpStatusCode.BadRequest);
> >     }
> > }
> > ```
> ---
> > **SendEmail**( CL.STRUCTURES.CLASSES.Email.EmailCredential, CL.STRUCTURES.CLASSES.Email.EmailDetails ): void
> > 
> > ***Descripcion***
> >
> > Permite realizar envio de correo de manera genérica, soporta copias y ajuntos.
> > 
> >
> > ***Parametros***
> > - _emailCredential(Requerido):  Credenciales y configuración para envio de correos
> > - _emailDetails(Requerido): Detalles del correo a enviar, receptor, copias y adjuntos
> > 
> > ***Ejemplo:***
> > 
> > ```csharp
> > CL.COMMON.Core.SendEmail(
> >     new CL.STRUCTURES.CLASSES.Email.EmailCredential()
> >     {
> >         Subject = "Recuperación de contraseña", // Se usa este asunto si no se especifica en los detalles
> >         Account = "exampleinfo@clavisco.com",
> >         Host = "outlook.office365.com",
> >         Password = "Contraseña para envio de correos",
> >         Port = 587,
> >         Ssl = true
> >     }, 
> >     new CL.STRUCTURES.CLASSES.Email.EmailDetails()
> >     {
> >         EmailsTo = new System.Collections.Generic.List<System.String>(){ "example@clavisco.com" },
> >         EmailsCC = new System.Collections.Generic.List<System.String>(){ "ccexample@clavisco.com" },
> >         Subject = "Asunto de ejemplo",
> >         Body = $"<p>Puede incluir html y enlaces como el siguiente <a href='example.clavisco.com/click-here'>[click aquí]</a></p>",
> >         EmailFiles = new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Email.EmailFile>()
> >         {
> >             new CL.STRUCTURES.CLASSES.Email.EmailFile()
> >             {
> >                 Base64 = "Aqui va el string en base64 del archivo adjuntado",
> >                 Extention = ".pdf",
> >                 FileName = "Ejemplo",
> >                 FileType = "application/pdf"
> >             }
> >         },
> >     };
> > ); 
> > ```

> > **QueryStringExposer**:void
> > 
> > ***Descripcion***
> >
> > Esta anotación debe ponerse en el controlador que recibe una serie de parámetros para ser mapeados a un modelo cuando usemos un Get hacia Service Layer.
> > Lo que `QueryStringExposer` hace es leer los parámetros de la url y mapearlos a un modelo cuando hacemos uso del método de extensión Get<TObject\>
> > 
> > ***Ejemplo:***
> > 
> > ```csharp
> > public class MyItemModel
> > {
> >     public string ItemCode { get; set; }
> > } 
> >
> >
> > public class MyController : ApiController
> > {
> >     // En el controlador decoramos nuestro endpoint con el QueryStringExposer  
> >     [QueryStringExposer]  
> >     public async Task<HttpResponseMessage> Get(string ItemCode)  
> >     {  
> >         try  
> >         {  
> >             CLContext<Item> clContext = Process.GetItem();
> >             //your response
> >         }  
> >         catch (Exception ex)  
> >         {  
> >             return Core.ContextBroker(ex);  
> >         }  
> >         finally  
> >         { 
> >             LogManager.Commit(Request);  
> >         }
> >     }
> > 
> > 
> >     public static CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext GetContext(string _resource)
> >     {
> >         //your code
> >     }
> > }
> > 
> > public class Process
> > {
> >     public static CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext GetContext(string _resource)
> >     {
> >         //your code
> >     }
> > 
> >     public static CLContext<Item> GetItem()
> >     {
> >         // Aqui ya se deberia setear automaticamente el campo "ItemCode" de "MyItemModel"
> >         CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext context = GetContext("MyResource").Get<MyItemModel>();
> >         // ...more code
> >     }
> > }
> > ```
> ---
> > **StreamToBytes**( System.IO.Stream ): byte[]
> > 
> > **Descripcion**
> > 
> > El objetivo principal de este método es leer los datos del flujo de entrada y almacenarlos en la memoria como una matriz de bytes.
> >
> > **Parametros**
> > 
> > _input(Requerido): El stream para convertir en una matriz de bytes de memoria
> >
> > **Ejemplo:**
> >
> > ```csharp
> > public static void MyMethod()
> > {
> >     // Replace "path_to_your_file" with the actual path to the file on your local machine
> >     string filePath = "path_to_your_file";
> >
> >     try
> >      {
> >         // Open the file using FileStream
> >         using (FileStream fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
> >         {
> >             // Call the StreamToBytes method to convert the FileStream to a byte array
> >             byte[] byteArray = CL.COMMON.Core.StreamToBytes(fileStream);
> >
> >             // Do something with the byte array if needed
> >             // For example, you could print the length of the byte array
> >             Console.WriteLine($"Byte array length: {byteArray.Length}");
> >         }
> >     }
> >     catch (Exception ex)
> >     {
> >         // Handle exceptions, for example, file not found, permission issues, etc.
> >         Console.WriteLine($"An error occurred: {ex.Message}");
> >     }
> > }
> > ```
> ---
> ### LogManager Rutinas
> > Esta funcionalidad requiere de ciertas configuraciones iniciales, como por ejemplo agregar una llave en el web.config con el nombre `LogPath`, para poder obtener la ruta donde se van a escribir los logs. De manera opcional se puede escoger el intervalo de generación de archivos, por defecto es diario.
> > Puede ser cambiado agregando la propiedad `SeriLogRollingInterval` en en el webconfig. Posibles valores(`Infinite`, `Year`, `Month`, `Day`, `Hour`, `Minute`).
> >
> > Todas las sobrecargas del método Commit intentan sacar el usuario del contexto del pipe, accediendo a un Claim llamado `UserEmail`, el cual puede ser configurado al momento de iniciar sesión en la la aplicación. En caso de no suministrar un usuario el valor por defecto de este será 'no_user_found'.
> > 
> > Además permite registrar encabezados de la petición, para esto es requerido que los mismos encabezados tengan el prefijo `Cl-` para que sean reconocidos por log manager. Ejemplo: Para indicar el momento en el que salió una petición desde el ui,  agregar un encabezado a la petición en el interceptor con el nombre `Cl-Ui-Request-Time`.
> >
> > **Glosario**
> >
> > Para mantener el orden y simetría en los logs se han definido una serie de abreviaciones para estos.
> > - **USR**: Usuario al que se le relaciona con los logs(miusuario@correo.com)
> > - **PTH**: Dirección física del endpoint(/api/Item/GetItemInfo)
> > - **QRS**: Query string de la dirección física del endpoint(?param1=ejemplo&param2=1234)
> > - **VRB**: Verbo http de la petición(GET, POST, ...)
> > - **MDL**: Modelo contenido en la petición que solo es visible en operaciones de escritura ({"prop1": "value"}).
> > - **AYV**: Versión del emsamblado de Log Manager.
> ---
> > **Enter**:void
> > 
> > ***Descripcion***
> > 
> > Agrega un enter los logs almacenados hasta el momento.
> > 
> > **Ejemplo**:
> > 
> > `CL.COMMON.LogManager.Enter();`  
> ---
> > **Record**:void
> > 
> > ***Descripcion***
> > 
> > Agrega un mensaje al contexto actual del log al final de este.
> > 
> > ***Sobrecargas***
> >
> > 1. Record(System.String _message)
> > 2. Record(System.String _message, CL.STRUCTURES.TabLevel _tabLevel)
> >
> > ***Parametros***
> > 
> > - `Primera y segunda sobrecarga` _message(Requerido): Mensage que será escrito un medio externo.
> > - `Segunda sobrecarga` _tabLevel(Requerido): Indica si el mensaje recién registrado va a tener un margen izquierdo(Cantidad de tabs).
> > 
> > ***Ejemplo***:
> > 
> > ```csharp
> > public static void MyFunction()
> > {
> >     CL.COMMON.LogManger.Record("Este es un log de la sobrecarga 1");
> >     CL.COMMON.LogManger.Record("Este es un log de la sobrecarga 2", CL.STRUCTURES.TabLevel.One);
> > }
> > ```
> >
> ---
>  > **Commit**:void
> > 
> > ***Descripcion***
> >
> > Este método es exclusivo para escenarios en donde no tenemos un contexto web claro, por ejemplo en un servicio en donde solo necesitamos registrar nuestros eventos y asignarlos al servicio. Por este motivo es requerido pasar estos parámetros de forma manual.
> > 
> > ***Sobrecargas*** 
> > 1. Commit(System.Net.Http.HttpRequestMessage _httpRequestMessage, System.String _user = null)
> > 2. Commit<T\>(System.Net.Http.HttpRequestMessage _httpRequestMessage, T _oT = default, System.String _user = null)
> > 3. Commit(System.String _fileName = "UNDEFINED", System.String _user = null)
> > 4. Commit(System.String _user = null)
> > 5. Commit()
> > 
> > ***Parametros***
> > 
> > - `Primera y segunda sobrecarga` _httpRequestMessage(Requerido): Contexto actual de la petición.
> > - `Primera, segunda, tercera y cuarta sobrecarga` _user(Opcional): Usuario al que se le asignaran los logs.
> > - `Segunda sobrecarga` _oT(Opcional): Objeto que será serializado
> > - `Tercera sobrecarga` _fileName(Opcional): Nombre del archivo en el que se guardará el log
> >
> >
> > ***Ejemplo:***
> > 
> > ```csharp
> > public HttpResponseMessage MyEndpoint(MyModel _object)
> > {
> >     try
> >     {
> >         //your code
> >     }
> >     catch
> >     {
> >         //your exception handler
> >     }
> >     finally
> >     {
> >         CL.COMMON.LogManager.Commit(Request);
> >         CL.COMMON.LogManager.Commit(Request, 'user@clavisco.com');
> >         CL.COMMON.LogManager.Commit(Request, _object);
> >         CL.COMMON.LogManager.Commit(Request, _object, 'user@clavisco.com');
> >         CL.COMMON.LogManager.Commit('MYENDPOINT', null);
> >         CL.COMMON.LogManager.Commit('MYENDPOINT', 'user@clavisco.com');
> >         CL.COMMON.LogManager.Commit('user@clavisco.com');
> >     }
> > }
> > ```
> >
> ---
> > **FlushSettings**:void
> >
> > ***Descripcion***
> >
> > Este método elimina toda configuración previa generada por alguna extensión de log manager. 
> >
> > ***Ejemplo***
> >
> > ```csharp
> > 
> > public static void MyFunction()
> > {
> >     new List<ClLogManagerOption>() {
> >             new ClLogManagerOption() { Key = "LogPath", Value = CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(),"LogPath") },
> >             new ClLogManagerOption() { Key = "FilePrefix", Value = "AUTH"},
> >             new ClLogManagerOption() { Key = "User",    Value = context.UserName},
> >     }.Ctor().Build().Dtor();
> >
> >     CL.COMMON.LogManager.FlushSettings();
> > }
> > ```
> > 
> ---
> > **Código completo de implementación**
> >
> > Este código debe ponerse en el controlador o en el llamado de un servicio para que se haga el commit al final del proceso.
> > Y ya luego el método CL.COMMON.LogManger.Record puede ser llamando en la capa que ocupemos para poder registrar nuestros eventos.
> > 
> > ```csharp
> > public HttpResponseMessage MyEndpoint(MyModel document)
> > {
> >     try 
> >     {  
> > 	    CL.COMMON.LogManager.Record("Controlador iniciado");  
> > 	    CLContext<Document> oCLContext = PROCESS.Process.CreateDocument(document);  
> > 	    CL.COMMON.LogManager.Record("Controlador terminado");  
> > 	    return CL.COMMON.Core.ContextBroker(oCLContext);    
> >     }  
> >     catch(System.Exception exception) 
> >     {  
> > 	    return CL.COMMON.Core.ContextBroker(ex);  
> >     } 
> >     finally 
> >     {  
> > 	    CL.COMMON.LogManager.Commit(Request, document);
> >     }
> > }
> > ```
> ---
> ### LogManager Rutinas de Extensión
> > Opciones disponibles para configurar log manager.  
> > - **User**: Usuario por defecto que va a usar log manager para asociar logs. 
> > - **FilePrefix**: Nombre del archivo por defecto que va a contener los logs. Usualmente esto es para servicios. 
> > - **LogPath**: Directorio por defecto en donde se van a guardar los logs. 
> ---
> > **Ctor**:CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption
> > 
> > ***Descripcion***
> >
> > Este método permite configurar un parámetro de log manager. 
> >
> > ***Sobrecargas*** 
> > 1. Ctor(this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption _logManagerOption)
> > 2. Ctor(this System.Collections.Generic.IEnumerable<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption> _source)
> >
> > ***Ejemplo:***
> >
> > ```csharp
> > public static void MyFunction()
> > {
> >     (new ClLogManagerOption() { Key = "FilePrefix", Value = "AUTH"}).Ctor();
> > 
> >     new List<ClLogManagerOption>() {
> >             new ClLogManagerOption() { Key = "LogPath", Value = CL.COMMON.Core.GetConfigKeyValue(System.Reflection.MethodBase.GetCurrentMethod(),"LogPath") },
> >             new ClLogManagerOption() { Key = "FilePrefix", Value = "AUTH"},
> >             new ClLogManagerOption() { Key = "User",    Value = context.UserName},
> >     }.Ctor();
> > }
> > ```
> >  
> ---
> > **Build**( this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption ):CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption
> > 
> > ***Descripcion***
> > 
> > Guarda las configuraciones realizadas con Ctor.
> > 
> > ***Ejemplo:***
> >
> > ```csharp
> > public static void MyFunction()
> > {
> >     (new ClLogManagerOption() { Key = "FilePrefix", Value = "AUTH"}).Ctor().Build();
> > }
> > ```
> > 
> ---
> > **Dtor**( this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption ):CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption
> > 
> > ***Descripcion***
> > 
> > Limpia todas las configuraciones guardas en memoria 
> >
> > ***Ejemplo:***
> >
> > ```csharp
> > public static void MyFunction()
> > {
> >     (new ClLogManagerOption() { Key = "FilePrefix", Value = "AUTH"}).Ctor().Build().Dtor();
> > }
> > ```
> ---
> ### Azure Storage Blobs Rutinas
> > ****
> >
> > ***Descripcion***
> >
> > Es una clase que permite realizar operaciones en Azure Storage blob como:
> > - Subir un archivo o una lista de archivos
> > - Descargar un archivo o una lista como stream o en Base64
> > - Eliminar un archivo o una lista de archivos
> >
> > ***Parametros***
> >
> >  - CL.STRUCTURES.CLASSES.Azure.AzureCredentials _credentials(requerido): Credenciales de azure
> > -  System.Boolean _overwriteFiles(opcional): Define si en el container al subir los archivos estos se pueden sobreescribir
> >
> > ***Ejemplo***
> >
> > Es recomendable hacer una setting en la tabla de settings definido por la clase AzureCredentials que esta en el Cl.STRUCTURES. Una vez obtenidas las credenciales
> > se crea una nueva instancia de la clase AzureStorage que recibe como parametro las credenciales.
> > ```csharp
> >  List<CL.STRUCTURES.CLASSES.Azure.AzureCredentials> azureSetting = GetSettingByCode<List<CL.STRUCTURES.CLASSES.Azure.AzureCredentials>>("AzureCredentials").Response.Data;
> >  
> >  CL.STRUCTURES.CLASSES.Azure.AzureCredentials azureCredentials = azureSetting.FirstOrDefault();
> >
> >  CL.COMMON.AzureStorage storage = new CL.COMMON.AzureStorage(azureCredentials);
> > ```
> 
> > 
> > **UploadFile**: System.String
> >
> > ***Descripcion***
> >
> > Permite subir un archivo al container de azure. Al subir al archivo se retorna la url de la ubicación.
> > 
> > ***Parametros***
> >
> >  - CL.STRUCTURES.CLASSES.Azure.AzureFile _azureFile(requerido): Objeto que contiene la información necesaria para subir el archivo
> >
> > ***Ejemplo***
> > ```csharp
> >    System.String url =  await storage.UploadFile(new CL.STRUCTURES.CLASSES.Azure.AzureFile()
> >     {
> >         Stream = new MemoryStream(Convert.FromBase64String(base64file)),
> >         StoragePath = "test",
> >         Name = "image1.png"
> >    });
> > ```
> >
> 
> > **UploadFiles**: System.Collections.Generic.List<System.String>;
> >
> > ***Descripcion***
> >
> > Permite subir una lista de  archivos al container de azure.
> > Se retorna la lista de urls de los archivos subidos en el orden que se envió en la lista.
> >
> > ***Parametros***
> >
> >  - System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile>  _azureFiles(requerido): Lista de  objetos de tipo AzureFile que contiene la información necesaria para subir una lista de archivos archivo
> >
> > ***Ejemplo***
> > ```csharp
> >    System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile> azureFilesList = new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Azure.AzureFile>();
> >
> >    System.Collections.Generic.List<System.String> urls =  await storage.UploadFiles(azureFilesList);
> > ```
> > 
>
> > **DownLoadFileAsBase64**: System.String
> >
> > ***Descripcion***
> >
> > Permite descargar un archivo como Base64. Se retorna el string base64 del archivo
> >
> > ***Parametros***
> >
> >  - System.String  _url(requerido): URL del archivo que se desea descargar de Azure.
> >
> > ***Ejemplo:***
> >
> > ```csharp
> >   System.String base64 =  storage.DownLoadFileAsBase64(filepath);
> > ```
> >
>
> > **DownLoadFileAsStream**: System.IO.MemoryStream
> >
> > ***Descripcion***
> >
> > Permite descargar un archivo como MemoryStream
> >
> > ***Parametros***
> >
> >  - System.String  _url(requerido): URL del archivo que se desea descargar de Azure.
> >
> > ***Ejemplo:***
> >
> > ```csharp
> >   System.IO.MemoryStreamstream = await storage.DownLoadFileAsStream(filepath);
> > ```
> >
> 
> > **DownloadFilesAsBase64** : System.Collections.Generic.List<System.String>
> >
> > ***Descripcion***
> >
> > Permite descargar una lista de archivos como Base64
> >
> > ***Parametros***
> >
> > System.Collections.Generic.List<System.String>  _urls(requerido): URLs de los archivos que se desean descargar de Azure.
> >
> > ***Ejemplo:***
> >
> >
> > ```csharp
> >   System.Collections.Generic.List<System.String> filePathList = new System.Collections.Generic.List<System.String>();
> >
> >   System.Collections.Generic.List<System.String> base64List =  await storage.DownloadFilesAsBase64(filePathList);
> >
> > ```
> > 
>
> > **DownloadFilesAsStream**: System.Collections.Generic.List<System.IO.MemoryStream>
> >
> > ***Descripcion***
> >
> > Permite descargar una lista de archivos como stream
> >
> > ***Parametros***
> >
> > System.Collections.Generic.List<System.String>  _urls(requerido): URLs de los archivos que se desean descargar de Azure.
> >
> > ***Ejemplo:***
> >
> >
> > ```csharp
> >   System.Collections.Generic.List<System.String> filePathList = new System.Collections.Generic.List<System.String>();
> >
> >   System.Collections.Generic.List<System.IO.MemoryStream> memoryStreamList =  await storage.DownloadFilesAsStream(filePathList);
> >
> > ```
>
> > **DeleteFile**: System.Boolean
> >
> > ***Descripcion***
> >
> > Función para eliminar un archivo en azure. Retorna true o false en caso de que el archivo haya sido eliminado o no con éxito
> >
> > ***Parametros***
> >
> > System.String  _url(requerido): URL del archivo que se desea eliminar
> >
> >  ***Ejemplo:***
> >
> >
> > ```csharp
> >   System.Boolean isSuccess =  await storage.DeleteFile(filePath);
> > ```
> > 
>
> > **DeleteFiles**: System.Boolean
> >
> > ***Descripcion***
> >
> > Función para eliminar un archivo en azure. Retorna true o false en caso de que todos los archivos hayan sido eliminados o no con éxito
> >
> > ***Parametros***
> >
> > System.Collections.Generic.List<System.String>  _urls(requerido): URLs de los archivos que se desean eliminar de Azure.
> >
> >***Ejemplo:***
> >
> > ```csharp
> >    System.Collections.Generic.List<System.String> filePathList = new System.Collections.Generic.List<System.String>();
> > 
> >    System.Boolean isSuccess =  await storage.DeleteFiles(filePathList);
> > ```
> ---
> ### XSD Rutinas
> > Obtiene archivos .xsd para validar modelos en la aplicacion. 
> > Para esto se debe implementar el metodo LoadSchemas, el cual cargara los schemas que se encuentren en la ruta definida en la key del Web.config nombrada como SchemasPath. 
> > Este metodo debe invocarse unicamente en el metodo Application_Start de la clase WebApiApplication, esto en el archivo Global.asax.cs. 
> > Para poder validar un modelo como tal se debe extender dicho modelo de la interface CL.STRUCTURES.INTERFACES.SchemaValidator.ISchemaValidator, de esta manera dicho modelo tendrá acceso al método ValidateSchema, el modelo debe llevar el mismo nombre del schema y del archivo .xsd contra el que se quiere validar para que la comparacion de características entre cada uno de los campos sea exitosa.
> >
> ---
> > **LoadSchemas**( System.Reflection.MethodBase ): void
> >
> > **Descripcion**
> >
> > Metodo que se encarga de cargar los archivos xsd que se encuentran en la ruta de la key SchemasPath del Web.config. En caso de que el LoadSchemas no se este llamando en el metodo Application_Start de la clase WebApiApplication, esto en el archivo Global.asax.cs, el mismo presentara una excepcion, caso contrario se cargaran los archivos encontrados y en caso de que alguno no se puede cargar se guardará un log con el problema encontrado. Ademas, en caso de que no se encuentre el directorio definido en la key SchemasPath del Web.config se guardara un log informando sobre dicho problema y el flujo continuara con normalidad.
> >
> > **Parametros**
> >
> > _ methodBase(Requerido): Parametro utilizado para obtener el nombre del metodo y clase donde se invoca LoadSchemas.
> >
> > **Ejemplo:**
> >
> > ```csharp
> > public class WebApiApplication : System.Web.HttpApplication
> > {
> >     protected void Application_Start()
> >     {
> >         AreaRegistration.RegisterAllAreas();
> >         GlobalConfiguration.Configure(WebApiConfig.Register);
> >         FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
> >         RouteConfig.RegisterRoutes(RouteTable.Routes);
> >         BundleConfig.RegisterBundles(BundleTable.Bundles);
> >
> >         SchemaLoader.Instance.LoadSchemas(System.Reflection.MethodBase.GetCurrentMethod());
> >     }
> > }
> > ```
> ---
> > **ValidateSchema**: void
> >
> > **Descripcion**
> >
> > Metodo que se encarga de validar un modelo contra un schema que posea el mismo nombre que el tipo de dicho modelo. El schema contra el que se quiere validar el modelo debe estar cargado previamente. En caso de no encontrar un schema contra el cual validar, el flujo continuara sin ningun error, caso contrario se hara la validación del modelo contra el xsd y en caso de que alguna validacion no se cumpla se arrojara una excepcion indicando la misma.
> >
> > **Ejemplo:**
> >
> > Declaracion del metodo extendiendo de la interface CL.STRUCTURES.INTERFACES.SchemaValidator.ISchemaValidator:
> >
> > ```csharp
> > namespace CL_CF_CF_CSC_API.MODELS.DB
> > {
> >     public class Item: CL.STRUCTURES.INTERFACES.SchemaValidator.ISchemaValidator
> >     {
> >        public string ItemCode { get; set; }
> >        public string ItemName { get; set; }
> >     }
> > }
> > ```
> > 
> > Llamado del metodo ValidateSchema:
> >
> > ```csharp
> > Item item = new Item
> > {
> >     ItemCode = "43",
> >     ItemName = "PAÑAL PARA  ADULTO MAXI TALLA XS",
> > };
> > item.ValidateSchema();
> > ```
> ---
> > ### Resumen de versión
> >
> > **Correcciones (Fixes)**
> > - Avisar sobre que se eliminara la LogManager option "FileName"
> > - Se utiliza "FilePrefix" en lugar de "FileName"
> >
> > **Novedades**
> > - Implementacion de validacion de modelos contra archivos .xsd
> > 
> ---
> > ### Solución de problemas (Troubleshooting)
> > Ninguna
>
> [Clavis Consultores ©](https://www.clavisco.com/)  