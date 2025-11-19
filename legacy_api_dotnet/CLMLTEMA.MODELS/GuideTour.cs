using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a guided tour group, used to organize onboarding or walkthrough steps.
    /// </summary>
    public class GuideTourGroup : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Unique code identifying the tour group.
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Display name of the tour group.
        /// </summary>
        public string TourGroupName { get; set; }

        /// <summary>
        /// Path or route where the tour is triggered in the application.
        /// </summary>
        public string ViewPath { get; set; }
    }

    /// <summary>
    /// Represents an individual step within a guided tour.
    /// </summary>
    public class GuideTourStep : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Identifier of the associated tour group.
        /// </summary>
        public int GuideTourGroupId { get; set; }

        /// <summary>
        /// CSS selector used to target the UI component for this step.
        /// </summary>
        public string ComponentSelector { get; set; }

        /// <summary>
        /// Title shown at the top of the step modal.
        /// </summary>
        public string StepTitle { get; set; }

        /// <summary>
        /// Descriptive text shown within the step modal.
        /// </summary>
        public string StepText { get; set; }

        /// <summary>
        /// Indicates whether the "Next" button is shown.
        /// </summary>
        public bool ShowNextButton { get; set; }

        /// <summary>
        /// Indicates whether the "Back" button is shown.
        /// </summary>
        public bool ShowBackButton { get; set; }

        /// <summary>
        /// Indicates whether the "Finish" button is shown.
        /// </summary>
        public bool ShowFinalizeButton { get; set; }

        /// <summary>
        /// Position of the step modal relative to the target element (e.g., top, right).
        /// </summary>
        public string ModalPosition { get; set; }

        /// <summary>
        /// CSS class used to highlight the target element.
        /// </summary>
        public string HighlightClass { get; set; }

        /// <summary>
        /// Custom CSS classes applied to the step modal.
        /// </summary>
        public string CssClasses { get; set; }

        /// <summary>
        /// CSS selector used to trigger auto-advance to the next step.
        /// </summary>
        public string AdvanceOnSelector { get; set; }

        /// <summary>
        /// DOM event (e.g., click, input) that triggers step advancement.
        /// </summary>
        public string AdvanceOnDOMEvent { get; set; }

        /// <summary>
        /// Indicates whether the user is allowed to click the highlighted target element.
        /// </summary>
        public bool CanClickTarget { get; set; }
    }

    /// <summary>
    /// Configuration for custom buttons used within guided tour steps.
    /// </summary>
    public class GuideTourButtonConfig
    {
        /// <summary>
        /// Unique key identifying the button.
        /// </summary>
        public string Key { get; set; }

        /// <summary>
        /// Text displayed on the button.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// CSS classes applied to the button for styling.
        /// </summary>
        public string CssClasses { get; set; }
    }
}