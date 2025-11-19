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
    public class GeoRolesController : ApiController
    {
        // GET: api/GeoRoles
        public HttpResponseMessage Get(bool active)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoRole>> oCLContext = Process.GetGeoRoles(active);

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

        // GET: /api/GeoRoles/1/GeoConfigs
        [Route("~/api/GeoRoles/{geoRoleId:int}/GeoConfigs")]
        [HttpGet]
        public HttpResponseMessage GetGeoConfigsByGeoRole(int geoRoleId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoConfig>> oCLContext = Process.GetGeoConfigsByGeoRole(geoRoleId);

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

        //PATCH: /api/GeoRoles/1/GeoConfigs
        [Route("~/api/GeoRoles/{geoRoleId:int}/GeoConfigs")]
        [HttpPatch]
        public HttpResponseMessage PatchGeoConfigsByGeoRole([FromUri]int geoRoleId, [FromBody] IEnumerable<GeoConfig> geoConfigs)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoConfig>> oCLContext = Process.PatchGeoConfigsByGeoRole(geoRoleId, geoConfigs);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, geoConfigs);
            }
        }
        
        // GET: api/GeoRoles/5
        public HttpResponseMessage Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoRole> oCLContext = Process.GetGeoRole(id);

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
        
        // POST: api/GeoRoles
        public HttpResponseMessage Post([FromBody] GeoRole geoRole)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoRole> oCLContext = Process.PostGeoRole(geoRole);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, geoRole);
            }
        }

        // PATCH: api/GeoRoles
        public HttpResponseMessage Patch([FromBody] GeoRole geoRole)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GeoRole> oCLContext = Process.PatchGeoRole(geoRole);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, geoRole);
            }
        }
        
        // PUT: api/Roles/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/Roles/5
        public void Delete(int id)
        {
        }
    }
}