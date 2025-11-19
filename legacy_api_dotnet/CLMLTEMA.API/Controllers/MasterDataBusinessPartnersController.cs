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
    public class MasterDataBusinessPartnersController : ApiController
    {
        /// <summary>
        /// Endpoint to obtain business partners according to filter
        /// </summary>
        /// <param name="FilterBusinessPartner"> Filter to find business partner matches </param>
        /// <returns></returns>
        [EnablePagination]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetbyFilter(string FilterBusinessPartner)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartners>> oClContext = await Process.GetMasterData<BusinessPartners>(FilterBusinessPartner);

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
        /// Retrieves a single business partner record based on the specified card code.
        /// </summary>
        /// <param name="CardCode">
        /// The card code used to search for the business partner in the master data.
        /// </param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing a <see cref="CLContext{BusinessPartners}"/> with the business partner data,
        /// or an error response if the operation fails.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oClContext = await Process.GetMasterDataOne<BusinessPartners>(CardCode);

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
        /// Method to get business partner to activate
        /// </summary>
        /// <param name="DateFrom">Date from</param>
        /// <param name="DateTo">Date to</param>
        /// <param name="Customer">Customer filter</param>
        /// <returns></returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> GetToActivate(string DateFrom,
            string DateTo, string Customer)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartners>> oClContext = await Process.GetBusinessPartnerToActivate(DateFrom, DateTo, Customer);

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
        /// Method to activate business partner
        /// </summary>
        /// <param name="businessPartner">Business partner to update</param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post(BusinessPartnersActivate businessPartner)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartnersActivate> oCLContext = await Process.ActivateBusinessPartner(businessPartner);

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