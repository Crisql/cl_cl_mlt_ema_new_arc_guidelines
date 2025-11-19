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
    [ModelValidationActionFilter]
    public class RolesController : ApiController
    {
        // GET: api/Roles
        public HttpResponseMessage Get(bool active)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Role>> oCLContext = Process.GetRoles(active);

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

        // GET: /api/Roles/1/Permissions
        [Route("~/api/Roles/{roleId:int}/Permissions")]
        [HttpGet]
        public HttpResponseMessage GetRolePermissions(int roleId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Permission>> oCLContext = Process.GetPermissionsByRole(roleId);

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

        //PATCH: /api/Roles/1/Permissions
        [Route("~/api/Roles/{roleId:int}/Permissions")]
        [HttpPatch]
        public HttpResponseMessage PostPermissionsRole([FromUri]int roleId, [FromBody] IEnumerable<Permission> permissions)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Permission>> oCLContext = Process.PatchPermissionsByRole(roleId, permissions);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, permissions);
            }
        }


        // GET: api/Roles/5
        public HttpResponseMessage Get(int id)
        {

            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Role> oCLContext = Process.GetRole(id);

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

     

        // POST: api/Roles
        public HttpResponseMessage Post([FromBody] Role role)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Role> oCLContext = Process.PostRole(role);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, role);
            }
        }

        public HttpResponseMessage Patch([FromBody] Role role)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Role> oCLContext = Process.PatchRole(role);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, role);
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
