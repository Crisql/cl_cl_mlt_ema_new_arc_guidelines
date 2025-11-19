using CL.COMMON;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class MenuController : ApiController
    {
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<Menu>> cLContext = PROCESS.Process.GetMenuOptions();

                LogManager.Record("FIN DE CONTROLADOR");

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
        
        /// <summary>
        /// Retrieves the mobile menu options based on the specified language.
        /// </summary>
        /// <param name="language">The language code for which the mobile menu options are to be retrieved.</param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the mobile menu options for the specified language.
        /// </returns>
        [Route("~/api/Menu/GetMobile")]
        public HttpResponseMessage GetMobile(string language)
        {
            try
            {
                LogManager.Record("INICIO DE CONTROLADOR");

                CLContext<IEnumerable<Menu>> cLContext = PROCESS.Process.GetMenuMobileOptions(language);

                LogManager.Record("FIN DE CONTROLADOR");

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
    }
}
