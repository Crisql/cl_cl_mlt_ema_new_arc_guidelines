import {IBPAddresses, IBusinessPartner} from "@app/interfaces/i-business-partner";

/**
 * this interface is used to mapping activities
 */
export interface IActivities {
  /**
   * property activiti code
   */
  ActivityCode: number;
  /**
   * property activiti
   */
  Activity: string;
  /**
   * property activiti type
   */
  ActivityType: number;
  /**
   * property phone
   */
  Phone: string;
  /**
   * property card code of business parther
   */
  CardCode: string;
  /**
   * property card name of business parther
   */
  CardName: string;
  /**
   * property subject
   */
  Subject: number;
  /**
   * property Handled By, license internal key of users SAP
   */
  HandledBy: number;
  /**
   * property Contact Person Code
   */
  ContactPersonCode: number | null;
  /**
   * property Details
   */
  Details: string;
  /**
   * property activiti Start Date
   */
  StartDate: string;
  /**
   * property activiti Start Time
   */
  StartTime: string;
  /**
   * property activitie End Due Date
   */
  EndDueDate: string | null;
  /**
   * property activiti End Time
   */
  EndTime: string | null;
  /**
   * property activiti Duration
   */
  Duration: number | null;
  /**
   * property activiti Duration Type
   */
  DurationType: string;
  /**
   * property activiti Priority
   */
  Priority: string;
  /**
   * property activiti Location
   */
  Location: number | null;
  /**
   * property activities Recurrence Pattern
   */
  RecurrencePattern: string;
  /**
   * property activities Repeat Option
   */
  RepeatOption: any;
  /**
   * property activities Interval
   */
  Interval: number;
  /**
   * property activities Series Start Date
   */
  SeriesStartDate: string;
  /**
   * property activities Series End Date
   */
  SeriesEndDate: string;
  /**
   * property activities EndType
   */
  EndType: string;
  /**
   * property activities Max Occurrence
   */
  MaxOccurrence: number;
  /**
   * property activities Closed
   */
  Closed: string;
  /**
   * property activities Inactive Flag
   */
  InactiveFlag: string;
  /**
   * property activities Monday
   */
  Monday: string;
  /**
   * property activities Tuesday
   */
  Tuesday: string;
  /**
   * property activities Wednesday
   */
  Wednesday: string;
  /**
   * property activities Thursday
   */
  Thursday: string;
  /**
   * property activities Friday
   */
  Friday: string;
  /**
   * property activities Saturday
   */
  Saturday: string;
  /**
   * property activities Sunday
   */
  Sunday: string;
  /**
   * property activities Recurrence Sequence Specifier
   */
  RecurrenceSequenceSpecifier: string;
  /**
   * property activities Recurrence Day Of Week
   */
  RecurrenceDayOfWeek: string;
  /**
   * property activities Recurrence Day In Month
   */
  RecurrenceDayInMonth: number;
  /**
   * property activities Recurrence Month
   */
  RecurrenceMonth: number;
  /**
   * property activities Document Type
   */
  DocType: string;
  /**
   * property activities Document Type
   */
  DocEntry: string;
  /**
   * property activities Document number
   */
  DocNum: string;
  /**
   * Recordatorio
   */
  Reminder: string;

  /**
   * Reminder Period
   */
  ReminderPeriod: number;

  /**
   * Reminder Period
   */
  ReminderType: string;

  /**
   * Country where it will take place
   */
  Country : string | null;

  /**
   * State where it will take place
   */
  State : string | null;

  /**
   * Room where it will take place
   */
  Room : string | null;

  /**
   * Street where it will take place
   */
  Street : string | null;

  /**
   * city where it will take place
   */
  City : string | null;

  /**
   * Status of the activity
   */
  Status : number | null;
}

/**
 * this interface is used base mapping
 */
export interface IBaseActivities {
  /**
   * property code
   */
  Code: string;
  /**
   * property name
   */
  Name: string;
}

/**
 * this interface is used to mapping options of the activities
 */
export interface IOptionActivities extends IBaseActivities {

}

/**
 * This interface is used to mapping prioritys
 */
export interface IPriority {
  /**
   * property Id
   */
  Id: number;
  /**
   * property name
   */
  Name: string;
}

/**
 * This interface is used to mapping contact person
 */
export interface IContactPersonActivities {
  /**
   * property contact code
   */
  ContactCode: string;
  /**
   * property name of the contact person
   */
  Name: string;
  /**
   * property name of the contact person
   */
  Phone: string;
}

/**
 * This interface is used to mapiing type activities
 */
export interface ITypeActivities extends IBaseActivities {

}

/**
 * This interface is used to mapping location
 */
export interface ILocationActivities extends IBaseActivities {

}

/**
 * This interface is used to maping subject
 */
export interface ISubjectActivities extends IBaseActivities {

}

export interface IRecurrenceActivities extends IBaseActivities {

}

/**
 * This interface is used to mapping day of week
 */
export interface IDayOfWeekActivities extends IBaseActivities {

}

/**
 * This interface is used to mapping weeks
 */
export interface IWeekActivities extends IBaseActivities {

}

/**
 * This interface is used to mapping month
 */
export interface IMonthActivities {
  /**
   * Id month
   */
  Id: number;
  /**
   * Description month
   */
  Month: string;
}

/**
 * This interface is used to mapping documents activities
 */
export interface IDocumentsActivities {
  /**
   * Internal document number
   */
  DocEntry: number;
  /**
   * Number document
   */
  DocNum: number;
  /**
   * Date document
   */
  DocDate: string;
  /**
   * Name business partner
   */
  CardName: string;
  /**
   * Comments
   */
  Comments: string;
}

/**
 * This interface is used to mapping object SAP
 */
export interface IObjectSAPActivities {
  /**
   * Id object table SAP
   */
  Id: number;
  /**
   * Description table of the SAP
   */
  Description: string;
}

/**
 * This class is used to model items for the activity screen
 */
export interface IItemsActivities {
  /**
   * This property code of the model
   */
  Codigo: string;
  /**
   * This property description of the model
   */
  Description: string;
  /**
   * This property activo of the model
   */
  Activo: string;
  /**
   * This property available of the model
   */
  OnHand: number;
}

export interface ISearchDocumentsActivity{
  /**
   * property activiti code
   */
  ActivityCode: number;
  /**
   * property card code of business parther
   */
  CardCode: string;
  /**
   * property card name of business parther
   */
  CardName: string;
  /**
   * property create date document
   */
  CreateDate: string;
}

export interface IActivityStates{
  /**
   * Id of the status
   */
  StatusId: number;
  /**
   * Name of the status
   */
  Name: string;
}

export interface ICountriesActivity{
  /**
   * Code of the country
   */
  Code: string;
  /**
   * Name of the country
   */
  Name: string;
}

export interface IStatesCountriesActivity{
  /**
   * Code of the state
   */
  Code: string;
  /**
   * Code of the country
   */
  Country: string;
  /**
   * Name of the country
   */
  Name: string;
}
export interface IBPAndContact{
  /**
   * Object of the SN
   */
  BP: IBusinessPartner;
  /**
   * List of teh contact person
   */
  ContactPerson: IContactPersonActivities[];
}
export interface IBPAndContactAndDirections{
  /**
   * Object of the SN
   */
  BP: IBusinessPartner;
  /**
   * List of the contact person
   */
  ContactPerson: IContactPersonActivities[];
  /**
   * List of the BP Address
   */
  BPAddresses: IBPAddresses[];
}
