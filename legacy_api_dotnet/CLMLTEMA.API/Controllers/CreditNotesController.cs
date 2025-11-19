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

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class CreditNotesController : ApiController
    {

        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                ARCreditMemo document = new ARCreditMemo();
                document = JsonConvert.DeserializeObject<ARCreditMemo>(HttpContext.Current.Request.Form["Document"]);
                
                string attachmentJson = HttpContext.Current.Request.Form["Attachment"];
                
                DocumentAttachment attachment = (attachmentJson is null) ? null : JsonConvert.DeserializeObject<DocumentAttachment>(attachmentJson);

                IEnumerable<HttpPostedFile> attachmentFiles = new List<HttpPostedFile>();

                if (HttpContext.Current.Request.Files.Count > 0)
                {
                    HttpFileCollection files = HttpContext.Current.Request.Files;

                    attachmentFiles = files.AllKeys.Select(key => files[key]);
                }

                CLContext<ARCreditMemo> oCLContext = await Process.PostCreditNotes(document, attachment, attachmentFiles);

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
        /// Method to get credit notes
        /// </summary>
        /// <param name="SlpCode">SplCode document to search</param>
        /// <param name="DateInit">Date init document to search</param>
        /// <param name="DateEnd">Date end document to search</param>
        /// <param name="DocNum">Docnum document to search</param>
        /// <param name="DocStatus">Status document to search</param>
        /// <param name="DocCurrency">Currency document to search</param>
        /// <param name="CardCode">Code business document to search</param>
        /// <param name="CardName">Name business document to search</param>
        /// <returns></returns>
        [EnablePagination]
        public async Task<HttpResponseMessage> Get(int SlpCode, string DateInit,
            string DateEnd, int DocNum, string DocStatus, string DocCurrency = "", string CardCode = "", string CardName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ARCreditMemo>> oCLContext = await Process.GetCreditNotes(SlpCode, DateInit, DateEnd, DocNum, DocStatus, DocCurrency, CardCode, CardName);

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
        /// Obtiene nc en estado abierto para hacer reconciliacion 
        /// </summary>
        /// <param name="CardCode">CardCode document to search</param>
        /// <param name="DocCurrency">Currency document to search</param>
        /// <param name="DateInit">Date init document to search</param>
        /// <param name="DateEnd">Date end document to search</param>
        /// <returns></returns>
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetCreditNotesOpen(string CardCode, string DocCurrency, string DateInit, string DateEnd)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ReconciliationCreditMemo>> oCLContext = await Process.GetCreditNotesOpen(CardCode, DocCurrency, DateInit, DateEnd);

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
        /// Method to get credit note by DocEntry
        /// </summary>
        /// <param name="DocEntry">DocEntry to get credit note</param>
        /// <returns></returns>
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ARCreditMemo> oCLContext = await Process.GetCreditNote(DocEntry);

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
