/**
 * The interface is used to map the countries
 */
export interface ICountry {
  //The property represents the country code
  Code: string;
  //The property represents the description of the country
  Name: string;
}

/**
 * The interface is used to map the states of a country, with the properties code and description of the state
 */
export interface IStates extends ICountry {
}
