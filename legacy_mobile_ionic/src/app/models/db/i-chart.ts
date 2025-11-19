export interface IChart {
    type: string;
    data: IChartData;
    options: string;
}

export interface IChartData {
    labels: string[];
    datasets: IChartDataSet[];
}

export interface IChartDataSet {
    label: string;
    data: number[];
    color: string;
}