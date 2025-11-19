> # Acerca de CL.SL
> Conjunto de funcionalidades que nos permiten conectarnos a service
> layer e interactuar con los distintos procesos que este nos ofrece.

> # ¿Qué resuelve?
> La gestión de las configuraciones requeridas para poder interactuar 
> con SAP a través de service layer.
> 
> A su vez nos brinda una serie de extensiones para faciliar el control
> de operaciones post, patch y get.

> ### Resumen de versión
> Cambios (Changes)
> > - Ahora la versión mínima de framework es 4.6.2

> # Rutinas de extensión
> > ## Consultas con service layer
> > #### Permite consumir una vista expuesta de service layer. Obtiene todos los registros sin aplicar ningún filtro.
> > ### Detalles de implementación
> > #### Extiende a: CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext
> > #### Función: Get : CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > ### Ejemplo:
> > `// La función ConfigurarContexto conecta a la base de datos y obtiene licencia, series, entre otros. Crear su propia función que realice este proceso.`  
> > `ClUserContext oClUserContext = ConfigurarContext();` 
> > ` `  
> > `// En la siguiente línea podemos ver como la extensión nos devuelve el objeto configurado` 
> > `// Importante tomar en cuenta que el objeto oClUserContext debe tener completa la variable Resource con el nombre de la vista de sap`   
> > `SLRequestObject oSLRequestObject = oClUserContext.Get();`  
> > #### [¿Y ahora cómo envío mi objeto recién configurado a service layer?](#enviar-transacciones-a-service-layer)
>
> > ## Consultas con service layer
> > #### Permite consumir vistas usando un modelo para mapearlo hacia ciertos filtros en el query string.
> > ### Detalles de implementación
> > #### Extiende a: CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext
> > #### Función: Get : CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Parámetros:
> > #### - TObject _target(Opcional): Permite construir los filtros que se deseen aplicar a una vista sql/hana. Si no se pasa este objeto el mapeador va a buscar en el diccionario de items de la sessión algún objeto expuesto mediante CL.COMMON.ActionFilters.QueryStringExposer.
> > ### Consideraciones:
> > #### El proceso de inyectar propiedades en los recursos se hace respecto al mismo, es decir si tenemos el recurso https://miservidor/b1s/v1/[sml.svc,view.svc,etc]/MIS_ITEMS[B1Sqlquery]?$filter=ItemCode%20eq%20@ItemCode y nuestro modelo tiene un montón de propiedades sólo se estaría mapeando la propiedad ItemCode debido a que es la que está definida en el recurso y en caso de no encontrase se levantará una excepción por parte del nuget.
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se conecta  `  
> > `// a la base de datos app y obtiene credenciales de sap`  
> > `ClUserContext oClUserContext = FuncionQueConfiguraObjeto();`
> > `// En la siguiente línea podemos ver como la extensión nos devuelve el objeto configurado`
> > `// Importante tomar en cuenta que el objeto oClUserContext debe tener completa la variable Resource con el nombre de la vista de sap.`   
> > `SLRequestObject oSLRequestObject = oClUserContext.Get<Item>();`  
> > #### [¿Y ahora cómo envío mi objeto recién configurado a service layer?](#enviar-transacciones-a-service-layer)
>
> > ## Consultas paginadas con service layer
> > #### Nos permite realizar consultas a vistas expuestas de service layer implementando un mecanismo de paginación integrado con service layer
> > ### Detalles de implementación
> > #### - En nuestro WebApi.Config antes de habilitar el cors en la línea "config.EnableCors(corsAttr);" tenemos que llamar a "corsAttr.ClHeadersSetter();". Esto con la idea de poder exponer los encabezados que nos brindan el contexto sobre el estado de la paginación.
> > #### - Es requerido que en cada endpoint que represente nuestra consulta agregar la anotación [EnablePagination]
> > #### - Se deben agregar los siguientes encabezados: cl-sl-pagination-page: (número de página), cl-sl-pagination-page-size: (tamaño de la página)
> > #### En la respuesta de la petición se retorna una serie de encabezados que contienen los datos respectivos a la paginación solicitada.
> > #### Extiende a: CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext
> > #### Función: Get : CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Parámetros:
> > #### - TObject _target(Opcional): Objeto que va a ser reemplazado en el query string. Si no se pasa este objeto el mapeador va a buscar en el diccionario de items de la sessión algún objeto expuesto mediante CL.COMMON.ActionFilters.QueryStringExposer
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente`  
> > `// estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se conecta  `  
> > `// a la base de datos app y obtiene credenciales de sap`  
> > `ClUserContext oClUserContext = FuncionQueConfiguraObjeto();`
> > ` `  
> > `// En la siguiente línea podemos ver como la extensión nos devuelve el objeto configurado`
> > `// Importante tomar en cuenta que el objeto oClUserContext debe tener completa la variable Resource con el nombre de la vista de sap y los filtros respectivos.`   
> > `SLRequestObject oSLRequestObject = oClUserContext.Get();`  
> > #### [¿Y ahora cómo envío mi objeto recién configurado a service layer?](#enviar-transacciones-a-service-layer)
>
> > ## Crear con service layer
> > #### Para poder crear objetos con service layer es requerido configurar el contexto. Dicho contexto es el que contiene toda la información necesaria para conectarnos con service layer, especificar el objeto que ocupamos crear y tipo de operación a realizar con service layer.
> > #### Esta función nos termina devolviendo un objeto configurado listo para ser procesado.
> > ### Detalles de implementación
> > #### Extiende a: CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext
> > #### Función: Post : CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Parámetros:
> > #### - TObject _target: Objeto que va a ser creado en sap.
> > #### - System.String _fieldsToRemoveInHeaders(Opcional): Nombres de las propiedades que serán eliminadas de la cabecera de TObject separadas por comas. Ejemplo: "DocEntry,DocNum".
> > #### - System.String _fieldsToRemoveInLines(Opcional):Nombres de las propiedades que serán eliminadas de las líneas de TObject separadas por comas. Ejemplo: "LineNum,U_Udf". NOTA: El mapeador va a buscar una propiedad que se llama DocumentLines para realizar el proceso de eliminación de propieades.
> > #### - System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs(Opcional): Lista de udfs que el usuario desea inyectar en la cabecera de un objeto.
> > #### - System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs(Opcional): Lista de udfs que el usuario necesita inyectar a nivel de línea de un objeto.
> > #### - System.String _lineObjectName(Opcional): Permite especificar el nombre de la propiedad que hace referencia a las líneas del objeto.
> > #### - System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions(Opcional): Permite especificar una serie de condiciones que serán aplicadas al proceso de eliminar propiedades a nivel de cabecera de un objeto mediante delegados.
> > #### - System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions(Opcional): Permite especificar una serie de condiciones que serán aplicadas al proceso de eliminar propiedades a nivel de línea de un objeto mediante delegados.
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente`  
> > `// estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se conecta  `  
> > `// a la base de datos app y obtiene credenciales de sap`  
> > `ClUserContext oClUserContext = FuncionQueConfiguraObjeto();`  
> > `System.Collections.Generics.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> lineFlushCondition = FuncionCreadoraDelegados();`  
> > ` `  
> > `// En la siguiente línea podemos ver como la extensión nos devuelve el objeto configurado`   
> > `// La variable oInvoice contiene el objeto que será transaccionado con service layer`  
> > `// El parámetro _fieldsToRemoveInHeaders contiene el string que presenta los datos de cabecera que serán eliminados de la variable oInvoice`  
> > `SLRequestObject oSLRequestObject = oClUserContext.Post(oInvoice,_fieldsToRemoveInHeaders: "DocEntry,DocNum", _lineFlushConditions: lineFlushConditions);`  
> > #### [¿Y ahora cómo envío mi objeto recién configurado a service layer?](#enviar-transacciones-a-service-layer)  
>
> > ## Actualizar con service layer
> > #### Para poder actualizar objetos con service layer es requerido configurar el contexto. Dicho contexto es el que contiene toda la información necesaria para conectarnos con service layer, especificar el objeto que ocupamos actualizar y tipo de operación a realizar con service layer.
> > #### Esta función nos termina devolviendo un objeto configurado listo para ser procesado. 
> > ### Detalles de implementación
> > #### Extiende a: CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext
> > #### Función: Patch : CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Parámetros:
> > #### - TObject _target: Objeto que va a ser actualizado en sap.
> > #### - System.String _fieldsToRemoveInHeaders(Opcional): Nombres de las propiedades que serán eliminadas de la cabecera de TObject separadas por comas. Ejemplo: "DocEntry,DocNum".
> > #### - System.String _fieldsToRemoveInLines(Opcional):Nombres de las propiedades que serán eliminadas de las líneas de TObject separadas por comas. Ejemplo: "LineNum,U_Udf". NOTA: El mapeador va a buscar una propiedad que se llama DocumentLines para realizar el proceso de eliminación de propieades
> > #### - System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs(Opcional): Lista de udfs que el usuario desea inyectar en la cabecera de un objeto.
> > #### - System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs(Opcional): Lista de udfs que el usuario necesita inyectar a nivel de línea de un objeto.
> > #### - System.String _lineObjectName(Opcional): Permite especificar el nombre de la propiedad que hace referencia a las líneas del objeto.
> > #### - System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions(Opcional): Permite especificar una serie de condiciones que serán aplicadas al proceso de eliminar propiedades a nivel de cabecera de un objeto mediante delegados.
> > #### - System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions(Opcional): Permite especificar una serie de condiciones que serán aplicadas al proceso de eliminar propiedades a nivel de línea de un objeto mediante delegados.
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente`  
> > `// estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se conecta  `  
> > `// a la base de datos app y obtiene credenciales de sap`  
> > `ClUserContext oClUserContext = FuncionQueConfiguraObjeto();`
> > `System.Collections.Generics.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> lineFlushCondition = FuncionCreadoraDelegados();`  
> > ` `  
> > `// Con la siguiente instrucción configuramos el objeto en modo patch`  
> > `SLRequestObject oSLRequestObject = oClUserContext.Patch<Invoice>(oInvoice, _fieldsToRemoveInLine: "TaxRate", _lineFlushConditions: lineFlushConditions);`
> > #### [¿Y ahora cómo envío mi objeto recién configurado a service layer?](#enviar-transacciones-a-service-layer)
>
> > ## Enviar transacciones a service layer
> > #### Permite enviar un transacción de tipo GET, POST, PATCH
> > #### a service layer retornándonos un objeto de tipo T.
> > ### Detalles de implementación
> > #### Extiende a: CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Función: SendAsync : System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<T\>\>
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente`  
> > `// estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se encarga `  
> > `// de agregar la información necesaria para conectar a sap`  
> > `SLRequestObject oSLRequestObject = FuncionQueConfiguraObjeto();`  
> > ` `  
> > `// El generic que se le da el metodo es para indicar el eventual objeto que nos puede devolver sap`  
> > `return await oSLRequestObject.SendAsync<Document>();`  
> 
> > ## Enviar transacciones a service layer 
> > #### Permite enviar un transacción de tipo GET, POST, PATCH, a service layer retornándonos una lista de objetos de tipo T.
> > ### Detalles de implementación 
> > #### Extiende a: CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
> > #### Función: SendAsync : System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generics.List<T\>\>\>
> > ### Ejemplo:
> > `// Las siguientes instrucciones usualmente`  
> > `// estarán en el Process.cs`  
> > ` `  
> > `// La función FuncionQueConfiguraObjeto se encarga `  
> > `// de agregar la información necesaria para conectar a sap`  
> > `SLRequestObject oSLRequestObject = FuncionQueConfiguraObjeto();`  
> > ` `  
> > `// El generic que se le da a el método es para`  
> > `// indicar la eventual lista de objetos que nos puede devolver sap`  
> > ` `  
> > `return await oSLRequestObject.SendAsync<List<Document>>();`  
> > `// O Si queremos obtener sólo un registro.`
> > `// return await oSLRequestObject.SendAsync<Document>();`
>
> > ## Procesamiento por lotes
> > #### Permite enviar un conjunto de transacciones a service layer, obtine una respuesta de tipo string en formato MINE.
> > ### Implementacion:
> > `// Se deben crear objetos de tipo  BatchRequest los cuales representan las transacciones que se enviarán a service layer`\
> > `// Se debe agregar cada objeto a la lista de transacciones`\
> > `// Se debe configurar el objeto SLRequestObject con la funcion BatchOperation(request)`\
> > `// Se debe enviar el objeto SLRequestObject a service layer`\
> > `//CLContext<UnmappedResponse> oClContext = await oSLRequestObject.SendAsync<UnmappedResponse>();`
>
> > ## Respuesta de service layer sin necesidad de mappear
> > #### Permite obtener la respuesta de service layer sin necesidad de mapearla a un objeto.
> > ### Detalles de implementación
> > #### Objeto requerido: Cl.Core.Structures.Classes.ServiceLayer.UnmappedResponse
> > ### Ejemplo:
> > `CLContext<UnmappedResponse> oClContext = await oSLRequestObject.SendAsync<UnmappedResponse>(); `
>

> [Clavis Consultores ©](https://www.clavisco.com/)  