using System.Linq;

namespace CL.COMMON
{
    /// <summary>
    /// Contains a set of functions to help you in your journey coding, for instance 
    /// <para>List of Methods</para>
    /// <para>* GetConfigKeyValue:  Access to config file keys in a safety way.</para>
    /// <para>* FileToBase64:       Converts a phisical file into an 64base string.</para>
    /// <para>* FillObject:         Used to create an object from a database result set.</para>
    /// <para>* InflateObject:      Its a wrapper of FillObject method, you should use this function in standar mappings.</para>
    /// <para>* InflateList: Used to create an object list from a database result set.</para>
    /// <para>* ParametersBuilder:  Creates the parameters section of a query for instace ('value1', 2, 'value3')</para>
    /// <para>* ObjectParameters:   Creates a list of parameters to be used on a query</para>
    /// </summary>
    public static class Core
    {
        #region ContextBroker

        /// <summary>
        /// Allows to map your application context into web context response with a custom error Code.
        /// </summary>
        /// <param name="_target">Exception to be mapped</param>
        /// <param name="_code">Code of your exception</param>
        /// <returns>HttpResponse message with your exception detail</returns>
        public static System.Net.Http.HttpResponseMessage ContextBroker(System.Exception _target,
            System.Net.HttpStatusCode _code)
        {
            if (!(_target is System.Object))
                throw new System.ArgumentNullException(nameof(_target));

            if (!(_code is System.Object))
                throw new System.ArgumentNullException(nameof(_code));

            CL.STRUCTURES.CLASSES.Rebound.CLContext oCLContext =
                new CL.STRUCTURES.CLASSES.Rebound.CLContext(_target, _code);

            System.String serializedResponse = System.String.Empty;

            System.String polishedMessage = System.String.Empty;

            try
            {
                polishedMessage = Internals.ParseMessage(oCLContext.Response.Message);
                CL.COMMON.LogManager.Record(polishedMessage);
                polishedMessage = System.Uri.EscapeDataString(polishedMessage);

                serializedResponse = Newtonsoft.Json.JsonConvert.SerializeObject(oCLContext.Response);
                serializedResponse = Internals.ParseMessage(serializedResponse);
            }
            catch
            {
                /**/
            }

            System.Net.Http.HttpResponseMessage oHttpResponseMessage;

            switch (oCLContext.Code)
            {
                case System.Net.HttpStatusCode.NoContent:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code);
                    break;
                case System.Net.HttpStatusCode.NotFound:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code);
                    break;
                default:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code)
                    {
                        Content = new System.Net.Http.StringContent(serializedResponse, System.Text.Encoding.UTF8,
                            "application/json")
                    };

                    break;
            }

            oHttpResponseMessage.Headers.Add("cl-message", polishedMessage);

            return oHttpResponseMessage;
        }

        /// <summary>
        /// Allows to map your application context into web context response.
        /// </summary>
        /// <param name="_target">Exception to be mapped</param>
        /// <returns>HttpResponse message with your exception detail</returns>
        public static System.Net.Http.HttpResponseMessage ContextBroker(System.Exception _target)
        {
            if (!(_target is System.Object))
                throw new System.ArgumentNullException(nameof(_target));

            CL.STRUCTURES.CLASSES.Rebound.CLContext oCLContext = new CL.STRUCTURES.CLASSES.Rebound.CLContext(_target);

            System.String serializedResponse = System.String.Empty;
            System.String polishedMessage = System.String.Empty;

            try
            {
                polishedMessage = System.Uri.EscapeDataString(Internals.ParseMessage(oCLContext.Response.Message));

                CL.COMMON.LogManager.Record(polishedMessage);

                polishedMessage = System.Uri.EscapeDataString(polishedMessage);

                serializedResponse = Newtonsoft.Json.JsonConvert.SerializeObject(oCLContext.Response);
                serializedResponse = Internals.ParseMessage(serializedResponse);
            }
            catch
            {
                /**/
            }

            System.Net.Http.HttpResponseMessage oHttpResponseMessage;

            switch (oCLContext.Code)
            {
                case System.Net.HttpStatusCode.NoContent:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code);
                    break;
                case System.Net.HttpStatusCode.NotFound:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code);
                    break;
                default:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(oCLContext.Code)
                    {
                        Content = new System.Net.Http.StringContent(serializedResponse, System.Text.Encoding.UTF8,
                            "application/json")
                    };
                    break;
            }

            oHttpResponseMessage.Headers.Add("cl-message", polishedMessage);

            return oHttpResponseMessage;
        }

        /// <summary>
        /// Maps your model into a web context
        /// </summary>
        /// <typeparam name="T">Prototype of your object</typeparam>
        /// <param name="_target">Model to be mapped into a response</param>
        /// <returns>HttpResponse message with your exception detail</returns>
        public static System.Net.Http.HttpResponseMessage ContextBroker<T>(
            CL.STRUCTURES.CLASSES.Rebound.CLContext<T> _target)
        {
            System.String serializedResponse = System.String.Empty;
            try
            {
                if (_target is System.Object && _target.Response is System.Object)
                {
                    serializedResponse = Newtonsoft.Json.JsonConvert.SerializeObject(_target.Response);
                    serializedResponse = Internals.ParseMessage(serializedResponse);
                }
            }
            catch
            {
                /**/
            }

            System.Net.Http.HttpResponseMessage oHttpResponseMessage;

            switch (_target.Code)
            {
                case System.Net.HttpStatusCode.NoContent:
                case System.Net.HttpStatusCode.NotFound:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(_target.Code);
                    break;
                default:
                    oHttpResponseMessage = new System.Net.Http.HttpResponseMessage(_target.Code)
                    {
                        Content = new System.Net.Http.StringContent(serializedResponse, System.Text.Encoding.UTF8, "application/json")
                    };

                    if (!System.String.IsNullOrEmpty(serializedResponse))
                    {
                        oHttpResponseMessage.Content = new System.Net.Http.StringContent(serializedResponse, System.Text.Encoding.UTF8, "application/json");
                    }

                    break;
            }

            if (_target.Response is System.Object && !System.String.IsNullOrEmpty(_target.Response.Message))
                oHttpResponseMessage.Headers.Add("cl-message", System.Uri.EscapeDataString(Internals.ParseMessage(_target.Response.Message)));

            if (System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"] is System.Object && (System.Boolean)System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"])
            {
                System.Int32 recordsCount = System.Int32.Parse(System.Web.HttpContext.Current.Items["cl-sl-pagination-records-count"].ToString());
                oHttpResponseMessage.Headers.Add("cl-sl-pagination-records-count", recordsCount.ToString());

                System.Int32 page =
                    System.Int32.Parse(System.Web.HttpContext.Current.Items["cl-sl-pagination-page"].ToString());

                if (page == 0) page = 1;

                oHttpResponseMessage.Headers.Add("cl-sl-pagination-next-page", (page + 1).ToString());

                System.Int32 pageSize =
                    System.Int32.Parse(System.Web.HttpContext.Current.Items["cl-sl-pagination-page-size"].ToString());
                oHttpResponseMessage.Headers.Add("cl-sl-pagination-page-size", pageSize.ToString());

                oHttpResponseMessage.Headers.Add("cl-sl-pagination-is-enabled"
                    , System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"].ToString());

                System.Int32 pages = System.Convert.ToInt32(recordsCount / pageSize) > 0
                    ? System.Convert.ToInt32(recordsCount / pageSize)
                    : 1;

                oHttpResponseMessage.Headers.Add("cl-sl-pagination-pages", pages.ToString());

                oHttpResponseMessage.Headers.Add("cl-sl-pagination-page", page.ToString());
            }
            return oHttpResponseMessage;
        }

        #endregion

        #region Miscellaneous

        /// <summary>
        /// It allows you to request a token value in a safety way in the Web.config file. In case of not found key the function will indicates the error
        /// </summary>
        /// <param name="_invoker">Used to determinate which function is calling current method in an exception situation System.Reflection.MethodBase</param>
        /// <param name="_configKey">Token name System.String</param>
        /// <returns>The value related to a token in the Web.config file</returns>
        [System.ObsoleteAttribute("Evitar el uso de este método y usar la versión genérica para obtener el tipado correcto")]
        public static System.String GetConfigKeyValue(System.Reflection.MethodBase _invoker, System.String _configKey)
        {
            System.String OBJECT_NAME = System.Configuration.ConfigurationManager.AppSettings[_configKey];

            if (OBJECT_NAME is null)
            {
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";
                throw new System.Exception(
                    $"CL Invoker={invokerPath}* Please add {_configKey} token to your Web.config.");
            }

            return OBJECT_NAME;
        }

        public static T GetConfigKeyValue<T>(System.Reflection.MethodBase _invoker, System.String _configKey)
        {
            T oT;
            System.String configKeyValue = System.Configuration.ConfigurationManager.AppSettings[_configKey];

            switch (System.Type.GetTypeCode(typeof(T)))
            {
                case System.TypeCode.Int32:
                    oT = (T)(System.Object)System.Convert.ToInt32(configKeyValue);
                    break;
                case System.TypeCode.String:
                    oT = (T)(System.Object)configKeyValue;
                    break;
                case System.TypeCode.Single:
                    oT = (T)(System.Object)System.Convert.ToSingle(configKeyValue);
                    break;
                case System.TypeCode.Decimal:
                    oT = (T)(System.Object)System.Convert.ToDecimal(configKeyValue);
                    break;
                case System.TypeCode.Double:
                    oT = (T)(System.Object)System.Convert.ToDouble(configKeyValue);
                    break;
                case System.TypeCode.Char:
                    oT = (T)(System.Object)System.Convert.ToChar(configKeyValue);
                    break;
                case System.TypeCode.Boolean:
                    oT = (T)(System.Object)System.Convert.ToBoolean(configKeyValue);
                    break;
                default:
                    throw new System.Exception(
                        $"CL We don't have requested type mapped '{System.Type.GetTypeCode(typeof(T))}', please ticket this error.");
            }

            if (oT == null)
            {
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";
                throw new System.Exception(
                    $"CL Invoker={invokerPath}* Please add {_configKey} token to your Web.config.");
            }

            return oT;
        }

        [System.ObsoleteAttribute("Esta función en la versión 1.0.16 no estará disponible para que de paso al uso de CL.COMMOM.Core.ContextBroker.")]
        public static System.Int32 ServiceLayerRecordsCount()
        {
            System.Int32 recordsCount = 0;
            if (System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"] is System.Object &&
                (System.Boolean)System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"])
            {
                recordsCount = System.Int32.Parse(System.Web.HttpContext.Current
                    .Items["cl-sl-pagination-records-count"].ToString());
            }

            return recordsCount;
        }

        /// <summary>
        /// Give it a physical path and this function converts it into an 64base string
        /// </summary>
        /// <param name="_filePath">Physical path of your file System.String</param>
        /// <returns>64base stringed file</returns>
        public static System.String FileToBase64(System.String _filePath)
        {
            try
            {
                System.Byte[] ContentBytes;

                using (System.IO.FileStream FileStream = System.IO.File.OpenRead(_filePath))
                {
                    using (System.IO.MemoryStream MemoryStream = new System.IO.MemoryStream())
                    {
                        FileStream.CopyTo(MemoryStream);
                        ContentBytes = MemoryStream.ToArray();
                        MemoryStream.Close();
                    }

                    FileStream.Close();
                }

                System.String base64file = System.Convert.ToBase64String(ContentBytes);
                ContentBytes = null;

                return base64file;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Maps an exception into a string
        /// </summary>
        /// <param name="_exception">Exception to be mapped</param>
        /// <returns>String with message of the exception</returns>
        public static System.String GetException(System.Exception _exception)
        {
            try
            {
                System.String name = _exception.TargetSite.DeclaringType.FullName + "." + _exception.TargetSite.Name;
                System.Int32 code = _exception.InnerException != null
                    ? _exception.InnerException.InnerException != null
                        ? _exception.InnerException.InnerException.HResult
                        : _exception.InnerException.HResult
                    : _exception.HResult;
                System.String message = _exception.InnerException != null
                    ? _exception.InnerException.InnerException != null
                        ? _exception.InnerException.InnerException.Message
                        : _exception.InnerException.Message
                    : _exception.Message;

                message = $"{message} {code}.  Caused by {name}";

                return message;
            }
            catch
            {
                return _exception.Message;
            }
        }

        /// <summary>
        /// Gets a value from the current context by its key
        /// </summary>
        /// <param name="_key">Token of the stored value</param>
        /// <returns>An stringed value</returns>
        public static System.String GetPipeValue(System.String _key)
        {
            try
            {
                System.Security.Claims.ClaimsPrincipal oClaimsPrincipal =
                    (System.Security.Claims.ClaimsPrincipal)System.Threading.Thread.CurrentPrincipal;
                return System.Convert.ToString(oClaimsPrincipal.Claims.Where(c => c.Type.Equals(_key)).Single().Value);
            }
            catch
            {
                return null;
            }
        }

        public static System.String DicToXml(
            System.Collections.Generic.Dictionary<System.String, System.String> _definitions,
            System.String _fileName)
        {
            System.String file = System.IO.Path.GetDirectoryName(
                System.Reflection.Assembly.GetExecutingAssembly().Location) + $"\\{_fileName}.xml";

            if (System.IO.File.Exists(file))
            {
                System.IO.File.Delete(file);
            }

            System.String definitions = System.String.Empty;
            foreach (System.Collections.Generic.KeyValuePair<System.String, System.String> kvp in _definitions)
            {
                if (kvp.Key.Contains(" "))
                    throw new System.Exception(
                        $"CL Key {kvp.Key} contains spaces in its definitions. Xml key can not have a white space");

                definitions += $"<{kvp.Key}>{kvp.Value}</{kvp.Key}>";
            }

            System.String serializedXml = $"<?xml version=\"1.0\"?>" +
                                          $"<Definitions>{definitions}</Definitions>";

            System.IO.File.WriteAllText(file, serializedXml);

            return file;
        }

        public static System.Type GetType(System.Type _type)
            => System.Nullable.GetUnderlyingType(_type) is System.Object &&
               System.Nullable.GetUnderlyingType(_type).IsValueType
                ? typeof(System.Nullable<>).MakeGenericType(_type)
                : _type;

        /// <summary>
        /// The primary purpose of this method is to read the data from the input stream and store it in memory as a byte array
        /// </summary>
        /// <param name="_input">The stream to convert in a memory byte array</param>
        /// <returns>Stream converted in a byte array</returns>
        public static byte[] StreamToBytes(System.IO.Stream _input)
        {
            try
            {
                byte[] buffer = new byte[16 * 1024];

                using (System.IO.MemoryStream ms = new System.IO.MemoryStream())
                {
                    int read;

                    while ((read = _input.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        ms.Write(buffer, 0, read);
                    }

                    return ms.ToArray();
                }
            }
            finally
            {
                if (_input != null)
                {
                    _input.Dispose();
                    _input.Close();
                }
            }
        }
        #endregion

        #region Generics

        /// <summary>
        /// Returns user id. You must set a key in the claim with UserId
        /// </summary>
        /// <returns>User id</returns>
        public static System.Int32 GetClaimUserId()
        {
            return GetClaimValue<System.Int32>("UserId");
        }

        /// <summary>
        /// Allow to read a key from the header plot.
        /// </summary>
        /// <typeparam name="T">Type of casting</typeparam>
        /// <param name="_key">Token to be readed from header plot</param>
        /// <param name="_isOptional">Optional parameter to throw a exception if required</param>
        /// <returns>A casted value to T</returns>
        public static T GetClaimValue<T>(System.String _key, System.Boolean _isOptional = false)
        {
            System.String keyClaimValue = System.String.Empty;
            try
            {
                System.Security.Claims.ClaimsPrincipal oClaimsPrincipal =
                    (System.Security.Claims.ClaimsPrincipal)System.Threading.Thread.CurrentPrincipal;
                keyClaimValue = System.Convert.ToString(oClaimsPrincipal.Claims.Where(c => c.Type.Equals(_key))
                    .FirstOrDefault()?.Value);

                if (System.String.IsNullOrEmpty(keyClaimValue) && _isOptional) return default;

                if (System.String.IsNullOrEmpty(keyClaimValue) && !_isOptional)
                    throw new System.Exception($"CL - Empty or null value of {_key}");

                T inVariable = default;

                switch (System.Type.GetTypeCode(typeof(T)))
                {
                    case System.TypeCode.Int32:
                        inVariable = (T)(System.Object)System.Convert.ToInt32(keyClaimValue);
                        break;
                    case System.TypeCode.String:
                        inVariable = (T)(System.Object)keyClaimValue;
                        break;
                    case System.TypeCode.Single:
                        inVariable = (T)(System.Object)System.Convert.ToSingle(keyClaimValue);
                        break;
                    case System.TypeCode.Decimal:
                        inVariable = (T)(System.Object)System.Convert.ToDecimal(keyClaimValue);
                        break;
                    case System.TypeCode.Double:
                        inVariable = (T)(System.Object)System.Convert.ToDouble(keyClaimValue);
                        break;
                    case System.TypeCode.Char:
                        inVariable = (T)(System.Object)System.Convert.ToChar(keyClaimValue);
                        break;
                    case System.TypeCode.Boolean:
                        inVariable = (T)(System.Object)System.Convert.ToBoolean(keyClaimValue);
                        break;
                    default:
                        throw new System.Exception(
                            $"CL We don't have requested type mapped '{System.Type.GetTypeCode(typeof(T))}', please ticket this error.");
                }

                return inVariable;
            }
            catch (System.Exception exception)
            {
                if (_isOptional) return default;

                throw new System.Exception(
                    $"CL Check your claims content. {_key}: {keyClaimValue} could not be found. Usually is an expired token: {GetException(exception)}");
            }
        }

        /// <summary>
        /// Creates an object from a _data table (Its a wrapper of FillObject method) System.Data.DataTable
        /// </summary>
        /// <param name="_dt">Tabla del DataSet que contiene los datos del objeto a mapear</param>
        /// <returns>Retorna el tipo de objeto a llenar</returns>
        public static T InflateObject<T>(System.Data.DataTable _dt) where T : new()
        {
            return _dt.Rows.Count >= 1
                ? Internals.FillObject<T>(System.Reflection.MethodBase.GetCurrentMethod().Name, _dt.Rows[0], _dt.Columns)
                : default;
        }

        /// <summary>
        /// Creates an objects list from a _data table
        /// </summary>
        /// <param name="_dt">Data table with the records to be mapped System.Data.DataTable</param>
        /// <returns>A list of mapped objects from a _data table</returns>
        public static System.Collections.Generic.List<T> InflateList<T>(System.Data.DataTable _dt) where T : new()
        {
            System.Collections.Generic.List<T> list = new System.Collections.Generic.List<T>();
            if (_dt.Rows.Count >= 1)
            {
                foreach (System.Data.DataRow row in _dt.Rows)
                {
                    T objectT = Internals.FillObject<T>(System.Reflection.MethodBase.GetCurrentMethod().Name, row, _dt.Columns);
                    list.Add(objectT);
                }
            }

            return list;
        }

        /// <summary>
        /// Creates a list of odbc parameters with an object properties
        /// </summary>
        /// <typeparam name="T">Object to map into list</typeparam>
        /// <typeparam name="U">To determinate ignore/include properties</typeparam>
        /// <param name="_invoker">Method which is calling this methos</param>
        /// <param name="_object">Object which contains data to be mapped</param>
        /// <param name="_toIgnore">List of properties to be excluded/inclued</param>
        /// <returns>A list of Odbc parameters</returns>
        public static System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> ParametersBuilder<T, U>(
            System.String _invoker, T _object, System.String[] _toIgnore)
            where T : new() where U : CL.STRUCTURES.INTERFACES.ICLMaster
        {
            // Dummy validations
            if (_object == null)
                throw new System.Exception(
                    "CL You are trying to build a query filter with a null object. Please provide an instance of an object");

            // end of dummy validations

            System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> buildedParameters =
                new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

            System.Reflection.PropertyInfo[] properties =
                _object.GetType().GetProperties().OrderBy(x => x.Name).ToArray();

            if (_toIgnore is null)
            {
                System.Int32 PROPERTIES_COUNT = _object.GetType().GetProperties().Length;

                for (System.Int32 c = 0; c < PROPERTIES_COUNT; c++)
                {
                    try
                    {
                        if (properties[c].GetValue(_object) is System.Object)
                        {
                            Internals.AddItemsToBuildedFilter<T>(properties[c], buildedParameters, _object);
                        }
                        else
                        {
                            buildedParameters.Add(new System.Data.Odbc.OdbcParameter($"@{properties[c].Name}",
                                System.DBNull.Value)
                            { IsNullable = true });
                        }
                    }
                    catch (System.Exception ex)
                    {
                        throw new System.Exception(
                            $"Invoker={_invoker}* Parameter <{properties[c].Name}> {ex.Message}");
                    }
                }


                return buildedParameters;
            }

            System.Collections.Generic.List<System.String> propertiesToIgnore =
                new System.Collections.Generic.List<System.String>(_toIgnore);

            // This check is to validate if we have to include or exclude properties from the list
            if (typeof(U) == typeof(CL.STRUCTURES.INTERFACES.ICLInclude))
            {
                System.Int32 PROPERTIES_COUNT = _toIgnore.Length;

                for (System.Int32 c = 0; c < PROPERTIES_COUNT; c++)
                {
                    System.Reflection.PropertyInfo oPropertyInfo = _object.GetType().GetProperty(_toIgnore[c]);

                    // Validates if user misses a property name
                    if (oPropertyInfo is null) continue;

                    Internals.AddItemsToBuildedFilter<T>(oPropertyInfo, buildedParameters, _object);
                }
            }
            else
            {
                propertiesToIgnore = new System.Collections.Generic.List<System.String>(_toIgnore);

                System.Int32 PROPERTIES_COUNT = _object.GetType().GetProperties().Length;

                for (System.Int32 c = 0; c < PROPERTIES_COUNT; c++)
                {
                    try
                    {
                        // Checks if a property should be ignored
                        if (propertiesToIgnore is System.Object &&
                            propertiesToIgnore.Find(x => x.Equals(properties[c].Name)) is System.Object) continue;

                        if (properties[c].GetValue(_object) is System.Object)
                        {
                            Internals.AddItemsToBuildedFilter<T>(properties[c], buildedParameters, _object);
                        }
                        else
                        {
                            buildedParameters.Add(
                                new System.Data.Odbc.OdbcParameter($"@{properties[c].Name}", System.DBNull.Value)
                                {
                                    IsNullable = true
                                }
                            );
                        }
                    }
                    catch (System.Exception ex)
                    {
                        throw new System.Exception(
                            $"Invoker={_invoker}* Parameter <{properties[c].Name}> {ex.Message}");
                    }
                }
            }

            return buildedParameters;
        }

        /// <summary>
        /// Allow to read a key from the header plot.
        /// </summary>
        /// <typeparam name="T">Type of casting</typeparam>
        /// <param name="_httpRequestMessage">Context of current request</param>
        /// <param name="_key">Token to be readed from header plot</param>
        /// <param name="_isOptional">Optional parameter to throw a exception if required</param>
        /// <returns>A casted value to T</returns>
        public static T GetHeaderValue<T>(System.Net.Http.HttpRequestMessage _httpRequestMessage, System.String _key,
            System.Boolean _isOptional = false)
        {
            try
            {
                System.String headerKeyValue = _httpRequestMessage.Headers.GetValues(_key).FirstOrDefault();

                T inVariable = default;

                switch (System.Type.GetTypeCode(typeof(T)))
                {
                    case System.TypeCode.Int32:
                        inVariable = (T)(System.Object)System.Convert.ToInt32(headerKeyValue);
                        break;
                    case System.TypeCode.String:
                        inVariable = (T)(System.Object)headerKeyValue;
                        break;
                    case System.TypeCode.Single:
                        inVariable = (T)(System.Object)System.Convert.ToSingle(headerKeyValue);
                        break;
                    case System.TypeCode.Decimal:
                        inVariable = (T)(System.Object)System.Convert.ToDecimal(headerKeyValue);
                        break;
                    case System.TypeCode.Double:
                        inVariable = (T)(System.Object)System.Convert.ToDouble(headerKeyValue);
                        break;
                    case System.TypeCode.Char:
                        inVariable = (T)(System.Object)System.Convert.ToChar(headerKeyValue);
                        break;
                    case System.TypeCode.Boolean:
                        inVariable = (T)(System.Object)System.Convert.ToBoolean(headerKeyValue);
                        break;
                    default:
                        throw new System.Exception(
                            $"CL We don't have requested type mapped '{System.Type.GetTypeCode(typeof(T))}', please ticket this error.");
                }

                return inVariable;
            }
            catch (System.Exception exception)
            {
                if (_isOptional) return default;

                throw new System.Exception(
                    $"CL Can not map or find {_key}, check your headers plot. {GetException(exception)}");
            }
        }

        /// <summary>
        /// Replace a raw service layer query into a formatted service layer query path
        /// </summary>
        /// <typeparam name="T">Object prototype to be mapped</typeparam>
        /// <param name="_object">Object which is going to be mapped into a service layer query path</param>
        /// <param name="_unparsedQuery">Raw service layer query path</param>
        /// <returns>Formatted and replaced service layer query path</returns>
        public static System.String SLQueryStringBuilder<T>(T _object, System.String _unparsedQuery)
        {
            System.String parsedQuery = System.String.Empty;

            if ((System.Object)_object is null && _unparsedQuery is System.Object) return $"{_unparsedQuery}";
            if ((System.Object)_object is null && _unparsedQuery is null) return null;

            try
            {
                // This validatios is to implement paging in the query string
                System.Int32 indexOfPageSize = _unparsedQuery.IndexOf("odata.maxpagesize=");

                if (indexOfPageSize > 0) _unparsedQuery = _unparsedQuery.Substring(0, indexOfPageSize);
                // End of paging validations

                System.String cache = System.String.Copy(_unparsedQuery);

                // This simple count allows me to know how many parameters are there in the query string
                System.Int32 parametersToReplace = _unparsedQuery.Where(c => c == '@').Count();

                System.Collections.Generic.List<System.String> parametersFound =
                    new System.Collections.Generic.List<System.String>();

                System.Int32 startIndex = 0;
                System.Int32 endIndex = 0;

                for (System.Int32 c = 0; c < parametersToReplace; c++)
                {
                    startIndex = cache.IndexOf("@") + 1;
                    endIndex = cache.IndexOf(" ", startIndex);

                    if (endIndex < 0) endIndex = cache.IndexOf("", startIndex);

                    System.Int32 offset = endIndex - startIndex;

                    if (offset == 0) offset = cache.Length - endIndex;

                    System.String result = cache.Substring(startIndex, offset);

                    if (!System.String.IsNullOrEmpty(result))
                    {
                        parametersFound.Add(result.Replace("(", "").Replace(")", ""));
                    }

                    cache = cache.Substring(startIndex, cache.Length - startIndex);
                }

                System.Int32 parameterFoundCount = parametersFound.Count;

                for (System.Int32 c = 0; c < parameterFoundCount; c++)
                {
                    System.Reflection.PropertyInfo oPropertyInfo = _object.GetType().GetProperty(parametersFound[c]);

                    if (oPropertyInfo is null) continue;

                    switch (System.Type.GetTypeCode(oPropertyInfo.GetValue(_object).GetType()))
                    {
                        case System.TypeCode.Int32:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"{(System.Int32)oPropertyInfo.GetValue(_object)}");
                            break;
                        case System.TypeCode.String:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"'{(System.String)oPropertyInfo.GetValue(_object)}'");
                            break;
                        case System.TypeCode.Decimal:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"{(System.Decimal)oPropertyInfo.GetValue(_object)}");
                            break;
                        case System.TypeCode.Double:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"{(System.Double)oPropertyInfo.GetValue(_object)}");
                            break;
                        case System.TypeCode.Char:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"{(System.Char)oPropertyInfo.GetValue(_object)}");
                            break;
                        case System.TypeCode.Boolean:
                            System.Boolean booleanCast = (System.Boolean)oPropertyInfo.GetValue(_object);
                            System.Int32 mappedBoolean = booleanCast ? 1 : 0;
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}", $"{mappedBoolean}");
                            break;
                        case System.TypeCode.DateTime:
                            _unparsedQuery = _unparsedQuery.Replace($"@{parametersFound[c]}",
                                $"'{(System.DateTime)oPropertyInfo.GetValue(_object)}'");
                            break;
                        default:
                            throw new System.Exception(
                                $"CL We don't have requested type mapped '{System.Type.GetTypeCode(typeof(T))}', please ticket this error.");
                    }
                } // this is the for end

                return _unparsedQuery;
            }
            catch
            {
                throw;
            }
        }

        /// <summary>
        /// Creates a list of odbc parameters with an object properties
        /// </summary>
        /// <typeparam name="T">Object to map into list</typeparam>
        /// <param name="_invoker">Method which is calling this methos</param>
        /// <param name="_object">Object which contains data to be mapped</param>
        /// <returns>A list of Odbc parameters</returns>
        public static System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> ParametersBuilder<T>(
            System.String _invoker, T _object)
        {
            // Nullability must be checked as usually in generics
            if (_object == null)
                throw new System.ArgumentNullException(nameof(_object));

            System.Collections.Generic.List<System.Data.Odbc.OdbcParameter> parameters =
                new System.Collections.Generic.List<System.Data.Odbc.OdbcParameter>();

            System.Reflection.PropertyInfo[] properties = _object.GetType().GetProperties();

            for (System.Int32 c = 0; c < properties.Length; c++)
            {
                try
                {
                    // Checks if a property should be ignored
                    if (properties[c].GetValue(_object) is System.Object)
                    {
                        Internals.AddItemsToBuildedFilter<T>(properties[c], parameters, _object);
                    }
                    else
                    {
                        parameters.Add(
                            new System.Data.Odbc.OdbcParameter($"@{properties[c].Name}", System.DBNull.Value));
                    }
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception($"Invoker={_invoker}* Parameter <{properties[c].Name}> {ex.Message}");
                }
            }

            return parameters;
        }

        // Dejo este codigo comentado porque no descartamos dar soporte para transcciones especificas de service layer
        ///// <summary>
        ///// 
        ///// </summary>
        ///// <typeparam name="T"></typeparam>
        ///// <typeparam name="U"></typeparam>
        ///// <param name="_httpResponseMessage"></param>
        ///// <param name="_invoker"></param>
        ///// <returns></returns>
        //public static CL.STRUCTURES.CLASSES.CLContext<System.Collections.Generic.List<T>> SLResolve<T, U, V>(System.Net.Http.HttpResponseMessage _httpResponseMessage, System.Reflection.MethodBase _invoker)
        //    where T : new() where U : CL.STRUCTURES.INTERFACES.ICLGet
        //{
        //    System.String message = null;

        //    System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK;
        //    try
        //    {
        //        if (!_httpResponseMessage.IsSuccessStatusCode)
        //        {
        //            bool isValidError = false;
        //            string errorMessage = System.String.Empty; string invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";
        //            try
        //            {
        //                CL.STRUCTURES.CLASSES.CLSLResponse oSLResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.CLSLResponse>(_httpResponseMessage.Content.ReadAsStringAsync().Result);
        //                isValidError = true;
        //                errorMessage = System.String.Concat(oSLResponse.error.code, " - ", oSLResponse.error.message.value);
        //            }
        //            catch (System.Exception ex)
        //            {
        //                throw new System.Exception(System.String.Concat(ex?.Message ?? ex?.InnerException?.Message, " No se pudo mapear la respuesta. ", _httpResponseMessage.Content.ReadAsStringAsync().Result, " On ", invokerPath));
        //            }
        //            if (isValidError)
        //            {
        //                throw new System.Exception(System.String.Concat(errorMessage, " On ", invokerPath));
        //            }
        //        }

        //        CL.STRUCTURES.CLASSES.SLGet<System.Collections.Generic.List<T>, CL.STRUCTURES.INTERFACES.ICLGet> oT = Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.SLGet<System.Collections.Generic.List<T>, CL.STRUCTURES.INTERFACES.ICLGet>>(_httpResponseMessage.Content.ReadAsStringAsync().Result);

        //        if (!(oT is object) || oT.value.Count == 0)
        //        {
        //            message = "No records found";
        //            code = System.Net.HttpStatusCode.OK;
        //        }

        //        CL.STRUCTURES.CLASSES.CLContext<System.Collections.Generic.List<T>> oCLContext = new CL.STRUCTURES.CLASSES.CLContext<System.Collections.Generic.List<T>>()
        //        {
        //            Response = new CL.STRUCTURES.CLASSES.Response<System.Collections.Generic.List<T>>()
        //            {
        //                Data = oT.value,
        //                Message = message
        //            },
        //            Code = code
        //        };

        //        return oCLContext;
        //    }
        //    catch
        //    {
        //        throw;
        //    }
        //}

        public static System.Collections.Generic.Dictionary<System.String, System.String> StringToDictionary(
            System.String _queryString)
        {
            System.Collections.Generic.Dictionary<System.String, System.String> mDic =
                new System.Collections.Generic.Dictionary<System.String, System.String>();
            System.Collections.Generic.List<System.String> keys = new System.Collections.Generic.List<System.String>();
            System.Collections.Generic.List<System.String> trunkedKeys =
                new System.Collections.Generic.List<System.String>();
            System.Int32 initialOffset = 0;
            for (System.Int32 c = 0; c < _queryString.Length; c++)
            {
                if (_queryString[c] == '=')
                {
                    System.Boolean isProcessed = false;
                    for (System.Int32 d = c; d >= 0; d--)
                    {
                        if (_queryString[d] == '&')
                        {
                            System.String keyName = _queryString.Substring(d + 1, c - 1 - d);
                            if (keyName.Contains('='))
                            {
                                keyName = keyName.Split('=').LastOrDefault();
                                trunkedKeys.Add(keyName);
                            }


                            mDic.Add(keyName, System.String.Empty);
                            keys.Add(keyName);

                            isProcessed = true;
                            break;
                        }
                    }

                    if (!isProcessed)
                    {
                        System.String keyName = _queryString.Substring(1, c - 1);
                        mDic.Add(keyName, System.String.Empty);
                        keys.Add(keyName);
                    }
                }
            }

            for (System.Int32 c = 0; (c + 1) < keys.Count; c++)
            {
                if (trunkedKeys.Any(x => x.Equals(keys[c + 1]))) continue;
                System.Int32 firstIndex = _queryString.IndexOf(keys[c] + '=') + (keys[c] + '=').Length;
                System.Int32 secondIndex = _queryString.LastIndexOf(keys[c + 1] + '=') - 1;
                System.Int32 rightOffset = firstIndex - secondIndex;
                if (rightOffset >= 0)
                {
                    System.String gg = _queryString.Substring(firstIndex, rightOffset);
                    mDic.Remove(keys[c]);
                    mDic.Add(keys[c], gg);
                }
                else
                {
                    System.String gg = _queryString.Substring(firstIndex, secondIndex - firstIndex);
                    mDic.Remove(keys[c]);
                    mDic.Add(keys[c], gg);
                }
            }

            if (mDic.Count > 0)
            {
                mDic.Remove(keys[keys.Count - 1]);
                System.String value = _queryString.Substring(
                    _queryString.IndexOf(keys[keys.Count - 1] + '=') + (keys[keys.Count - 1] + '=').Length,
                    _queryString.Length - (_queryString.IndexOf(keys[keys.Count - 1] + '=') +
                                           (keys[keys.Count - 1] + '=').Length));
                mDic.Add(keys[keys.Count - 1], value);
            }
            else
            {
                System.String value = _queryString.Split('=')[1];
                System.String key = _queryString.Split('=')[0].Substring(1);
                mDic.Add(key, value);
            }

            return mDic;
        }



        public static System.String GetHttpContextItem(System.String _key)
        {
            System.Object value = System.Web.HttpContext.Current.Items[_key];

            if (value is System.Object)
            {
                throw new System.Exception($"CL The current context value for '{_key}' was not supplied");
            }

            return System.Convert.ToString(value);
        }

        #endregion

        #region Emails

        public static void SendEmail(
            CL.STRUCTURES.CLASSES.Email.EmailCredential _emailCredential,
            CL.STRUCTURES.CLASSES.Email.EmailDetails _emailDetails)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Ssl3 | System.Net.SecurityProtocolType.Tls12 |
                                                              System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls;

            using (System.Net.Mail.MailMessage message = new System.Net.Mail.MailMessage())
            {
                using (System.Net.Mail.SmtpClient SmtpServer = new System.Net.Mail.SmtpClient(_emailCredential.Host))
                {
                    message.From = new System.Net.Mail.MailAddress(_emailCredential.Account, "", System.Text.Encoding.UTF8);
                    message.Sender = new System.Net.Mail.MailAddress(_emailCredential.Account, "",
                        System.Text.Encoding.UTF8);
                    SmtpServer.Port = _emailCredential.Port;
                    SmtpServer.Credentials =
                        new System.Net.NetworkCredential(_emailCredential.Account, _emailCredential.Password);
                    SmtpServer.EnableSsl = _emailCredential.Ssl;

                    if (_emailDetails.EmailsTo is System.Object)
                    {
                        foreach (System.String email in _emailDetails.EmailsTo)
                        {
                            message.To.Add(email);
                        }
                    }

                    if (_emailDetails.EmailsCC is System.Object)
                    {
                        foreach (System.String email in _emailDetails.EmailsCC)
                        {
                            message.CC.Add(email);
                        }
                    }

                    if (!System.String.IsNullOrEmpty(_emailDetails.Subject))
                    {
                        message.Subject = _emailDetails.Subject;
                    }
                    else
                    {
                        message.Subject = _emailCredential.Subject;
                    }

                    message.IsBodyHtml = true;
                    message.BodyEncoding = System.Text.UTF8Encoding.UTF8;
                    message.DeliveryNotificationOptions = System.Net.Mail.DeliveryNotificationOptions.OnFailure;
                    message.Body = _emailDetails.Body;

                    System.Collections.Generic.List<System.IO.Stream> attachedFiles = new System.Collections.Generic.List<System.IO.Stream>();

                    try
                    {
                        if (_emailDetails.EmailFiles is System.Object)
                        {
                            foreach (CL.STRUCTURES.CLASSES.Email.EmailFile file in _emailDetails.EmailFiles)
                            {
                                if (!System.String.IsNullOrEmpty(file.Base64))
                                {
                                    System.Byte[] bytes = System.Convert.FromBase64String(file.Base64);

                                    System.IO.Stream stream = new System.IO.MemoryStream(bytes);

                                    attachedFiles.Add(stream);

                                    System.String fullFileName = $"{file.FileName}.{file.Extention}";

                                    message.Attachments.Add(new System.Net.Mail.Attachment(stream, fullFileName, file.FileType));
                                }
                            }
                        }

                        SmtpServer.Send(message);
                    }
                    finally
                    {
                        foreach (var attachedFile in attachedFiles)
                        {
                            try
                            {
                                attachedFile.Close();
                                attachedFile.Dispose();
                            }
                            catch
                            {
                                // ignored
                            }
                        }
                    }
                }
            }
        }

        #endregion


    }
}