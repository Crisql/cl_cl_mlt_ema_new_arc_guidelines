using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.PROCESS;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class WithholdingTaxController : ApiController
    {
        /// <summary>
        /// Retrieves a list of withholding tax records.
        /// </summary>
        /// <returns>
        /// A task representing the HTTP response message containing the list of withholding tax records.
        /// </returns>
        [HttpGet]
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<WithholdingTax>> oCLContext = await Process.GetWithholdingTax();

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
        /// Retrieves a list of withholding taxes associated with a specific business partner.
        /// </summary>
        /// <param name="CardCode">The unique identifier of the business partner.</param>
        /// <returns>
        /// A task representing the HTTP response message containing the list of withholding taxes 
        /// applicable to the specified business partner.
        /// </returns>
        [HttpGet]
        [Route("api/WithholdingTax/ByBusinessPartner")]
        public async Task<HttpResponseMessage> GetByBusinessPartner(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<WithholdingTaxByBP>> oCLContext = await Process.GetWithholdingTaxByBP(CardCode);

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