export interface IDistributionRules {

  /*
  * Represent distribution rule code
  */
  OcrCode: string

  /*
  * Represent distribution rule name
  */
  OcrName: string

  /*
  * Represent Total Factor of the Distribution Rule
   */
  OcrTotal: number

  /*
  * Represent distribution rule direct
   */
  Direct: string

  /*
  * Represent distribution rule locked
   */
  Locked: string

  /*
  * Represent distribution rule data source
   */
  DataSource: string

  /*
  * Represent distribution rule user signature
   */
  UserSign?: number

  /*
  * Represent distribution rule dimension code
   */
  DimCode: number

  /*
  * Represent distribution rule numerator
   */
  AbsEntry?: number

  /*
  * Represent distribution rule line Active
   */
  Active: string

  /*
  * Represent distribution rule line log instance
   */
  LogInstanc?: number

  /*
  * Represent distribution rule Updating User
   */
  UserSign2?: number

  /*
  * Represent distribution rule Update Date
   */
  UpdateDate: string

}
