using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.Filters;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    [RoutePrefix("api/Mobile")]
    public class MobileController : ApiController
    {
        [HttpGet]
        [Route("Users")]
        public HttpResponseMessage GetMobileUsers()
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<MobileUser>> cLContext = PROCESS.Process.GetMobileUsers();

                LogManager.Record("FIN DE CONTROLADOR");

                return Core.ContextBroker(cLContext);
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
        /// Retrieves the list of mobile items updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time of the last update to filter items.</param>
        /// <returns>HTTP response containing a list of mobile items.</returns>
        [HttpGet]
        [Route("Items")]
        public async Task<HttpResponseMessage> GetMobileItems(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<List<MobileItem>> oCLContext = await Process.GetMobileItems(LastUpdate);
        
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
        /// Retrieves the count of mobile items updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time of the last update to filter items.</param>
        /// <returns>HTTP response containing the count of updated mobile items.</returns>
        [HttpGet]
        [Route("Items/Count")]
        public async Task<HttpResponseMessage> GetMobileItemsCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobileItemsCount(LastUpdate);
        
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
        /// Retrieves a list of mobile business partners based on the salesperson code and last update timestamp.
        /// </summary>
        /// <param name="SlpCode">The salesperson code used to filter business partners.</param>
        /// <param name="LastUpdate">The timestamp of the last update to fetch only updated records.</param>
        /// <returns>An <see cref="HttpResponseMessage"/> containing the list of business partners or an error response.</returns>
        [HttpGet]
        [Route("BusinessPartners")]
        public async Task<HttpResponseMessage> GetMobileBusinessPartners(int SlpCode, DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<List<MobileBusinessPartner>> oCLContext = await Process.GetMobileBusinessPartners(SlpCode, LastUpdate);
        
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
        /// Retrieves the count of business partners assigned to a salesperson that have been updated after the specified date.
        /// </summary>
        /// <param name="SlpCode">The salesperson code used to filter business partners.</param>
        /// <param name="LastUpdate">The date and time of the last update to filter records.</param>
        /// <returns>HTTP response containing the count of updated business partners.</returns>
        [HttpGet]
        [Route("BusinessPartners/Count")]
        public async Task<HttpResponseMessage> GetMobileBusinessPartnersCount(int SlpCode, DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobileBusinessPartnersCount(SlpCode, LastUpdate);
        
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
        /// Retrieves the list of mobile accounts, optionally filtered by the last update date.
        /// </summary>
        /// <param name="LastUpdate">Optional. The date and time of the last update to filter accounts.</param>
        /// <returns>HTTP response containing a list of mobile accounts.</returns>
        [HttpGet]
        [Route("Accounts")]
        public async Task<HttpResponseMessage> GetMobileAccounts(DateTime? LastUpdate = null)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileAccount>> oCLContext = await PROCESS.Process.GetMobileAccounts();

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
        /// Retrieves the list of mobile cards, optionally filtered by the last update date.
        /// </summary>
        /// <param name="LastUpdate">Optional. The date and time of the last update to filter cards.</param>
        /// <returns>HTTP response containing a list of mobile cards.</returns>
        [HttpGet]
        [Route("Cards")]
        public async Task<HttpResponseMessage> GetMobileCards(DateTime? LastUpdate = null)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileCard>> oCLContext = await PROCESS.Process.GetMobileCards();

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
        /// Retrieves the list of mobile price list information updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time used to filter price list information updated after this point.</param>
        /// <returns>HTTP response containing a list of mobile price list information.</returns>
        [HttpGet]
        [Route("PriceListsInfo")]
        public async Task<HttpResponseMessage> GetMobilePriceListsInfo(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobilePriceListInfo>> oCLContext = await Process.GetMobilePriceListsInfo(LastUpdate);

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
        /// Retrieves the count of mobile price list information updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time used to filter price list updates.</param>
        /// <returns>HTTP response containing the count of updated mobile price list information.</returns>

        [HttpGet]
        [Route("PriceListsInfo/Count")]
        public async Task<HttpResponseMessage> GetMobilePriceListsInfoCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobilePriceListsInfoCount(LastUpdate);
        
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
        /// Retrieves a single price list information
        /// </summary>
        /// <param name="PriceListNum">The list number to retrieve the required information</param>
        /// <returns>A CLContext with a the price list information</returns>
        [HttpGet]
        [Route("PriceListsInfo")]
        public async Task<HttpResponseMessage> GetMobilePriceListInfo(int PriceListNum)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<MobilePriceListInfo> oCLContext = await Process.GetMobilePriceListInfo(PriceListNum);

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
        /// Retrieves the list of mobile price lists updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time used to filter price list updates.</param>
        /// <returns>HTTP response containing the list of updated mobile price lists.</returns>
        [HttpGet]
        [Route("PriceLists")]
        public async Task<HttpResponseMessage> GetMobilePriceLists(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobilePriceList>> oCLContext = await Process.GetMobilePriceLists(LastUpdate);

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
        /// Retrieves the count of mobile price lists updated after the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date and time used to filter price list updates.</param>
        /// <returns>HTTP response containing the count of updated mobile price lists.</returns>

        [HttpGet]
        [Route("PriceLists/Count")]
        public async Task<HttpResponseMessage> GetMobilePriceListsCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobilePriceListsCount(LastUpdate);
        
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
        /// Retrieves a list of mobile measurement units, optionally filtered by last update date.
        /// </summary>
        /// <param name="LastUpdate">Optional date to filter measurement units updated after this timestamp.</param>
        /// <returns>HTTP response containing the list of mobile measurement units.</returns>

        [HttpGet]
        [Route("MeasurementUnits")]
        public async Task<HttpResponseMessage> GetMobileMeasurementUnits(DateTime? LastUpdate = null)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<List<MobileMeasurementUnit>> oCLContext = await PROCESS.Process.GetMobileMeasurementUnits();
        
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
        /// Retrieves a list of mobile discount groups updated since the specified date.
        /// </summary>
        /// <param name="LastUpdate">Date to filter discount groups updated after this timestamp.</param>
        /// <returns>HTTP response containing the list of mobile discount groups.</returns>

        [HttpGet]
        [Route("DiscountGroups")]
        public async Task<HttpResponseMessage> GetMobileDiscountGroups(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileDiscountGroup>> oCLContext = await Process.GetMobileDiscountGroups(LastUpdate);

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
        /// Retrieves the count of mobile discount groups updated since the specified date.
        /// </summary>
        /// <param name="LastUpdate">Date to filter discount groups updated after this timestamp.</param>
        /// <returns>HTTP response containing the count of updated mobile discount groups.</returns>
        [HttpGet]
        [Route("DiscountGroups/Count")]
        public async Task<HttpResponseMessage> GetMobileDiscountGroupsCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobileDiscountGroupsCount(LastUpdate);
        
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
        /// Retrieves mobile discount hierarchies for a given user assignment, filtered by active discounts status.
        /// </summary>
        /// <param name="UserAssignId">Identifier for the user assignment.</param>
        /// <param name="ActivedDiscounts">Flag to filter active discounts only.</param>
        /// <returns>HTTP response containing the mobile discount hierarchies.</returns>
        [HttpGet]
        [Route("DiscountHierarchies")]
        public HttpResponseMessage GetMobileDiscountHierarchies(int UserAssignId, bool ActivedDiscounts)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<MobileDiscountHierarchy>> oCLContext = Process.GetMobileDiscountHierarchies(UserAssignId, ActivedDiscounts);

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
        /// Retrieves a list of mobile blanket agreements updated since the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date to filter records updated after.</param>
        /// <returns>HTTP response containing the list of mobile blanket agreements.</returns>
        [HttpGet]
        [Route("BlanketAgreements")]
        public async Task<HttpResponseMessage> GetMobileBlanketAgreements(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileBlanketAgreement>> oCLContext = await PROCESS.Process.GetMobileBlanketAgreements(LastUpdate);

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
        /// Retrieves the count of mobile blanket agreements updated since the specified date.
        /// </summary>
        /// <param name="LastUpdate">The date to filter records updated after.</param>
        /// <returns>HTTP response containing the count of updated mobile blanket agreements.</returns>
        [HttpGet]
        [Route("BlanketAgreements/Count")]
        public async Task<HttpResponseMessage> GetMobileBlanketAgreementsCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobileBlanketAgreementsCount(LastUpdate);
        
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
        /// Retrieves the list of mobile print document type labels, optionally filtered by last update date.
        /// </summary>
        /// <param name="LastUpdate">Optional date to filter records updated after.</param>
        /// <returns>HTTP response containing the list of mobile print document type labels.</returns>
        [HttpGet]
        [Route("PrintDocTypeLabels")]
        public async Task<HttpResponseMessage> GetMobilePrintDocTypeLabels(DateTime? LastUpdate = null)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobilePrintDocTypeLabel>> oCLContext = await Process.GetMobilePrintDocTypeLabels();

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
        /// Retrieves mobile batches filtered by the provided list of batch filters.
        /// </summary>
        /// <param name="_mobileBatchesFilters">List of filters to apply for batch retrieval.</param>
        /// <returns>HTTP response containing the filtered list of mobile batches.</returns>
        [HttpPost]
        [Route("Batches")]
        public async Task<HttpResponseMessage> GetMobileBatches(List<MobileBatchesFilter> _mobileBatchesFilters)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileBatchesList>> oCLContext = await PROCESS.Process.GetMobileBatches(_mobileBatchesFilters);

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
        /// Retrieves mobile bin allocations based on the provided batch allocation filters.
        /// </summary>
        /// <param name="_mobileBatchesFilters">List of filters to apply for batch allocations retrieval.</param>
        /// <returns>HTTP response containing the list of mobile bin allocations.</returns>
        [HttpPost]
        [Route("Allocations")]
        public async Task<HttpResponseMessage> GetMobileAllocations(List<MobileBatchesAllocationsFilter> _mobileBatchesFilters)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileBinAllocation>> oCLContext = await Process.GetMobileBatchesAllocations(_mobileBatchesFilters);

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
        /// Retrieves the mobile company information.
        /// </summary>
        /// <returns>HTTP response containing the company information.</returns>
        [HttpGet]
        [Route("CompanyInformation")]
        public async Task<HttpResponseMessage> GetMobileCompanyInformation()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<MobileCompanyInformation> oCLContext = await Process.GetMobileCompanyInformation();

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
        /// Retrieves the list of mobile tax code determinations.
        /// </summary>
        /// <param name="LastUpdate">Optional date to filter records updated since this date.</param>
        /// <returns>HTTP response containing the list of tax code determinations.</returns>
        [HttpGet]
        [Route("GetMobileTaxCodeDeterminations")]
        public async Task<HttpResponseMessage> GetMobileTaxCodeDeterminations(DateTime? LastUpdate = null)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileTaxCodeDetermination>> oCLContext = await Process.GetMobileTaxCodeDeterminations();

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
        
        [HttpGet]
        [Route("Charts")]
        public HttpResponseMessage GetMobileCharts()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Chart>> oCLContext = Process.GetMobileCharts();

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
        /// API endpoint that retrieves a list of mobile payment terms from SAP.
        /// </summary>
        /// <returns>
        /// A <see cref="HttpResponseMessage"/> containing the result of the operation wrapped in a <see cref="CLContext{List{MobilePayTerms}}"/>.
        /// </returns>
        [HttpGet]
        [Route("PayTerms")]
        public async Task<HttpResponseMessage> GetMobilePayTerms()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobilePayTerms>> oCLContext = await Process.GePayTerms();

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
        /// Returns the mobile user series for a given user and company.
        /// </summary>
        /// <param name="userId">User identifier used to fetch series.</param>
        /// <param name="companyId">Company identifier used to scope the query.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="IEnumerable{MobileUserSeries}"/> on success; an error response otherwise.
        /// </returns>
        /// <remarks>GET UserSeries</remarks>
        [HttpGet]
        [Route("UserSeries")]
        public HttpResponseMessage GetMobileUserSeries(int userId, int companyId)
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<MobileUserSeries>> cLContext = PROCESS.Process.GetMobileUserSeries(userId, companyId);

                LogManager.Record("FIN DE CONTROLADOR");

                return Core.ContextBroker(cLContext);
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