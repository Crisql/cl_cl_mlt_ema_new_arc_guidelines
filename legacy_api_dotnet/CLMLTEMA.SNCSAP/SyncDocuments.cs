using System;
using System.Reflection;
using System.ServiceProcess;
using System.Timers;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using Newtonsoft.Json;

namespace CLMLTEMA.SNCSAP
{
    public partial class SyncDocuments : ServiceBase
    {
        private const string ServiceFileName = "CL_CL_DCR_EMA_SNC_SAP";
        private const string ServiceUser = "service@clavisco.com";
        private Timer timerSyncDocuments = null;
        
        public SyncDocuments()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] _args)
        {
            try
            {
                LogManager.Record($"Iniciando servicio ...");
                
                timerSyncDocuments = new Timer();
                double time = CL.COMMON.Core.GetConfigKeyValue<double>(MethodBase.GetCurrentMethod(), "ServiceInterval") * 60 * 1000;
                timerSyncDocuments.Interval = time;
                timerSyncDocuments.Elapsed += new ElapsedEventHandler(this.TimeElapsedTimerSyncDocuments);
                timerSyncDocuments.Enabled = true;
            }
            catch (Exception ex)
            {
                int code = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.HResult : ex.InnerException.HResult : ex.HResult;
                string message = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.Message : ex.InnerException.Message : ex.Message;
                
                LogManager.Record($"Code: {code} | Error: {message}");
            }
            finally
            {
                LogManager.Commit(ServiceFileName, ServiceUser);
            }
        }
        
        public async void TimeElapsedTimerSyncDocuments(object _sender, ElapsedEventArgs _e)
        {
            try
            {
                LogManager.Record($"Iniciando ejecución del servicio ...");

                CLContext<SyncDocumentStatus> oClContext = await Process.SyncDocumentsToSap();
                
                if (oClContext.Response != null)
                {
                    LogManager.Record($"Message: {oClContext.Response.Message} | Model: {JsonConvert.SerializeObject(oClContext.Response.Data)}");
                }
            }
            catch (Exception ex)
            {
                int code = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.HResult : ex.InnerException.HResult : ex.HResult;
                string message = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.Message : ex.InnerException.Message : ex.Message;
                
                LogManager.Record($"Code: {code} | Error: {message}");
            }
            finally
            {
                LogManager.Record($"Ejecución del servicio terminada");
                LogManager.Commit(ServiceFileName, ServiceUser);
            }
        }

        protected override void OnStop()
        {
            try
            {
                LogManager.Record($"Servicio finalizado correctamente");
            }
            catch(Exception ex)
            {
                int code = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.HResult : ex.InnerException.HResult : ex.HResult;
                string message = ex.InnerException != null ? ex.InnerException.InnerException != null ? ex.InnerException.InnerException.Message : ex.InnerException.Message : ex.Message;
                
                LogManager.Record($"Code: {code} | Error: {message}");
            }
            finally
            {
                LogManager.Commit(ServiceFileName, ServiceUser);
            }
        }
    }
}