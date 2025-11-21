using System.Linq;

namespace CL.SL.Extensions
{
    internal class Internals : CL.STRUCTURES.INTERFACES.ServiceLayer.ISlInternals
    {
        public void ValidateUserContext(CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext)
        {
            _ = _userContext ??
                throw new System.ArgumentNullException(nameof(_userContext));

            _ = _userContext.Resource ??
                throw new System.ArgumentNullException(nameof(_userContext.Resource));

            _ = _userContext.SLUrl ??
                throw new System.ArgumentNullException(nameof(_userContext.SLUrl));

            _ = _userContext.ResourceType ??
                throw new System.ArgumentNullException(nameof(_userContext.ResourceType));
        }

        public System.String ServiceLayerUrlPatcher<TObject>(TObject _target, System.String _resource)
        {
            System.Type t = _target.GetType();
            System.Int32 masterKeysCounter = 0;
            System.String mappedResource = System.String.Empty;

            foreach (System.Reflection.PropertyInfo property in t.GetProperties())
            {
                foreach (System.Object customAttribute in property.GetCustomAttributes(true))
                {
                    try
                    {
                        CL.STRUCTURES.ATTRIBUTES.MasterKey oMasterKey =
                            (CL.STRUCTURES.ATTRIBUTES.MasterKey)customAttribute;
                        if (oMasterKey is System.Object)
                        {
                            System.Object mValue = property.GetValue(_target);
                            switch (System.Type.GetTypeCode(mValue.GetType()))
                            {
                                case System.TypeCode.Int32:
                                    mappedResource = $"{_resource}({System.Convert.ToInt32(mValue)})";
                                    break;
                                case System.TypeCode.String:
                                    mappedResource = $"{_resource}('{mValue.ToString()}')";
                                    break;
                                default:
                                    throw new System.Exception(
                                        $"CL We don't have requested type mapped '{System.Type.GetTypeCode(typeof(TObject))}', please ticket this error.");
                            }

                            masterKeysCounter++;
                        }
                    }
                    catch
                    {
                        // ignored
                    }
                }
            }

            if (masterKeysCounter == 0)
                throw new System.Exception("CL You must add MasterKey to your model");

            if (masterKeysCounter > 1)
                throw new System.Exception("CL You must add only one MasterKey peer model. Please check your model");

            return mappedResource;
        }

        public CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject ServiceLayerWriter<TObject>(
            CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext
            , System.String _method
            , TObject _target = default
            , System.String _fieldsToRemoveInHeaders = null
            , System.String _fieldsToRemoveInLines = null
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs = null
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs = null
            , System.String _lineObjectName = null
            // Business implementation start
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
        // Business implementation end
        )
        {
            if (!(_target is System.Object))
                throw new System.ArgumentNullException(nameof(_target));

            ValidateUserContext(_userContext);

            if (!_userContext.ResourceType.Equals("SW"))
                throw new System.Exception(
                    "CL You must provide a SW type object. Pleas check your CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext instance content.");

            System.String urlBase = _userContext.SLUrl;

            _fieldsToRemoveInHeaders = _fieldsToRemoveInHeaders ?? "";
            _fieldsToRemoveInLines = _fieldsToRemoveInLines ?? "";

            Newtonsoft.Json.Linq.JObject mappedObject = BuildServiceLayerObject(
                _target
                , _fieldsToRemoveInHeaders.Split(',')
                , _fieldsToRemoveInLines.Split(',')
                , _headerUdfs
                , _lineUdfs
                , _lineObjectName
                , _headerFlushConditions
                , _lineFlushConditions);

            System.String serializedContent = Newtonsoft.Json.JsonConvert.SerializeObject(mappedObject);

            System.String masterKey = _method.Equals("POST")
                ? _userContext.Resource
                : ServiceLayerUrlPatcher(_target, _userContext.Resource);

            System.String endpoint = System.String.Concat(urlBase, masterKey);

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject =
                new CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject()
                {
                    Url_Base = urlBase,
                    Login = new CL.STRUCTURES.CLASSES.ServiceLayer.Login
                    {
                        Url = $"Login",
                        Method = "POST",
                        Content = new CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent
                        {
                            CompanyDB = _userContext.DBCode,
                            UserName = _userContext.License,
                            Password = _userContext.Password
                        }
                    },
                    Content = serializedContent,
                    Url_Request = endpoint,
                    Method = _method
                };

            return oSlRequestObject;
        }

        public TObject QueryStringReader<TObject>()
        {
            System.Object rawInjector =
                System.Web.HttpContext.Current.Items["qs-injector"]
                ?? throw new System.Exception(
                    "CL You are not using CL.COMMON.ActionFilters.QueryStringExposer method to expose your controller query.");

            System.String queryString = rawInjector.ToString();

            System.Collections.Generic.Dictionary<System.String, System.String> mappedQueryString =
                CL.COMMON.Core.StringToDictionary(queryString);

            System.String serializeObject = Newtonsoft.Json.JsonConvert.SerializeObject(mappedQueryString);

            return Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(serializeObject);
        }




        /// <summary>
        ///   This function is used to map the batch response from Service Layer to a CLContext object.
        /// </summary>
        /// <typeparam name="TObject">The type of object to be mapped, in this case must be BatchResponse type</typeparam>
        /// <param name="_httpResponseMessage"></param>
        /// <param name="_invoker"></param>
        /// <param name="batchBoundary"></param>
        /// <param name="_slRequestObject">The Service Layer request object.</param>
        /// <param name="_reponseContent">The MIME response content.</param>
        /// <returns>A CLContext containing the mapped object.</returns>
        private CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse SlUnmmapedResolve(
            System.Net.Http.HttpResponseMessage _httpResponseMessage
            , System.Reflection.MethodBase _invoker)
        {

            System.String message = System.String.Empty;

            System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK;

            if (!_httpResponseMessage.IsSuccessStatusCode)
            {
                System.Boolean isValidError = false;
                System.String errorMessage;
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";

                try
                {
                    CL.STRUCTURES.CLASSES.Rebound.CLSLResponse oSlResponse =
                        Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.Rebound.CLSLResponse>(
                            _httpResponseMessage.Content.ReadAsStringAsync().Result);
                    errorMessage = System.String.Concat(oSlResponse.error.message.value, $"{oSlResponse.error.code}");
                    isValidError = true;
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception(System.String.Concat(ex?.Message ?? ex?.InnerException?.Message,
                        $" Response can't be mapped. ",
                        _httpResponseMessage.Content.ReadAsStringAsync().Result +
                        $"StatusCode: {_httpResponseMessage.StatusCode}", " Caused by ", invokerPath));
                }

                if (isValidError)
                {
                    throw new CL.STRUCTURES.CLASSES.Exceptions.CLException(
                        System.String.Concat(errorMessage, " Caused by ", invokerPath),
                        _httpResponseMessage.StatusCode);
                }
            }

            string responseContent = _httpResponseMessage.Content.ReadAsStringAsync().Result;

            CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse unmappedResponses =
                new CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse()
                {
                    StringResponse = responseContent
                };

            return unmappedResponses;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="_httpResponseMessage"></param>
        /// <param name="_invoker"></param>
        /// <param name="_method"></param>
        /// <typeparam name="TObject"></typeparam>
        /// <returns></returns>
        /// <exception cref="System.Exception"></exception>
        /// <exception cref="STRUCTURES.CLASSES.Exceptions.CLException"></exception>
        public CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> SlResolve<TObject>(
            System.Net.Http.HttpResponseMessage _httpResponseMessage
            , System.Reflection.MethodBase _invoker
            , System.String _method)
            where TObject : new()
        {
            /*
             THIS FUNCTION SHOULD BE REFACTORED TO AVOID DUPLICATED CODE WHIT ANY OVERLOAD THAT HAS
             */

            System.String message = System.String.Empty;
            TObject oTObject = default;
            System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK;

            if (!_httpResponseMessage.IsSuccessStatusCode)
            {
                System.Boolean isValidError = false;
                System.String errorMessage;
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";

                try
                {
                    CL.STRUCTURES.CLASSES.Rebound.CLSLResponse oSlResponse =
                        Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.Rebound.CLSLResponse>(
                            _httpResponseMessage.Content.ReadAsStringAsync().Result);
                    errorMessage = System.String.Concat(oSlResponse.error.message.value, $"{oSlResponse.error.code}");
                    isValidError = true;
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception(System.String.Concat(ex?.Message ?? ex?.InnerException?.Message,
                        $" Response can't be mapped. ",
                        _httpResponseMessage.Content.ReadAsStringAsync().Result +
                        $"StatusCode: {_httpResponseMessage.StatusCode}", " Caused by ", invokerPath));
                }

                if (isValidError)
                {
                    throw new CL.STRUCTURES.CLASSES.Exceptions.CLException(
                        System.String.Concat(errorMessage, " Caused by ", invokerPath),
                        _httpResponseMessage.StatusCode);
                }
            }

            System.Net.HttpStatusCode fallbackEmptyStatusCode = System.Net.HttpStatusCode.NoContent;
            System.Net.HttpStatusCode fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;

            if (_method.Equals("GET"))
            {
                System.Type oType = typeof(TObject);
                fallbackEmptyStatusCode = System.Net.HttpStatusCode.NotFound;
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;
                CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<TObject> deserializeObject =
                    Newtonsoft.Json.JsonConvert
                        .DeserializeObject<
                            CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<TObject>>(_httpResponseMessage.Content
                            .ReadAsStringAsync()
                            .Result);

                oTObject = deserializeObject.value;
            }
            else if (_method.Equals("POST"))
            {
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.Created;
                oTObject = Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(_httpResponseMessage.Content
                    .ReadAsStringAsync().Result);
            }
            else if (_method.Equals("PATCH"))
            {
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;

                oTObject = Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(_httpResponseMessage.Content
                    .ReadAsStringAsync().Result);
            }

            TObject adapterObject = default;

            code = fallbackEmptyStatusCode;
            // Used only to return properly message
            if (oTObject == null && (_method.Equals("POST") || _method.Equals("PATCH")))
            {
                message = "No record returned";
            }
            else if (oTObject == null && _method.Equals("GET"))
            {
                message = "No records returned";
            }
            else
            {
                code = fallbackSuccessStatusCode;
                adapterObject = oTObject;
            }

            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> oClContext =
                new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                {
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                    {
                        Data = adapterObject,
                        Message = message
                    },
                    Code = code
                };

            return oClContext;
        }

        public CL.STRUCTURES.CLASSES.Rebound.CLContext<T> SlResolve<T>(
            System.Reflection.MethodBase _invoker
            , System.Net.Http.HttpResponseMessage _httpResponseMessage)
            where T : new()
        {
            System.String message = null;

            /*
             THIS FUNCTION SHOULD BE REFACTORED TO AVOID DUPLICATED CODE WHIT ANY OVERLOAD THAT HAS
             */

            System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK;
            if (!_httpResponseMessage.IsSuccessStatusCode)
            {
                System.Boolean isValidError = false;
                System.String errorMessage = System.String.Empty;
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";
                try
                {
                    CL.STRUCTURES.CLASSES.Rebound.CLSLResponse oSLResponse =
                        Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.Rebound.CLSLResponse>(
                            _httpResponseMessage.Content.ReadAsStringAsync().Result);
                    isValidError = true;
                    errorMessage = System.String.Concat(oSLResponse.error.code, " ",
                        oSLResponse.error.message.value);
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception(System.String.Concat(ex?.Message ?? ex?.InnerException?.Message,
                        " Service layer response can't be mapped. ",
                        _httpResponseMessage.Content.ReadAsStringAsync().Result, " On ", invokerPath));
                }

                if (isValidError)
                {
                    throw new CL.STRUCTURES.CLASSES.Exceptions.CLException(
                        System.String.Concat(errorMessage, " On ", invokerPath), _httpResponseMessage.StatusCode);
                }
            }

            CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<T>
                oT = Newtonsoft.Json.JsonConvert
                    .DeserializeObject<
                        CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<T>>(_httpResponseMessage.Content.ReadAsStringAsync()
                        .Result);

            T records;

            if (!(oT is System.Object))
            {
                message = "No records found";
                code = System.Net.HttpStatusCode.NotFound;
                records = oT.value;
            }
            else
            {
                records = oT.value;
            }

            if (System.Convert.ToBoolean(System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"]))
            {
                System.Web.HttpContext.Current.Items.Add("cl-sl-pagination-records-count", oT.RecordsCount);
            }

            CL.STRUCTURES.CLASSES.Rebound.CLContext<T> oClContext =
                new CL.STRUCTURES.CLASSES.Rebound.CLContext<T>()
                {
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<T>()
                    {
                        Data = records,
                        Message = message
                    },
                    Code = code
                };

            return oClContext;
        }

        public CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            BuildWithoutQueryString( // this function should be used with queryExposerExtension
                CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _clUserContext
            )
        {
            // This method checks user context integrity
            CheckUserContext(_clUserContext);

            System.String urlBase = _clUserContext.SLUrl;

            System.Boolean isPagingRequired = System.Web.HttpContext.Current != null &&
                !(System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"] is null) &&
                (System.Boolean)System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"];

            System.Int32 indexOfPageSize = System.String.IsNullOrEmpty(_clUserContext.Resource)
                ? 0
                : _clUserContext.Resource.IndexOf("odata.maxpagesize=", System.StringComparison.Ordinal);

            System.String polishedQueryString = null;

            System.String pageHeader = System.String.Empty;
            if (indexOfPageSize > 0)
            {
                polishedQueryString = $"{_clUserContext.Resource.Substring(0, indexOfPageSize)}";

                pageHeader = _clUserContext.Resource.Substring(indexOfPageSize,
                    _clUserContext.Resource.Length - indexOfPageSize);
            }
            else
            {
                polishedQueryString = $"{_clUserContext.Resource}";
            }

            // Inside this condition is not required validate the context because this variable isPagingRequired only will be true if the context exist
            if (isPagingRequired)
            {
                System.Int32 page = (System.Int32)System.Web.HttpContext.Current.Items["cl-sl-pagination-page"];
                System.Int32 pageSize =
                    (System.Int32)System.Web.HttpContext.Current.Items["cl-sl-pagination-page-size"];

                System.Int32 offset = page * pageSize;

                System.String skippedSection = offset > 0 ? $"&$skip={offset}" : "";
                polishedQueryString += polishedQueryString.Contains("?")
                    ? $"&$inlinecount=allpages{skippedSection}"
                    : $"?$inlinecount=allpages{skippedSection}";
                pageHeader = $"odata.maxpagesize={pageSize}";
            }

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject =
                new CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject()
                {
                    Url_Base = urlBase,
                    Login = new CL.STRUCTURES.CLASSES.ServiceLayer.Login
                    {
                        Url = $"Login",
                        Method = "POST",
                        Content = new CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent
                        {
                            CompanyDB = _clUserContext.DBCode,
                            UserName = _clUserContext.License,
                            Password = _clUserContext.Password
                        }
                    },
                    Url_Request = System.String.Concat(urlBase, polishedQueryString),
                    Method = "GET"
                };


            if (indexOfPageSize <= 0 && !isPagingRequired) return oSlRequestObject;

            oSlRequestObject.Headers =
                new System.Collections.Generic.List<
                    System.Collections.Generic.KeyValuePair<System.String, System.String>>
                {
                    new System.Collections.Generic.KeyValuePair<System.String, System.String>("Prefer", pageHeader)
                };

            return oSlRequestObject;
        }

        public CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            BuildFromQueryString<TObject>( // this function should be used with queryExposerExtension
                CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _clUserContext
                , TObject _target
            )
            where TObject : new()
        {
            // This method checks user context integrity
            CheckUserContext(_clUserContext);

            TObject oTObject;

            System.String urlBase = _clUserContext.SLUrl;

            System.Boolean isPagingRequired = System.Web.HttpContext.Current != null &&
                !(System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"] is null) &&
                (System.Boolean)System.Web.HttpContext.Current.Items["cl-sl-pagination-is-enabled"];

            System.Int32 indexOfPageSize = System.String.IsNullOrEmpty(_clUserContext.Resource)
                ? 0
                : System.Math.Max(0,
                    _clUserContext.Resource.IndexOf("odata.maxpagesize=", System.StringComparison.Ordinal));

            System.String polishedQueryString = System.String.Empty;

            System.String serializeObject =
                Newtonsoft.Json.JsonConvert.SerializeObject(_target is System.Object
                    ? _target
                    : QueryStringReader<TObject>());

            oTObject = Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(serializeObject);

            polishedQueryString = !(oTObject is System.Object)
                ? $"{_clUserContext.Resource}"
                : CL.COMMON.Core.SLQueryStringBuilder(oTObject, _clUserContext.Resource);

            System.String pageHeader = _clUserContext.Resource.Substring(indexOfPageSize,
                _clUserContext.Resource.Length - indexOfPageSize);

            // Inside this condition is not required validate the context because this variable isPagingRequired only will be true if the context exist
            if (isPagingRequired)
            {
                System.Int32 page = (System.Int32)System.Web.HttpContext.Current.Items["cl-sl-pagination-page"];
                System.Int32 pageSize =
                    (System.Int32)System.Web.HttpContext.Current.Items["cl-sl-pagination-page-size"];

                System.Int32 offset = page * pageSize;
                System.String skippedSection = offset > 0 ? $"&$skip={offset}" : "";
                polishedQueryString += polishedQueryString.Contains("?")
                    ? $"&$inlinecount=allpages{skippedSection}"
                    : $"?$inlinecount=allpages{skippedSection}";
                pageHeader = $"odata.maxpagesize={pageSize}";
            }

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject =
                new CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject()
                {
                    Url_Base = urlBase,
                    Login = new CL.STRUCTURES.CLASSES.ServiceLayer.Login
                    {
                        Url = $"Login",
                        Method = "POST",
                        Content = new CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent
                        {
                            CompanyDB = _clUserContext.DBCode,
                            UserName = _clUserContext.License,
                            Password = _clUserContext.Password
                        }
                    },
                    Url_Request = System.String.Concat(urlBase, polishedQueryString),
                    Method = "GET"
                };


            if (indexOfPageSize <= 0) return oSlRequestObject;

            oSlRequestObject.Headers =
                new System.Collections.Generic.List<
                    System.Collections.Generic.KeyValuePair<System.String, System.String>>
                {
                    new System.Collections.Generic.KeyValuePair<System.String, System.String>("Prefer", pageHeader)
                };

            return oSlRequestObject;
        }

        public void CheckUserContext(CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext)
        {
            _ = _userContext ??
                throw new System.ArgumentNullException(nameof(_userContext));

            if (System.String.IsNullOrEmpty(_userContext.SLUrl))
                throw new System.ArgumentNullException(nameof(_userContext.SLUrl));

            if (System.String.IsNullOrEmpty(_userContext.License))
                throw new System.ArgumentNullException(nameof(_userContext.License));

            if (System.String.IsNullOrEmpty(_userContext.Password))
                throw new System.ArgumentNullException(nameof(_userContext.Password));

            if (System.String.IsNullOrEmpty(_userContext.DBCode))
                throw new System.ArgumentNullException(nameof(_userContext.DBCode));

            if (System.String.IsNullOrEmpty(_userContext.Resource))
                throw new System.ArgumentNullException(nameof(_userContext.Resource));
        }

        public Newtonsoft.Json.Linq.JObject BuildServiceLayerObject<TObject>(
            TObject _slDocument
            , System.String[] _propertiesToFlushOnHeader
            , System.String[] _propertiesToFlushOnLines
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs
            , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs
            , System.String _lineObjectName = null
            // Business implementation start
            , System.Collections.Generic.Dictionary<System.String,
                System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
            , System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
        // Business implementation end
        )
        {
            Newtonsoft.Json.Linq.JObject jObject =
                (Newtonsoft.Json.Linq.JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(
                    Newtonsoft.Json.JsonConvert.SerializeObject(_slDocument));

            Newtonsoft.Json.Linq.JArray oJArray = null;

            if (jObject[_lineObjectName ?? "DocumentLines"] is System.Object
                && jObject[_lineObjectName ?? "DocumentLines"].HasValues)
            {
                oJArray = (Newtonsoft.Json.Linq.JArray)jObject[_lineObjectName ?? "DocumentLines"];
            }

            Newtonsoft.Json.Linq.JArray headerUdfs = null;
            if (jObject["Udfs"] is System.Object && jObject["Udfs"].HasValues)
            {
                headerUdfs = (Newtonsoft.Json.Linq.JArray)jObject["Udfs"];
            }

            System.Collections.Generic.List<System.String> copyToProperties =
                new System.Collections.Generic.List<System.String>
                    { "BaseLine", "BaseEntry" };

            foreach (System.String property in _propertiesToFlushOnHeader)
            {
                if (jObject.Property(property) != null) jObject.Property(property).Remove();
            }

            // Headers business

            if (_headerFlushConditions is System.Object)
            {
                if (_headerFlushConditions.Keys.Any(System.String.IsNullOrEmpty))
                {
                    throw new System.Exception("CL Any of your delegates token is empty or null");
                }

                foreach (System.Collections.Generic.KeyValuePair<System.String,
                             System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> keyValuePair in
                         _headerFlushConditions)
                {
                    Newtonsoft.Json.Linq.JProperty oJProperty = jObject.Property(keyValuePair.Key);
                    if (oJArray is System.Object && oJProperty is System.Object && keyValuePair.Value(oJProperty))
                        jObject.Remove(keyValuePair.Key);
                }

                _headerFlushConditions.Clear();
            }

            // end headers business
            if (oJArray is System.Object)
            {
                foreach (Newtonsoft.Json.Linq.JObject line in oJArray)
                {
                    Newtonsoft.Json.Linq.JArray lineUdfs = null;
                    if (line["Udfs"] is System.Object && line["Udfs"].HasValues)
                    {
                        lineUdfs = (Newtonsoft.Json.Linq.JArray)line["Udfs"];
                    }

                    for (System.Int32 i = 0; i < copyToProperties.Count; i++)
                    {
                        if (line.Property(copyToProperties[i]) is System.Object)
                        {
                            Newtonsoft.Json.Linq.JToken propVal = line.Property(copyToProperties[i]).Value;

                            if (propVal is System.Object && propVal.Type == Newtonsoft.Json.Linq.JTokenType.Null)
                            {
                                line.Property(copyToProperties[i]).Remove();
                            }
                        }
                    }

                    foreach (System.String property in _propertiesToFlushOnLines)
                    {
                        if (line.Property(property) != null) line.Property(property).Remove();
                    }

                    if (_lineFlushConditions is System.Object)
                    {
                        if (_lineFlushConditions.Keys.Any(System.String.IsNullOrEmpty))
                        {
                            throw new System.Exception("CL Any of your delegates token is empty or null");
                        }

                        foreach (System.Collections.Generic.KeyValuePair<System.String,
                                     System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> keyValuePair in
                                 _lineFlushConditions)
                        {
                            Newtonsoft.Json.Linq.JProperty oJProperty = line.Property(keyValuePair.Key);
                            if (line is System.Object && oJProperty is System.Object && keyValuePair.Value(oJProperty))
                                line.Remove(keyValuePair.Key);
                        }
                    }

                    if (lineUdfs is System.Object)
                    {
                        foreach (Newtonsoft.Json.Linq.JObject oJObject in lineUdfs)
                        {
                            line.Add(
                                new Newtonsoft.Json.Linq.JProperty(oJObject.Property("Name").Value.ToString()
                                    , oJObject.Property("Value").Value));
                        }
                    }
                }

                _lineFlushConditions?.Clear();
                jObject[_lineObjectName ?? "DocumentLines"] = oJArray;
            }


            if (headerUdfs is System.Object)
            {
                foreach (Newtonsoft.Json.Linq.JObject oJObject in headerUdfs)
                {
                    jObject.Add(
                        new Newtonsoft.Json.Linq.JProperty(oJObject.Property("Name").Value.ToString()
                            , oJObject.Property("Value").Value));
                }
            }

            if (jObject["Udfs"] is System.Object)
            {
                jObject.Property("Udfs").Remove();
            }

            return jObject;
        }


        private void ValidateNode(
            Node _node)
        {
            if (_node is null)
            {
                throw new System.NullReferenceException(
                    "CL Failure on _node building. Please see your logs to get more context");
            }

            // Dummy validations
            if (_node.Queue is null)
            {
                throw new System.NullReferenceException("CL Failure with Queue build. Check logs to get more context");
            }

            if (System.String.IsNullOrEmpty(_node.License))
            {
                throw new System.NullReferenceException("CL No license found. Check logs to get more context");
            }

            if (System.String.IsNullOrEmpty(_node.Company))
            {
                throw new System.NullReferenceException("CL No company found. Check logs to get more context.");
            }

            if (_node.HttpClient is null)
            {
                throw new System.NullReferenceException(
                    "CL Failure with HttpClient build. Check your logs to get more context.");
            }

            if (_node.Semaphore is null)
            {
                throw new System.NullReferenceException(
                    "CL Failure with Semaphore build. Check your logs to get more context");
            }
        }

        private System.Net.Http.HttpRequestMessage BuildRequest(Node _node,
            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject requestObject)
        {
            CL.COMMON.LogManager.Record($@"{requestObject.Login.Content.UserName} - {requestObject.Login.Content.CompanyDB} - {requestObject.Method} - {requestObject.Url_Request}");
            return LoadBalancer.Instance.BuildRequest(requestObject);
        }

        private CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> Mapper<TObject>(
            System.Net.Http.HttpResponseMessage _httpResponseMessage
            , System.String _method, System.String _batchBoundary)
            where TObject : new()
        {
            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> context = null;


            System.Type oType = typeof(TObject);

            if (oType.IsGenericType && oType.GetGenericTypeDefinition() == typeof(System.Collections.Generic.List<>))
            {
                context = SlResolve<TObject>(_httpResponseMessage, System.Reflection.MethodBase.GetCurrentMethod(), _method);

            }
            else if (oType == typeof(CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse))
            {
                CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse unmappedResponse = SlUnmmapedResolve(_httpResponseMessage, System.Reflection.MethodBase.GetCurrentMethod());

                context = new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                {
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                    {
                        Data = (TObject)System.Convert.ChangeType(unmappedResponse, typeof(TObject)),
                        Message = "Unmapped response"
                    },
                };
            }
            else
            {
                switch (_method)
                {
                    case "PATCH":
                    case "POST":
                        context
                            = SlResolve<TObject>(_httpResponseMessage,
                                System.Reflection.MethodBase.GetCurrentMethod(), _method);
                        break;
                    case "GET":

                        CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<TObject>>
                            auxiliaryContext
                                = SlResolve<System.Collections.Generic.List<TObject>>(_httpResponseMessage,
                                    System.Reflection.MethodBase.GetCurrentMethod(), _method);

                        TObject mappedObject = default;

                        if (auxiliaryContext is System.Object
                            && auxiliaryContext.Response is System.Object
                            && auxiliaryContext.Response.Data is System.Object)
                            mappedObject = auxiliaryContext.Response.Data.FirstOrDefault();

                        context = new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                        {
                            Code = auxiliaryContext.Code,
                            Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                            {
                                Data = mappedObject,
                                Message = auxiliaryContext.Response.Message
                            }
                        };
                        break;
                }
            }

            return context;
        }

        public async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>>
            LocalExecutor<TObject>(
                CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject
                , System.String _method = null
                , CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse _cookieResponse = null)
            where TObject : new()
        {
            CL.COMMON.LogManager.Enter();
            CL.COMMON.LogManager.Record("------------- Unbalanced request--------------");

            VirtualNode oVirtualNode = null;
            Node oNode = null;
            LoadBalancer oLoadBalancer = null;
            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> oClContext;

            try
            {
                // Locks all current request until a virtual node is built
                await LoadBalancer.Instance.Enter(); // AppLock.WaitAsync();

                oVirtualNode = LoadBalancer.Instance.GetVirtualNode(_slRequestObject.Url_Base);

                LoadBalancer.Instance.Exit(); //.AppLock.Release();

                // Signal to eventually dequeue a request
                System.Threading.Tasks.TaskCompletionSource<System.Boolean> taskCompletionSource =
                    new System.Threading.Tasks.TaskCompletionSource<System.Boolean>();

                // Creates queue of requests by domain and license
                await oVirtualNode.Enter();

                oLoadBalancer = LoadBalancer.Instance;

                oLoadBalancer.ReleaseNodes();

                oNode = await oLoadBalancer.GetNodeAsync(_slRequestObject);

                oVirtualNode.Exit();

                ValidateNode(oNode);

                oNode.Queue.Enqueue(taskCompletionSource);

                await oNode.Semaphore.WaitAsync();

                System.Net.Http.HttpRequestMessage oHttpRequestMessage = BuildRequest(oNode, _slRequestObject);

                System.Net.Http.HttpResponseMessage oHttpResponseMessage =
                    await oNode.HttpClient.SendAsync(oHttpRequestMessage);

                if (oNode.Queue.Any() && oNode.Queue.TryDequeue(
                        out System.Threading.Tasks.TaskCompletionSource<System.Boolean> completedTaskCompletionSource))
                {
                    // Set the result of the TaskCompletionSource to signal the completion of the task
                    completedTaskCompletionSource.SetResult(true);
                }
                else
                {
                    // Handle the case where the dequeue operation failed
                    // This might occur if the queue is empty or if there's an issue with the operation
                }

                oClContext = Mapper<TObject>(oHttpResponseMessage, _slRequestObject.Method, _slRequestObject.BatchBoundary);
            }
            catch
            {
                if (oNode is System.Object && oNode.Queue.Any() && oNode.Queue.TryDequeue(
                        out System.Threading.Tasks.TaskCompletionSource<System.Boolean> completedTaskCompletionSource))
                {
                    // Set the result of the TaskCompletionSource to signal the completion of the task
                    completedTaskCompletionSource.SetResult(true);
                }
                else
                {
                    // Handle the case where the dequeue operation failed
                    // This might occur if the queue is empty or if there's an issue with the operation
                }

                throw;
            }
            finally
            {
                LoadBalancer.Instance.Exit(); //.AppLock.Release();
                oVirtualNode?.Exit();
                oNode?.Semaphore.Release();

                if (oLoadBalancer is System.Object) await oLoadBalancer.DetachNodes();

                CL.COMMON.LogManager.Record("-------------- Request balanced ---------------");
                CL.COMMON.LogManager.Enter();
            }

            return oClContext;
        }

        public CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject ServiceLayerBatchWriter(
           CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext
           , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> _target = default

       )
        {
            if (!(_target is System.Object))
                throw new System.ArgumentNullException(nameof(_target));

            ValidateUserContext(_userContext);

            if (!_userContext.ResourceType.Equals("SW"))
                throw new System.Exception(
                    "CL You must provide a SW type object. Pleas check your CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext instance content.");

            System.String urlBase = _userContext.SLUrl;

            CL.STRUCTURES.CLASSES.ServiceLayer.BatchOperationsBuilder batchOperationBuilder = new CL.STRUCTURES.CLASSES.ServiceLayer.BatchOperationsBuilder(_target);

            System.String serializedContent = batchOperationBuilder.BuildOperation();

            System.String batchBoundary = batchOperationBuilder.GetBatchBoundary();

            System.String endpoint = System.String.Concat(urlBase, "$batch");

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject =
                new CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject()
                {
                    Url_Base = urlBase,
                    Login = new CL.STRUCTURES.CLASSES.ServiceLayer.Login
                    {
                        Url = $"Login",
                        Method = "POST",
                        Content = new CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent
                        {
                            CompanyDB = _userContext.DBCode,
                            UserName = _userContext.License,
                            Password = _userContext.Password
                        }
                    },
                    BatchBoundary = batchBoundary,
                    Content = serializedContent,
                    Url_Request = endpoint,
                    Method = "POST",

                };



            return oSlRequestObject;
        }

        public CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> SlResolveFactory<TObject, TPrimitive>(
           System.Net.Http.HttpResponseMessage _httpResponseMessage
           , System.Reflection.MethodBase _invoker
           , System.String _method
           // , Deserializers.Deserializer<TObject> MyDs = DeserializerFactory
           , Deserializers.Deserializer<TPrimitive> _deserializer = null
       )
           where TObject : new()
        {
            /*
             THIS FUNCTION SHOULD BE REFACTORED TO AVOID DUPLICATED CODE WHIT ANY OVERLOAD THAT HAS
             */

            System.String message = System.String.Empty;
            TObject oTObject = default;
            System.Net.HttpStatusCode code = System.Net.HttpStatusCode.OK;

            if (!_httpResponseMessage.IsSuccessStatusCode)
            {
                System.Boolean isValidError = false;
                System.String errorMessage;
                System.String invokerPath = $"{_invoker.DeclaringType}.{_invoker.Name}";

                try
                {
                    CL.STRUCTURES.CLASSES.Rebound.CLSLResponse oSlResponse =
                        Newtonsoft.Json.JsonConvert.DeserializeObject<CL.STRUCTURES.CLASSES.Rebound.CLSLResponse>(
                            _httpResponseMessage.Content.ReadAsStringAsync().Result);
                    errorMessage = System.String.Concat(oSlResponse.error.message.value, $"{oSlResponse.error.code}");
                    isValidError = true;
                }
                catch (System.Exception ex)
                {
                    throw new System.Exception(System.String.Concat(ex?.Message ?? ex?.InnerException?.Message,
                        $" Response can't be mapped. ",
                        _httpResponseMessage.Content.ReadAsStringAsync().Result +
                        $"StatusCode: {_httpResponseMessage.StatusCode}", " Caused by ", invokerPath));
                }

                if (isValidError)
                {
                    throw new CL.STRUCTURES.CLASSES.Exceptions.CLException(
                        System.String.Concat(errorMessage, " Caused by ", invokerPath),
                        _httpResponseMessage.StatusCode);
                }
            }

            System.Net.HttpStatusCode fallbackEmptyStatusCode = System.Net.HttpStatusCode.NoContent;
            System.Net.HttpStatusCode fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;

            if (_method.Equals("GET"))
            {
                System.Type oType = typeof(TObject);
                fallbackEmptyStatusCode = System.Net.HttpStatusCode.NotFound;
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;

                CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<TObject> deserializeObject;

                if (_deserializer is null)
                {
                    string rawObject = Deserializers.ReadAsJson(_httpResponseMessage);
                    deserializeObject =
                        Newtonsoft.Json.JsonConvert
                            .DeserializeObject<
                                CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<TObject>>(
                                rawObject
                            );
                }
                else
                {
                    TPrimitive oTPrimitive = _deserializer(_httpResponseMessage);
                    CL.STRUCTURES.CLASSES.Deserializers.Media<TPrimitive> oMedia = new CL.STRUCTURES.CLASSES.Deserializers.Media<TPrimitive>();
                    oMedia.Data = oTPrimitive;
                    System.String mediaContent = Newtonsoft.Json.JsonConvert.SerializeObject(oMedia);

                    deserializeObject = new CL.STRUCTURES.CLASSES.ServiceLayer.SLGet<TObject>();

                    deserializeObject.value = Newtonsoft.Json.JsonConvert
                        .DeserializeObject<TObject>(
                            mediaContent
                        );
                }

                oTObject = deserializeObject.value;
            }
            else if (_method.Equals("POST"))
            {
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.Created;
                oTObject = Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(_httpResponseMessage.Content
                    .ReadAsStringAsync().Result);
            }
            else if (_method.Equals("PATCH"))
            {
                fallbackSuccessStatusCode = System.Net.HttpStatusCode.OK;

                oTObject = Newtonsoft.Json.JsonConvert.DeserializeObject<TObject>(_httpResponseMessage.Content
                    .ReadAsStringAsync().Result);
            }

            TObject adapterObject = default;

            code = fallbackEmptyStatusCode;
            // Used only to return properly message
            if (oTObject == null && (_method.Equals("POST") || _method.Equals("PATCH")))
            {
                message = "No record returned";
            }
            else if (oTObject == null && _method.Equals("GET"))
            {
                message = "No records returned";
            }
            else
            {
                code = fallbackSuccessStatusCode;
                adapterObject = oTObject;
            }

            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> oClContext =
                new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                {
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                    {
                        Data = adapterObject,
                        Message = message
                    },
                    Code = code
                };

            return oClContext;
        }
        private CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> MapperFactory<TObject, TPrimitive>(
           System.Net.Http.HttpResponseMessage _httpResponseMessage
           , System.String _method
           , Deserializers.Deserializer<TPrimitive> _deserializer = null)
           where TObject : new()
        {
            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> context = null;

            System.Type oType = typeof(TObject);
            if (oType.IsGenericType &&
                oType.GetGenericTypeDefinition() == typeof(System.Collections.Generic.List<>))
            {
                switch (_method)
                {
                    case "PATCH":
                    case "POST":
                        context
                            = SlResolveFactory<TObject, TPrimitive>(_httpResponseMessage,
                                System.Reflection.MethodBase.GetCurrentMethod(), _method, _deserializer);
                        break;
                    case "GET":

                        CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<TObject>>
                            auxiliaryContext
                                = SlResolveFactory<System.Collections.Generic.List<TObject>, TPrimitive>(
                                    _httpResponseMessage,
                                    System.Reflection.MethodBase.GetCurrentMethod(), _method, _deserializer);

                        TObject mappedObject = default;

                        if (auxiliaryContext is System.Object
                            && auxiliaryContext.Response is System.Object
                            && auxiliaryContext.Response.Data is System.Object)
                            mappedObject = auxiliaryContext.Response.Data.FirstOrDefault();

                        context = new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                        {
                            Code = auxiliaryContext.Code,
                            Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                            {
                                Data = mappedObject,
                                Message = auxiliaryContext.Response.Message
                            }
                        };
                        break;
                }
            }
            else if (oType == typeof(CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse))
            {
                CL.STRUCTURES.CLASSES.ServiceLayer.UnmappedResponse unmappedResponse =
                    SlUnmmapedResolve(_httpResponseMessage, System.Reflection.MethodBase.GetCurrentMethod());

                context = new CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>()
                {
                    Response = new CL.STRUCTURES.CLASSES.Rebound.Response<TObject>()
                    {
                        Data = (TObject)System.Convert.ChangeType(unmappedResponse, typeof(TObject)),
                        Message = "Unmapped response"
                    },
                };
            }
            else
            {


                context = SlResolveFactory<TObject, TPrimitive>(_httpResponseMessage,
                    System.Reflection.MethodBase.GetCurrentMethod(), _method, _deserializer);
            }

            return context;
        }

        public async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject>>
           LocalExecutor<TObject, TPrimitive>(
               CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject
               , System.String _method = null
               , CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse _cookieResponse = null
               , Deserializers.Deserializer<TPrimitive> _deserializer = null)
           where TObject : new()
        {
            VirtualNode oVirtualNode = null;
            Node oNode = null;
            LoadBalancer oLoadBalancer = null;
            CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> oClContext;

            try
            {
                // Locks all current request until a virtual node is built
                await LoadBalancer.Instance.Enter(); // AppLock.WaitAsync();

                oVirtualNode = LoadBalancer.Instance.GetVirtualNode(_slRequestObject.Url_Base);

                LoadBalancer.Instance.Exit(); //.AppLock.Release();

                // Signal to eventually dequeue a request
                System.Threading.Tasks.TaskCompletionSource<System.Boolean> taskCompletionSource =
                    new System.Threading.Tasks.TaskCompletionSource<System.Boolean>();

                // Creates queue of requests by domain and license
                await oVirtualNode.Enter();

                oLoadBalancer = LoadBalancer.Instance;

                oLoadBalancer.ReleaseNodes();

                oNode = await oLoadBalancer.GetNodeAsync(_slRequestObject);

                oVirtualNode.Exit();

                ValidateNode(oNode);

                oNode.Queue.Enqueue(taskCompletionSource);

                await oNode.Semaphore.WaitAsync();

                System.Net.Http.HttpRequestMessage oHttpRequestMessage = BuildRequest(oNode, _slRequestObject);

                System.Net.Http.HttpResponseMessage oHttpResponseMessage =
                    await oNode.HttpClient.SendAsync(oHttpRequestMessage);

                if (oNode.Queue.Any() && oNode.Queue.TryDequeue(
                        out System.Threading.Tasks.TaskCompletionSource<System.Boolean> completedTaskCompletionSource))
                {
                    // Set the result of the TaskCompletionSource to signal the completion of the task
                    completedTaskCompletionSource.SetResult(true);
                }
                else
                {
                    // Handle the case where the dequeue operation failed
                    // This might occur if the queue is empty or if there's an issue with the operation
                }

                oClContext =
                    MapperFactory<TObject, TPrimitive>(oHttpResponseMessage, _slRequestObject.Method, _deserializer);
            }
            catch
            {
                if (oNode is System.Object && oNode.Queue.Any() && oNode.Queue.TryDequeue(
                        out System.Threading.Tasks.TaskCompletionSource<System.Boolean> completedTaskCompletionSource))
                {
                    // Set the result of the TaskCompletionSource to signal the completion of the task
                    completedTaskCompletionSource.SetResult(true);
                }
                else
                {
                    // Handle the case where the dequeue operation failed
                    // This might occur if the queue is empty or if there's an issue with the operation
                }

                throw;
            }
            finally
            {
                LoadBalancer.Instance.Exit(); //.AppLock.Release();
                oVirtualNode?.Exit();
                oNode?.Semaphore.Release();

                if (oLoadBalancer is System.Object) await oLoadBalancer.DetachNodes();
            }

            return oClContext;
        }
    }
}