using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS.SAP;
using Newtonsoft.Json;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class BusinessPartnersController : ApiController
    {
        /// <summary>
        /// Handles an HTTP GET request to retrieve business partners filtered by salesperson code.
        /// </summary>
        /// <param name="SlpCode">The salesperson code to filter the business partners. Optional.</param>
        /// <returns>An HttpResponseMessage containing the business partners data.</returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetBusinessPartners(string SlpCode = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartners>> oCLContext = await Process.GetBusinessPartners(SlpCode);

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
        /// Retrieves a filtered list of business partners based on the provided filter string and optional sales employee code.
        /// </summary>
        /// <param name="FilterBusinessPartner">The text filter to match against business partner names or codes.</param>
        /// <param name="SlpCode">Optional sales employee code to filter business partners associated with a specific salesperson.</param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the list of matching business partners wrapped in a <see cref="CLContext{List{BusinessPartners}}"/>.
        /// </returns>
        [EnablePagination]
        [Route("api/BusinessPartners/GetbyFilter")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetbyFilter(string FilterBusinessPartner, string SlpCode = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartners>> oClContext = await Process.GetBusinessPartnersbyFilter(FilterBusinessPartner, SlpCode);

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
        /// Retrieves a specific business partner by CardCode.
        /// </summary>
        /// <param name="CardCode">The CardCode of the business partner to retrieve.</param>
        /// <returns>A response with the business partner data.</returns>
        public async Task<HttpResponseMessage> Get(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext = await Process.GetBusinessPartner(CardCode);

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

        public async Task<HttpResponseMessage> Post(BusinessPartners businessPartner)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext = await Process.CreateBusinessPartner(businessPartner);

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

        public async Task<HttpResponseMessage> Patch(BusinessPartners businessPartner)
        {
            try
            {
                
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext = await Process.UpdateBusinessPartner(businessPartner);

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
        /// Retrieves customer locations for a given business partner by CardCode and address type.
        /// </summary>
        /// <param name="CardCode">The CardCode of the business partner.</param>
        /// <param name="AddressType">The address type to filter by.</param>
        /// <returns>A response with the list of customer locations.</returns>
        [Route("api/BusinessPartners/{CardCode}/Locations")]
        public async Task<HttpResponseMessage> GetCustomerLocations(string CardCode, int AddressType)
        {
            try
            {
                
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartnerLocation>> oCLContext = await Process.GetCustomerLocations(CardCode, AddressType);

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
        
        [Route("api/BusinessPartners/GetAddressType")]
        [HttpGet]
        public HttpResponseMessage GetAddressType()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<AddressTypes>> oCLContext =  Process.GetAddressType();

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
        
        [Route("api/BusinessPartners/GetSocioComercial")]
        [HttpGet]
        public HttpResponseMessage GetSocioComercial()
        {
            try
            {
                
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<SociosComercial>> oCLContext =  Process.GetSocioComercial();

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
        
        [Route("api/BusinessPartners/CreateBPAddress")]
        [HttpPatch]
        public async Task<HttpResponseMessage> CreateBPAddress(BusinessPartners _businessPartners)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext =  await Process.CreateAddress(_businessPartners);

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
        
        [QueryStringExposer]
        [EnablePagination]
        [Route("api/BusinessPartners/GetBPAddresses")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBPAddresses(string CardCode, string Pattern = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BPAddresses>> oCLContext =  await Process.GetBPAddresses(CardCode, Pattern);

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
        
        [EnablePagination]
        [Route("api/BusinessPartners/GetBPProperties")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBPProperties()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BPProperties>> oCLContext =  await Process.GetProperties();

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
        
        [QueryStringExposer]
        [Route("api/BusinessPartners/GetBPProperty")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBPProperty(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BPProperty> oCLContext =  await Process.GetBPProperty(CardCode);

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
        
        [Route("api/BusinessPartners/PostProperties")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostProperties(PatchProperties properties)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext =  await Process.PostProperties(properties);

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
        /// API endpoint to retrieve delivery addresses for a given business partner (BP).
        /// </summary>
        /// <param name="CardCode">The unique identifier (CardCode) of the business partner.</param>
        /// <param name="AddressType">The type of address to retrieve.</param>
        /// <returns>
        /// Returns an <see cref="HttpResponseMessage"/> containing a context-wrapped response
        /// with a list of <see cref="BPAddresses"/> corresponding to the specified business partner and address type.
        /// </returns>
        [Route("api/BusinessPartners/GetBPDeliveryAddresses")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBPDeliveryAddresses(string CardCode, string AddressType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BPAddresses>> oCLContext = await Process.GetBPADeliveryddresses(CardCode, AddressType);

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
