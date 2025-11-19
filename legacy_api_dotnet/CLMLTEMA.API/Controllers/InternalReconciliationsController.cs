using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class InternalReconciliationsController : ApiController
    {
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string CardCode, string DocCurrency,string DateInit, string DateEnd)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<PayInAccount>> oCLContext =  await Process.GetPayInAccount(CardCode, DocCurrency, DateInit, DateEnd);

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
        
        public async Task<HttpResponseMessage> Post(InternalReconciliations _internalReconciliation)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<InternalReconciliationsResponse> oCLContext =  await Process.CreateInternalReconciliation(_internalReconciliation);

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