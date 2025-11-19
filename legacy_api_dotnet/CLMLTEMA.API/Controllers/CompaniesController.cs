using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CL.STRUCTURES.CLASSES.Udf;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class CompaniesController : ApiController
    {
        // GET: api/Companies
        public HttpResponseMessage Get(bool active)
        {
            try
            {
                CL.COMMON.LogManager.Record("INCIO CONTROLADOR");

                CLContext<IEnumerable<Company>> oCLContext = PROCESS.Process.GetCompanies(active);

                CL.COMMON.LogManager.Record("FINALIZACION DE CONTROLADOR");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                CL.COMMON.LogManager.Commit(Request);
            }
        }

        // GET: api/Companies/5
        
        public HttpResponseMessage Get(int id)
        {
            try
            {
                CL.COMMON.LogManager.Record("INCIO CONTROLADOR");

                CLContext<Company> oCLContext = PROCESS.Process.GetCompanyById(id);

                CL.COMMON.LogManager.Record("FINALIZACION DE CONTROLADOR");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                CL.COMMON.LogManager.Commit(Request);
            }
        }
        // POST: api/Users
        public HttpResponseMessage Post([FromBody] Company company)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Company> oCLContext = Process.PostCompany(company);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, company);
            }
        }

        // PATCH: api/Companies/5
        public HttpResponseMessage Patch(Company company)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Company> oCLContext = Process.PatchCompany(company);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, company);
            }
        }
        
        /// <summary>
        /// Get configured udfs
        /// </summary>
        /// <param name="companyId">Company to get udfs</param>
        /// <param name="category">Category of udf to get</param>
        /// <param name="isUdfLine">if it is a udf line</param>
        /// <param name="configured">If it is udf configure</param>
        /// <param name="group">udfs group to filter</param>
        /// <returns></returns>
        [Route("api/Companies/{companyId}/Udfs")]
        public async Task<HttpResponseMessage> GetCompanyUdfs(int companyId, string category, bool isUdfLine, bool configured, string group = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<CL.STRUCTURES.CLASSES.Udf.UdfContext>> oCLContext = await Process.GetUdfs(companyId, category, isUdfLine, configured, group);

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
        [Route("api/Companies/{companyId}/Udfs")]
        public HttpResponseMessage SaveCompanyUdfs([FromBody] CL.STRUCTURES.CLASSES.Udf.UdfTransfer _udfs, int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<CL.STRUCTURES.CLASSES.Udf.UdfTransfer> oCLContext = Process.PostUdfs(_udfs, companyId);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request, _udfs);
            }
        }
        
        /// <summary>
        /// Gets the groups configured for a specific udf category
        /// </summary>
        /// <param name="companyId">company from which the groups will be obtained</param>
        /// <param name="category">udf category to get</param>
        /// <param name="isActive">indicates whether the active groups or all are obtained</param>
        /// <returns></returns>
        
        [Route("api/Companies/{companyId}/Udfs/Groups")]
        public HttpResponseMessage GetCompanyUdfGroups(int companyId, string category, bool isActive)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<GroupContext>> oCLContext = Process.GetUdfGroups(companyId, category, isActive);

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
        [Route("api/Companies/{companyId}/DiscountHierarchies")]
        public HttpResponseMessage GetDiscountHierarchiesByCompany(int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<DiscountHierarchy>> oClContext = Process.GetDiscountHierarchiesByCompany(companyId);

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
        
        [HttpGet]
        [Route("api/Companies/{companyId}/SalesMen")]
        public async Task<HttpResponseMessage> SalesMen(int companyId,int licenseId)
        {
            try 
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SalesMan>> oClContext = await Process.GetSalesMen(companyId,licenseId, true);
                
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
        
        [HttpGet]
        [Route("api/Companies/{companyId}/Warehouses")]
        public async Task<HttpResponseMessage> Warehouses(int companyId, int licenseId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                CLContext<List<Warehouses>> oClContext = await Process.GetWarehouses(companyId, licenseId, true);
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
        
    }
}
