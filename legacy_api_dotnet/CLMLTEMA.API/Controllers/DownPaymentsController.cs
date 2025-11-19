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
    public class DownPaymentsController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                AdvanceInvoiceWithPayment document = new AdvanceInvoiceWithPayment();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<AdvanceInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<AdvanceInvoiceWithPayment> oCLContext = await Process.PostAdvanceInvoiceWithPayment(document, attachment, attachmentFiles);

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
        /// Retrieves a down payment document based on the specified document entry.
        /// </summary>
        /// <param name="DocEntry">The unique identifier for the down payment document.</param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the down payment document details.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DownPayments> oCLContext = await Process.GetARDownPayment( DocEntry);

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
        /// Returns A/R down payments filtered by salesperson, date range, document info, and BP data.
        /// Pagination is enabled via <c>[EnablePagination]</c>.
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
        /// <see cref="List{DownPayments}"/> (paginated); an error response otherwise.
        /// </returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<DownPayments>> oCLContext = await Process.GetARDownPayments(SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName);

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
        /// Method to get closed down payments
        /// </summary>
        /// <param name="CardCode"> Code business partner</param>
        /// <param name="DocCurrency">Currency business partner</param>
        /// <param name="DateInit">Date start</param>
        /// <param name="DateEnd">Date end </param>
        /// <param name="DocNum">DocNum document</param>
        /// <returns></returns>
        [EnablePagination]
        [Route("~/api/DownPayments/GetARDownPaymentsClosed")]
        [HttpGet]
        public async Task<HttpResponseMessage> Get(string CardCode, string DocCurrency, string DateInit, string DateEnd, int DocNum)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<AppliedDownPayment>> oCLContext = await Process.GetARDownPaymentsClosed(CardCode, DocCurrency, DateInit, DateEnd, DocNum);

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
        /// HTTP PATCH endpoint used to update an Advance Invoice.
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
                AdvanceInvoiceWithPayment document = new AdvanceInvoiceWithPayment();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<AdvanceInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];

                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<AdvanceInvoiceWithPayment> oCLContext = await Process.PatchAdvanceInvoice(document, attachment, attachmentFiles);

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