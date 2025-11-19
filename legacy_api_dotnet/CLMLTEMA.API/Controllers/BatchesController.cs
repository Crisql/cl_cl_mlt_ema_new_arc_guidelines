using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class BatchesController : ApiController
    {
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string ItemCode, string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Batch>> oCLContext = await Process.GetItemBatchesByWarehouse();

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
        /// Retrieves available batch information for transfer operations filtered by item code, warehouse code, and bin location.
        /// </summary>
        /// <param name="ItemCode">Item code filter.</param>
        /// <param name="WhsCode">Warehouse code filter.</param>
        /// <param name="BinAbs">Bin location absolute entry filter.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{Batch}"/> on success; an error response otherwise.
        /// </returns>
        public async Task<HttpResponseMessage> Get(string ItemCode, string WhsCode, int BinAbs)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Batch>> oCLContext = await Process.GetLotesForTansfers(ItemCode, WhsCode, BinAbs);

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
