using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Main Entity Framework database context that maps application entities to database tables.
    /// Inherits from <see cref="DbContext"/>.
    /// </summary>
    public class MainDBContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MainDBContext"/> class using the 'MainDBContext'
        /// connection string defined in the application configuration file.
        /// </summary>
        public MainDBContext() : base("name=MainDBContext")
        {
        }

        /// <summary>
        /// Represents the Users table.
        /// </summary>
        public virtual DbSet<User> Users { get; set; }

        /// <summary>
        /// Represents the Companies table.
        /// </summary>
        public virtual DbSet<Company> Companies { get; set; }

        /// <summary>
        /// Represents the Connections table.
        /// </summary>
        public virtual DbSet<Connection> Connections { get; set; }

        /// <summary>
        /// Represents the DBResources table.
        /// </summary>
        public virtual DbSet<DBResource> DBResources { get; set; }

        /// <summary>
        /// Represents the Licenses table.
        /// </summary>
        public virtual DbSet<License> Licenses { get; set; }

        /// <summary>
        /// Represents the UserAssigns table.
        /// </summary>
        public virtual DbSet<UserAssign> UserAssigns { get; set; }

        /// <summary>
        /// Represents the Settings table.
        /// </summary>
        public virtual DbSet<Setting> Settings { get; set; }

        /// <summary>
        /// Represents the Roles table.
        /// </summary>
        public virtual DbSet<Role> Roles { get; set; }

        /// <summary>
        /// Represents the Permissions table.
        /// </summary>
        public virtual DbSet<Permission> Permissions { get; set; }

        /// <summary>
        /// Represents the PermsByRoles table.
        /// </summary>
        public virtual DbSet<PermsByRole> PermsByRoles { get; set; }

        /// <summary>
        /// Represents the RolesByUsers table.
        /// </summary>
        public virtual DbSet<RolesByUser> RolesByUsers { get; set; }

        /// <summary>
        /// Represents the Terminals table.
        /// </summary>
        public virtual DbSet<Terminal> Terminals { get; set; }

        /// <summary>
        /// Represents the TerminalsByUsers table.
        /// </summary>
        public virtual DbSet<TerminalsByUser> TerminalsByUsers { get; set; }

        /// <summary>
        /// Represents the PPBalance table.
        /// </summary>
        public virtual DbSet<PPBalance> PPBalance { get; set; }

        /// <summary>
        /// Represents the PPTransaction table.
        /// </summary>
        public virtual DbSet<PPTransaction> PPTransaction { get; set; }

        /// <summary>
        /// Represents the PPVoidedTransaction table.
        /// </summary>
        public virtual DbSet<PPVoidedTransaction> PPVoidedTransaction { get; set; }

        /// <summary>
        /// Represents the PPCashDeskClosing table.
        /// </summary>
        public virtual DbSet<PPCashDeskClosing> PPCashDeskClosing { get; set; }

        /// <summary>
        /// Represents the PPCashDeskClosingDetail table.
        /// </summary>
        public virtual DbSet<PPCashDeskClosingDetail> PPCashDeskClosingDetail { get; set; }

        /// <summary>
        /// Represents the PPStoredTransactions table.
        /// </summary>
        public virtual DbSet<PPStoredTransaction> PPStoredTransactions { get; set; }

        /// <summary>
        /// Represents the ResourcesByCompanies table.
        /// </summary>
        public virtual DbSet<ResourcesByCompany> ResourcesByCompanies { get; set; }

        /// <summary>
        /// Represents the SeriesByUsers table.
        /// </summary>
        public virtual DbSet<SeriesByUser> SeriesByUsers { get; set; }

        /// <summary>
        /// Represents the CompanyUdfs table.
        /// </summary>
        public virtual DbSet<CompanyUdf> CompanyUdfs { get; set; }

        /// <summary>
        /// Represents the PaydeskBalances table.
        /// </summary>
        public virtual DbSet<PaydeskBalance> PaydeskBalances { get; set; }

        /// <summary>
        /// Represents the LogEvents table.
        /// </summary>
        public virtual DbSet<LogEvent> LogEvents { get; set; }

        /// <summary>
        /// Represents the SyncDocuments table.
        /// </summary>
        public virtual DbSet<SyncDocument> SyncDocuments { get; set; }

        /// <summary>
        /// Represents the DiscountHierarchies table.
        /// </summary>
        public virtual DbSet<DiscountHierarchy> DiscountHierarchies { get; set; }

        /// <summary>
        /// Represents the LocalPrinters table.
        /// </summary>
        public virtual DbSet<LocalPrinter> LocalPrinters { get; set; }

        /// <summary>
        /// Represents the FESeries table.
        /// </summary>
        public virtual DbSet<FESerie> FESeries { get; set; }

        #region Guide Tour

        /// <summary>
        /// Represents the GuideTourGroups table.
        /// </summary>
        public virtual DbSet<GuideTourGroup> GuideTourGroups { get; set; }

        /// <summary>
        /// Represents the GuideTourSteps table.
        /// </summary>
        public virtual DbSet<GuideTourStep> GuideTourSteps { get; set; }

        #endregion

        #region Geo Roles

        /// <summary>
        /// Represents the GeoConfigs table.
        /// </summary>
        public virtual DbSet<GeoConfig> GeoConfigs { get; set; }

        /// <summary>
        /// Represents the GeoRoles table.
        /// </summary>
        public virtual DbSet<GeoRole> GeoRoles { get; set; }

        /// <summary>
        /// Represents the GeoConfigsByGeoRoles table.
        /// </summary>
        public virtual DbSet<GeoConfigByGeoRole> GeoConfigsByGeoRoles { get; set; }

        /// <summary>
        /// Represents the GeoRolesByUsers table.
        /// </summary>
        public virtual DbSet<GeoRoleByUser> GeoRolesByUsers { get; set; }

        #endregion

        #region Routes

        /// <summary>
        /// Represents the table containing route definitions.
        /// </summary>
        public virtual DbSet<Route> Routes { get; set; }

        /// <summary>
        /// Represents the table containing detailed route lines (stops or checkpoints).
        /// </summary>
        public virtual DbSet<RouteLine> RouteLines { get; set; }

        /// <summary>
        /// Represents the table defining frequency rules for scheduled routes.
        /// </summary>
        public virtual DbSet<RouteFrequency> RouteFrequencies { get; set; }

        /// <summary>
        /// Represents the table for storing historical data about route executions.
        /// </summary>
        public virtual DbSet<RouteHistory> RouteHistories { get; set; }

        /// <summary>
        /// Represents the table for detailed information used in route calculation and optimization.
        /// </summary>
        public virtual DbSet<RouteCalculationDetail> RouteCalculationDetails { get; set; }

        /// <summary>
        /// Represents the table associating users or entities with specific route assignments.
        /// </summary>
        public virtual DbSet<RouteAssignment> RouteAssignments { get; set; }

        /// <summary>
        /// Represents the table for route administrators who manage and control route configurations.
        /// </summary>
        public virtual DbSet<RouteAdministrator> RouteAdministrators { get; set; }

        #endregion

        #region Appointments

        /// <summary>
        /// Represents the table for calendar appointments, including Outlook and Gmail events,
        /// used for scheduling visits or tasks within the routing system.
        /// </summary>
        public virtual DbSet<CalendarAppointment> CalendarAppointments { get; set; }

        #endregion
    }

}
