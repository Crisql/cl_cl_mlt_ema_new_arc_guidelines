
using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class GuideTourGroupsController : ApiController
    {
        // GET
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GuideTourGroup>> oClContext = Process.GetGuideTourGroups();
                
                LogManager.Record("CONTROLLER END UP");

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
        [Route("api/GuideTourGroups/{groupCode}")]
        public HttpResponseMessage Get(string groupCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GuideTourGroup>> oClContext = Process.GetGuideTourGroupByCode(groupCode);
                
                LogManager.Record("CONTROLLER END UP");

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
        [Route("api/GuideTourGroups/{groupCode}/Steps")]
        public HttpResponseMessage GetGroupSteps(string groupCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GuideTourStep>> oClContext = Process.GetGuideTourStepsByGroupCode(groupCode);
                
                LogManager.Record("CONTROLLER END UP");

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