using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
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

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class QuotationsController : ApiController
    {
        /// <summary>
        /// Retrieves a sales quotation based on the specified document entry.
        /// </summary>
        /// <param name="DocEntry">The document entry identifier for the sales quotation to be retrieved.</param>
        /// <returns>An <see cref="HttpResponseMessage"/> containing the sales quotation data or an error message.</returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SalesQuotation> oCLContext = await Process.GetQuotation(DocEntry);

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
        /// Endpoint to retrieve a paginated list of sales quotations based on the provided filters.
        /// </summary>
        /// <param name="SlpCode">The salesperson code used to filter quotations.</param>
        /// <param name="DateInit">The initial date for the quotation search range.</param>
        /// <param name="DateEnd">The end date for the quotation search range.</param>
        /// <param name="DocNum">The document number to filter quotations.</param>
        /// <param name="DocStatus">The status of the document to filter quotations.</param>
        /// <param name="DocCurrency">The currency used to filter quotations (optional).</param>
        /// <param name="CardCode">The business partner code used to filter quotations (optional).</param>
        /// <param name="CardName">The business partner name used to filter quotations (optional).</param>
        /// <returns>
        /// A task representing the HTTP response message containing the filtered and paginated list of sales quotations.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "") 
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesQuotation>> oCLContext = await Process.GetQuotations(SlpCode, DateInit, DateEnd, DocNum,
                    DocStatus, DocCurrency, CardCode, CardName);

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
            SalesQuotation quotation = new SalesQuotation();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                quotation = JsonConvert.DeserializeObject<SalesQuotation>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<SalesQuotation> oCLContext = await Process.PostQuotations(quotation, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, quotation);
            }
        }

        public async Task<HttpResponseMessage> Patch()
        {
            SalesQuotation quotation = new SalesQuotation();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                quotation = JsonConvert.DeserializeObject<SalesQuotation>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<SalesQuotation> oCLContext = await Process.PatchQuotations(quotation, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, quotation);
            }
        }
        
        [Route("~/api/Quotations/PostDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostQuotationsDrafts()
        {
            SalesQuotation quotation = new SalesQuotation();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                quotation = JsonConvert.DeserializeObject<SalesQuotation>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<SalesQuotation> oCLContext = await Process.PostQuotationsDrafts(quotation, attachment, attachmentFiles);

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
        
        [Route("~/api/Quotations/PatchDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchDocumentsDrafts()
        {
            SalesQuotation quotation = new SalesQuotation();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                quotation = JsonConvert.DeserializeObject<SalesQuotation>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);
                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;
                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<SalesQuotation> oCLContext = await Process.PatchQuotationsDrafts(quotation, attachment, attachmentFiles);
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
        /// Handles HTTP DELETE requests to cancel a sales quotation by its document entry.
        /// </summary>
        /// <param name="DocEntry">
        /// The unique identifier (document entry) of the sales quotation to be canceled.
        /// </param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the result of the cancel operation:
        /// either the canceled <see cref="SalesOrder"/> context or an error response.
        /// </returns>
        [HttpDelete]
        public async Task<HttpResponseMessage> Delete(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SalesQuotation> oCLContext = await Process.CancelQuotations(DocEntry);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, DocEntry);
            }
        }
    }
}