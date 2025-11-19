using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class LogEventsController: ApiController
    {
        public async Task<HttpResponseMessage> Get(string filter, string @event, DateTime from, DateTime to, int skip, int take)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<LogEvent>> oCLContext = await Process.GetLogEvent(filter,@event, from, to, skip, take);

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
        
        public async Task<HttpResponseMessage> Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LogEvent> oCLContext = await Process.GetLogEvent(id);

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
        /// This endpoint is used to create logs
        /// </summary>
        /// <param name="logEvent">Model events</param>
        /// <returns></returns>
        public HttpResponseMessage Post(LogEvent logEvent)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LogEvent> oCLContext =  Process.PostLogEvent(logEvent);

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
        /// This endpoint is used to create logs
        /// </summary>
        /// <param name="logEvents">Model list events</param>
        /// <returns></returns>
        [Route("api/LogEvents/saveList")]
        [HttpPost]
        public HttpResponseMessage Post(IEnumerable<LogEvent> logEvents)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<LogEvent>> oCLContext = Process.PostLogEvents(logEvents);

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
        
        public async Task<HttpResponseMessage> Patch(LogEvent logEvent)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LogEvent> oCLContext = await Process.PatchLogEvent(logEvent);

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