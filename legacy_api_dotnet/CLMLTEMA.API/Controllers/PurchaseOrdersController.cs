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
    [CompanyBinderActionFilter]
    [Authorize]
    public class PurchaseOrdersController : ApiController
    {
       
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                PurchaseOrder document = new PurchaseOrder();
                LogManager.Record("CONTROLLER STARTED");
                document = JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<PurchaseOrder> oCLContext = await Process.PostPurchaseOrder(document,attachment, attachmentFiles);

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
        
        public async Task<HttpResponseMessage> Patch(PurchaseOrder purchaseOrder)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                PurchaseOrder document = new PurchaseOrder();
                document = JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<PurchaseOrder> oCLContext = await Process.PatchPurchaseOrder(document,attachment, attachmentFiles);

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
        /// Endpoint to obtain purchase orders based on specific filters.
        /// </summary>
        /// <param name="SlpCode">Sales employee code to filter purchase orders.</param>
        /// <param name="DateFrom">Start date for filtering purchase orders.</param>
        /// <param name="DateTo">End date for filtering purchase orders.</param>
        /// <param name="DocNum">Document number to search for a specific purchase order.</param>
        /// <param name="DocStatus">Document status to filter purchase orders.</param>
        /// <param name="CardCode">Optional. Business partner code to filter purchase orders.</param>
        /// <param name="CardName">Optional. Business partner name to filter purchase orders.</param>
        /// <returns>
        /// An HTTP response message containing the filtered list of purchase orders.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateFrom,
            string DateTo, int DocNum, string DocStatus, string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<PurchaseOrder>> oCLContext = await Process.GetPurchaseOrders(SlpCode, DateFrom, DateTo,
                    DocNum, DocStatus, CardCode, CardName);

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
        /// Endpoint to obtain a specific purchase order based on the document entry.
        /// </summary>
        /// <param name="DocEntry">The unique identifier (DocEntry) of the purchase order.</param>
        /// <returns>
        /// An HTTP response message containing the requested purchase order.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PurchaseOrder> oCLContext = await Process.GetPurchaseOrder(DocEntry);

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
        
        [Route("~/api/PurchaseOrders/PostDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostPurchaseOrderDrafts()
        {
            PurchaseOrder purchaseOrder = new PurchaseOrder();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                purchaseOrder = JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<PurchaseOrder> oCLContext = await Process.PostPurchaseOrderDrafts(purchaseOrder, attachment, attachmentFiles);

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
        
        [Route("~/api/PurchaseOrders/PatchDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchDocumentsDrafts()
        {
            PurchaseOrder purchaseOrder = new PurchaseOrder();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                purchaseOrder = JsonConvert.DeserializeObject<PurchaseOrder>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<PurchaseOrder> oCLContext = await Process.PatchPurchaseOrderDrafts(purchaseOrder, attachment, attachmentFiles);
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
