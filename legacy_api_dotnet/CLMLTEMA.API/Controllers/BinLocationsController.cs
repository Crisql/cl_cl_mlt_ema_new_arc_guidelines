using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class BinLocationsController : ApiController
    {
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string ItemCode, string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Location>> oCLContext = await Process.GetBinAllocations(ItemCode, WhsCode);

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
        /// Retrieves warehouse bin locations for transfers filtered by warehouse code.
        /// </summary>
        /// <param name="WhsCode">The warehouse code filter.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{Location}"/> on success; an error response otherwise.
        /// </returns>
        public async Task<HttpResponseMessage> Get(string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Location>> oCLContext = await Process.GetLocationForTansfers(WhsCode);

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
        /// Retrieves warehouse bin locations for transfers with pagination support.
        /// Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="WhsCode">The warehouse code filter.</param>
        /// <param name="Location">The location code or name filter.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{Location}"/> (paginated) on success; an error response otherwise.
        /// </returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> GetBinLocations(string WhsCode, string Location)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Location>> oCLContext = await Process.GetLocationForTansfersPagination(WhsCode, Location);

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
    }
}