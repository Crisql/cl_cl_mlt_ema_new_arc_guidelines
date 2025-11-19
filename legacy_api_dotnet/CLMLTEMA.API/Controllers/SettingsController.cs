using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class SettingsController : ApiController
    {
        public HttpResponseMessage Get(string Code)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Setting> oCLContext = Process.GetSettingByCode(Code, true);

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

        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Setting>> oCLContext = Process.GetSetting();

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

        public HttpResponseMessage Post(Setting setting)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Setting> oCLContext = Process.PostSetting(setting);

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

        [Route("~/api/Settings/list")]
        public HttpResponseMessage Post(List<Setting> settings)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Setting> oCLContext = Process.PostSetting(settings);

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

        public HttpResponseMessage Patch([FromUri] string Code, [FromBody] Setting setting)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Setting> oCLContext = Process.PatchSetting(Code, setting); 

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

        [Route("~/api/Settings/list")]
        public HttpResponseMessage Patch(List<Setting> settings)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Setting> oCLContext = Process.PatchSetting(settings);

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
        
        [Route("~/api/Settings/MarginsTables")]
        [HttpGet]
        public HttpResponseMessage GetMarginTables()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<IEnumerable<ValidateInventoryTable>> oCLContext = Process.GetMarginTables();


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
        
        [Route("~/api/Settings/ValidateInventoryTables")]
        [HttpGet]
        public HttpResponseMessage GetValidateInventoryTables()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<IEnumerable<ValidateInventoryTable>> oCLContext = Process.GetValidateInventoryTables();


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
        
        [Route("~/api/Settings/FieldsBusinessPartner")]
        [HttpGet]
        public HttpResponseMessage GetFieldsBusinessPartner()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<IEnumerable<FieldsBusinessPartner>> oCLContext = Process.GetFieldsBusinessPartner();


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
        
        [Route("~/api/Settings/Shorcuts")]
        [HttpGet]
        public HttpResponseMessage GetShorcuts()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<IEnumerable<Shorcuts>> oCLContext = Process.GetShorcuts();


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
        
        [Route("~/api/Settings/ValidateAttachmentsTables")]
        [HttpGet]
        public HttpResponseMessage GetValidateAttachmentsTables()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");


                CLContext<IEnumerable<ValidateAttachmnetsTable>> oCLContext = Process.GetValidateAttachmentsTables();


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
        /// Validates the automatic printing tables configuration.
        /// </summary>
        /// <returns>
        /// An HTTP response message indicating the validation result of the automatic printing tables.
        /// </returns>
        [Route("~/api/Settings/ValidateAutomaticPrintingTables")]
        [HttpGet]
        public HttpResponseMessage GetValidateAutomaticPrintingTables()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<IEnumerable<ValidateAutomaticPrintingTable>> oCLContext = Process.GetValidateAutomaticPrintingTables();
                
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
