using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class SuppliersController : ApiController
    {
        // GET: api/Suppliers
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<List<BusinessPartners>> oCLContext = await Process.GetSuppliers();
                
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
        /// Endpoint to obtain business partners according to filter
        /// </summary>
        /// <param name="FilterBusinessPartner"> Filter to find business partner matches </param>
        /// <returns></returns>
        [EnablePagination]
        [QueryStringExposer]
        [Route("api/Suppliers/GetbyFilter")] 
        [HttpGet]
        public async Task<HttpResponseMessage> GetbyFilter(string FilterBusinessPartner)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartners>> oClContext = await Process.GetSuppliersbyFilter( FilterBusinessPartner);

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
        /// Method to get supplier by CardCode
        /// </summary>
        /// <param name="CardCode">Code supplier</param>
        /// <returns></returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<BusinessPartners> oCLContext = await Process.GetSupplier( CardCode);

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
