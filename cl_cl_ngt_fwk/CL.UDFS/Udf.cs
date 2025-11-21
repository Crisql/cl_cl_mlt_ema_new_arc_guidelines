
using System.Linq;
using CL.SL.Extensions;
using CL.DB.Extensions;
namespace CL.UDFS
{
    public static class Udf
    {

        #region Get SL
        /// <summary>
        /// Return udfs de sap by category 
        /// </summary>
        /// <param name="_slRequestObject"></param>
        /// <returns></returns>
        /// <exception cref="System.Exception"></exception>
        public static async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>>>
            GetUdfs(CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject)
        {
            if (_slRequestObject == null)
            {
                throw new System.Exception("CL - SLRequestObject not be null or empty");
            }

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject = _slRequestObject;

            CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>>
                oClContext = await oSlRequestObject.SendAsync<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>>();


            System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext> Udfs = new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>();

            if (oClContext.Response.Data != null && oClContext.Response.Data.Count > 0)
            {
                foreach (CL.STRUCTURES.CLASSES.Udf.UdfContext udf in oClContext.Response.Data)
                {
                    if (!Udfs.Exists(o => o.Name == udf.Name))
                    {
                        Udfs.Add(new CL.STRUCTURES.CLASSES.Udf.UdfContext()
                        {
                            TableId = udf.TableId,
                            Name = udf.Name,
                            FieldType = udf.FieldType,
                            Description = udf.Description,
                            MappedValues = oClContext.Response.Data.Where(x => x.LinesId == udf.HeaderId)
                                .Select(x => new CL.STRUCTURES.CLASSES.Udf.UdfInvoke()
                                {
                                    Value = x.Values,
                                    Description = x.DescriptionLines,
                                    IsActive = x.IsActive
                                }).ToList()
                        });
                    }

                }
            }

            oClContext.Response.Data = Udfs;

            return oClContext;

        }

        /// <summary>
        /// Return data of object configured udf
        /// </summary>
        /// <param name="_slRequestObject"></param>
        /// <returns></returns>
        /// <exception cref="System.Exception"></exception>
        public static async System.Threading.Tasks.Task<CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>>>
            GetUdfInvokeDBO(CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject _slRequestObject)
        {
            if (_slRequestObject == null)
            {
                throw new System.Exception("CL - SLRequestObject not be null or empty");
            }

            CL.STRUCTURES.CLASSES.ServiceLayer.SLRequestObject oSlRequestObject = _slRequestObject;

            return await oSlRequestObject.SendAsync<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>>();

        }

        #endregion

        #region Get Local

        /// <summary>
        /// Return list udfs configured from a object
        /// </summary>
        /// <param name="_dbObjectToken"></param>
        /// <typeparam name="TDbContext"></typeparam>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<System.Collections.Generic.IEnumerable<CL.STRUCTURES.CLASSES.Udf.UdfCategory>>
            GetUdfCategories<TDbContext>(System.String _dbObjectToken)
            where TDbContext : System.Data.Entity.DbContext, new()
        {
            return CL.DB.Services.Execute<CL.STRUCTURES.CLASSES.Udf.UdfCategory, TDbContext>(_dbObjectToken);
        }

        /// <summary>
        /// Return udf configured  by category
        /// </summary>
        /// <param name="_model"></param>
        /// <param name="_dbObjectToken"></param>
        /// <typeparam name="TDbContext"></typeparam>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>
            GetUdfConfigured<TDbContext, T, W>(System.String _dbObjectToken, T _object)
            where TDbContext : System.Data.Entity.DbContext, new()
            where T : new()
            where W : CL.STRUCTURES.INTERFACES.ICLSingle
        {

            CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> oClContext =
             CL.DB.Services.Execute<CL.STRUCTURES.CLASSES.Udf.UdfTransfer, T, TDbContext, W>(_dbObjectToken, _object);

            if (oClContext is null || oClContext.Response is null || oClContext.Response.Data is null) return oClContext;

            oClContext.Response.Data.UDFList =
                Newtonsoft.Json.JsonConvert
                    .DeserializeObject<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.UdfContext>>(
                        oClContext.Response.Data.Udfs,
                        new Newtonsoft.Json.JsonSerializerSettings
                        {
                            NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
                            DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Local
                        });

            oClContext.Response.Data.GroupList =
                Newtonsoft.Json.JsonConvert
                    .DeserializeObject<System.Collections.Generic.List<CL.STRUCTURES.CLASSES.Udf.GroupContext>>(
                        oClContext.Response.Data.Groups,
                        new Newtonsoft.Json.JsonSerializerSettings
                        {
                            NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
                            DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Local
                        });


            return oClContext;
        }

        #endregion

        #region Post Local

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>
            PostUdf<TDbContext, TMaster, TSingle>(this CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs,
                System.String _dbObjectToken, params System.String[] _fields)
            where TDbContext : System.Data.Entity.DbContext, new()
            where TMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TSingle : CL.STRUCTURES.INTERFACES.ICLSingle
        {

            System.String serializedContent = Newtonsoft.Json.JsonConvert.SerializeObject(_udfs.UDFList);

            _udfs.Udfs = serializedContent;

            serializedContent = Newtonsoft.Json.JsonConvert.SerializeObject(_udfs.GroupList);

            _udfs.Groups = serializedContent;

            return _udfs.Post<CL.STRUCTURES.CLASSES.Udf.UdfTransfer, TDbContext, TMaster, TSingle>(_dbObjectToken, _fields);

        }

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer>
            PatchUdf<TDbContext, TMaster, TSingle>(this CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs,
                System.String _dbObjectToken, params System.String[] _fields)
            where TDbContext : System.Data.Entity.DbContext, new()
            where TMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TSingle : CL.STRUCTURES.INTERFACES.ICLSingle
        {

            System.String serializedContent = Newtonsoft.Json.JsonConvert.SerializeObject(_udfs.UDFList);

            _udfs.Udfs = serializedContent;

            serializedContent = Newtonsoft.Json.JsonConvert.SerializeObject(_udfs.GroupList);

            _udfs.Groups = serializedContent;

            return _udfs.Patch<CL.STRUCTURES.CLASSES.Udf.UdfTransfer, TDbContext, TMaster, TSingle>(_dbObjectToken, _fields);

        }
        #endregion

    }

}