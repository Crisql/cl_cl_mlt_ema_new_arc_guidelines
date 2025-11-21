using System.Linq;

namespace CL.STRUCTURES.CLASSES.Exceptions
{
    public class CLException : System.Exception
    {
        public System.Net.HttpStatusCode Code { get; set; }

        public CLException(System.String _message, System.Net.HttpStatusCode _code) : base(_message)
        {
            Code = _code;
        }

        public CLException(System.String _message) : base(_message)
        {
        }
    }
}

namespace CL.STRUCTURES.CLASSES.Rebound
{
    public class CLSLResponse
    {
        public CL.STRUCTURES.CLASSES.ServiceLayer.error error { get; set; }
    }

    public class Response<T>
    {
        public T Data { get; set; }

        [Newtonsoft.Json.JsonPropertyAttribute(NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public System.String Message { get; set; }

        public Response()
        {
        }

        public Response(System.Exception _exception)
        {
            try
            {
                if (_exception is null)
                    throw new System.Exception(
                        "CL You are trying to get an exception status but you have pass an empty instance, please provide an instance of an object");

                System.String message = string.Empty;

                if (_exception is Newtonsoft.Json.JsonSerializationException)
                {
                    message = _exception.Message;
                }
                else
                {
                    message = _exception.InnerException != null
                        ? _exception.InnerException.InnerException != null
                            ? _exception.InnerException.InnerException.Message
                            : _exception.InnerException.Message
                        : _exception.Message;
                }

                System.String name = _exception.TargetSite.DeclaringType.FullName + "." + _exception.TargetSite.Name;
                System.Int32 code = _exception.InnerException != null
                    ? _exception.InnerException.InnerException != null
                        ? _exception.InnerException.InnerException.HResult
                        : _exception.InnerException.HResult
                    : _exception.HResult;

                message = $"{message} {code}. Caused by {name}";

                Message = message;
            }
            catch
            {
                /*This catch is empty because i dont need to perform any action in case of fail*/
            }
        }
    }

    public class Response
    {
        [Newtonsoft.Json.JsonPropertyAttribute(NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public System.String Message { get; set; }

        public System.Net.HttpStatusCode Code { get; set; }

        public Response()
        {
        }

        public Response(System.Exception _exception)
        {
            try
            {
                if (_exception is null)
                    throw new System.Exception(
                        "CL You are trying to get an exception status but you have pass an empty instance, please provide an instance of an object");

                System.String message = string.Empty;

                if (_exception is Newtonsoft.Json.JsonSerializationException)
                {
                    message = _exception.Message;
                }
                else
                {
                    message = _exception.InnerException != null
                        ? _exception.InnerException.InnerException != null
                            ? _exception.InnerException.InnerException.Message
                            : _exception.InnerException.Message
                        : _exception.Message;
                }


                System.String name = _exception.TargetSite.DeclaringType.FullName + "." + _exception.TargetSite.Name;
                System.Int32 code = _exception.InnerException != null
                    ? _exception.InnerException.InnerException != null
                        ? _exception.InnerException.InnerException.HResult
                        : _exception.InnerException.HResult
                    : _exception.HResult;


                message = $"{message} {code}. Caused by {name}";
                Code = System.Net.HttpStatusCode.InternalServerError;

                try
                {
                    CL.STRUCTURES.CLASSES.Exceptions.CLException oCLException =
                        (CL.STRUCTURES.CLASSES.Exceptions.CLException)_exception;

                    if (System.Enum.IsDefined(typeof(System.Net.HttpStatusCode), oCLException.Code))
                    {
                        Code = oCLException.Code;
                    }
                }
                catch
                {
                    Code = System.Net.HttpStatusCode.InternalServerError;
                }

                Message = message;
            }
            catch
            {
            }
        }
    }

    public class CLContext<T>
    {
        public CL.STRUCTURES.CLASSES.Rebound.Response<T> Response { get; set; }
        private T mValue;

        public CLContext()
        {
            Code = System.Net.HttpStatusCode.OK;
            mValue = default;
        }

        public T value
        {
            set { mValue = value; }
        }

        public System.Net.HttpStatusCode Code { get; set; }
    }

    public class CLContext
    {
        public CL.STRUCTURES.CLASSES.Rebound.Response Response { get; set; }
        public System.Net.HttpStatusCode Code { get; set; }

        public CLContext()
        {
            Code = System.Net.HttpStatusCode.OK;
        }

        public CLContext(System.Exception _exception)
        {
            Response = new Response(_exception);

            if (System.Enum.IsDefined(typeof(System.Net.HttpStatusCode), Response.Code)) Code = Response.Code;
        }

        public CLContext(System.Exception _exception, System.Net.HttpStatusCode _httpStatusCode)
        {
            Response = new Response(_exception);
            Code = _httpStatusCode;
        }
    }
}

namespace CL.STRUCTURES.CLASSES.PinPad
{
    public class CLTerminal : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String TerminalCode { get; set; }
        public System.String Description { get; set; }
        public System.String Status { get; set; }
        public System.String Currency { get; set; }
        public System.Double QuickPayAmount { get; set; }
    }

    public class CLStoredTransaction : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity,
        CL.STRUCTURES.INTERFACES.IClDatabaseServices
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string StorageKey { get; set; }
        public string Data { get; set; }
        public string StateType { get; set; }
        public string TransactionType { get; set; }
        public string SyncUser { get; set; }
        public string DocumentKey { get; set; }
        public string TerminalId { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.LocalEntities
{
    public class CLSingleValue<T>
    {
        public T Value { get; set; }
    }

    public class CLPermission : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Name { get; set; }
        public System.String Description { get; set; }
        public CL.STRUCTURES.PermissionType PermissionType { get; set; }
    }

    public class CLRole : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Name { get; set; }
        public System.String Description { get; set; }
    }

    public class CLSetting : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Code { get; set; }
        public System.String View { get; set; }
        public System.String Json { get; set; }
    }

    public class CLUser : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Name { get; set; }
        public System.String LastName { get; set; }
        public System.String Email { get; set; }
        public System.String Password { get; set; }
    }

    public class CLAssignment : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String SlpCode { get; set; }
        public System.String CenterCost { get; set; }
        public System.String WhsCode { get; set; }
        public System.Double Discount { get; set; }
    }

    public class CLLicense : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String User { get; set; }
        public System.String Password { get; set; }
    }

    public class CLMenu : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Key
        {
            get => System.String.Format("{0}-{1}", Category, Id);
        }

        public System.String Description { get; set; }
        public System.String Icon { get; set; }
        public System.String Route { get; set; }
        public System.Boolean Visible { get; set; }
        public System.Collections.Generic.List<CLMenu> Nodes { get; set; }
        public System.String Category { get; set; }
        public System.Int32 NextId { get; set; }
    }

    public class CLDBResource : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Code { get; set; }
        public System.String Description { get; set; }
        public System.String DBObject { get; set; }
        public System.String QueryString { get; set; }
        public System.Int32 PageSize { get; set; }
        public System.String Type { get; set; }
    }

    public class CLConnection : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Name { get; set; }
        public System.String Odbctype { get; set; }
        public System.String Server { get; set; }
        public System.String User { get; set; }
        public System.String Pass { get; set; }
        public System.String ServerType { get; set; }
        public System.String SLUrl { get; set; }
    }

    public class CLCompany : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity
    {
        public System.String Name { get; set; }
        public System.String DatabaseCode { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.PresentationEntities
{
    /// <summary>
    /// This entity should be used as base in any object you want to track
    /// </summary>
    public abstract class BaseEntity
    {
        [System.ComponentModel.DataAnnotations.KeyAttribute]
        public virtual System.Int32 Id { get; set; }

        public System.DateTime CreatedDate { get; set; }
        public System.String CreatedBy { get; set; }
        public System.DateTime? UpdateDate { get; set; }
        public System.String UpdatedBy { get; set; }
        public System.Boolean IsActive { get; set; }
    }

    public class CLUserHolder
    {
        public System.Int32 UserId { get; set; }
        public System.Int32 CompanyId { get; set; }
        public System.String ResourceCode { get; set; }
    }

    /// <summary>
    /// Class to configure the queries to SAP databases
    /// </summary>
    public class CLDbConnectionOptions
    {
        public System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> Parameters { get; set; }
        public System.String DbObjectName { get; set; }
        public System.String DbName { get; set; }
        public System.Data.CommandType CommandType { get; set; }
        public System.String CommandText { get; set; }
        public System.String ConnectionString { get; set; }
    }

    public class CLCredentialHolder
    {
        public System.String DBCode { get; set; }
        public System.String Server { get; set; }
        public System.String SLUrl { get; set; }
        public System.String DST { get; set; }
        public System.String License { get; set; }
        public System.String Password { get; set; }
        public System.String Email { get; set; }
        public System.String ODBCUser { get; set; }
        public System.String ODBCPass { get; set; }
        public System.String ODBCType { get; set; }
        public System.String ServerType { get; set; }
        public System.String Resource { get; set; }
    }

    public class ClUserContext
    {
        /// <summary>
        /// Código de la base de datos SAP
        /// </summary>
        public System.String DBCode { get; set; }

        /// <summary>
        /// Servidor que almacena la base de datos SAP
        /// </summary>
        public System.String Server { get; set; }

        /// <summary>
        /// Url de service layer
        /// </summary>
        public System.String SLUrl { get; set; }

        public System.String DST { get; set; }

        /// <summary>
        /// Nombre del usuario SAP. Ejemplo: CLAVISCO\\cl.desarrollo.sql1
        /// </summary>
        public System.String License { get; set; }

        /// <summary>
        /// Contrasena para autenticarse con SAP
        /// </summary>
        public System.String Password { get; set; }

        /// <summary>
        /// Correo del usuaro logeado
        /// </summary>
        public System.String Email { get; set; }

        /// <summary>
        /// Usario para ejecutar consultas SQL
        /// </summary>
        public System.String ODBCUser { get; set; }

        /// <summary>
        /// Contrasena para autenticar usuario que ejecuta consultas SQL
        /// </summary>
        public System.String ODBCPass { get; set; }

        public System.String ODBCType { get; set; }
        public System.String ServerType { get; set; }

        /// <summary>
        /// Importante completar si se quiere usar las extensiones de service layer
        /// Si queremos consumir solo una vista de sql: CL_D_EMA_SLT_CURRENCIESB1SqlQuery
        /// Si queremos consumir una vista que aplique filtros usando el QueryStringExposer: CL_D_EMA_SLT_CURRENCIESB1SqlQuery$filter @Code eq Code
        /// Si queremos crear una cotizacion: Quotations
        /// </summary>
        public System.String Resource { get; set; }

        /// <summary>
        /// Indica el tipo de recurso: QS: QueryString, SW = Sap writter
        /// </summary>
        public System.String ResourceType { get; set; }

        /// <summary>
        /// Esta propidad debe usarse en el documento principal como por ejemplo:
        /// Si tenemos el objeto factura+pago la propidade ParentSerie va a contener la serie para la factura y la propidad
        /// ChildSerie va a usarse para dar la serie del pago
        /// </summary>
        public System.Int32 ParentSerie { get; set; }

        /// <summary>
        /// Esta propidad debe usarse cuando tenemos un objeto que tiene dos hijos. Por ejemplo factura + pago en donde
        /// el pago va a completar el valor de la serie con ChildSerie
        /// ** En caso de que sea un solo objeto usar la propiedad ParentSerie.
        /// </summary>
        public System.Int32 ChildSerie { get; set; }
    }

    /// <summary>
    /// Este clase debe usarse cuando queremos mandar una relación de otros objetos a un sp.
    /// Por ejemplo si queremos obtener los permisos de un usuario lo ideal mandar el id del usuario y el id del rol
    /// que este tiene asignado entonces invocamos esta clase con estos dos valores cargados y los mandamos hacia el sp.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="U"></typeparam>
    public class CartesianEntity<T, U>
    {
        /// <summary>
        /// Primer llave foránea
        /// </summary>
        public T AKey { get; set; }

        /// <summary>
        /// Segunda llave foránea
        /// </summary>
        public U BKey { get; set; }
    }

    public class CartesianEntity<T, U, V>
    {
        public T AKey { get; set; }
        public U BKey { get; set; }
        public V CKey { get; set; }
    }

    public class CartesianEntity<T, U, V, W>
    {
        public T AKey { get; set; }
        public U BKey { get; set; }
        public V CKey { get; set; }
        public W DKey { get; set; }
    }

    public class CartesianEntity<T, U, V, W, X>
    {
        public T AKey { get; set; }
        public U BKey { get; set; }
        public V CKey { get; set; }
        public W DKey { get; set; }
        public X EKey { get; set; }
    }

    public class CartesianEntity<T, U, V, W, X, Y>
    {
        public T AKey { get; set; }
        public U BKey { get; set; }
        public V CKey { get; set; }
        public W DKey { get; set; }
        public X EKey { get; set; }
        public Y YKey { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.ServiceLayer
{
    #region Batch Operations

    /// <summary>
    /// Represents a batch request with necessary information.
    /// </summary>
    public class BatchRequest
    {
        /// <summary>
        /// Gets or sets the unique identifier for the batch request.
        /// </summary>
        public System.Int32 Id { get; set; }

        /// <summary>
        /// Gets or sets the HTTP method for the batch request, could be GET, POST or PATCH.
        /// </summary>
        public CL.STRUCTURES.VERBS Method { get; set; }

        /// <summary>
        /// Gets or sets the URL in SL for the batch request.
        /// </summary>
        public System.String Url { get; set; }

        /// <summary>
        /// Gets or sets the content of the batch request. Is used for request of type POST or PATCH
        /// </summary>
        public System.String Content { get; set; }

        /// <summary>
        /// Gets or sets the change set number group associated with  the batch request.
        /// </summary>
        public System.Int32 ChangeSetNumber { get; set; }
    }


    public class BatchOperationsBuilder
    {
        /// <summary>
        /// Gets or sets the batch boundary.
        /// </summary>
        private System.String _batchBoundary { get; set; }

        /// <summary>
        /// Gets or sets the batch ID.
        /// </summary>
        private System.String _batchId { get; set; }

        /// <summary>
        /// Gets or sets the list of batch requests.
        /// </summary>
        private System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> _requestList;

        /// <summary>
        /// Initializes a new instance of the <see cref="BatchOperationsBuilder"/> class.
        /// </summary>
        /// <param name="_requests">List of batch requests.</param>
        /// <param name="_batchId">Optional batch ID.</param>
        public BatchOperationsBuilder(
            in System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> _requests,
            in System.String _batchId = null)
        {
            this._batchId = _batchId;
            this._requestList = _requests;

            GenerateBoundary();
        }

        /// <summary>
        /// Gets the batch boundary.
        /// </summary>
        /// <returns>The batch boundary.</returns>
        public System.String GetBatchBoundary()
        {
            return this._batchBoundary;
        }


        /// <summary>
        /// Generates the batch boundary.
        /// </summary>
        private void GenerateBoundary()
        {
            System.String id = System.Guid.NewGuid().ToString();
            this._batchBoundary = !System.String.IsNullOrEmpty(_batchId)
                ? $"batch_{_batchId}_{id}"
                : $"batch_{id}";
        }


        /// <summary>
        /// Builds the entire batch operation.
        /// </summary>
        /// <returns>The batch operation as a string.</returns>  
        public System.String BuildOperation()
        {
            System.Text.StringBuilder bodyBuilder = new System.Text.StringBuilder();

            bodyBuilder.AppendLine($"--{_batchBoundary}").AppendLine();

            BuildSimpleRequests(ref bodyBuilder);

            BuildChangeSets(ref bodyBuilder);

            bodyBuilder.AppendLine().AppendLine($"--{_batchBoundary}--");

            return bodyBuilder.ToString();
        }

        /// <summary>
        /// Builds the change sets in the batch operation in case that is required .
        /// </summary>
        /// <param name="stringBuilder">The StringBuilder used to build the batch operation.</param>
        private void BuildChangeSets(ref System.Text.StringBuilder stringBuilder)
        {
            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> changeSetRequests =
                _requestList.Where(r => r.ChangeSetNumber != 0).ToList();

            if (!changeSetRequests.Any())
                return;

            if (changeSetRequests.Any(r => r.Method == CL.STRUCTURES.VERBS.GET))
                throw new System.Exception("CL ChangeSet cannot take a GET request");

            System.Collections.Generic.IEnumerable<GroupedChangeSetRequests> groupedRequests = changeSetRequests
                .GroupBy(r => r.ChangeSetNumber)
                .Select(g => new GroupedChangeSetRequests
                {
                    ChangeSetNumber = g.Key,
                    Requests = g.ToList()
                });

            foreach (GroupedChangeSetRequests req in groupedRequests)
            {
                System.String boundary = $"changeset_{System.Guid.NewGuid().ToString()}";
                System.Text.StringBuilder changeSetBuilder = new System.Text.StringBuilder();

                changeSetBuilder.AppendLine($"Content-Type: multipart/mixed;boundary={boundary}").AppendLine();

                foreach (CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest request in req.Requests)
                {
                    changeSetBuilder.AppendLine($"--{boundary}");
                    changeSetBuilder.AppendLine()
                        .AppendLine("Content-Type: application/http")
                        .AppendLine("Content-Transfer-Encoding: binary")
                        .AppendLine($"Content-ID: {request.Id}")
                        .AppendLine()
                        .AppendLine($"{request.Method} {request.Url}")
                        .AppendLine("Content-Type: application/json")
                        .AppendLine()
                        .AppendLine(request.Content)
                        .AppendLine();
                }

                changeSetBuilder.AppendLine($"--{boundary}--");
                stringBuilder.Append(changeSetBuilder).AppendLine();
            }
        }


        private void BuildSimpleRequests(ref System.Text.StringBuilder stringBuilder)
        {
            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> simpleRequest =
                _requestList.Where(r => r.ChangeSetNumber == 0).ToList();

            if (!simpleRequest.Any())
                return;

            System.Int32 index = 0;
            foreach (CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest request in simpleRequest)
            {
                if (index != 0)
                {
                    System.String boundary = $"--{_batchBoundary}";
                    stringBuilder.AppendLine(boundary);
                }

                stringBuilder.AppendLine()
                    .AppendLine("Content-Type: application/http")
                    .AppendLine("Content-Transfer-Encoding:binary")
                    .AppendLine($"Content-ID: {request.Id}")
                    .AppendLine()
                    .AppendLine($"{request.Method} {request.Url}");
                if (request.Method != CL.STRUCTURES.VERBS.GET)
                    stringBuilder.AppendLine("Content-Type: application/json");
                stringBuilder.AppendLine()
                    .AppendLine(request.Content)
                    .AppendLine($"--{_batchBoundary}")
                    .AppendLine();
                index++;
            }
        }
    }

    internal class GroupedChangeSetRequests
    {
        public System.Int32 ChangeSetNumber { get; set; }
        public System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> Requests { get; set; }
    }

    #endregion

    /// <summary>
    /// Represents the response for a batch operation, including MIME response and batch boundary.
    /// </summary>
    public class UnmappedResponse
    {
        /// <summary>
        /// Gets or sets the response string.
        /// </summary>
        public System.String StringResponse { get; set; }
    }


    public class SrvLayer
    {
    }

    public class Login
    {
        public System.String Url { get; set; }
        public System.String Method { get; set; }
        public LoginContent Content { get; set; }
    }

    /// <summary>
    /// Holds company target, licence and password
    /// Used to log into sap
    /// </summary>
    public class LoginContent
    {
        public System.String CompanyDB { get; set; }
        public System.String UserName { get; set; }
        public System.String Password { get; set; }
    }

    public class CookieResponse
    {
        public System.DateTime GetTime { get; set; }
        public System.String SessionId { get; set; }
        public System.String ROUTEID { get; set; }
        public System.String Version { get; set; }
        public System.Int32 SessionTimeout { get; set; }

        public error error { get; set; }
        // public int Id { get; set; }
    }

    public class message
    {
        public System.String lang { get; set; }
        public System.String value { get; set; } = System.String.Empty;
    }

    /// <summary>
    /// Used to hold service layer errors
    /// </summary>
    public class error
    {
        public System.Int32 code { get; set; }
        public message message { get; set; }
    }

    /// <summary>
    /// Holds main service layer object.
    /// This object is used to create a service layer transaction
    /// </summary>
    public class SLRequestObject
    {
        public Login Login { get; set; }
        public System.String Url_Base { get; set; }
        public System.String Url_Request { get; set; }
        public System.String Method { get; set; }
        public System.String Content { get; set; }

        public System.String BatchBoundary { get; set; }

        public System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<System.String, System.String>>
            Headers
        { get; set; }
    }

    /// <summary>
    /// This class only should be used when you are trying to map a service layer get
    /// </summary>
    /// <typeparam name="T">Prototype to be mapeed</typeparam>
    /// <typeparam name="U">Constraint to try to validate an get scenario</typeparam>
    public class SLGet<T>
    {
        /// <summary>
        /// This property only has this name because
        /// </summary>
        public T value { get; set; }

        /// <summary>
        /// Request metadata
        /// </summary>
        [Newtonsoft.Json.JsonProperty("odata.metadata")]
        public System.String OdataMetadata { get; set; }

        /// <summary>
        /// Use this property to paging
        /// </summary>
        [Newtonsoft.Json.JsonProperty("odata.nextLink")]
        public System.String OdataNextLink { get; set; }


        /// <summary>
        /// This property is used to map service layer hana version of next object state
        /// </summary>
        [Newtonsoft.Json.JsonProperty("@odata.nextLink")]
        private System.String hanaNextLink
        {
            set
            {
                if (value is System.Object)
                {
                    OdataNextLink = value;
                }
            }
        }

        /// <summary>
        /// Returns all record with filter count applied
        /// </summary>
        private System.Int32 recordsCount;

        [Newtonsoft.Json.JsonProperty("odata.count")]
        public System.Int32 RecordsCount
        {
            get => recordsCount;
            set
            {
                if (value is System.Object)
                {
                    recordsCount = value;
                    System.Web.HttpContext.Current.Items["cl-sl-pagination-records-count"] = recordsCount;
                }
            }
        }

        /// <summary>
        /// This property is used to map service layer hana version of result set count
        /// </summary>
        [Newtonsoft.Json.JsonProperty("@odata.count")]
        private System.Int32 hanaRecordsCount
        {
            set
            {
                if (value is System.Object)
                {
                    recordsCount = value;
                    System.Web.HttpContext.Current.Items["cl-sl-pagination-records-count"] = recordsCount;
                }
            }
        }
    }

    public class CookieJar
    {
        public System.String Cookie { get; set; }
        public System.String License { get; set; }
        public System.Int32 PushTime { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.SAP
{
    /// <summary>
    /// 
    /// </summary>
    public class SalesMan
    {
        /// <summary>
        /// Code of the salesman
        /// </summary>
        public System.Int32 SlpCode { get; set; }

        /// <summary>
        /// Presentation name
        /// </summary>
        public System.String SlpName { get; set; }
    }

    public class BusinessPartner
    {
        public System.String CardCode { get; set; }
        public System.String CardName { get; set; }
        public System.String Address { get; set; }
        public System.String Phone1 { get; set; }
        public System.String Balance { get; set; }
        public System.String GroupNum { get; set; }
        public System.String Discount { get; set; }
        public System.String ListNum { get; set; }
        public System.String Currency { get; set; }
    }

    public class Account
    {
        public System.String AcctName { get; set; }
        public System.String AcctCode { get; set; }
        public System.String ActCurr { get; set; }
        public System.Int32 Type { get; set; }
    }

    public class Bank
    {
        public System.String BankCode { get; set; }
        public System.String BankName { get; set; }
    }

    public class Card
    {
        public System.String CardName { get; set; }
        public System.String AcctCode { get; set; }
        public System.String Currency { get; set; }
    }

    public class Item
    {
        [CL.STRUCTURES.ATTRIBUTES.MasterKey] public System.String ItemCode { get; set; }
        public System.String ItemName { get; set; }
        public System.String InventoryItem { get; set; }
        public System.String SalesItem { set; get; }
        public System.String PurchaseItem { get; set; }
        public System.Double TaxRate { get; set; }
        public System.String TaxCode { get; set; }
        public System.Double UnitPrice { get; set; }
        public System.String TaxOnly { get; set; }
        public System.String UoMEntry { get; set; }
        public System.Double OnHand { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.LogManager
{
    /// <summary>
    /// 
    /// </summary>
    public class ClLogManagerOption
    {
        /// <summary>
        /// 
        /// </summary>
        public System.String Key { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public System.String Value { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.Udf
{
    public class UdfContext
    {
        public System.String TableId { get; set; }
        public System.String Name { get; set; }
        public System.String Description { get; set; }
        public System.String FieldType { get; set; }
        public System.String Values { get; set; }
        public System.Collections.Generic.List<UdfInvoke> MappedValues { get; set; }
        public System.String DataSource { get; set; }
        public System.String TargetToOverride { get; set; }
        public System.String PostTransactionObject { get; set; }
        public System.Boolean IsActive { get; set; }
        public System.Boolean IsRequired { get; set; }
        public System.Boolean IsRendered { get; set; }
        public System.Boolean IsTypehead { get; set; }
        public System.Int32 FieldID { get; set; }
        public System.Int32? HeaderId { get; set; }
        public System.Int32? LinesId { get; set; }
        public System.String DescriptionLines { get; set; }

        public System.String Group { get; set; }
    }


    /// <summary>
    /// Envio sl
    /// </summary>
    public class Udf
    {
        public System.String Name { get; set; }
        public System.String FieldType { get; set; }
        public System.String Value { get; set; }
    }

    /// <summary>
    /// View udfs configured
    /// </summary>
    public class UdfCategory
    {
        public System.String Name { get; set; }
        public System.String Description { get; set; }
        public System.String Key { get; set; }
        public System.String KeyLine { get; set; }
    }

    /// <summary>
    /// Save bd local
    /// </summary>
    public class CLUdf : CL.STRUCTURES.CLASSES.PresentationEntities.BaseEntity,
        CL.STRUCTURES.INTERFACES.IClDatabaseServices
    {
        public System.Int32 CompanyId { get; set; }
        public System.String TableId { get; set; }
        public System.String Udfs { get; set; }

        public System.String Groups { get; set; }
    }

    /// <summary>
    /// Save udfs
    /// </summary>
    public class UdfTransfer : CLUdf
    {
        public System.Collections.Generic.List<UdfContext> UDFList { get; set; }

        public System.Collections.Generic.List<GroupContext> GroupList { get; set; }
    }

    /// <summary>
    /// Busqueda ligada
    /// </summary>
    public class UdfInvoke
    {
        public System.String Value { get; set; }
        public System.String Description { get; set; }
        public System.Boolean IsActive { get; set; }
    }

    /// <summary>
    /// Get data of udf
    /// </summary>
    public class UdfSource
    {
        public System.Int32 CompanyId { get; set; }
        public System.String TableId { get; set; }
        public System.String Key { get; set; }
        public System.String Value { get; set; }
        public System.Collections.Generic.List<UdfContext> Udf { get; set; }
    }

    /// <summary>
    /// Get data of group
    /// </summary>
    public class GroupContext
    {
        public System.String Name { get; set; }
        public System.String Description { get; set; }
        public System.Boolean IsActive { get; set; }
    }

}

namespace CL.STRUCTURES.CLASSES.DatabaseService
{
    public class CLDatabaseServiceOption
    {
        public System.String Key { get; set; }
        public System.String Value { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.Email
{
    public class EmailCredential
    {
        public System.Int32 IdCompany { get; set; }
        public System.String Subject { get; set; }
        public System.String Account { get; set; }
        public System.String User { get; set; }
        public System.String Host { get; set; }
        public System.String Password { get; set; }
        public System.Int32 Port { get; set; }
        public System.Boolean Ssl { get; set; }
    }

    public class EmailDetails
    {
        public System.Collections.Generic.List<System.String> EmailsTo { get; set; }
        public System.String Body { get; set; }
        public System.String Subject { get; set; }
        public System.Collections.Generic.List<System.String> EmailsCC { get; set; }
        public System.Collections.Generic.List<EmailFile> EmailFiles { get; set; }
    }

    public class EmailFile
    {
        public System.String Base64 { get; set; }
        public System.String FileName { get; set; }
        public System.String Extention { get; set; }
        public System.String FileType { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.Azure
{
    /// <summary>
    /// Represents an Azure file with properties such as name, content stream, and storage path.
    /// </summary>
    public class AzureFile
    {
        /// <summary>
        /// Gets or sets the name of the Azure file.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the content of the Azure file as a MemoryStream.
        /// </summary>
        public System.IO.MemoryStream Stream { get; set; }

        /// <summary>
        /// Gets or sets the storage path of the Azure file.
        /// </summary>
        public string StoragePath { get; set; }
    }

    /// <summary>
    /// Represents Azure storage credentials with properties such as account, access key, container, and root directory.
    /// </summary>
    public class AzureCredentials
    {
        /// <summary>
        /// Gets or sets the Azure storage account.
        /// </summary>
        public string Account { get; set; }

        /// <summary>
        /// Gets or sets the access key associated with the Azure storage account.
        /// </summary>
        public string AccessKey { get; set; }

        /// <summary>
        /// Gets or sets the name of the Azure storage container.
        /// </summary>
        public string Container { get; set; }

        /// <summary>
        /// Gets or sets the root directory within the Azure storage container.
        /// </summary>
        public string Root { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.Schema
{
    /// <summary>
    /// Class used to store schema information.
    /// </summary>
    public class SchemaContext
    {
        /// <summary>
        /// xsd file name
        /// </summary>
        public System.String Name { get; set; }

        /// <summary>
        /// xsd file content
        /// </summary>
        public System.Xml.Schema.XmlSchemaSet Schema { get; set; }
    }
}

namespace CL.STRUCTURES.CLASSES.Deserializers
{
    /// <summary>
    /// Base model to map mediatypes from Service Layer endpoints
    /// </summary>
    /// <typeparam name="TPrimitive">Final type of your media. System.String, System.Int32...</typeparam>
    public class Media<TPrimitive>
    {
        /// <summary>
        /// Will contain your mapped Service Layer media
        /// </summary>
        public TPrimitive Data { get; set; }
    }
}