using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class AccountsController : ApiController
    {
        /// <summary>
        /// Retrieves a list of accounts for the specified store.
        /// </summary>
        /// <param name="Store">The store identifier for which to retrieve accounts.</param>
        /// <returns>An HttpResponseMessage containing the list of accounts.</returns>
        public async Task<HttpResponseMessage> GetAccounts(string Store)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Accounts>> oClContext = await Process.GetAccounts(Store);

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
        /// Retrieves account information based on the provided account code.
        /// </summary>
        /// <param name="account">The account code to retrieve information for.</param>
        /// <returns>An HttpResponseMessage containing the account information.</returns>
        public async Task<HttpResponseMessage> Get(string account)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Accounts> oClContext = await Process.GetAccount(account);

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
