namespace CL.SL.Extensions
{
    /// <summary>
    /// Allows to interact with service layer transactions
    /// </summary>
    public static class SlExtensions
    {
        /// <summary>
        /// Allows to retrieve data from service layer calling a single view without applying filters.
        /// You must call this extension method to prepare your transaction to use CL.SL.Extensions.SendAsync&lt;TObject&gt;
        /// </summary>
        /// <param name="_createSlRequestObject"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            Get(this CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _createSlRequestObject)
            => new Internals().BuildWithoutQueryString(_createSlRequestObject);

        /// <summary>
        /// Allows to retrieve data from service layer calling a single view and applying filters.
        /// All parameters to apply in filter are mapped from TObject instance object
        /// If you expose your query string using CL.COMMON.ActionFilters.QueryStringExposer in your action is not necessary pass
        /// an instance of TObject.
        /// You must call this extension method to prepare your transaction to use CL.SL.Extensions.SendAsync&lt;TObject&gt;
        /// </summary>
        /// <param name="_createSlRequestObject"></param>
        /// <param name="_target">Object to map into service layer query string filter</param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            Get<TObject>(this CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _createSlRequestObject,
                TObject _target = default)
            where TObject : new()
            => new Internals().BuildFromQueryString(_createSlRequestObject, _target);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="_userContext"></param>
        /// <param name="_target"></param>
        /// <param name="_fieldsToRemoveInHeaders"></param>
        /// <param name="_fieldsToRemoveInLines"></param>
        /// <param name="_headerUdfs"></param>
        /// <param name="_lineUdfs"></param>
        /// <param name="_lineObjectName"></param>
        /// <param name="_headerFlushConditions"></param>
        /// <param name="_lineFlushConditions"></param>
        /// <typeparam name="TObject"></typeparam>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            Post<TObject>(
                this CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext
                , TObject _target
                , System.String _fieldsToRemoveInHeaders = null
                , System.String _fieldsToRemoveInLines = null
                , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs = null
                , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs = null
                , System.String _lineObjectName = null
                // Business implementation start
                , System.Collections.Generic.Dictionary<System.String,
                    System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
                , System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
            // Business implementation end
            )
            => new Internals().ServiceLayerWriter(
                _userContext
                , "POST"
                , _target
                , _fieldsToRemoveInHeaders
                , _fieldsToRemoveInLines
                , _headerUdfs
                , _lineUdfs
                , _lineObjectName
                , _headerFlushConditions
                , _lineFlushConditions);

        /// <summary>
        /// Allows to configure a patch transaction to send it to service layer.
        /// </summary>
        /// <param name="_userContext">Current user context. This object should contains required data for service layer auth</param>
        /// <param name="_target">Object to be updated in service layer. For instance an Quotation, Item...</param>
        /// <param name="_fieldsToRemoveInHeaders">If you want to remove some properties in your header model, just an string with field names separated by ,. For instance "DocEntry,SlpCode"</param>
        /// <param name="_fieldsToRemoveInLines">If you want to remove some properties in your lines model, just an string with field names separated by ,. For instance "LineNum,Id"</param>
        /// <param name="_lineUdfs">Udfs to be injected inside target object</param>
        /// <param name="_lineObjectName">Used to specify an property property of your object is a list</param>
        /// <param name="_headerUdfs">Udfs to be injected inside target object</param>
        /// <param name="_headerFlushConditions">Header promise to be asserted</param>
        /// <param name="_lineFlushConditions">Line promise to be asserted</param>
        /// <typeparam name="TObject">Type of your object to update in sap.</typeparam>
        /// <returns>An instance of CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject object.</returns>
        public static CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            Patch<TObject>(
                this CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext
                , TObject _target
                , System.String _fieldsToRemoveInHeaders = null
                , System.String _fieldsToRemoveInLines = null
                , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _headerUdfs = null
                , System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.Udf> _lineUdfs = null
                , System.String _lineObjectName = null
                // Business implementation start
                , System.Collections.Generic.Dictionary<System.String,
                    System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _headerFlushConditions = null
                , System.Collections.Generic.Dictionary<System.String, System.Func<Newtonsoft.Json.Linq.JProperty, System.Boolean>> _lineFlushConditions = null
            // Business implementation end
            )
            => new Internals().ServiceLayerWriter(
                _userContext
                , "PATCH"
                , _target
                , _fieldsToRemoveInHeaders
                , _fieldsToRemoveInLines
                , _headerUdfs
                , _lineUdfs
                , _lineObjectName
                , _headerFlushConditions
                , _lineFlushConditions);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="_createSlRequestObject"></param>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public static async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<T>>
            SendAsync<T>(this CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _createSlRequestObject) where T : new()
            => await new Internals().LocalExecutor<T>(_createSlRequestObject);

        public static async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<T>>
            SendAsync<T, TPrimitive>(this CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _createSlRequestObject,
                Deserializers.Deserializer<TPrimitive> _deserializer) where T : new()
            => await new Internals().LocalExecutor<T, TPrimitive>(_slRequestObject: _createSlRequestObject, _deserializer: _deserializer);

        /// <summary>
        ///  Allows to configure a batch operation to send it to service layer.
        /// </summary>
        /// <param name="_userContext"></param>
        /// <param name="_target"></param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject
            BatchOperation(this CL.STRUCTURES.CLASSES.PresentationEntities.ClUserContext _userContext, System.Collections.Generic.List<CL.STRUCTURES.CLASSES.ServiceLayer.BatchRequest> _requestLists
            )
            => new Internals().ServiceLayerBatchWriter(
                _userContext
                , _requestLists);

    }
}