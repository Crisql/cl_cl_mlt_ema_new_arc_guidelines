using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using Newtonsoft.Json;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class PurchaseInvoicesController : ApiController
    {
        /// <summary>
        /// Method to create invoice purchase
        /// </summary>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post()
        {
            APInvoiceWithPayment document = new APInvoiceWithPayment();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<APInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<APInvoiceWithPayment> oCLContext = await Process.CreatePurchaseInvoiceWithPayment(document, attachment, attachmentFiles);

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
        /// Endpoint to retrieve open purchase invoices available for payment application.
        /// </summary>
        /// <param name="CardCode">The unique business partner code.</param>
        /// <param name="DocCurrency">The currency of the invoices to be retrieved.</param>
        /// <param name="DateInit">The start date for filtering invoices.</param>
        /// <param name="DateEnd">The end date for filtering invoices.</param>
        /// <returns>
        /// A task representing an HTTP response message containing the list of open purchase invoices.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string CardCode, string DocCurrency, string DateInit, string DateEnd)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<InvoiceOpen>> oCLContext = await Process.GetOpenPurchaseInvoices(CardCode, DocCurrency,
                    DateInit, DateEnd);

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
        /// Endpoint to retrieve a list of Accounts Payable (AP) Invoices based on the provided filters.
        /// </summary>
        /// <param name="SlpCode">The salesperson code to filter the invoices.</param>
        /// <param name="DateFrom">The start date for filtering invoices.</param>
        /// <param name="DateTo">The end date for filtering invoices.</param>
        /// <param name="DocNum">The document number to filter a specific invoice.</param>
        /// <param name="DocStatus">The status of the invoice (e.g., open, closed).</param>
        /// <param name="CardCode">Optional. The business partner code to filter invoices.</param>
        /// <param name="CardName">Optional. The business partner name to filter invoices.</param>
        /// <returns>
        /// A task representing an HTTP response message containing the requested AP Invoices.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateFrom,
            string DateTo, int DocNum, string DocStatus, string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<APInvoice>> oCLContext = await Process.GetPurchaseInvoices(SlpCode, DateFrom, DateTo,
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
        /// Endpoint to retrieve an accounts payable (AP) invoice based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The unique document entry identifier for the AP invoice.</param>
        /// <returns>
        /// An HTTP response message containing the requested AP invoice.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<APInvoice> oCLContext = await Process.GetPurchaseInvoice( DocEntry);

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
        
        [Route("~/api/PurchaseInvoices/PostDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostInvoicesDrafts()
        {
            APInvoiceWithPayment document = new APInvoiceWithPayment();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
             
                document = JsonConvert.DeserializeObject<APInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<APInvoice> oCLContext = await Process.PostPurchaseInvoicesDrafts(document.APInvoice, attachment, attachmentFiles);
                CLContext<APInvoiceWithPayment> oCLContextResponse = new CLContext<APInvoiceWithPayment>()
                {
                    Code = oCLContext.Code,
                    value = new APInvoiceWithPayment()
                    {
                        APInvoice = oCLContext.Response.Data
                    },
                    Response = new Response<APInvoiceWithPayment>()
                    {
                        Data =new APInvoiceWithPayment(){APInvoice =oCLContext.Response.Data },
                        Message = oCLContext.Response.Message
                    }
                };

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContextResponse);
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
        
        [Route("~/api/PurchaseInvoices/PatchDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchDocumentsDrafts()
        {
            APInvoiceWithPayment document = new APInvoiceWithPayment();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
             
                document = JsonConvert.DeserializeObject<APInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);
                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;
                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<APInvoice> oCLContext = await Process.PatchPurchaseInvoicesDrafts(document.APInvoice, attachment, attachmentFiles);
                CLContext<APInvoiceWithPayment> oCLContextResponse = new CLContext<APInvoiceWithPayment>()
                {
                    Code = oCLContext.Code,
                    value = new APInvoiceWithPayment()
                    {
                        APInvoice = oCLContext.Response.Data
                    },
                    Response = new Response<APInvoiceWithPayment>()
                    {
                        Data =new APInvoiceWithPayment(){APInvoice =oCLContext.Response.Data },
                        Message = oCLContext.Response.Message
                    }
                };
                LogManager.Record("CONTROLLER ENDED UP");
                return Core.ContextBroker(oCLContextResponse);
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
