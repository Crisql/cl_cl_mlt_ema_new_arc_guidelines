using System.Net.Http;
using System.Web.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Routing;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.Udf;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.Filters;
using CLMLTEMA.PROCESS;
using Newtonsoft.Json.Linq;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter] 
    public class UdfsController : ApiController
    { 
        
        #region DBLocal
        
        /// <summary>
        /// Get configured udfs
        /// </summary>
        /// <param name="category">Category of udf to get</param>
        /// <param name="isUdfLine">if it is a udf line</param>
        /// <param name="configured">If it is udf configure</param>
        /// <param name="group">udfs group to filter</param>
        /// <returns></returns>
       
        public async Task<HttpResponseMessage> Get(string category, bool isUdfLine, bool configured, string group = "")
        {
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<UdfContext>> oCLContext = await Process.GetUdfs(-1, category, isUdfLine, configured, group);

                LogManager.Record("CONTROLLER ENDED UP");
                
                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        
        [Route("api/Udfs/Categories")]
        public async Task<HttpResponseMessage> GetCategories()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<UdfCategory>> oCLContext = Process.GetUdfCategories();

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        public HttpResponseMessage Post(CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> oCLContext = Process.PostUdfs(_udfs, -1);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _udfs);
            }
        }
        
   
        
        [Route("~/api/Udfs/UdfsDevelopment")]
        [HttpGet]
        public HttpResponseMessage GetUdfsDevelopment(string Table)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<IEnumerable<UdfDevelopment>> oCLContext = Process.GetUdfsDevelopment(Table);
        
                LogManager.Record("CONTROLLER ENDED UP");
        
                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        /// <summary>
        /// Gets the groups configured for a specific udf category
        /// </summary>
        /// <param name="category">udf category to get</param>
        /// <param name="isActive">indicates whether the active groups or all are obtained</param>
        /// <returns></returns>
        
        [Route("~/api/Udfs/Groups")]
        [HttpGet]
        public HttpResponseMessage GetUdfGroups(string category, bool isActive)
        {
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<List<GroupContext>> oCLContext = Process.GetUdfGroups(-1, category, isActive);

                LogManager.Record("CONTROLLER ENDED UP");
                
                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        #endregion
        
        #region SAP
        
        /// <summary>
        /// Retrieves user-defined fields (UDFs) for a specified SAP table.
        /// </summary>
        /// <param name="TableID">The identifier of the SAP table to retrieve UDFs from.</param>
        /// <returns>
        /// An HTTP response message containing the list of user-defined fields.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string TableID)
        {  
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<UdfContext>> oCLContext = await Process.GetUdfs(TableID);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        
       
        [Route("api/Udfs/Values")]
        public async Task<HttpResponseMessage> GetUdfInvokeDBO(string dbo, string value, string dboType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<CL.STRUCTURES.CLASSES.Udf.UdfInvoke>> oCLContext = await Process.GetUdfInvokeDBO(dbo, value);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
         
        [Route("api/Udfs/GetUdfsLinesData")]  
        [HttpPost]
        public async Task<HttpResponseMessage> GetUdfsLinesData(List<UdfSourceLine>_udfSource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
            
                CLContext<List<UdfSourceLine>> oCLContext = await Process.GetUdfsLinesData(_udfSource);
            
                LogManager.Record("CONTROLLER ENDED UP");
            
                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        
        [Route("api/Udfs/GetUdfsData")]  
        [HttpPost]  
        public async Task<HttpResponseMessage> GetUdfsData(FilterKeyUdf filterUdf)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
            
                CLContext<List<CL.STRUCTURES.CLASSES.Udf.Udf>> oCLContext = await Process.GetUdfsData(filterUdf);
            
                LogManager.Record("CONTROLLER ENDED UP");
            
                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
        #endregion
        
    }
}