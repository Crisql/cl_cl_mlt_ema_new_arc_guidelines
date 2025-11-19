using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class BanksController : ApiController
    {
        // GET: api/Banks
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Bank>> oCLContext = await Process.GetBanks();

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
        /// Retrieves a filtered bank based on the provided bank code and bank name.
        /// </summary>
        /// <param name="BankCode">The code of the bank to filter by.</param>
        /// <param name="BankName">The name of the bank to filter by.</param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the filtered bank information
        /// or an error message if an exception occurs.
        /// </returns>
        // GET: api/Banks/5
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string BankCode, string BankName)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Bank> oCLContext = await Process.GetBankFiltered( BankCode,  BankName);

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
