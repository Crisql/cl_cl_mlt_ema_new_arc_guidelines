
namespace CL.SL
{
    /// <summary>
    /// Load balancer implemented through thread safe singleton
    /// </summary>
    internal class LoadBalancer : ILoadBalancer, ISlimLock
    {
        /// <summary>
        /// 
        /// </summary>
        private static readonly System.Lazy<LoadBalancer> LazyInstance =
            new System.Lazy<LoadBalancer>(() => new LoadBalancer());

        /// <summary>
        /// Locks all current threads in pipe
        /// </summary>
        private static readonly System.Threading.SemaphoreSlim AppLock =
            new System.Threading.SemaphoreSlim(1, 1);

        /// <summary>
        /// 
        /// </summary>
        private static System.Boolean _isTreadLock;
        /// <summary>
        /// Locks all pipe threads by company and domain
        /// </summary>
        private static readonly System.Collections.Generic.List<VirtualNode> VirtualNodes =
            new System.Collections.Generic.List<VirtualNode>();

        public async System.Threading.Tasks.Task Enter()
        {
            await AppLock.WaitAsync();
            _isTreadLock = true;
        }

        public void Exit()
        {
            if (!_isTreadLock) return;

            AppLock.Release();
            _isTreadLock = false;
        }

        /// <inheritdoc />
        public VirtualNode GetVirtualNode(in System.String _domain)
        {
            System.String domain = _domain;
            VirtualNode oVirtualNode = VirtualNodes.Find(_virtualNode => _virtualNode.Domain.Equals(domain));


            if (oVirtualNode is System.Object)
                return oVirtualNode;

            oVirtualNode = new VirtualNode(_domain, new System.Threading.SemaphoreSlim(1, 1));

            VirtualNodes.Add(oVirtualNode);

            return VirtualNodes[VirtualNodes.Count - 1];
        }

        /// <summary>
        /// Single instance of balancer
        /// </summary>
        public static LoadBalancer Instance => LazyInstance.Value;

        private LoadBalancer()
        {
            // Private constructor to prevent instantiation from outside the class.
        }

        /// <summary>
        /// All HttpClients and its owns queues by company and license
        /// </summary>
        private readonly System.Collections.Generic.List<Node>
            _nodes = new System.Collections.Generic.List<Node>();

        /// <summary>
        /// Makes a service layer request to get a valid session id
        /// </summary>
        /// <param name="_baseAddress"></param>
        /// <param name="_loginContent"></param>
        /// <returns></returns>
        private async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse> BuildLoginNode(
            System.String _baseAddress
            , CL.STRUCTURES.CLASSES.ServiceLayer.LoginContent _loginContent)
        {
            System.Net.ServicePointManager.ServerCertificateValidationCallback =
                (sender, certificate, chain, errors) => true;
            System.Net.ServicePointManager.Expect100Continue = false;
            System.String serializedLoginObject = Newtonsoft.Json.JsonConvert.SerializeObject(_loginContent);
            System.Net.Http.HttpClientHandler oHttpClientHandler = new System.Net.Http.HttpClientHandler
            {
                AutomaticDecompression =
                    System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
            };

            System.Net.Http.HttpClient oHttpClient = new System.Net.Http.HttpClient(oHttpClientHandler);

            System.Net.Http.HttpMethod ReqMethod = new System.Net.Http.HttpMethod("POST");
            oHttpClient.DefaultRequestHeaders.Accept.Clear();
            oHttpClient.DefaultRequestHeaders.Add("Accept", "application/json");

            oHttpClient.BaseAddress = new System.Uri(_baseAddress);

            System.String url = _baseAddress + "Login";

            System.Net.Http.HttpRequestMessage oHttpRequestMessage = new System.Net.Http.HttpRequestMessage(ReqMethod
                , url);

            System.Net.Http.StringContent oStringContent =
                new System.Net.Http.StringContent(serializedLoginObject, null, "application/json");
            oStringContent.Headers.ContentType.CharSet = "";
            oHttpRequestMessage.Content = oStringContent;

            System.Net.Http.HttpResponseMessage result =
                await oHttpClient.SendAsync(oHttpRequestMessage);

            CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse>
                oCookieResponseContext = SlResolve<CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse>(result,
                    System.Reflection.MethodBase.GetCurrentMethod(), "POST");

            CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse oCookieResponse = oCookieResponseContext.Response.Data;

            return oCookieResponse;
        }

        /// <summary>
        /// Requests a service layer and build HttpClient Context
        /// </summary>
        /// <param name="_slRequestObject"></param>
        /// <returns></returns>
        /// <exception cref="System.NullReferenceException"></exception>
        private async System.Threading.Tasks.Task<System.Tuple<System.String, System.Net.Http.HttpClient>>
            BuildNodeContext(
                CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject)
        {
            CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse oCookieResponse =
                await BuildLoginNode(_slRequestObject.Url_Base, _slRequestObject.Login.Content);

            _ = oCookieResponse ??
                throw new System.NullReferenceException(
                    "CL Failure building Login Node. Please see logs to get more context.");

            System.Net.Http.HttpClientHandler oHttpClientHandler = new System.Net.Http.HttpClientHandler
            {
                AutomaticDecompression =
                    System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
            };

            System.Net.CookieContainer cookieContainer = new System.Net.CookieContainer();
            cookieContainer.Add(new System.Uri(_slRequestObject.Url_Base),
                new System.Net.Cookie("B1SESSION", oCookieResponse.SessionId));

            if (!System.String.IsNullOrEmpty(oCookieResponse.ROUTEID))
            {
                cookieContainer.Add(new System.Uri(_slRequestObject.Url_Base),
                    new System.Net.Cookie("ROUTEID", oCookieResponse.ROUTEID));
            }

            oHttpClientHandler = new System.Net.Http.HttpClientHandler
            {
                AutomaticDecompression =
                    System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
            };

            oHttpClientHandler.CookieContainer = cookieContainer;

            System.Net.Http.HttpClient oHttpClient = new System.Net.Http.HttpClient(oHttpClientHandler);
            oHttpClient.DefaultRequestHeaders.Accept.Clear();
            oHttpClient.Timeout = System.TimeSpan.FromSeconds(3600);
            oHttpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            oHttpClient.DefaultRequestHeaders.Add("Accept", "text/json");
            oHttpClient.DefaultRequestHeaders.Add("Accept", "text/x-json");
            oHttpClient.DefaultRequestHeaders.Add("Accept", "text/javascript");
            oHttpClient.DefaultRequestHeaders.Add("Accept", "application/xml");
            oHttpClient.DefaultRequestHeaders.Add("Accept", "text/xml");
            oHttpClient.BaseAddress = new System.Uri(_slRequestObject.Url_Base);


            return new System.Tuple<System.String, System.Net.Http.HttpClient>(oCookieResponse.SessionId, oHttpClient);
        }

        /// <inheritdoc />
        public async System.Threading.Tasks.Task<Node> GetNodeAsync(
            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject)
        {
            ReleaseNodes();

            Node oNode = _nodes.Find(_node => _node.IsNodeValid &&
                                         _node.Company.Equals(_slRequestObject.Login.Content.CompanyDB) &&
                                         _node.License.Equals(_slRequestObject.Login.Content.UserName) &&
                                         _node.BaseAddress.Equals(_slRequestObject.Url_Base));

            if (oNode is System.Object)
            {
                return oNode;
            }

            System.Tuple<System.String, System.Net.Http.HttpClient> nodeContext = await BuildNodeContext(
                _slRequestObject);

            System.Net.Http.HttpClient oHttpClient = nodeContext.Item2;
            System.String sessionId = nodeContext.Item1;

            oNode = new Node()
            {
                Company = _slRequestObject.Login.Content.CompanyDB,
                License = _slRequestObject.Login.Content.UserName,
                BaseAddress = _slRequestObject.Url_Base,
                SessionId = sessionId,
                HttpClient = oHttpClient,
                PushTime = System.DateTime.Now
            };

            _nodes.Add(oNode);

            return _nodes[_nodes.Count - 1];
        }

        public void ReleaseNodes()
        {
            System.Collections.Generic.List<Node> nodesToRelease = _nodes.FindAll(_node => _node.HasBeenDetached);

            nodesToRelease.ForEach(_node =>
            {
                _nodes.Remove(_node);
            });
        }

        public async System.Threading.Tasks.Task DetachNodes()
        {
            System.Collections.Generic.List<Node> nodesToDetach =
                _nodes.FindAll(_node => _node.MustBeDetach && !_node.HasBeenDetached);

            System.Int32 detachedNodes = 0;

            foreach (Node node in nodesToDetach)
            {
                try
                {
                    detachedNodes++;
                    CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject =
                        new CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject()
                        {
                            Url_Base = node.BaseAddress,
                            Headers =
                                new System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<
                                    System.String, System.String>>(),
                            Url_Request = System.String.Concat(node.BaseAddress, "Logout"),
                            Method = "POST"
                        };

                    System.Net.Http.HttpRequestMessage oHttpRequestMessage = BuildRequest(oSlRequestObject);
                    System.Net.Http.HttpResponseMessage oHttpResponseMessage =
                        await node.HttpClient.SendAsync(oHttpRequestMessage);

                    CL.COMMON.LogManager.Record(
                        $"Code: {oHttpResponseMessage.StatusCode} {oHttpResponseMessage.IsSuccessStatusCode}");

                    CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse>
                        oCookieResponseContext = SlResolve<CL.STRUCTURES.CLASSES.ServiceLayer.CookieResponse>(
                            oHttpResponseMessage,
                            System.Reflection.MethodBase.GetCurrentMethod(), "POST");

                    node.HttpClient.Dispose();
                    node.Semaphore.Dispose();
                    node.HasBeenDetached = true;
                }
                catch (System.Exception exception)
                {
                    CL.COMMON.LogManager.Record(exception.Message);
                }
            }
        }


        /// <inheritdoc />
        public System.Net.Http.HttpRequestMessage BuildRequest(
            in CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _sLRequestObject)
        {
            System.Net.Http.HttpMethod oHttpMethod = new System.Net.Http.HttpMethod(_sLRequestObject.Method);

            System.Net.Http.HttpRequestMessage oHttpRequestMessage = new System.Net.Http.HttpRequestMessage(oHttpMethod
                , _sLRequestObject.Url_Request);


            System.String mediaType = "application/json";

            if (_sLRequestObject.Headers is System.Object)
            {
                oHttpRequestMessage.Headers.Clear();
                foreach (System.Collections.Generic.KeyValuePair<System.String, System.String> header in
                         _sLRequestObject.Headers)
                {
                    if (header.Key.Equals("Content-Type"))
                        mediaType = header.Value;
                    else
                        oHttpRequestMessage.Headers.Add(header.Key, header.Value);
                }
            }

            if (System.String.IsNullOrEmpty(_sLRequestObject.Content)) return oHttpRequestMessage;

            if (_sLRequestObject.Method.Equals("GET"))
            {
                throw new System.Exception("Http verb is incorrect!");
            }



            #region StringContent creation


            System.Net.Http.StringContent oStringContent = new System.Net.Http.StringContent(_sLRequestObject.Content, null, mediaType);

            if (!string.IsNullOrEmpty(_sLRequestObject.BatchBoundary))
                oStringContent.Headers.ContentType.Parameters.Add(new System.Net.Http.Headers.NameValueHeaderValue("boundary", _sLRequestObject.BatchBoundary));

            oStringContent.Headers.ContentType.CharSet = "";

            oHttpRequestMessage.Content = oStringContent;

            #endregion

            return oHttpRequestMessage;
        }

        public CL.STRUCTURES.CLASSES.Rebound.CLContext<TObject> SlResolve<TObject>(
            in System.Net.Http.HttpResponseMessage _httpResponseMessage
            , in System.Reflection.MethodBase _invoker
            , in System.String _method)
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
                        " Response can't be mapped. ",
                        _httpResponseMessage.Content.ReadAsStringAsync().Result, " Caused by ", invokerPath));
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
    }
}