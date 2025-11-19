using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class ChartsController : ApiController
    {
        /// <summary>
        /// Retrieves charts
        /// </summary>
        /// <returns>A collections of charts</returns>
        /// <seealso cref="Chart"/>
    
        [HttpGet]
        public async Task<HttpResponseMessage> GetCharts()
        {
            try
            {
                CLContext<List<Chart>> oCLContext = await Process.GetCharts();

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit();
            }
        }

        
    }
}