using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using CL.STRUCTURES;

namespace CLMLTEMA.API
{
    public class CompanyBinderActionFilter : System.Web.Http.Filters.ActionFilterAttribute
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="_httpActionContext"></param>
        public override void OnActionExecuting(HttpActionContext _httpActionContext)
        {
            int headerKeyValue = CL.COMMON.Core.GetHeaderValue<int>(_httpActionContext.Request, "cl-company-id");
            //string userEmail = CL.COMMON.Core.GetClaimValue<string>("UserEmail");
            System.Web.HttpContext.Current.Items.Add(HttpContextItems.CompanyKey, headerKeyValue);
        }

    }

    public class ModelValidationActionFilter : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext _httpActionContext)
        {
            
            if (!_httpActionContext.ModelState.IsValid)
            {

            }
            base.OnActionExecuting(_httpActionContext);
        }
    }
    public class ExposeQueryString: System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext _httpActionContext)
        {
            System.String currentQueryString = _httpActionContext.Request.RequestUri.Query;
            if (System.String.IsNullOrEmpty(currentQueryString))
                throw new System.Exception("CL Query string can't be null or empty");
            System.Web.HttpContext.Current.Items.Add(System.String.Concat("qs-injector"), currentQueryString);
            base.OnActionExecuting(_httpActionContext);
        }
    }
}
