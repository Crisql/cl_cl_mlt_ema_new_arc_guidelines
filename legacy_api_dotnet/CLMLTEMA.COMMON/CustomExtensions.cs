using System;

namespace CLMLTEMA.COMMON
{
    /// <summary>
    /// Provides custom extension methods for common operations.
    /// </summary>
    public static class CustomExtensions
    {
        /// <summary>
        /// Converts the specified <see cref="DateTime"/> to the number of minutes elapsed since January 1, 1970 (Unix epoch).
        /// </summary>
        /// <param name="pDate">The <see cref="DateTime"/> to convert.</param>
        /// <returns>
        /// The total number of minutes since January 1, 1970. 
        /// Returns 0 if the provided date is earlier than the base date.
        /// </returns>
        public static int ToCustomTimeSpan(this DateTime pDate)
        {
            DateTime baseDate = new DateTime(1970, 01, 01);

            if (baseDate > pDate)
            {
                return 0;
            }
            
            TimeSpan timeSpan = pDate.Subtract(baseDate);

            return (int)timeSpan.TotalMinutes;
        }
    }
}