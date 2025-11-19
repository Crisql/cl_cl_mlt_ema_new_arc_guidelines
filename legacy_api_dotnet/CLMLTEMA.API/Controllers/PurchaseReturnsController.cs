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
    public class PurchaseReturnsController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                GoodsReturn document = new GoodsReturn();
                document = JsonConvert.DeserializeObject<GoodsReturn>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<GoodsReturn> oCLContext = await Process.PostPurchaseReturns(document,attachment, attachmentFiles);

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
        /// Retrieves a list of purchase returns based on the specified filters.
        /// </summary>
        /// <param name="SlpCode">The sales representative code to filter the purchase returns.</param>
        /// <param name="DateFrom">The start date for filtering records.</param>
        /// <param name="DateTo">The end date for filtering records.</param>
        /// <param name="DocNum">The document number to filter the purchase returns.</param>
        /// <param name="DocStatus">The status of the document to filter.</param>
        /// <param name="CardCode">The business partner code (optional).</param>
        /// <param name="CardName">The business partner name (optional).</param>
        /// <returns>
        /// An HTTP response message containing the list of purchase returns.
        /// </returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateFrom,
            string DateTo, int DocNum, string DocStatus, string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<GoodsReturn>> oCLContext = await Process.GetPurchaseReturns(SlpCode, DateFrom, DateTo,
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
        /// Retrieves a specific purchase return based on the provided document entry.
        /// </summary>
        /// <param name="DocEntry">The document entry identifier of the purchase return.</param>
        /// <returns>
        /// An HTTP response message containing the details of the requested purchase return.
        /// </returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GoodsReturn> oCLContext = await Process.GetPurchaseReturn(DocEntry);

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