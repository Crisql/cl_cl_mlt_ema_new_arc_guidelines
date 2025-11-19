/**
 * This interface represent is menu
 */
export interface IMenu {
    /**
     * Name
     */
    Name: string;
    /**
     * Id
     */
    Id: number;
    /**
     * Icon
     */
    Icon: string;
    /**
     * Sub menus
     */
    Sons: IMenu[];
    /**
     * Url
     */
    Url: number;
    /**
     * Page
     */
    Page: string; 
    /**
     * Perm
     */
    Perm: string;
    /**
     * Need connection
     */
    NeedConnection?: boolean;
    /**
     * Open sub menus
     */
    Open?: boolean;
}

/**
 * Interface representing a mobile menu item.
 */
export interface IMenuMobile {
    /**
     * Unique key identifier for the menu item.
     */
    Key: string;

    /**
     * Description or name of the menu item.
     */
    Description: string;

    /**
     * Icon associated with the menu item.
     */
    Icon: string;

    /**
     * Route or path for navigation associated with the menu item.
     */
    Route: string;

    /**
     * Indicates whether the menu item is visible.
     */
    Visible: boolean;

    /**
     * List of sub-menu items.
     */
    Nodes: IMenuMobile[];

    /**
     * Category to which the menu item belongs.
     */
    Category: string;

    /**
     * Identifier for the next menu item.
     */
    NextId: number;

    /**
     * Permission name required to access the menu item.
     */
    NamePermission: string;

    /**
     * Used for specific language for the menu.
     */
    Language: string;

    /**
     * Indicates whether a network connection is required for the menu item.
     */
    NeedConnection: boolean;
    /**
     * Indicates whether a type action for the menu item.
     */
    Type: number;
}