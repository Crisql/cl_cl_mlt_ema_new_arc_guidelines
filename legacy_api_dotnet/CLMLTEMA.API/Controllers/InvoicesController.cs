using CL.COMMON;
using CLMLTEMA.MODELS;
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
using CLMLTEMA.MODELS.SAP;
using Newtonsoft.Json;
using Document = CLMLTEMA.MODELS.Document;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class InvoicesController : ApiController
    {
        /// <summary>
        /// Retrieves A/R invoices filtered by salesperson, dates, document info, BP data, status, and delivery.
        /// Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="SlpCode">Salesperson code.</param>
        /// <param name="DateInit">Start date filter.</param>
        /// <param name="DateEnd">End date filter.</param>
        /// <param name="DocNum">Document number filter.</param>
        /// <param name="DocStatus">Document status filter.</param>
        /// <param name="DocCurrency">Document currency filter (optional).</param>
        /// <param name="CardCode">Business partner code filter (optional).</param>
        /// <param name="CardName">Business partner name filter (optional).</param>
        /// <param name="Status">Additional status filter (optional).</param>
        /// <param name="Delivery">Delivery status filter (optional).</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{ARInvoice}"/> (paginated) on success; an error response otherwise.
        /// </returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(
            int SlpCode,
            string DateInit,
            string DateEnd,
            int DocNum,
            string DocStatus,
            string DocCurrency = "",
            string CardCode = "",
            string CardName = "",
            string Status = "",
            string Delivery = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ARInvoice>> oCLContext = await Process.GetInvoices(
                    SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName, Status, Delivery
                    );

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
        /// Controller method to get open invoices for payment received based on provided filters.
        /// </summary>
        /// <param name="CardCode">Customer or business partner code.</param>
        /// <param name="DocCurrency">Document currency code.</param>
        /// <param name="DateInit">Start date of the filter range.</param>
        /// <param name="DateEnd">End date of the filter range.</param>
        /// <returns>HTTP response with the list of open invoices matching the criteria.</returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(string CardCode, string DocCurrency, string DateInit, string DateEnd)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<InvoiceOpen>> oCLContext = await Process.GetInvoiceOpenForPayReceived(CardCode, DocCurrency, DateInit, DateEnd);

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
        /// Retrieves an invoice based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The document entry used to identify the specific invoice to retrieve.</param>
        /// <returns>
        /// An asynchronous task that returns an <see cref="HttpResponseMessage"/> containing the invoice details.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ARInvoice> oCLContext = await Process.GetInvoice(DocEntry);

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

        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                ARInvoice document = new ARInvoice();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<ARInvoice>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                ARInvoiceWithPayment documentWithPayment = new ARInvoiceWithPayment
                {
                    ARInvoice = document,
                };

                CLContext<ARInvoice> oCLContext = await Process.PostInvoices(documentWithPayment, attachment, attachmentFiles);

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

        [Route("~/api/Invoices/GetTypeInvoices")]
        [HttpGet]
        public HttpResponseMessage GetTypeInvoices()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<TypeInvoice>> oCLContext = Process.GetTypeInvoices();

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
        /// Retrieves open invoices for internal reconciliation filtered by business partner, currency, and date range.
        /// </summary>
        /// <param name="CardCode">Business partner code filter.</param>
        /// <param name="DocCurrency">Document currency filter.</param>
        /// <param name="DateInit">Start date filter.</param>
        /// <param name="DateEnd">End date filter.</param>
        /// <returns>HTTP response message containing the list of open invoices.</returns>
        [Route("~/api/Invoices/GetInvoiceForInternalReconciliation")]
        [HttpGet]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetInvoiceForInternalReconciliation(string CardCode, string DocCurrency, string DateInit, string DateEnd)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<InvoiceOpen>> oCLContext = await Process.GetInvoiceForInternalReconciliation(CardCode, DocCurrency, DateInit, DateEnd);

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
        /// Returns reserve (proforma) A/R invoices filtered by salesperson, date range,
        /// document info, and BP data. Pagination enabled via <c>[EnablePagination]</c>.
        /// </summary>
        /// <param name="SlpCode">Salesperson code.</param>
        /// <param name="DateInit">Start date filter.</param>
        /// <param name="DateEnd">End date filter.</param>
        /// <param name="DocNum">Document number filter.</param>
        /// <param name="DocStatus">Document status filter.</param>
        /// <param name="DocCurrency">Document currency filter (optional).</param>
        /// <param name="CardCode">Business partner code filter (optional).</param>
        /// <param name="CardName">Business partner name filter (optional).</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="List{ARInvoice}"/> (paginated) on success; an error response otherwise.
        /// </returns>
        [EnablePagination]
        [Route("api/Invoices/GetReserveInvoice")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetReserveInvoice(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ARInvoice>> oCLContext = await Process.GetInvoicesReserve(SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName);

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
        /// Retrieves a reserve invoice for preview based on the provided document entry identifier.
        /// </summary>
        /// <param name="DocEntry">The document entry identifier for the reserve invoice to be retrieved.</param>
        /// <returns>
        /// HTTP 200 with a serialized <see cref="CLContext{T}"/> containing
        /// <see cref="ARInvoice"/> with lines and UoM data on success; an error response otherwise.
        /// </returns>
        [Route("api/Invoices/GetReserveInvoice")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetReserveInvoiceToPreview(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ARInvoice> oCLContext = await Process.GetReserveInvoiceToPreview(DocEntry);

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

        
        [Route("~/api/Invoices/PostDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostInvoicesDrafts()
        {
            ARInvoice _arInvoice = new ARInvoice();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                _arInvoice = JsonConvert.DeserializeObject<ARInvoice>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<ARInvoice> oCLContext = await Process.PostInvoicesDrafts(_arInvoice, attachment, attachmentFiles);

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
        
        [Route("~/api/Invoices/PatchDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchDocumentsDrafts()
        {
            ARInvoice _arInvoice = new ARInvoice();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                _arInvoice = JsonConvert.DeserializeObject<ARInvoice>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<ARInvoice> oCLContext = await Process.PatchInvoicesDrafts(_arInvoice,  attachment, attachmentFiles);
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
        /// Retrieves reserved invoices based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The document entry used to retrieve the reserved invoices.</param>
        /// <returns>An asynchronous task that returns an HttpResponseMessage containing the reserved invoices.</returns>
        [EnablePagination]
        [Route("api/Invoices/GetReserveInvoice")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetReserveInvoice(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ARInvoice>> oCLContext = await Process.GetInvoicesReserve(0, "", "", DocEntry, "", "", "", "");

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
        /// HTTP PATCH endpoint used to update an A/R Invoice.  
        /// Expects a multipart /form-data request where:
        /// • “Document” (form field) contains the serialized <see cref="ARInvoice"/> in JSON.  
        /// • “Attachment” (optional form field) contains serialized <see cref="DocumentAttachment"/> metadata.  
        /// • Uploaded files (if any) are the binary contents for the attachment.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> wrapping a <see cref="CLContext{ARInvoice}"/> with the
        /// server-updated invoice, or a standardized error context on failure.
        /// </returns>
        public async Task<HttpResponseMessage> Patch()
        {
            try
            {
                ARInvoice document = new ARInvoice();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<ARInvoice>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];

                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<ARInvoice> oCLContext = await Process.PatchInvoice(document, attachment, attachmentFiles);

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

