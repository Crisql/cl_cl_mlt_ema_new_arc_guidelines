using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Routing;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class AttachmentsController : ApiController
    {

        public async Task<HttpResponseMessage> Post()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<Attachments2> oCLContext =  await Process.CreateAnexos();

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
        /// This endpoint is used to get attachment assigned a business parther
        /// </summary>
        /// <param name="CardCode">this card code of business partner</param>
        /// <returns></returns>
        [QueryStringExposer]
        [HttpGet]
        public async Task<HttpResponseMessage> Get(int AttachmentEntry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<List<Attachments2Line>> oCLContext =  await Process.GetAttachment( AttachmentEntry);

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
        /// This endpoint is used to download attachment
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("api/Attachments/Download")]
        public HttpResponseMessage Download(string path)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<string> oCLContext =  Process.DownloadAttachment(path);

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