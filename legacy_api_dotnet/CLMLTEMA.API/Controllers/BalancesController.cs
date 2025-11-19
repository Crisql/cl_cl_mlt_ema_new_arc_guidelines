using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class BalancesController : ApiController
    {
        public HttpResponseMessage Post(PPCashDeskClosing ppCashDeskClosing)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<CommittedTransaction>> oCLContext = Process.PostPreBalances(ppCashDeskClosing);

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

        public HttpResponseMessage Get(string From,string To,string TerminalId,string DocumentType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<CommittedTransaction>> oCLContext = Process.GetBalances( From, To, TerminalId, DocumentType);

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