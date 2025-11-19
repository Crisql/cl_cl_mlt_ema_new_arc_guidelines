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
    public class GeoConfigsController : ApiController
    {
        // GET: api/GeoConfigs
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoConfig>> oCLContext = Process.GetGeoConfigs();

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
        
        // GET: api/GeoConfigs/5
        public HttpResponseMessage Get(int id)
        {

            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoConfig> oCLContext = Process.GetGeoConfig(id);

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
        
        // POST: api/GeoConfigs
        public HttpResponseMessage Post(GeoConfig geoConfig)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoConfig> oCLContext = Process.PostGeoConfig(geoConfig);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, geoConfig);
            }
        }

        // PATCH: api/GeoConfigs
        public HttpResponseMessage Patch(GeoConfig geoConfig)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoConfig> oCLContext = Process.PatchGeoConfig(geoConfig);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, geoConfig);
            }
        }
    }
}