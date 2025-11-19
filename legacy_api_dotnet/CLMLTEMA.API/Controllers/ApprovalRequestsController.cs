using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class ApprovalRequestsController : ApiController
    {
        /// <summary>
        /// Retrieves a list of approval requests based on the specified criteria.
        /// </summary>
        /// <param name="DateInit">The start date for filtering approval requests.</param>
        /// <param name="DateEnd">The end date for filtering approval requests.</param>
        /// <param name="DraftEntry">The draft entry identifier for the approval requests.</param>
        /// <param name="ApprovalStatus">The status of the approval requests to filter by.</param>
        /// <param name="DocType">The document type of the approval requests.</param>
        /// <returns>A <see cref="HttpResponseMessage"/> containing the result of the operation, which includes the list of approval requests.</returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string DateInit, string DateEnd, int DraftEntry, string ApprovalStatus, string DocType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ApprovalRequest>> oCLContext = await Process.GetApprovalRequests( DateInit,  DateEnd,  DraftEntry,  ApprovalStatus,  DocType);

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

        public async Task<HttpResponseMessage> Patch(ApprovalRequest approvalRequest)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ApprovalRequest> oCLContext = await Process.PatchApprovalRequests(approvalRequest, Convert.ToInt32(approvalRequest.ObjectType));

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, approvalRequest);
            }
        }
        
        /// <summary>
        /// Retrieves approval requests based on the provided list of codes.
        /// </summary>
        /// <param name="Codes">A list of integer codes representing the approval requests to be retrieved.</param>
        /// <returns>A <see cref="HttpResponseMessage"/> containing the result of the operation, which includes the list of approval requests.</returns>
        [HttpPost]
        public async Task<HttpResponseMessage> GetApprovalRequest([FromBody] List<int> Codes)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                

                CLContext<List<ApprovalRequest>> cLContext = await Process.GetApprovalRequest(Codes);

                LogManager.Record("CONTROLLER ENDED UP");

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
    }
}