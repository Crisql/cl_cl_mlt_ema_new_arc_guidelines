using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    public class PasswordsController : ApiController
    {
        // [Route("api/Passwords/recovery/{userEmail:string}")]
        // [HttpGet]
        public HttpResponseMessage GetSendRecovery(string userEmail)
        {
            try
            {
                LogManager.Record("CONTROLLER PASSWORDSCONTROLLER STARTED");

                CLContext<bool> cLContext = Process.GetSendRecovery(userEmail);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(cLContext);
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
    
        
        [Route("api/Passwords/RecoveryPassword")]
        [HttpPatch]
        public HttpResponseMessage PatchRecoveryPassword(Dictionary<string, string> _password)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                string token = Request.Headers.Authorization.Parameter;
                
                CLContext<IEnumerable<RecoveryPassword>> oCLContext = Process.PatchRecoveryPassword(_password["password"], token);

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
        
        [HttpPatch]
        [Route("api/Passwords/ChangePassword")]
        public HttpResponseMessage PatchChangePassword(ChangePassword  changePassword)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<ChangePassword>> oCLContext = Process.PatchChangePassword(changePassword);

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