using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class PermissionsController : ApiController
    {
        // GET: api/Permissions
        public HttpResponseMessage Get(bool active)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Permission>> oCLContext = Process.GetPermissions(active);

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
        
        public HttpResponseMessage Get(string searchCriteria, bool shouldBeActive)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Permission>> oCLContext = Process.GetFilteredPermissions(searchCriteria, shouldBeActive);

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
        
        // GET: api/Permissions/5
        [HttpGet]
        [Route("api/Permissions/{id:int}")]
        public HttpResponseMessage Get(int id)
        {

            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Permission> oCLContext = Process.GetPermission(id);

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
        
        // POST: api/Permissions
        public HttpResponseMessage Post(Permission permission)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Permission> oCLContext = Process.PostPermission(permission);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, permission);
            }
        }

        // PATCH: api/Permissions
        public HttpResponseMessage Patch(Permission permission)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Permission> oCLContext = Process.PatchPermission(permission);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, permission);
            }
        }
    }
}
