import { IBaseEntity } from "./i-base-entity";

export interface ISerie extends IBaseEntity {
    SerieName: string;
    Serie: number;
    Type: string;
}


/**
 * Represents a series assigned to a user in the database
 */
export interface  ISerieAssing extends IBaseEntity{
  /**
   * ID of the user to whom the series is assigned.
   */
  UserAssingId: number,

  /**
   * ID of the company associated with the series.
   */
  CompanyId: number,

  /**
   * Serial number of the series.
   */
  NoSerie: number,

  /**
   * Type of document associated with the series.
   */
  DocumentType: string,

  /**
   * Type of the series.
   */
  SerieType: number,

  /**
   * Indicates whether the series is serial.
   */
  IsSerial: boolean,

  /**
   * Description of the series.
   */
  SerieDescription: string
}

export interface ISerialType {
  IsSerial: boolean;
}

/**
 * It represents the interface for FE series
 */
export interface  IFESerie{

  /**Name assigned to the series */
  SerieName: string,

  /**Number of the BranchOffice */
  BranchOffice :number,

  /**Number of the terminal */
  Terminal: number,

  /**Next number of the series */
  NextNumber: number,

  /**Id of the series per user to which it relates */
  SeriesByUserId: number,
}

/**
 * Interface to use for the save the series
 */
export interface ISerieAssingWithFESerie{
  SeriesByUser: ISerieAssing,

  FESerie: IFESerie
}
