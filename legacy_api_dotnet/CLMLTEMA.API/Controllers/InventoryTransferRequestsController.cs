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
    public class InventoryTransferRequestsController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                StockTransferRequest document = new StockTransferRequest();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<StockTransferRequest>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<StockTransferRequest> oCLContext =
                    await Process.CreateStockTransfersRequest(document, attachment, attachmentFiles);

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
        
        public async Task<HttpResponseMessage> Patch()
        {
            try
            {
                StockTransferRequest document = new StockTransferRequest();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<StockTransferRequest>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<StockTransferRequest> oCLContext =
                    await Process.UpdateStockTansfersRequest(document, attachment, attachmentFiles);

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
        /// Retrieves a paginated list of stock transfer requests filtered by document number, date range, salesperson, and status.
        /// Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="DocNum">Document number filter.</param>
        /// <param name="DateInit">Start date filter.</param>
        /// <param name="DateEnd">End date filter.</param>
        /// <param name="SlpCode">Salesperson code filter.</param>
        /// <param name="DocStatus">Document status filter.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{TransfersRequests}"/> (paginated) on success; an error response otherwise.
        /// </returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int DocNum, string DateInit, string DateEnd, int SlpCode,
            string DocStatus)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<TransfersRequests>> oCLContext = await Process.GetTransfersRequest(DocNum, DateInit, DateEnd, SlpCode, DocStatus);

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
        /// Retrieves the stock transfer request header with lines and bin locations based on the action type.
        /// </summary>
        /// <param name="DocEntry">Document entry identifier.</param>
        /// <param name="Accion">Action type to determine if bin locations should be loaded.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="StockTransferRequest"/> on success; an error response otherwise.
        /// </returns>
        public async Task<HttpResponseMessage> Get(int DocEntry, string Accion)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<StockTransferRequest> oCLContext = await Process.GetTransfersRequestHeader(DocEntry, Accion);

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
        /// Handles the creation of inventory transfer request drafts.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> indicating the result of the operation.
        /// </returns>
        [Route("~/api/InventoryTransferRequests/PostInventoryTransferRequestsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostInventoryTransferRequestsDrafts()
        {
            StockTransferRequest stockTransfer = new StockTransferRequest();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                stockTransfer = JsonConvert.DeserializeObject<StockTransferRequest>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<StockTransferRequestDraft> oCLContext = await Process.PostInventoryTransferRequestsDrafts(stockTransfer, attachment, attachmentFiles);

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
        /// Updates existing inventory transfer request drafts.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> indicating the result of the operation.
        /// </returns>
        [Route("~/api/InventoryTransferRequests/PatchInventoryTransferRequestsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchInventoryTransferRequestsDrafts()
        {
            StockTransferRequest stockTransfer = new StockTransferRequest();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                stockTransfer = JsonConvert.DeserializeObject<StockTransferRequest>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<StockTransferRequestDraft> oCLContext = await Process.PatchInventoryTransferRequestsDrafts(stockTransfer, attachment, attachmentFiles);

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