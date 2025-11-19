using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    public class Route : BaseEntity, IClDatabaseServices
    {
        public string Name { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int Status { get; set; }
        public int Type { get; set; }
        public DateTime? ActivationDate { get; set; }
        public float TotalDistance { get; set; }
        public float TotalDuration { get; set; }
        public string CloseDetail { get; set; }
        public string CloseUser { get; set; }
        public DateTime? CloseDate { get; set; }
        public float TotalEstimatedDistance { get; set; }
        public float TotalEstimatedDuration { get; set; }
        public int CompanyId { get; set; }
        public int RouteFrequencyId { get; set; }
        public Company Company { get; set; }
        public RouteFrequency RouteFrequency { get; set; }
    }

    public class RouteFrequency : BaseEntity, IClDatabaseServices
    {
        public string Description { get; set; }
        public string Weeks { get; set; }
        public string Days { get; set; }
    }

    public class RouteAssignment : BaseEntity, IClDatabaseServices
    {
        public DateTime? RouteDownloadDate { get; set; }
        public string IMEI { get; set; }
        public int UserAssignId { get; set; }
        public int RouteId { get; set; }
        public Route Route { get; set; }
        public UserAssign UserAssign { get; set; }
    }

    /// <summary>
    /// Represents line route data
    /// </summary>
    public class RouteLine : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// The address of the stop.
        /// </summary>
        public string Address { get; set; }

        /// <summary>
        /// Latitude coordinate of the address.
        /// </summary>
        public double Latitude { get; set; }

        /// <summary>
        /// Longitude coordinate of the address.
        /// </summary>
        public double Longitude { get; set; }

        /// <summary>
        /// The SAP business partner code associated with the stop.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// The name of the customer or business partner.
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Optional ID of the address line in the database.
        /// </summary>
        public int? AddressLineId { get; set; }

        /// <summary>
        /// Status of the visit check (e.g., completed, pending).
        /// </summary>
        public int CheckStatus { get; set; }

        /// <summary>
        /// General status of the route line.
        /// </summary>
        public int Status { get; set; }

        /// <summary>
        /// Indicates the type of address (e.g., billing, shipping).
        /// </summary>
        public int AddressType { get; set; }

        /// <summary>
        /// Scheduled time to begin the visit.
        /// </summary>
        public string VisitingTime { get; set; }

        /// <summary>
        /// Scheduled time to end the visit.
        /// </summary>
        public string VisitEndTime { get; set; }

        /// <summary>
        /// Sequential number identifying the line within the address list.
        /// </summary>
        public int AddressLineNum { get; set; }

        /// <summary>
        /// Foreign key referencing the associated route.
        /// </summary>
        public int RouteId { get; set; }

        /// <summary>
        /// Navigation property for the associated route.
        /// </summary>
        public Route Route { get; set; }

        /// <summary>
        /// Grouping number used for segmenting lines within the same route.
        /// </summary>
        public int LineGroupNum { get; set; }
    }

    /**
     * Model representing a route history
     */
    public class RouteHistory : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Latitude of the route history location.
        /// </summary>
        public double Latitude { get; set; }
        /// <summary>
        /// Longitude of the route history location.
        /// </summary>
        public double Longitude { get; set; }
        /// <summary>
        /// Type of check of the route history.
        /// </summary>
        public int CheckType { get; set; }
        /// <summary>
        /// Comments associated with the route history.
        /// </summary>
        public string Comments { get; set; }
        /// <summary>
        /// Code of the customer associated with the route history.
        /// </summary>
        public string CardCode { get; set; }
        /// <summary>
        /// Name of the customer associated with the route history.
        /// </summary>
        public string CardName { get; set; }
        /// <summary>
        /// Address name associated with the route history.
        /// </summary>
        public string Address { get; set; }
        /// <summary>
        /// Address type of the route history. Indicates if is a order or delivery destination
        /// </summary>
        public int AddressType { get; set; }
        /// <summary>
        /// Photos associated with the route history.
        /// </summary>
        public string Photos { get; set; }
        /// <summary>
        /// ID of the route line associated with the route history.
        /// </summary>
        public int? RouteLineId { get; set; }
        /// <summary>
        /// ID of the route associated with the route history.
        /// </summary>
        public int RouteId { get; set; }
        /// <summary>
        /// Navigation property to make the relationship between routes and routes histories
        /// </summary>
        public Route Route { get; set; }
        /// <summary>
        /// Navigation property to make the relationship between routes lines and routes histories
        /// </summary>
        public RouteLine RouteLine { get; set; }
        /// <summary>
        /// The date when the route history were created in the mobile
        /// </summary>
        public DateTime MobileCreationDate
        {
            get
            {
                return CreatedDate;
            }
        }
    }

    public class RouteCalculationDetail : BaseEntity, IClDatabaseServices
    {
        public int Type { get; set; }
        public float Distance { get; set; }
        public float Duration { get; set; }
        public string JsonApi { get; set; }
        public int Status { get; set; }
        
        public int RouteId { get; set; }
        public Route Route { get; set; }
    }

    public enum RouteStatus
    {
        INACTIVE,
        ACTIVATED,
        FINISHED,
        CLOSED,
        NOSTARTED
    }

    public enum RouteType
    {
        ORDER,
        DELIVERY
    }

    public enum RouteCheckTypes
    {
        DESTINATION,
        FAILED_EXIT,
        SUCCESS_EXIT,
        AUTOMATIC_POINT,
        ARRIVAL,
        NOT_LINKED_TO_ROUTE,
        ROUTE_START,
        END_OF_ROUTE
    }

    public enum RouteCalculationTypes
    {
        CALCULATED,
        ESTIMATED
    }

    public class RouteWithLines
    {
        public Route Route { get; set; }
        public List<RouteLine> RouteLines { get; set; }
    }

    [NotMapped]
    public class PresentationRoute : Route
    {
        public int RouteAssignmentUserId { get; set; }
        public bool RouteWasDownloaded { get; set; }
    }

    public class PresentationRouteWithLines
    {
        public PresentationRoute Route { get; set; }
        public List<RouteLine> RouteLines { get; set; }
    }

    public class RouteAdministrator : BaseEntity, IClDatabaseServices
    {
        public int UserId { get; set; }
        public int RouteId { get; set; }
        public Route Route { get; set; }
        public User User { get; set; }
    }

    public class ProcessedRoute
    {
        public Route Route { get; set; }
        public List<RouteLine> RouteLines { get; set; }
        public int UserAssigned { get; set; }
        public bool Estimate { get; set; }
        public string EstimateJson { get; set; }
        public bool Status { get; set; }
        public string Result { get; set; }
    }
    
    public class CreatedProcessedRoute
    {
        public int RouteId { get; set; }
        public List<int> RouteDetailIDs { get; set; }
    }

    public class RouteUserFilter
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public string IMEI { get; set; }
    }
    
    public class RouteActiveFilter
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
    }


    /// <summary>
    /// Model that represents the total documents of the route
    /// </summary>
    public class TotalBPRouteDocuments
    {
        /// <summary>
        /// Card code of BP
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Card name of bp
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Total of documents of bp
        /// </summary>
        public int DocsTotal { get; set; }
    }
}