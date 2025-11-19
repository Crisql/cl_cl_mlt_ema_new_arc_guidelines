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
    public class DeliveryNotesController : ApiController
    {
        /// <summary>
        /// This endpoint is used to create delivery notes
        /// </summary>
        /// <param name="delivery">Model delivery notes</param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                Delivery document = new Delivery();
                LogManager.Record("CONTROLLER STARTED");

                document = JsonConvert.DeserializeObject<Delivery>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<Delivery> oClContext = await Process.PostDelivery(document, attachment, attachmentFiles);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oClContext);
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
        /// This endpoint is used to filter delivery notes by params
        /// </summary>
        /// <param name="SlpCode">Sales person code</param>
        /// <param name="DateInit">Date init</param>
        /// <param name="DateEnd">Date end</param>
        /// <param name="DocNum">Number document</param>
        /// <param name="DocStatus">Document number</param>
        /// <param name="DocCurrency">Currency document to search</param>
        /// <param name="CardCode">Pather code</param>
        /// <param name="CardName">Pather name</param>
        /// <returns></returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Delivery>> oCLContext = await Process.GetDeliveryNotes(SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName);

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
        /// This endpoint is used to get one documents Delivery notes
        /// </summary>
        /// <param name="DocEntry">internal number</param>
        /// <returns></returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Delivery> oCLContext = await Process.GetDelivery( DocEntry);

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