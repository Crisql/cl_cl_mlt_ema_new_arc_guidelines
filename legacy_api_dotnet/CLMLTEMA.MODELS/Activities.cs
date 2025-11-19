using System;
using CL.STRUCTURES.ATTRIBUTES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class represent a model activities
    /// </summary>
    public class Activities
    {
        /// <summary>
        /// It is the property Activity Code
        /// </summary>
        [MasterKey]
        public int ActivityCode { get; set; }

        /// <summary>
        /// It is the property selected activity
        /// </summary>
        public string Activity { get; set; }

        /// <summary>
        /// It is the property type activity
        /// </summary>
        public int? ActivityType { get; set; }

        /// <summary>
        /// It is the property phone activity
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// It is the property card code activity
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// It is the property card name activity
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// It is the property subject activity
        /// </summary>
        public int? Subject { get; set; }

        /// <summary>
        /// It is the property user
        /// </summary>
        public int? HandledBy { get; set; }

        /// <summary>
        /// It is the property contact person by busines partner
        /// </summary>
        public int? ContactPersonCode { get; set; }

        /// <summary>
        /// It is the property comments activity
        /// </summary>
        public string Details { get; set; }

        /// <summary>
        ///  It is the property start date activity
        /// </summary>
        public string StartDate { get; set; }

        /// <summary>
        /// It is the property start time activity
        /// </summary>
        public string StartTime { get; set; }

        /// <summary>
        /// It is the property end date activity
        /// </summary>
        public string EndDueDate { get; set; }

        /// <summary>
        /// It is the property end time activity
        /// </summary>
        public string EndTime { get; set; }

        /// <summary>
        /// It is the property duration activity
        /// </summary>
        public decimal? Duration { get; set; }

        /// <summary>
        /// It is the property priority of the activity
        /// </summary>
        public string Priority { get; set; }

        /// <summary>
        /// It is the property location activity
        /// </summary>
        public int? Location { get; set; }

        /// <summary>
        /// It is the property recurrence activity
        /// </summary>
        public string RecurrencePattern { get; set; } = "rpNone";

        /// <summary>
        /// It is the property Repeat Option activity
        /// </summary>
        public object RepeatOption { get; set; }

        /// <summary>
        /// It is the property Interval activity
        /// </summary>
        public int? Interval { get; set; }

        /// <summary>
        /// It is the property Series Start Date activity
        /// </summary>
        public string SeriesStartDate { get; set; }

        /// <summary>
        /// It is the property Series End Date activity
        /// </summary>
        public string SeriesEndDate { get; set; }

        /// <summary>
        /// It is the property End Type activity
        /// </summary>
        public object EndType { get; set; }

        /// <summary>
        /// It is the property Max Occurrence activity
        /// </summary>
        public int? MaxOccurrence { get; set; }

        /// <summary>
        /// It is the property Closed activity
        /// </summary>
        public string Closed { get; set; } = "tNO";

        /// <summary>
        /// It is the property Inactive Flag activity
        /// </summary>
        public string InactiveFlag { get; set; } = "tNO";

        /// <summary>
        /// It is the property Monday activity
        /// </summary>
        public string Monday { get; set; }

        /// <summary>
        /// It is the property Tuesday activity
        /// </summary>
        public string Tuesday { get; set; }

        /// <summary>
        /// It is the property Wednesday activity
        /// </summary>
        public string Wednesday { get; set; }

        /// <summary>
        /// It is the property Thursday activity
        /// </summary>
        public string Thursday { get; set; }

        /// <summary>
        /// It is the property Friday activity
        /// </summary>
        public string Friday { get; set; }

        /// <summary>
        /// It is the property Saturday activity
        /// </summary>
        public string Saturday { get; set; }

        /// <summary>
        /// It is the property Sunday activity
        /// </summary>
        public string Sunday { get; set; }

        /// <summary>
        /// It is the property Recurrence Sequence Specifier activity
        /// </summary>
        public string RecurrenceSequenceSpecifier { get; set; }

        /// <summary>
        /// It is the property Recurrence Day Of Week activity
        /// </summary>
        public string RecurrenceDayOfWeek { get; set; }

        /// <summary>
        /// It is the property Recurrence Day InMonth activity
        /// </summary>
        public int? RecurrenceDayInMonth { get; set; }

        /// <summary>
        /// It is the property Recurrence Month activity
        /// </summary>
        public int? RecurrenceMonth { get; set; }

        /// <summary>
        /// It is the property document type
        /// </summary>
        public string DocType { get; set; }

        /// <summary>
        /// document number
        /// </summary>
        public string DocNum { get; set; }

        /// <summary>
        /// Internal document number
        /// </summary>
        public string DocEntry { get; set; }
        
        /// <summary>
        /// Reminder Property
        /// </summary>
        public string Reminder { get; set; }
        
        /// <summary>
        /// Reminder type
        /// </summary>
        public string ReminderType { get; set; }
        
        /// <summary>
        /// Reminder Period
        /// </summary>
        public decimal? ReminderPeriod { get; set; }

        /// <summary>
        /// Country where it will take place
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// State where it will take place
        /// </summary>
        public string State { get; set; }

        /// <summary>
        ///  Room where it will take place
        /// </summary>
        public string Room { get; set; }
        
        /// <summary>
        /// Street where it will take place
        /// </summary>
        public string Street { get; set; }
        
        /// <summary>
        /// city where it will take place
        /// </summary>
        public string City { get; set; }
        
        /// <summary>
        /// Status of the activity
        /// </summary>
        public int? Status { get; set; }
    }

    /// <summary>
    /// This class represent an activities
    /// </summary>
    public class OptionActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent recurrence Day Week activities
    /// </summary>
    public class DayWeekActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent recurrence Day Week activities
    /// </summary>
    public class WeekActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent Month for activities
    /// </summary>
    public class MonthActivities
    {
        /// <summary>
        /// Property id in model
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Property month in model
        /// </summary>
        public string Month { get; set; }
    }

    /// <summary>
    /// This class represent Object SAP to activities
    /// </summary>
    public class ObjectSAPActivities
    {
        /// <summary>
        /// Property id in model
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Property Description in model
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// Represents the base class for activity models.
    /// </summary>
    public class BaseActivities
    {
        /// <summary>
        /// Gets or sets the activity code.
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Gets or sets the activity name.
        /// </summary>
        public string Name { get; set; }
    }

    /// <summary>
    /// This class represent a list priortis of activities
    /// </summary>
    public class Priority
    {
        /// <summary>
        /// Id of ther priority
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name of the priority
        /// </summary>
        public string Name { get; set; }
    }

    /// <summary>
    /// This class represent a list of contact person
    /// </summary>
    public class ContactPersonActivities
    {
        /// <summary>
        /// Property contact code of the model person
        /// </summary>
        public string ContactCode { get; set; }

        /// <summary>
        /// Property Name of the model person
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Property Phone of the model person
        /// </summary>
        public string Phone { get; set; }
    }

    /// <summary>
    /// This class represent type activities
    /// </summary>
    public class TypeActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent location list
    /// </summary>
    public class LocationActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent a list of subject
    /// </summary>
    public class SubjectActivities : BaseActivities
    {
    }

    /// <summary>
    /// This class represent de recurrence activities
    /// </summary>
    public class RecurrenceActivities : BaseActivities
    {
    }
    
    /// <summary>
    /// This class represent the activity states
    /// </summary>
    public class ActivityStates
    {
        /// <summary>
        /// Id of the status
        /// </summary>
        public int StatusId { get; set; }
        
        /// <summary>
        /// Name of the status
        /// </summary>
        public string Name { get; set; }
    }

    /// <summary>
    /// This class represent the countries activity
    /// </summary>
    public class CountriesActivity
    {
        /// <summary>
        /// Code of the country
        /// </summary>
        public string Code { get; set; }
        
        /// <summary>
        /// Name of the country
        /// </summary>
        public string Name { get; set; }
    }
    
    /// <summary>
    /// This class represent the countries activity
    /// </summary>
    public class StatesCountriesActivity
    {
        /// <summary>
        /// Code of the state
        /// </summary>
        public string Code { get; set; }
        
        /// <summary>
        /// Code of the country
        /// </summary>
        public string Country { get; set; }
        
        /// <summary>
        /// Name of the country
        /// </summary>
        public string Name { get; set; }
    }
}