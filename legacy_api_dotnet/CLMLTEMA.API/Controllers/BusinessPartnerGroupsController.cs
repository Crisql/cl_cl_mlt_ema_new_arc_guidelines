using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.ModelBinding;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class BusinessPartnerGroupsController : ApiController
    {
        /// <summary>
        ///Retrieve all Business Partner Groups.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the list of Business Partner Groups and status information.
        /// </returns>
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartnerGroup>> oCLContext = await PROCESS.Process.GetBusinessPartnersGroups();

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
        /// API endpoint to retrieve Business Partner Groups filtered by a specific group type.
        /// </summary>
        /// <param name="GroupType">The type of group to filter.</param>
        /// <returns>
        /// An HTTP response containing a <see cref="CLContext{List{BusinessPartnerGroup}}"/> with the matching groups or an error response.
        /// </returns>
        [HttpGet]
        [Route("api/BusinessPartnerGroups/BpGroupsByGroupType")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetBpGroupsByGroupType(string GroupType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BusinessPartnerGroup>> oCLContext = await PROCESS.Process.GetBpGroupsByGroupType(GroupType);

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