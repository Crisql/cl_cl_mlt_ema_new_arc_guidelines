using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
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
    public class OrdersController : ApiController
    {
        public async Task<HttpResponseMessage> Post()
        {
            SalesOrder order = new SalesOrder();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                order = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<SalesOrder> oCLContext = await Process.PostOrders(order, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, order);
            }
        }

        public async Task<HttpResponseMessage> Patch()
        {
            SalesOrder order = new SalesOrder();
            
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                order = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                
                CLContext<SalesOrder> oCLContext = await Process.PatchOrders(order, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, order);
            }
        }

        /// <summary>
        /// Retrieves a sales order based on the specified document entry.
        /// </summary>
        /// <param name="DocEntry">The document entry identifier for the sales order to be retrieved.</param>
        /// <returns>An <see cref="HttpResponseMessage"/> containing the sales order details if successful, or an error message if an exception occurs.</returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SalesOrder> oCLContext = await Process.GetOrder(DocEntry);

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
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesOrder>> oCLContext = await Process.GetOrders(SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName);

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
        
        [Route("~/api/Orders/PostDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostSalesOrdeDrafts()
        {
            SalesOrder _order = new SalesOrder();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                LogManager.Record("CONTROLLER STARTED");
                
                _order = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["Document"]);

                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<SalesOrder> oCLContext = await Process.PostSalesOrdeDrafts(_order,attachment, attachmentFiles);

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
        
        [Route("~/api/Orders/PatchDocumentsDrafts")]
        [HttpPost]
        public async Task<HttpResponseMessage> PatchDocumentsDrafts()
        {
            SalesOrder _order = new SalesOrder();
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                LogManager.Record("CONTROLLER STARTED");
                
                _order = JsonConvert.DeserializeObject<SalesOrder>(HttpContext.Current.Request.Form["Document"]);
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);
                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();
                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;
                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }
                CLContext<SalesOrder> oCLContext = await Process.PatchSalesOrdeDrafts(_order,attachment, attachmentFiles);
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
        /// Handles HTTP DELETE requests to cancel a sales order by its document entry.
        /// </summary>
        /// <param name="DocEntry">
        /// The unique identifier (document entry) of the sales order to be canceled.
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

                CLContext<SalesOrder> oCLContext = await Process.CancelOrders(DocEntry);

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
