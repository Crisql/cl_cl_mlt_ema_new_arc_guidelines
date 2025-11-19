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
    public class PurchaseDownPaymentsController : ApiController
    {
        /// <summary>
        /// Method to create purchase advances
        /// </summary>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post()
        {
            AdvancePurchaseInvoiceWithPayment document = new AdvancePurchaseInvoiceWithPayment();
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<AdvancePurchaseInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<AdvancePurchaseInvoiceWithPayment> oCLContext = await Process.PostPurchaseDownPayments(document, attachment, attachmentFiles);

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
        /// Retrieves a list of purchase down payments based on the specified filters.
        /// </summary>
        /// <param name="SlpCode">The sales representative code to filter the down payments.</param>
        /// <param name="DateFrom">The start date for filtering records.</param>
        /// <param name="DateTo">The end date for filtering records.</param>
        /// <param name="DocNum">The document number to filter the down payments.</param>
        /// <param name="DocStatus">The status of the document to filter.</param>
        /// <param name="CardCode">The business partner code (optional).</param>
        /// <param name="CardName">The business partner name (optional).</param>
        /// <returns>
        /// An HTTP response message containing the list of purchase down payments.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateFrom,
            string DateTo, int DocNum, string DocStatus, string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<DownPayments>> oCLContext = await Process.GetAPDownPayments(SlpCode, DateFrom, DateTo,
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
        /// Endpoint to retrieve an Accounts Payable (AP) Down Payment based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The unique document entry identifier for the AP Down Payment.</param>
        /// <returns>
        /// A task representing the HTTP response containing the requested AP Down Payment details.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DownPayments> oCLContext = await Process.GetAPDownPayment(DocEntry);

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
        
    [Route("~/api/PurchaseDownPayments/PostDocumentsDrafts")]
    [HttpPost]
    public async Task<HttpResponseMessage> PostPurchasesDrafts()
    {
        AdvancePurchaseInvoiceWithPayment document = new AdvancePurchaseInvoiceWithPayment();
        try
        {
            LogManager.Record("CONTROLLER STARTED");

            document = JsonConvert.DeserializeObject<AdvancePurchaseInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);

            string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
            DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

            IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

            if (HttpContext.Current.Request.Files.Count > 0)
            {
                HttpFileCollection files = HttpContext.Current.Request.Files;

                attachmentFiles = files.AllKeys.Select(key => files[key]);
            }
            CLContext<DownPayments> oCLContext = await Process.PostAPDownPaymentDrafts(document.APInvoice, attachment, attachmentFiles);
            CLContext<AdvancePurchaseInvoiceWithPayment> oCLContextResponse = new CLContext<AdvancePurchaseInvoiceWithPayment>()
            {
                Code = oCLContext.Code,
                value = new AdvancePurchaseInvoiceWithPayment()
                {
                    APInvoice = oCLContext.Response.Data
                },
                Response = new Response<AdvancePurchaseInvoiceWithPayment>()
                {
                    Data =new AdvancePurchaseInvoiceWithPayment(){APInvoice =oCLContext.Response.Data },
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
    
    [Route("~/api/PurchaseDownPayments/PatchDocumentsDrafts")]
    [HttpPost]
    public async Task<HttpResponseMessage> PatchDocumentsDrafts()
    {
        AdvancePurchaseInvoiceWithPayment document = new AdvancePurchaseInvoiceWithPayment();
        try
        {
            LogManager.Record("CONTROLLER STARTED");
            document = JsonConvert.DeserializeObject<AdvancePurchaseInvoiceWithPayment>(HttpContext.Current.Request.Form["Document"]);
            string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
            DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);
            IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                HttpFileCollection files = HttpContext.Current.Request.Files;
                attachmentFiles = files.AllKeys.Select(key => files[key]);
            }
            CLContext<DownPayments> oCLContext = await Process.PatchAPDownPaymentDrafts(document.APInvoice, attachment, attachmentFiles);
            CLContext<AdvancePurchaseInvoiceWithPayment> oCLContextResponse = new CLContext<AdvancePurchaseInvoiceWithPayment>()
            {
                Code = oCLContext.Code,
                value = new AdvancePurchaseInvoiceWithPayment()
                {
                    APInvoice = oCLContext.Response.Data
                },
                Response = new Response<AdvancePurchaseInvoiceWithPayment>()
                {
                    Data =new AdvancePurchaseInvoiceWithPayment(){APInvoice =oCLContext.Response.Data },
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

