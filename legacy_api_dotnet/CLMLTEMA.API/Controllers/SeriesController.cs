using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.COMMON;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class SeriesController : ApiController
    {
        /// <summary>
        /// This enpoint obtains the numbering series assigned to a current user and company.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public HttpResponseMessage Get(int userId, int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<SeriesByUser>> oCLContext = Process.GetSeries(userId, companyId);

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
        /// This endpoint obtains the numbering series in SAP by the type of object and current company
        /// </summary>
        /// <param name="ObjectCode"></param>
        /// <param name="CompanyId"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> GetSeriesSap(string ObjectCode, int CompanyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<SeriesSAP>> oCLContext = await Process.GetSeriesSAP(ObjectCode, CompanyId);

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
        /// This enpoint inserts series that will be assigned to a user in the current company
        /// </summary>
        /// <param name="serie"></param>
        /// <returns></returns>
        public HttpResponseMessage Post(SeriesByUserWithFESerie serie)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SeriesByUserWithFESerie> oCLContext = Process.PostSeries(serie);

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
        /// The enpoint updates series that will be assigned to a user in the current company
        /// </summary>
        /// <param name="serie"></param>
        /// <returns></returns>
        public HttpResponseMessage Patch(SeriesByUser serie)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SeriesByUser> oCLContext = Process.PatchSeries(serie);

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
        /// The enpoint delete series that will be assigned to a user in the current company
        /// </summary>
        /// <param name="serieId"></param>
        /// <returns></returns>
        public HttpResponseMessage Delete(int serieId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Common.SingleValue<int>> oCLContext = Process.DeleteSerie(serieId);

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
        /// This enpoint gets the series assigned to a user in the current company and by the SAP object type
        /// </summary>
        /// <param name="userAssingId"></param>
        /// <param name="objectType"></param>
        /// <param name="companyId"></param>
        /// <returns></returns>
        public HttpResponseMessage Get(int userAssingId, int objectType, int companyId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SerialType> oCLContext = Process.GetIsSerial(userAssingId, objectType, companyId);

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