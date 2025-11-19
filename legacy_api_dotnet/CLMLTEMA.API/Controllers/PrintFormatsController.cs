using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class PrintFormatsController : ApiController
    {
        // GET
        public HttpResponseMessage Get()
        {
            throw new NotImplementedException();
        }


        public HttpResponseMessage Get(int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PrintFormat> oCLContext = Process.GetPrintFormatsByCompany(companyId);

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
        
        [HttpGet]
        [Route("api/PrintFormats/{companyId:int}/Download/{printFormatName}")]
        public HttpResponseMessage Download(int companyId, string printFormatName)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DownloadBase64> oCLContext = Process.DownloadPrintFormat(companyId, printFormatName);

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
        /// Handles the upload of print format files for a specific company.
        /// </summary>
        /// <param name="companyId">The ID of the company to update print formats for.</param>
        /// <returns>An HttpResponseMessage indicating the result of the operation.</returns>
        [HttpPost]
        [Route("api/PrintFormats/{companyId:int}")]
        public async Task<HttpResponseMessage>  Post(int companyId, bool active, string remoteServer, string path)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                List<KeyValuePair<string, HttpPostedFile>> printFormats =
                    new List<KeyValuePair<string, HttpPostedFile>>();
                
                foreach (PropertyInfo prop in (new PrintFormat()).GetType().GetProperties())
                {
                    
                    HttpPostedFile file = HttpContext.Current.Request.Files[prop.Name];

                    if (file != null)
                    {
                        printFormats.Add(new KeyValuePair<string, HttpPostedFile>(prop.Name, file));
                    }
                }

                CLContext<PrintFormat> oCLContext = await Process.UpdateCompanyPrintFormats(companyId, printFormats, active, remoteServer, path);

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
        /// This endpoint is used to print payment received
        /// </summary>
        /// <param name="companyId">company id</param>
        /// <param name="docEntry">internal document</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/PrintFormats/{companyId:int}/paymentReceivedToPrint")]
        public async Task<HttpResponseMessage> PaymentReceivedToPrint(int companyId, int docEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<FormatDocument> oCLContext = await Process.PaymentReceivedToPrint(docEntry, companyId);

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
        /// This endpoint is used to print document
        /// </summary>
        /// <param name="docEntry"></param>
        /// <param name="documentType"></param>
        /// <param name="clave"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/PrintFormats/DocumentToPrint")]
        public async Task<HttpResponseMessage> DocumentToPrint(int docEntry, int preliminarEntry, int documentType, string clave, decimal payTotal)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<FormatDocument> oCLContext =
                    await Process.DocumentToPrint(docEntry, preliminarEntry, documentType, payTotal, clave);

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
        /// This endpoint is used to get ZPL to cash closing
        /// </summary>
        /// <param name="id">parameter id cash closing</param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/PrintFormats/CashClosingToPrint")]
        public HttpResponseMessage CashClosingToPrint(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<FormatDocument> oCLContext =
                    Process.CashClosingToPrint(id);

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
        /// API endpoint to retrieve the ZPL (Zebra Programming Language) print format configuration for offline printing.
        /// </summary>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing a <see cref="CLContext{PrintFormatZPLOffline}"/> with the serialized ZPL format string.
        /// </returns>
        [HttpGet]
        [Route("api/PrintFormats/PrintFormatZPLOffline")]
        public async Task<HttpResponseMessage> PrintFormatZPLOffline()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PrintFormatZPLOfflineSerialice> oCLContext = Process.PrintFormatZPLOffline();

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