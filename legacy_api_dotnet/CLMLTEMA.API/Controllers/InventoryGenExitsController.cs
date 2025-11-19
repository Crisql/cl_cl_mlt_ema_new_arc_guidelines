using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;
using Newtonsoft.Json;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class InventoryGenExitsController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                GoodsIssue document = new GoodsIssue();
                LogManager.Record("CONTROLLER STARTED");
                document = JsonConvert.DeserializeObject<GoodsIssue>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }


                CLContext<GoodsIssue> oCLContext =  await Process.CreateInventoryOuput(document, attachment, attachmentFiles);

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
        /// Returns inventory exit (outbound transfer) requests filtered by document number,
        /// date range, salesperson, and status. Pagination is enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="DocNum">Document number filter.</param>
        /// <param name="DateInit">Start date filter.</param>
        /// <param name="DateEnd">End date filter.</param>
        /// <param name="SlpCode">Salesperson code filter.</param>
        /// <param name="DocStatus">Document status filter.</param>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int DocNum, string DateInit, string DateEnd, int SlpCode,
            string DocStatus)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<TransfersRequests>> oCLContext = await Process.GetInvetoryExistsRequest(DocNum, DateInit, DateEnd, SlpCode, DocStatus);

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