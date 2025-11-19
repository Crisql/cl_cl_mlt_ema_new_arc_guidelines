using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class MasterDataItemsController : ApiController
    {
   
        /// <summary>
        /// Endpoint to obtain items according to filter
        /// </summary>
        /// <param name="FilterItemr">Filter to find items matches</param>
        /// <returns></returns>
        [EnablePagination]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetbyFilter(string FilterItem)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemSearch>> oClContext = await Process.GetMasterData<ItemSearch>(FilterItem);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        /// Retrieves a single item record based on the specified item code.
        /// </summary>
        /// <param name="ItemCode">
        /// The item code used to search for the item in the master data.
        /// </param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing a <see cref="CLContext{ItemsModel}"/> with the item data,
        /// or an error response if the operation fails.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ItemsModel> oClContext = await Process.GetMasterDataOne<ItemsModel>(ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        /// Retrieves detailed inventory information for a specific item.
        /// Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="ItemCode">The item code to retrieve inventory details for.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{ItemInventoryDetail}"/> (paginated) on success; an error response otherwise.
        /// </returns>
        [Route("~/api/MasterDataItems/GetInventoryDetails")]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetInventoryDetails(string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemInventoryDetail>> oClContext = await Process.GetItemInventoryDetails(ItemCode);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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