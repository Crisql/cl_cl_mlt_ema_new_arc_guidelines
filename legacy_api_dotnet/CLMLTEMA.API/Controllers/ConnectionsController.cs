using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    public class ConnectionsController : ApiController
    {
        // GET: api/Connections
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Connection>> oCLContext = Process.GetConnections();

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

        // GET: api/Connections/1
        public HttpResponseMessage Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Connection> oCLContext = Process.GetConnection(id);

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

        // POST: api/Connections
        public HttpResponseMessage Post(Connection connection)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Connection> oCLContext = Process.CreateConnection(connection);

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

        // PATCH: api/Connections
        public HttpResponseMessage Patch(Connection connection)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Connection> oCLContext = Process.UpdateConnection(connection);

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
