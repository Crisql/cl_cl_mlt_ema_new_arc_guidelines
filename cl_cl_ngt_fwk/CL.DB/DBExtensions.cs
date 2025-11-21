using System.Linq;

namespace CL.DB.Extensions
{
    public static class DbExtensions
    {
        #region Internals

        private static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> LocalPostExecution<TObjectToMap, TDbContext, TClMaster, TClSingle>(
            this TObjectToMap _model
            , System.String _dbObjectToken
            , System.Net.HttpStatusCode _defaultCodeType
            , params System.String[] _fields)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            where TClMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TClSingle : CL.STRUCTURES.INTERFACES.ICLSingle
        {

            System.String[] propertiesToExcludeByDefault = { "Id", "CreatedDate", "UpdatedBy", "UpdateDate" };

            _fields = _fields is null ? propertiesToExcludeByDefault : _fields.Concat(propertiesToExcludeByDefault).ToArray();

            return CL.DB.Core.SingleExecutor<TObjectToMap, TDbContext, TClMaster, TClSingle>(_model, _dbObjectToken, _defaultCodeType, _fields);
        }
        private static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> LocalPatchExecution<TObjectToMap, TDbContext, TClMaster, TClSingle>(
            this TObjectToMap _model
            , System.String _dbObjectToken
            , System.Net.HttpStatusCode _defaultCodeType
            , params System.String[] _fields)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            where TClMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TClSingle : CL.STRUCTURES.INTERFACES.ICLSingle
        {

            System.String[] propertiesToExcludeByDefault = { "CreatedDate", "CreatedBy", "UpdateDate" };

            _fields = _fields is null ? propertiesToExcludeByDefault : _fields.Concat(propertiesToExcludeByDefault).ToArray();

            return CL.DB.Core.SingleExecutor<TObjectToMap, TDbContext, TClMaster, TClSingle>(_model, _dbObjectToken, _defaultCodeType, _fields);
        }

        #endregion

        #region Interface

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> Post<TObjectToMap, TDbContext, TMaster, TSingle>(this TObjectToMap _model, System.String _dbObjectToken,
            params System.String[] _fields)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            where TMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TSingle : CL.STRUCTURES.INTERFACES.ICLSingle
            => LocalPostExecution<TObjectToMap, TDbContext, TMaster, TSingle>(_model, _dbObjectToken, System.Net.HttpStatusCode.Created, _fields);

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> Post<TObjectToMap, TDbContext>(this TObjectToMap _model, System.String _dbObjectToken)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            => LocalPostExecution<TObjectToMap, TDbContext, CL.STRUCTURES.INTERFACES.ICLMaster, CL.STRUCTURES.INTERFACES.ICLSingle>(_model, _dbObjectToken, System.Net.HttpStatusCode.Created, null);

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> Patch<TObjectToMap, TDbContext, TMaster, TSingle>(this TObjectToMap _model, System.String _dbObjectToken,
            params System.String[] _fields)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            where TMaster : CL.STRUCTURES.INTERFACES.ICLMaster
            where TSingle : CL.STRUCTURES.INTERFACES.ICLSingle
            => LocalPatchExecution<TObjectToMap, TDbContext, TMaster, TSingle>(_model, _dbObjectToken, System.Net.HttpStatusCode.OK, _fields);

        public static CL.STRUCTURES.CLASSES.Rebound.CLContext<TObjectToMap> Patch<TObjectToMap, TDbContext>(this TObjectToMap _model, System.String _dbObjectToken)
            where TObjectToMap : CL.STRUCTURES.INTERFACES.IClDatabaseServices, new()
            where TDbContext : System.Data.Entity.DbContext, new()
            => LocalPatchExecution<TObjectToMap, TDbContext, CL.STRUCTURES.INTERFACES.ICLMaster, CL.STRUCTURES.INTERFACES.ICLSingle>(_model, _dbObjectToken, System.Net.HttpStatusCode.OK, null);
        #endregion
    }
}