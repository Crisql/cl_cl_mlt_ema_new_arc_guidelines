using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using Process = CLMLTEMA.PROCESS.Process;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class BillOfMaterialsController : ApiController
    {
        [HttpGet]
        [Route("api/BillOfMaterials/MobileSyncInfo")]
        public async Task<HttpResponseMessage> Get(DateTime LastUpdate)
        {
            try
            {
                CLContext<List<BillOfMaterialToSync>> oClContext = await Process.GetBillOfMaterialsToSync(LastUpdate);

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
        
        
        [HttpGet]
        [Route("api/BillOfMaterials/MobileSyncInfo/Count")]
        public async Task<HttpResponseMessage> GetMobilePriceListsInfoCount(DateTime LastUpdate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
        
                CLContext<MobileChangeInformation> oCLContext = await Process.GetMobileBillOfMaterialsCount(LastUpdate);
        
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