import {ChartConfiguration} from "chart.js";

/**
 * Represents the body of the chart data
 */
export interface IChart extends ChartConfiguration{

  /**
   * Chart title name
   */
  Title: string;

}

