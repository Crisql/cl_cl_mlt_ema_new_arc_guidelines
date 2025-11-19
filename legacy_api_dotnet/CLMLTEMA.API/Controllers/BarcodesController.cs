using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
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
    public class BarcodesController : ApiController
    {
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<List<BarCodeMasterData>> oCLContext = await Process.GetBarcodesByItem(ItemCode);


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
