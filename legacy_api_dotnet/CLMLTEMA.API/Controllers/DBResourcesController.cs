using CL.COMMON;
using CL.STRUCTURES.CLASSES;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class DBResourcesController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<DBResource>> oClContext = Process.GetDBResources();

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        public HttpResponseMessage Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResource> oClContext = Process.GetDBResource(id);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        [Route("api/DBResources/{resourceId:int}/Company/{companyId:int}")]
        public HttpResponseMessage GetResourceByCompany(int resourceId, int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResource> oClContext = Process.GetDBResourceByCompany(resourceId, companyId);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        [Route("api/DBResources/Company/{companyId:int}")]
        public HttpResponseMessage GetResourcesByCompany(int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<DBResource>> oClContext = Process.GetDBResourceByCompany(companyId);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        public HttpResponseMessage Post([FromBody] DBResourceWithCompany dBResource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResourceWithCompany> oClContext = Process.PostDbResource(dBResource);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        public HttpResponseMessage Patch([FromBody] DBResourceWithCompany dBResource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResourceWithCompany> oClContext = Process.PatchDbResource(dBResource);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        
        [HttpPost]
        [Route("api/DBResources/PostDBResource")]
        public HttpResponseMessage PostResource([FromBody] DBResourceWithCompany dBResource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResourceWithCompany> oClContext = Process.PostDbResourceInDbResources(dBResource);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        
        [HttpPatch]
        [Route("api/DBResources/PatchDBResource")]
        public HttpResponseMessage PatchResource([FromBody] DBResourceWithCompany dBResource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DBResourceWithCompany> oClContext = Process.PatchDbResourceById(dBResource);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        [Route("api/DBResources/Types")]
        public HttpResponseMessage GetDbResourceTypes()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<DBResourceType>> oClContext = Process.GetDBResourceTypes();

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        /// Retrieves the UI context information for the currently authenticated user based on a specified resource.
        /// </summary>
        /// <param name="resource">The resource identifier used to resolve the user's UI context.</param>
        /// <returns>An <c>HttpResponseMessage</c> containing a <c>CLContext</c> with the user's UI context data.</returns>
        /// <remarks>
        /// This endpoint resolves the user context by calling the internal <c>GetUserUiCtx</c> method,
        /// and returns relevant connection and UI configuration details. If an error occurs, a formatted error response is returned.
        /// </remarks>
        /// <response code="200">Returns the user UI context successfully.</response>
        /// <response code="400">If the context could not be determined or an error occurred.</response>
        /// <exception cref="Exception">Returned through the <c>ContextBroker</c> in case of unexpected errors.</exception>
        [HttpGet]
        [Route("api/DBResources/GetUserCtx/{resource}")]
        public HttpResponseMessage GetDbResourceTypes(string resource)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                ClUserUiContext clUserContext = Process.GetUserUiCtx(resource);

                CLContext<ClUserUiContext> oClContext = new CLContext<ClUserUiContext>()
                {
                    Response = new Response<ClUserUiContext>()
                    {
                        Data = clUserContext
                    },
                    value = clUserContext,
                    Code = HttpStatusCode.OK
                };

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
