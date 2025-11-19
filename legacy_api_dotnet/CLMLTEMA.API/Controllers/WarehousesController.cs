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
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class WarehousesController : ApiController
    {
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Warehouses>> oCLContext = await Process.GetWarehouses();

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
        /// Retrieves warehouse details based on the specified warehouse code.
        /// </summary>
        /// <param name="WhsCode">The code of the warehouse to retrieve.</param>
        /// <returns>
        /// An HTTP response message containing the warehouse details.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string WhsCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Warehouses> oCLContext = await Process.GetWarehouse(WhsCode);

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
        /// Method to get warehouses
        /// </summary>
        /// <param name="FilterWarehouse">Warehouse to search</param>
        /// <returns></returns>
        [EnablePagination]
        [QueryStringExposer]
        [Route("api/Warehouses/GetbyFilter")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetbyFilter(string FilterWarehouse)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Warehouses>> oCLContext = await Process.GetWarehousesByFilter(FilterWarehouse);

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
