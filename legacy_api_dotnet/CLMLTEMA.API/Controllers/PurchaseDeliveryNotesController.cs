using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
    public class PurchaseDeliveryNotesController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            GoodsReceiptPO document = new GoodsReceiptPO();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                document = JsonConvert.DeserializeObject<GoodsReceiptPO>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<GoodsReceiptPO> oCLContext = await Process.PostPurchaseDeliveryNotes(document, attachment, attachmentFiles);

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
        
        [HttpPost]
        [Route("api/PurchaseDeliveryNotes/PurchaseDeliveryNotesXml")]
        public async Task<HttpResponseMessage> PurchaseDeliveryNotesXml()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                HttpRequest oHttpRequest = HttpContext.Current.Request;

                CLContext<GoodsReceiptPO> oCLContext = await Process.PurchaseDeliveryNotesXml(oHttpRequest);

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
        /// Retrieves a list of purchase delivery notes based on the specified criteria.
        /// </summary>
        /// <param name="SlpCode">The sales representative's code.</param>
        /// <param name="DateFrom">The start date for filtering purchase delivery notes (format: YYYY-MM-DD).</param>
        /// <param name="DateTo">The end date for filtering purchase delivery notes (format: YYYY-MM-DD).</param>
        /// <param name="DocNum">The document number of the purchase delivery note.</param>
        /// <param name="DocStatus">The status of the document (e.g., Open, Closed).</param>
        /// <param name="CardCode">The business partner's code (optional).</param>
        /// <param name="CardName">The business partner's name (optional).</param>
        /// <returns>
        /// An HTTP response containing a list of purchase delivery notes matching the specified criteria.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateFrom,
            string DateTo, int DocNum, string DocStatus, string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<GoodsReceiptPO>> oCLContext = await Process.GetPurchaseDeliveryNotes(SlpCode, DateFrom, DateTo, DocNum, DocStatus, CardCode, CardName);

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
        /// Endpoint to retrieve a Goods Receipt Purchase Order (GRPO) based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The unique document entry identifier for the GRPO.</param>
        /// <returns>
        /// An HTTP response message containing the requested GRPO details.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GoodsReceiptPO> oCLContext = await Process.GetGoodsReceipt(DocEntry);

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