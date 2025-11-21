> ### Acerca de CL.UDFS
> CL.UDFS es un conjunto de funcionalidades que nos permite configurar campos definidos por usuario de SAP.

> ### ¿Qué resuelve?
>  Facilita la gestión
> de las configuraciones necesarias para interactuar con los campos definidos por usuario de SAP,
> y además permite guardar estas configuraciones localmente.

> ### Resumen de versión
> Cambios (Changes)
> > - Se implementa el maneje de grupos de udfs, implementando un nuevo modelo (GroupContext) para el manejo se los campos y agregando a los endpoint existentes la funcionalidad para manejar este valor

> ### Rutinas de CL.UDFS
> > **GetUdfs**(CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject): CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext\>\>
> >
> > ***Descripción***
> >
> > Usado para obtener campos definidos por usuarios de SAP según categoría específica.
> >
> > ***Parametros***
> > - _slRequestObject(Requerido): Objeto con la información necesaria para realizar la conexion y consulta con Service Layer
> >
> > ***Ejemplo***:
> > ```csharp
> > public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>> GetUdfs()
> > {
> >     //...more code
> > 
> >     // La función FuncionQueConfiguraObjeto se encarga
> >     // de agregar la información necesaria para conectar a sap.
> >     SLRequestObject oSLRequestObject = FuncionQueConfiguraObjeto();
> >     // Retorna una lista de campos definidos por usuario (UDFs) con el tipo especificado en el método.
> >   
> >     return await Udf.GetUdfs(requestModel);
> > }
> > ```
>
> > **GetUdfCategories**<System.Data.Entity.DbContext>(System.String _dbObjectToken) :CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<CL.STRUCTURES.CLASSES.Udf.UdfCategory>>
> >
> > ***Descripción***
> >
> > Usado para obtener las categorías con su respectiva configuración de UDFs a utilizar en la aplicación.
> >
> > ***Parametros***
> > - _dbObjectToken(Requerido): Codigo de registro de la tabla DBResources.
> >
> > ***Ejemplo***:
> > ```csharp
> > public static CLContext<IEnumerable<CL.STRUCTURES.CLASSES.Udf.UdfCategory>> GetUdfCategories()
> > {
> >     // Retorna lista de categorías configuradas localmente.
> >     return Udf.GetUdfCategories<MainDBContext>("GetUdfCategories").Get();
> > }
> > ```
>
> > **GetUdfConfigured**<System.Data.Entity.DbContext, T, CL.STRUCTURES.INTERFACES.ICLSingle>(System.String _dbObjectToken, T _object) :CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>>
> >
> > ***Descripción***
> >
> > Usado para obtener los campos definidos por usuario (udfs) configurados localmente según categoría específica.
> >
> > ***Parametros***
> > - _dbObjectToken(Requerido): Alias de objeto de base de datos.
> > - _object(Requerido): Objeto que va a ser mapeado a un query.
> >
> > ***Ejemplo***:
> > ```csharp
> > public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> GetConfiguredUdf()
> >     // Retorna todos los udfs configurados localmente según el objeto T  
> >     return Udf.GetUdfConfigured<MainDBContext, FilterUdfs, ICLSingle>("GetUdfs",
> >             new FilterUdfs(){
> >                 Category = category,
> >                 CompanyId = _companyId
> >             }).Get();
> > }
> > ```
>
> > **PostUdf**<System.Data.Entity.DbContext, CL.STRUCTURES.INTERFACES.ICLMaster, CL.STRUCTURES.INTERFACES.ICLSingle>(System.String _dbObjectToken, params System.String[] _fields) :CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>
> >
> > ***Descripción***
> >
> > Usado para guardar campos definidos por usuario (udfs) localmente
> >
> > ***Parametros***
> > - _dbObjectToken(Requerido): Objeto que va a ser mapeado a un query.
> > - _fields(Requerido): Propiedades a excluir
> >
> > ***Ejemplo***:
> > ```csharp
> > public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> ConfigureUdfs(CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs)
> > {
> >     // Guarda los campos definidos por usuario (udfs) localmente según el objeto T. 
> >     return _udfs.PostUdf<MainDBContext, ICLExclude, ICLSingle>("PostUdf", "UDFList");
> > }
> > ```
>
> > **PatchUdf**<System.Data.Entity.DbContext, CL.STRUCTURES.INTERFACES.ICLMaster, CL.STRUCTURES.INTERFACES.ICLSingle>(System.String _dbObjectToken, params System.String[] _fields) :CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>
> >
> > ***Descripción***
> >
> > Usado para actualizar campos definidos por usuario (udfs) localmente
> >
> > ***Parametros***
> > - _dbObjectToken(Requerido): Objeto que va a ser mapeado a un query.
> > - _fields(Requerido): Propiedades a excluir
> >
> > ***Ejemplo***:
> >
> > ```csharp
> > public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> UpdateConfiguredUdfs(CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs)
> > {
> >     //  Actualiza los campos definidos por usuario (udfs) localmente según el objeto T.
> >     return _udfs.PatchUdf<MainDBContext, ICLExclude, ICLSingle>("PostUdf", "UDFList");
> > }
> > ```
>
> > **GetUdfInvokeDBO**(CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject) :System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>>>
> >
> > ***Descripción***
> >
> > Usado para obtener mediante Service Layer los valores de un UDF configurados desde de una vista de base de datos
> >
> > ***Parametros***
> > - _slRequestObject(Requerido): Objeto con la información necesaria para realizar la conexion y consulta con Service Layer
> >
> > ***Ejemplo***:
> >
> > ```csharp
> > public static async CLContext<List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>> GetUdfInvokeDBO(System.String _dataSourceDBO)
> > {
> >     //...more code
> >     return await Udf.GetUdfInvokeDBO(_slRequestModel);
> > }
> > ```
> > 

> ### Solución de problemas
> 
> > #### Consultar UDFs configurados
> > Al consultar UDFs configurados se puede presentar un problema de que la categoría no esté registrada en base de datos con los UDFs que se le hayan configurado, por lo cual el componente lanzara un 404 NotFound. Para evitar este error sin tener que hacer mapeos innecesarios en el código, se puede registrar la categoría con el campo de UDFs con el valor de un array vacío para que el componente lo reconozca y no lance el error 404 NotFound. Todo esto se debe hacer a nivel de base de datos.
> > 
> > *Ejemplo*
> > ```
> > Id          CompanyId   TableId      Udfs   CreatedDate                CreatedBy           UpdateDate                UpdatedBy          IsActive     Groups
> > ----------- ----------- ------------ ------ -------------------------- ------------------- ------------------------- ------------------ ----------  ---------
> > 1           1           ORDR         []     2023-07-26 00:00:00.000    dev@clavisco.com    2023-12-11 09:03:54.510   dev@clavisco.com   0              []
> > 2           1           OQUT         []     2023-08-28 08:30:09.610    dev@clavisco.com    2023-12-21 13:44:16.647   dev@clavisco.com   0              []
> > 3           1           OINV         []     2023-08-28 08:35:21.247    dev@clavisco.com    2023-08-29 10:02:35.803   dev@clavisco.com   0              []
> > 4           1           ORIN         []     2023-08-28 10:39:17.857    dev@clavisco.com    2023-08-28 11:02:02.150   dev@clavisco.com   0              []
> > 5           1           INV1         []     2023-08-29 10:33:56.577    dev@clavisco.com    2023-11-09 08:44:07.123   dev@clavisco.com   0              []
> > 
> > ```
> 

> [Clavis Consultores ©](https://www.clavisco.com/)  
