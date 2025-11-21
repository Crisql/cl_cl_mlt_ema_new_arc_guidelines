namespace CL.COMMON.Extensions
{
    /// <summary>
    /// This class should be used to configure LogManager settings.
    /// </summary>
    public static class LogManagerExtensions
    {
        private static System.Collections.Generic.List<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption> logManagerOptions =
            new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption>();

        /// <summary>
        /// This method allows you to add a configuration to LogManager
        /// </summary>
        /// <param name="_logManagerOption">Object which stores a key-value configuration that will be used to configure LogManager</param>
        public static CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption Ctor(
            this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption _logManagerOption)
        {
            logManagerOptions = logManagerOptions ?? new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption>();

            if (System.String.IsNullOrEmpty(_logManagerOption.Key))
                throw new System.Exception("Key can not be empty or null");

            if (System.String.IsNullOrEmpty(_logManagerOption.Value))
                throw new System.Exception("Value can not be empty or null");

            logManagerOptions.Add(new CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption()
            {
                Key = _logManagerOption.Key,
                Value = _logManagerOption.Value
            });

            return _logManagerOption;
        }

        /// <summary>
        /// Allows to configure a set of option to LogManager
        /// </summary>
        /// <param name="_source">List of options to be configured into LogManager</param>
        public static CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption Ctor(
            this System.Collections.Generic.IEnumerable<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption> _source)
        {
            logManagerOptions = logManagerOptions ?? new System.Collections.Generic.List<CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption>();

            foreach (CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption logManagerOption in _source)
            {
                if (System.String.IsNullOrEmpty(logManagerOption.Key))
                    throw new System.Exception("Key can not be empty or null");

                if (System.String.IsNullOrEmpty(logManagerOption.Value))
                    throw new System.Exception("Value can not be empty or null");

                logManagerOptions.Add(new CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption()
                {
                    Key = logManagerOption.Key,
                    Value = logManagerOption.Value
                });
            }

            return new STRUCTURES.CLASSES.LogManager.ClLogManagerOption();
        }

        /// <summary>
        /// Allows to extended another defined method in the object. Should be used to commit a previous set configuration.
        /// </summary>
        /// <param name="_option">Object to be extended</param>
        /// <returns></returns>
        public static CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption Build(
            this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption _option)
        {
            System.Collections.Generic.Dictionary<System.String, System.String> definitions = new System.Collections.Generic.Dictionary<System.String, System.String>();

            if (logManagerOptions is null)
                throw new System.Exception("CL You are trying to create a configuration without given it. Please add a configuration at least.");

            logManagerOptions.ForEach(_x => definitions.Add(_x.Key, _x.Value));

            // I discard this result because i dont need it
            _ = CL.COMMON.Core.DicToXml(definitions, "LogManagerSettings");

            return new CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption()
            {
                Key = null,
                Value = null
            };
        }

        /// <summary>
        /// This method always should be called after when you setup a configuration.
        /// </summary>
        /// <param name="_option">Auxiliary to call this method</param>
        public static void Dtor(this CL.STRUCTURES.CLASSES.LogManager.ClLogManagerOption _option)
        {
            if (logManagerOptions is null) return;

            logManagerOptions.Clear();
            logManagerOptions = null;
        }
    }
}