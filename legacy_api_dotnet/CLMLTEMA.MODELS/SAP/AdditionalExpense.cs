using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS.SAP
{
    public class AdditionalExpense
    {
        /// <summary>
        /// Code reference to the expense
        /// </summary>
        public int ExpenseCode { get; set; }
        /// <summary>
        /// Total applied on expense
        /// </summary>
        public decimal LineTotal { get; set; }
        /// <summary>
        /// TotalFC applied on expense
        /// </summary>
        public decimal LineTotalFC { get; set; }
        /// <summary>
        /// TaxCode Expense define
        /// </summary>
        public string TaxCode { get; set; }
    }
}
