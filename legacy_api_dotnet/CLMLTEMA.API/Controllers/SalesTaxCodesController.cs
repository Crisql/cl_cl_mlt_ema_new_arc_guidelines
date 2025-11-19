using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    public class SalesTaxCodesController : ApiController
    {
        [Authorize]
        [CompanyBinderActionFilter]
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesTaxes>> oCLContext = await Process.GetTaxesAR();

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
        
        [Authorize]
        [CompanyBinderActionFilter]
        [HttpGet]
        [Route("api/SalesTaxCodes/GetTaxesAP")]
        public async Task<HttpResponseMessage> GetTaxesAP()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesTaxes>> oCLContext = await Process.GetTaxesAP();

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