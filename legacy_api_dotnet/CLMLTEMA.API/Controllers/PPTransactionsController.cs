using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.Filters;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class PPTransactionsController : ApiController
    {
        // GET
        public async Task<HttpResponseMessage> Get(string TerminalCode, decimal ExchangeRate)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<TotalTransaction> oCLContext = await Process.GetTransactionsPinpadTotal(TerminalCode, ExchangeRate);

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
        
        public HttpResponseMessage Get(int DocEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PPTransaction> oCLContext = Process.GetPPTranByDocEntry(DocEntry);

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
        
        public HttpResponseMessage Post(PPVoidedTransaction ppVoidedTransaction)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PPVoidedTransaction> oCLContext = Process.Cancel(ppVoidedTransaction);

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
        [Route("api/PPTransactions/GetCanceledTransactions")]
        public HttpResponseMessage GetCanceledTransactions(FilterPPVoidTransaction doc)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<VoidedPresentation>> oCLContext = Process.GetCanceledTransactions(doc);

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
        [Route("api/PPTransactions/GetPPTransactionByDocumentKey")]
        public HttpResponseMessage GetPPTransactionByDocumentKey(string DocumentKey)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<VoidedPresentation>> oCLContext = Process.GetPPTransactionByDocumentKey(DocumentKey);

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
        
        [Route("api/PPTransactions/GetPPTransactionDetails")]
        public HttpResponseMessage GetPPTransactionDetails(string DocumentKey)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<VoidedPresentation>> oCLContext = Process.GetPPTransactionDetails(DocumentKey);

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