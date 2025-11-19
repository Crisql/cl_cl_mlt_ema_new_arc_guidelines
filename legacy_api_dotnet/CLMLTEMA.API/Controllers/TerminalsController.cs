using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class TerminalsController : ApiController
    {
        public HttpResponseMessage Get(int Id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Terminal> oCLContext =  Process.GetTerminalsById(Id);

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
        
        public HttpResponseMessage GetTerminalByCompany(int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Terminal>> oCLContext =  Process.GetTerminalsByComapany(companyId);

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

        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Terminal>> oCLContext =  Process.GetTerminals();

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

        public HttpResponseMessage Post(Terminal terminal)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Terminal> oCLContext =  Process.PostTerminals(terminal);

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

        public HttpResponseMessage Patch(Terminal terminal)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Terminal> oCLContext = Process.PatchTerminals(terminal);

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
