import {IDistributionRules} from "@app/interfaces/i-distribution-rules";

export interface IDimensions {

  /*
  * Represent dimension code
  */
  DimCode: number;

  /*
  * Represent dimension name
  */
  DimName: string;

  /*
  * Represent dimension active
  */
  DimActive: string;

  /*
  * Represent dimension description
  */
  DimDesc: string;

  /*
  * Represent distribution rules
  */
  DistributionRulesList: IDistributionRules[];

}

export interface IDimensionsSelected  {
  DimCode: number;
  DimDesc: string;
  DistributionRulesList: string | null;
}
