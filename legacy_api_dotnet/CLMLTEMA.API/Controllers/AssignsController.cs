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
    public class AssignsController : ApiController
    {
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<UserAssign>> oCLContext = Process.GetAssigns();

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

        //GET: /api/Assigns/1
        public HttpResponseMessage Get(int assignId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<UserAssign> oCLContext = Process.GetUserAssign(assignId);

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

        public HttpResponseMessage Get(int UserId, int CompanyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<UserAssign> oCLContext = Process.GetUserAssign(UserId, CompanyId);

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
        [Route("api/Assigns/{assignId}/Routes")]
        public HttpResponseMessage GetAssignedRoutes(int assignId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<PresentationRoute>> oCLContext = Process.GetAssignedRoutes(assignId);

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

        //POST: /api/Assigns
        public HttpResponseMessage Post(UserAssign userAssign)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<UserAssign> oCLContext = Process.PostUserAssign(userAssign);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, userAssign);
            }
        }

        //PATCH: /api/Assigns
        public HttpResponseMessage Patch(UserAssign userAssign)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<UserAssign> oCLContext = Process.PatchUserAssign(userAssign);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, userAssign);
            }
        }
    }
}