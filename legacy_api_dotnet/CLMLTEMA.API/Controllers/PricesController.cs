using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class PricesController : ApiController
    {
        /// <summary>
        /// Obtiene los precios de todas las listas de precios
        /// </summary>
        /// <returns></returns>
        // GET
        public async Task<HttpResponseMessage> Get()
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Obtiene los precios de la list de precios indicada
        /// </summary>
        /// <param name="PriceList">Número de lista de precios</param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<HttpResponseMessage> Get(int PriceList)
        {
            throw new NotImplementedException();
        }

        
        /// <summary>
        /// Obtiene los precios de un item en todas las listas de precios
        /// </summary>
        /// <param name="ItemCode">Codigo de item</param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Get(string ItemCode)
        {
            throw new NotImplementedException();
        }
        
        /// <summary>
        /// Retrieves the price of a specific item from a given price list.
        /// </summary>
        /// <param name="ItemCode">The item code to retrieve the price for.</param>
        /// <param name="PriceList">The price list identifier.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="ItemPrice"/> on success; an error response otherwise.
        /// </returns>
        public async Task<HttpResponseMessage> Get(string ItemCode, int PriceList)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ItemPrice> oCLContext = await Process.GetItemPrice(ItemCode, PriceList);

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