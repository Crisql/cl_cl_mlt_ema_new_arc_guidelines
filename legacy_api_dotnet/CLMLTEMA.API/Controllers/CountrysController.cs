using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
   
    [Authorize]
    [CompanyBinderActionFilter]
    public class CountrysController : ApiController
    {
        
        /// <summary>
        /// Endpoint to obtain the list of countries from SAP
        /// </summary>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Countrys>> oClContext = await Process.GetCountrys();

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
        /// Endpoint to obtain states filtered by country
        /// </summary>
        /// <param name="Country"></param>
        /// <returns></returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string Country)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<States>> oClContext = await Process.GetStates(Country);

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