using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class SalesMenController : ApiController
    {
        // GET: api/SalesMen
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesMan>> oCLContext = await Process.GetSalesMen();

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
        /// Handles HTTP GET requests to retrieve details of a salesperson.
        /// </summary>
        /// <param name="id">The salesperson's code (SlpCode).</param>
        /// <returns>
        /// An HTTP response message containing the salesperson's details in JSON format.
        /// </returns>
        public async Task<HttpResponseMessage> Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SalesMan> oCLContext = await Process.GetSalesMan(id);

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

        // POST: api/SalesMen
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/SalesMen/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/SalesMen/5
        public void Delete(int id)
        {
        }
    }
}
