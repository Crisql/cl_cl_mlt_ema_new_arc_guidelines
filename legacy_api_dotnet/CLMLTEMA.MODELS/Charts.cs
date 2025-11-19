using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent data from charts
    /// </summary>
    public class ChartConfiguration
    {
        /// <summary>
        /// Id of the chart
        /// </summary>
        public int ChartId { get; set; }
        
        /// <summary>
        /// Name of the labels resource
        /// </summary>
        public string LabelsResource { get; set; }
        
        /// <summary>
        ///  Chart type name
        /// </summary>
        public string Type { get; set; }
        
        /// <summary>
        /// Name of the data set resource
        /// </summary>
        public string DataSetResource { get; set; }
        
        /// <summary>
        /// Type of the data set resource
        /// </summary>
        public string DataSetResourceType { get; set; }
        
        /// <summary>
        /// Chart title name
        /// </summary>
        public string Title { get; set; }
    }

    /// <summary>
    /// Represents chart labels for the x-axis
    /// </summary>
    public class ChartLabels
    {
        /// <summary>
        /// Id of the label
        /// </summary>
        public int LabelId { get; set; }
        
        /// <summary>
        /// Name of the label
        /// </summary>
        public string Label { get; set; }
    }

    /// <summary>
    /// Represents chart data set
    /// </summary>
    public class DataSetValue
    {
        /// <summary>
        /// Id of the data set
        /// </summary>
        public int DataSetId { get; set; }
        
        /// <summary>
        /// Id of the label
        /// </summary>
        public int LabelId { get; set; }
        
        /// <summary>
        /// Value to represent in the chart
        /// </summary>
        public int Value { get; set; }
    }

    /// <summary>
    ///  Represents the model of the data that will be displayed in the chart
    /// </summary>
    public class ChartDataSet
    {
        /// <summary>
        /// Label of data to represent in the chart
        /// </summary>
        public string label { get; set; }

        /// <summary>
        /// List of values to represent in the chart
        /// </summary>
        public List<double> data { get; set; } = new List<double>();

        /// <summary>
        /// The color in which the data will be presented
        /// </summary>
        public List<string> backgroundColor { get; set; } = new List<string>();
    }

    /// <summary>
    ///  Represents the body of the chart data
    /// </summary>
    public class Data
    {
        /// <summary>
        /// Labels for the x-axis
        /// </summary>
        public List<string> labels { get; set; } = new List<string>();

        /// <summary>
        /// List of data to be displayed in the chart
        /// </summary>
        public List<ChartDataSet> datasets { get; set; } = new List<ChartDataSet>();
    }

    /// <summary>
    ///  Represents the body of the chart data
    /// </summary>
    public class Chart
    {
        /// <summary>
        /// Chart title name
        /// </summary>
        public string Title { get; set; }
        
        /// <summary>
        /// Type of chart
        /// </summary>
        public string type { get; set; }
        
        /// <summary>
        /// Body data of the chart
        /// </summary>
        public Data data { get; set; }
    }

    /// <summary>
    ///  Represents the color o label of dataset
    /// </summary>
    public class ChartDataSetLabel
    {
        /// <summary>
        /// Id of chart
        /// </summary>
        public int ChartId { get; set; }
        
        /// <summary>
        /// Id of dataset
        /// </summary>
        public int DataSetId { get; set; }
        
        /// <summary>
        /// Color of dataset
        /// </summary>
        public string Color { get; set; }
        
        /// <summary>
        /// Label to represent dataset
        /// </summary>
        public string DataSetLabel { get; set; }
    }
}
