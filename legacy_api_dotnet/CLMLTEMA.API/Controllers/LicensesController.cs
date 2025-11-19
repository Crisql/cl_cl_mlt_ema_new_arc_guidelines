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
    public class LicensesController : ApiController
    {
        // GET
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<License>> oCLContext = Process.GetLicences();

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
        
        public HttpResponseMessage Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<License> oCLContext = Process.GetLicense(id);

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
        
        public async Task<HttpResponseMessage> Post([FromBody] License license)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<License> oCLContext = await Process.PostLicense(license);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, license);
            }
        }
        
        public async Task<HttpResponseMessage> Patch([FromBody] License license)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<License> oCLContext = await Process.PatchLicense(license);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, license);
            }
        }
        
        [Route("~/api/Licenses/GetLicensesByCompany")]
        [HttpGet]
        public HttpResponseMessage GetLicensesByCompany(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<License>> oCLContext = Process.GetLicensesByCompany(id);

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
        /// This endpoint is used to licenses by user
        /// </summary>
        /// <returns></returns>
        [Route("~/api/Licenses/GetLicenseUser")]
        [HttpGet]
        public HttpResponseMessage GetLicensesUser()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<UserLicense>> oCLContext = Process.GetLicenseUser();

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