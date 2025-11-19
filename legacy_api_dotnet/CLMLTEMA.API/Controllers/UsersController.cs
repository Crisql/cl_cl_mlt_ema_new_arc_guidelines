using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using System.Threading.Tasks;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class UsersController : ApiController
    {
        
        
        
        // GET : api/Users/1/Companies?active=true
        [Route("~/api/Users/{userId:int}/Companies")]
        [HttpGet]
        public HttpResponseMessage GetUserCompanies(int userId, bool active)
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<Company>> cLContext = PROCESS.Process.GetUserActiveCompanies(userId);

                LogManager.Record("FIN DE CONTROLADOR");

                return Core.ContextBroker(cLContext);
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

        // GET: /api/Users/1/Roles
        [Route("~/api/Users/{userId:int}/Companies")]
        [HttpGet]
        public HttpResponseMessage GetUserCompanies(int userId)
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<Company>> cLContext = Process.GetUserCompanies(userId);

                LogManager.Record("FIN DE CONTROLADOR");

                return Core.ContextBroker(cLContext);
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

        //PATCH: /api/Users/1/Company/4/Roles
        [Route("~/api/Users/{userId:int}/Company/{companyId:int}/Roles")]
        [HttpPatch]
        public HttpResponseMessage PostRolesUser([FromUri] int userId, [FromUri] int companyId, [FromBody] IEnumerable<Role> _roles)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Role>> oCLContext = Process.PatchRolesByUser(userId, companyId, _roles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _roles);
            }
        }

        [Route("~/api/Users/{userId:int}/Company/{companyId:int}/Roles")]
        [HttpGet]
        public HttpResponseMessage GetUserRolesByCompany([FromUri] int userId, [FromUri] int companyId, [FromBody] IEnumerable<Role> _roles)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Role>> oCLContext = Process.GetUserRolesByCompany(userId, companyId, _roles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _roles);
            }
        }
        // GET: api/Users
        public HttpResponseMessage Get(bool active)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<User>> oCLContext = Process.GetUsers(active);

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

        // GET: api/Users/5
        public HttpResponseMessage Get(int id)
        {

            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<User> oCLContext = Process.GetUser(id);

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

        // POST: api/Users
        public HttpResponseMessage Post([FromBody] User user)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<User> oCLContext = Process.PostUser(user);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, user);
            }
        }

        // POST: api/Users
        public HttpResponseMessage Patch([FromBody] User user)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<User> oCLContext = Process.PatchUser(user);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, user);
            }
        }

        [Route("api/Users/UsersByCompany")]
        [HttpGet]
        public HttpResponseMessage GetUserByCompany()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<User>> oCLContext = Process.GetUsersByCompany();

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
        
        #region User Assign
        
        //GET: /api/Users/1/Assigns
        [Route("~/api/Users/{userId:int}/Assigns")]
        [HttpGet]
        public HttpResponseMessage GetUserAssigns([FromUri] int userId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<UserAssign>> oCLContext = Process.GetUserAssigns(userId);

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

        #endregion

        #region GeoRoles

        //PATCH: /api/Users/1/Company/4/GeoRoles
        [Route("~/api/Users/{userId:int}/Company/{companyId:int}/GeoRoles")]
        [HttpPatch]
        public HttpResponseMessage PostGeoRolesUser([FromUri] int userId, [FromUri] int companyId, [FromBody] IEnumerable<GeoRole> _geoRoles)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoRole>> oCLContext = Process.PatchGeoRolesByUser(userId, companyId, _geoRoles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _geoRoles);
            }
        }

        //GET: /api/Users/1/Company/4/GeoRoles
        [Route("~/api/Users/{userId:int}/Company/{companyId:int}/GeoRoles")]
        [HttpGet]
        public HttpResponseMessage GetUserGeoRolesByCompany([FromUri] int userId, [FromUri] int companyId, [FromBody] IEnumerable<GeoRole> _geoRoles)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoRole>> oCLContext = Process.GetUserGeoRolesByCompany(userId, companyId, _geoRoles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _geoRoles);
            }
        }
        
        // I couldn't sure if those default parameters are working or how it work
        [Route("~/api/Users/{userId:int}/Company/{companyId:int}/GeoConfigs")]
        [HttpGet]
        public HttpResponseMessage GetUserGeoConfigs([FromUri] int userId = 0, [FromUri] int companyId = 0)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GeoConfigByUser>> oCLContext = Process.GetGeoConfigsByUser(userId, companyId);

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
        
        [Route("~/api/Users/{userId:int}/Routes")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetUserAssignedRoutes([FromUri] int userId, string imei)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<PresentationRouteWithLines>> oCLContext = await Process.GetUserAssignedRoutes(userId, imei);

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
        
        [Route("~/api/Users/{userId:int}/ActiveRoutes")]
        [HttpGet]
        public HttpResponseMessage GetUserActiveRoutes([FromUri] int userId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<PresentationRoute>> oCLContext = Process.GetUserActiveRoutes(userId);

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

        #endregion
    }
}
