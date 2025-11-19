using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.Filters;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;


namespace CLMLTEMA.API.Controllers
{
    /// <summary>
    /// This controller is used to maintenance activities
    /// </summary>
    [Authorize]
    [CompanyBinderActionFilter]
    [RoutePrefix("api/Activities")]
    public class ActivitiesController : ApiController
    {
        /// <summary>
        /// This endpoint is used to create activities
        /// </summary>
        /// <param name="_activities">model activities</param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Post(Activities _activities)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Activities> oCLContext = await Process.PostActivities(_activities);

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
        /// This endpoint is used to create activities
        /// </summary>
        /// <param name="_activities">model activities</param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> Patch(Activities _activities)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Activities> oCLContext = await Process.PatchActivities(_activities);

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
        /// This endpoint is used to get contact person
        /// </summary>
        /// <param name="CardCode">Parameter cardcode del BP</param>
        /// <returns></returns>
        [QueryStringExposer]
        [HttpGet]
        [Route("GetContactPerson")]
        public async Task<HttpResponseMessage> GetContactPerson(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ContactPersonActivities>> oCLContext = await Process.GetContactPerson(CardCode);

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
        /// This endpoint is used to get type contact activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetTypeActivities")]
        public async Task<HttpResponseMessage> GetTypeActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<TypeActivities>> oCLContext = await Process.GetTypeActivities();

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
        /// This endpoint is used to get subject activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetSubjectActivities")]
        public async Task<HttpResponseMessage> GetSubjectActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SubjectActivities>> oCLContext = await Process.GetSubjectActivities();

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
        /// This endpoint is used to get location activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetLocationActivities")]
        public async Task<HttpResponseMessage> GetLocationActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<LocationActivities>> oCLContext = await Process.GetLocationActivities();

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
        /// This endpoint is used to get recurrence acticvities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetRecurrenceActivities")]
        public HttpResponseMessage GetRecurrenceActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<RecurrenceActivities>> oCLContext = Process.GetRecurrenceActivities();

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
        /// This endpoint is used to get prioritys activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetPriorityActivities")]
        public HttpResponseMessage GetPriorityActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Priority>> oCLContext = Process.GetPriorityActivities();

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
        /// This method is used to get option activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetOptionActivities")]
        public HttpResponseMessage GetOptionActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<OptionActivities>> oCLContext = Process.GetOptionActivities();

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
        /// This method is used to get day week
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetDayOfWeek")]
        public HttpResponseMessage GetDayOfWeek()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<DayWeekActivities>> oCLContext = Process.GetDayOfWeek();

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
        /// This method is used to get week
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetWeek")]
        public HttpResponseMessage GetWeek()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<WeekActivities>> oCLContext = Process.GetWeek();

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
        /// This method is used to get Month
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetMonth")]
        public HttpResponseMessage GetMonth()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<MonthActivities>> oCLContext = Process.GetMonth();

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
        /// This method is used to get object SAP activities
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetObjectSAPActivities")]
        public HttpResponseMessage GetObjectSAPActivities()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<ObjectSAPActivities>> oCLContext = Process.GetObjectSAPActivities();

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
        /// This method is used to get documents
        /// </summary>
        /// <param name="docType">parameter document type</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetDocumentsActivities")]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetDocumentsActivities(int docType, int docNum)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<DocumentsActivities>> oCLContext = await Process.GetDocumentsActivities(docType, docNum);

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
        /// This method is used to get items to activities
        /// </summary>
        /// <param name="Description">parameter document Description</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetItemsActivities")]
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetItemsActivities(string Description)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ItemsActivities>> oCLContext = await Process.GetItemsActivities(Description);

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
        /// This endpoint is used to get a list of filtered and paginated activities
        /// </summary>
        /// <param name="DateFrom">Start date parameter</param>
        /// <param name="DateTo">End date parameter</param>
        /// <param name="Code">Activity code parameter</param>
        /// <param name="CardCode">Business partner code parameter</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetSearchActivities")]
        [QueryStringExposer]
        [EnablePagination]
        public async Task<HttpResponseMessage> GetSearchActivities(string DateFrom, string DateTo, int ActivityCode = 0, string CardCode = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SearchDocumentsActivities>> oCLContext = await Process.GetSearchActivities(DateFrom, DateTo, ActivityCode, CardCode);

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
        /// This endpoint obtains the details of an activity
        /// </summary>
        /// <param name="ActivityCode">Parameter activity code</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetDetailActivity")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetDetailActivity(int ActivityCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Activities>> oCLContext = await Process.GetDetailActivity(ActivityCode);

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
        /// This endpoint gets the states of activity type "Task"
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetActivityStates")]
        public async Task<HttpResponseMessage> GetActivityStates()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ActivityStates>> oCLContext = await Process.GetActivityStates();

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
        /// This endpoint gets counties states of activity
        /// </summary>
        /// <param name="FilterCountry"> Filter to find country matches </param>
        /// <returns></returns>
        [EnablePagination]
        [HttpGet]
        [Route("GetCountriesActivity")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetCountriesActivityByFilter(string FilterCountry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<CountriesActivity>> oClContext = await Process.GetCountriesActivityByFilter( FilterCountry);

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
        
        /// <summary>
        /// This endpoint gets the states of countries activity
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetStatesCountriesActivity")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetStatesCountriesActivity(string CountryCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<StatesCountriesActivity>> oCLContext = await Process.GetStatesCountriesActivity(CountryCode);

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
        /// This endpoint gets counties states of activity
        /// </summary>
        /// <param name="FilterCountry"> Filter to find country matches</param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetCountryActivity")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetCountryActivity(string FilterCountry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<CountriesActivity> oClContext = await Process.GetCountryActivity(FilterCountry);

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
        [QueryStringExposer]
        [Route("GetBPAddresses")]
        [HttpGet]
        public async Task<HttpResponseMessage> GetBPAddresses(string CardCode, string Pattern = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<BPAddresses>> oCLContext =  await Process.GetBPAddressesActivities( CardCode,  Pattern);

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
        /// This endpoint gets counties states of activity
        /// </summary>
        /// <param name="FilterCountry"> Filter to find country matches </param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetCountriesActivityWithouPagination")]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> GetCountriesActivityWithouPagination(string FilterCountry)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<CountriesActivity>> oClContext = await Process.GetCountriesActivityByFilter(FilterCountry);

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