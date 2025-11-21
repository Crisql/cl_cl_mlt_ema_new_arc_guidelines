> ### Acerca de CL.DB
> Permite contruir y ejecutar scripts de base de datos a través de un
> contexto EntityFramework y retornar un ResultSet mapeado a su
> objeto de interés.


> ### ¿Qué resuelve?
> Optimiza los tiempos de creación de transacciones CRUD,
> permitiéndole al desarrrollar invocar los métodos que esta librería
> ofrece y asi evitarse tener que estar mapeado las propiedades de 
> un objeto. Esto nos permite solo tener que crear los objetos
> de base de datos que van a recibir estas propiedades.

> ### Resumen de versión
> Cambios (Changes)
> > - Ahora la versión mínima de framework es 4.6.2

> ### Rutinas
> > ### GetDataTable:System.Data.DataTable  
> > - System.Data.Common.DbConnection _connection: Contexto de la conexión de la base de datos.
> > - System.String _query: Query que va a ser ejecutado. 
> > ### Usado para devolver una tabla según el query suministrado. 
>
> > ### GetDataSet:System.Data.DataSet
> > - System.String _stringConnection: Datos de la conexión para poder crear.
> > una nueva instancia de la conexión
> > - System.String _query: Query que va a ser ejecutado.
> > ### Usado para devolver el resultado de multiples tablas que puede retornar un query.
>
> > ### GetDBObjectName:System.String
> > - System.String _dbObjectKey: Alias del nombre del objeto de base de datos.
> > - T _context: Modelo del contexto de la base de datos.
> > - System.Bool _shouldReleaseContext(false):  Bandera para indicar si 
> > este método debe liberar la conexión tras finalizar sus procesos.
> > ### Usado para obtener el objeto de base de datos para formar parte del query que se va a ejecutar.
> > ### Execute:CL.STRUCTURES.CLASSES.Context<System.Collections.Generic.List<T\>\>  
> > ### T:new()
> > ### U:System.Data.Entity.DbContext, new()
> > - System.String _dbObjectToken: Alias de objeto de base de datos(Usualmente una vista sql).
> > ### Retorna el ResultSet de una vista sql.
> > ### Ejemplo:  
> > `// Retorna todos los usuarios de la vista con alias vGetUsers`  
> > `var users = Execute<User, AppContext>("vGetUsers").Response.Data;`
>
> > ### Execute:CL.STRUCTURES.CLASSES.Context<System.Collections.Generic.List<T\>\>
> > ### T:new(): Objeto que va a ser mapeado a un query.
> > ### U:System.Data.Entity.DbContext, new(): Model del contexto de la base de datos.
> > - System.String _dbObjectToken: Alias de objeto de base de datos.
> > - V _index: Llave del objeto a filtrar, debe ser una primitiva de datos.
> > ### Permite filtrar un ResultSet mediante una llave(DocEntry, Id, etc.)
> > ### Ejemplo:
> > `// Retorna todos los usuarios con el Id 5, pero le aplicamos un first or default para obtener solo uno.`  
> > `var user = Execute<User, AppContext, System.Int16>("spGetUserById", 5).Response.Data.FirstOrDefault();`
>
> > ### Execute:CL.STRUCTURES.CLASSES.Context<System.Collections.Generic.List<T\>\>
> > ### T:new(): Objeto que va a ser mapeado a un query.
> > ### U:System.Data.Entity.DbContext, new(): Model del contexto de la base de datos.
> > ### V:CL.STRUCTURES.INTERFACES.ICLMaster: Interface validadora al incluir/excluir propieades del Objeto T
> > - System.String _dbObjectToken: Alias de objeto de base de datos.
> > - T _object: Objeto que va a ser mapeado a un query
> > - System.String[] _toIgnore: Lista de propieades del objeto que van ser ignoradas/incluidas
> > ### Crear un query según las propiedades del objeto U y el genérico V, el cual puede ser dos interfaces. CL.STRUCTURES.INTERFACES.ICLInclude, para indicar que las propidades de la lista _toIgnore van a ser omitidas en el query y CL.STRUCTURES.INTERFACES.ICLExclude, para indicar que solo quiero tomar esas propidades.
> > ### Ejemplo:
> > `// Obtiene todos los usuarios, pero excluyendo la propiedad Id al momento de crear el query.`  
> > `var usersa = Execute<User, AppContext, CL.STRUCTURES.INTERFACES.ICLExclude>("spGetUsers", user, new System.String[] { "Id" });`  
>
> > ### Execute:CL.STRUCTURES.CLASSES.Context<System.Collections.Generic.List<U\>\>
> > ### T:new(): Objeto que va a ser mapeado a un query.
> > ### U:new(): Objeto aal que va a ser mapeado el ResultSet.
> > ### V:System.Data.Entity.DbContext, new(): Contexto de la base de datos.
> > ### W:CL.STRUCTURES.INTERFACES.ICLMaster: Interface validadora al incluir/excluir propieades del Objeto T
> > - System.String _dbObjectToken: Alias del objeto de base de datos que va a formar parte del query.
> > - T _object: Objeto que va a ser mapedo a un query
> > - System.String[] _toIgnore(null): Lista de propieades a incluir/ignorar.
> > ### Crear un query según las propiedades del objeto T y el genérico V, el cual puede ser dos interfaces. CL.STRUCTURES.INTERFACES.ICLInclude, para indicar que las propidades de la lista _toIgnore van a ser omitidas en el query y CL.STRUCTURES.INTERFACES.ICLExclude, para indicar que solo quiero tomar esas propidades, pero con la facilidad de devolver un objeto de tipo U.
> > `// Retorna todos los documentos según el objeto search que puede tener propiedades como rango de fechas`  
> > `var documents = Execute<Search, Document, AppContext, CL.STRUCTURES.INTERFACES.ICLInclude>("spGetDocuments", search);`


## **Configuration keys**
Hay ciertas keys de configuración que se deben agregar para el correcto funcionamiento
> - **spGetDBResource** (Obligatoria): Esta key de configuración lo que hace es otorgar el nombre del procedimiento almacenado que va a obtener los nombres de los otros objetos de base de datos.
Ejm: *"< add key="spGetDBResource" value="CLVS_D_MLT_SLT_DBRESOURCE" />"*
Parametros que debe tener el procedimiento almacenado que se indica en el valor de la key:
>    - **Name**: Codigo del DBResource
>    - **CompanyKey**: Id de la compañía, este parametro solamente se debe agregar al procedimiento si la key de configuración **IsMulticompany** esta con el valor **true**. Para obtener el valor de este parametro se debe agregar el id de la compañía en los *HttpContext.Current.Items* con el siguiente identificador *CL.STRUCTURES.ENUMS.HttpContextItems.CompanyKey*

> - **IsMulticompany** (Obligatoria): Esta key de configuración se utiliza para saber si la aplicacion va a manejar multicompañía, acepta los siguientes valores "**true**" o "**false**", si se agrega con "**true**" debe agregar un parametro extra al procedimiento almacenado que se indica en el "**spGetDBResource**"


> [Clavis Consultores ©](https://www.clavisco.com/)  