using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.CLASSES.PresentationEntities;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a navigational menu item, possibly with nested submenus.
    /// </summary>
    public class Menu : BaseEntity
    {
        /// <summary>
        /// Composite key generated from the category and ID of the menu.
        /// </summary>
        public string Key => string.Format("{0}-{1}", (object)this.Category, (object)this.Id);

        /// <summary>
        /// Text description displayed for the menu item.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Icon identifier used to visually represent the menu item.
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// Route or URL path associated with this menu item.
        /// </summary>
        public string Route { get; set; }

        /// <summary>
        /// Indicates whether the menu item should be visible.
        /// </summary>
        public bool Visible { get; set; }

        /// <summary>
        /// Submenu items nested under this menu.
        /// </summary>
        public List<Menu> Nodes { get; set; }

        /// <summary>
        /// Category or group the menu belongs to.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// ID reference used to determine the next available menu entry.
        /// </summary>
        public int NextId { get; set; }

        /// <summary>
        /// Name of the permission required to access this menu.
        /// </summary>
        public string NamePermission { get; set; }

        /// <summary>
        /// Language-specific identifier for localized display.
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// Indicates if this menu item requires an internet connection to be functional.
        /// </summary>
        public bool NeedConnection { get; set; }

        /// <summary>
        /// Type of action or method associated with this menu (e.g., page, command).
        /// </summary>
        public int Type { get; set; }
    }

    /// <summary>
    /// Represents weight configuration for menu options (e.g., for prioritization or sorting).
    /// </summary>
    public class MenuOptionWeight
    {
        /// <summary>
        /// Serialized weights assigned to menu options.
        /// </summary>
        public string Weights { get; set; }
    }
}
