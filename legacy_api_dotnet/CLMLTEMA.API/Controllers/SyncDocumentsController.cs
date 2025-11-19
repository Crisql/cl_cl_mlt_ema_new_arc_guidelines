using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class SyncDocumentsController: ApiController
    {
        public async Task<HttpResponseMessage> Get(string filter, string status, string type, DateTime from, DateTime to, int skip, int take)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SyncDocumentsPaged> oCLContext = await Process.GetSyncDocument(filter,status, type, from, to, skip, take);

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

        public async Task<HttpResponseMessage> Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SyncDocument> oCLContext = await Process.GetSyncDocument(id);

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
        
        public async Task<HttpResponseMessage> Post(List<SyncDocument> _syncDocument)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SyncDocument>> oCLContext = await Process.PostSyncDocument(_syncDocument);

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
        
        public async Task<HttpResponseMessage> Patch(SyncDocument syncDocument)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SyncDocument> oCLContext = Process.PatchSyncDocumentStatus(syncDocument);

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