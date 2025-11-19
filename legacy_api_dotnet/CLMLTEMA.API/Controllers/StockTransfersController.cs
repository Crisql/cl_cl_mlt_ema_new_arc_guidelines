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
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;
using Newtonsoft.Json;


namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class StockTransfersController : ApiController
    { 
        public async Task<HttpResponseMessage> Post()
        {
            StockTransfer document = new StockTransfer();
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<StockTransfer>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<StockTransfer> oCLContext = await Process.CreateStockTransfers(document, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, document);
            }
        }
        
        /// <summary>
        /// Retrieves a list of stock transfer requests based on the specified filtering criteria with pagination enabled.
        /// </summary>
        /// <param name="DocNum">The document number to filter the stock transfer requests.</param>
        /// <param name="DateInit">The start date for filtering the stock transfer requests (format: YYYY-MM-DD).</param>
        /// <param name="DateEnd">The end date for filtering the stock transfer requests (format: YYYY-MM-DD).</param>
        /// <param name="SlpCode">The sales representative code used to filter the stock transfer requests.</param>
        /// <param name="DocStatus">The status of the document (e.g., Open, Closed) used to filter the stock transfer requests.</param>
        /// <returns>
        /// An HTTP response containing a list of stock transfer requests filtered by the provided criteria.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int DocNum, string DateInit, string DateEnd, int SlpCode,
            string DocStatus)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<TransfersRequests>> oCLContext = await Process.GetStockTransferRequest(DocNum, DateInit, 
                    DateEnd, SlpCode, DocStatus);

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
        
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry, string Accion)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<StockTransfer> oCLContext = await Process.GetStockTransfersHeader(DocEntry, Accion);

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
            StockTransfer document = new StockTransfer();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<StockTransfer>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<StockTransfer> oCLContext = await Process.PatchStockTansfers(document, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, document);
            }
        }
        
        /// <summary>
        /// Endpoint to retrieve the list of available locations within a warehouse for a specific item.
        /// </summary>
        /// <param name="WhsCode">The warehouse code where the item is stored.</param>
        /// <param name="ItemCode">The code of the item for which locations are being retrieved.</param>
        /// <returns>
        /// A task representing the HTTP response message containing the list of available locations
        /// for the specified item within the specified warehouse.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetLocations(string WhsCode, string ItemCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                CLContext<List<WarehouseBinLocation>> oCLContext = await Process.GetWarehousesBinLocationFrom(WhsCode, ItemCode);
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
        /// Creates a new stock transfer draft using the provided document and attachments.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the result of the creation operation.
        /// </returns>
        [Route("~/api/StockTransfers/PostStockTransfersDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostStockTransfersDrafts()
        {
            StockTransfer stockTransfer = new StockTransfer();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                stockTransfer = JsonConvert.DeserializeObject<StockTransfer>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<StockTransferDraft> oCLContext = await Process.PostStockTransfersDrafts(stockTransfer, attachment, attachmentFiles);

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
        /// Updates existing stock transfer drafts with the provided document and attachments.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the result of the update operation.
        /// </returns>
        [Route("~/api/StockTransfers/PatchStockTransfersDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchStockTransfersDrafts()
        {
            StockTransfer stockTransfer = new StockTransfer();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                stockTransfer = JsonConvert.DeserializeObject<StockTransfer>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);
                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;
                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<StockTransferDraft> oCLContext = await Process.PatchStockTransfersDrafts(stockTransfer, attachment, attachmentFiles);
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
