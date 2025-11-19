using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class RouteFrequenciesController : ApiController
    {
        public HttpResponseMessage Get(bool onlyActive)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<RouteFrequency>> oCLContext = Process.GetRouteFrequencies(onlyActive);

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
        [Route("api/RouteFrequencies/{frequencyId}")]
        public HttpResponseMessage Get(int frequencyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<RouteFrequency> oCLContext = Process.GetRouteFrequency(frequencyId);

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
        [Route("api/RouteFrequencies/Weeks")]
        public HttpResponseMessage GetFrequenciesWeeks()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Structures>> oCLContext = Process.GetRouteFrequenciesWeeks();

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


        public HttpResponseMessage Post(RouteFrequency _routeFrequency)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<RouteFrequency> oCLContext = Process.CreateRouteFrequency(_routeFrequency);

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
        
        public HttpResponseMessage Patch(RouteFrequency _routeFrequency)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<RouteFrequency> oCLContext = Process.UpdateRouteFrequency(_routeFrequency);

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