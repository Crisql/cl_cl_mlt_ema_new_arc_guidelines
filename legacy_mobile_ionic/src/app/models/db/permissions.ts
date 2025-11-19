// modelo con la informacion de los permisos, se usa en la DB
export interface PermissionsModel {
    // Identificador de los permisos
    Id: number;
    // Tipo de permiso
    Type: number;
    // Nombre del permiso
    Name: string;
    // Descripcion del permiso
    Description: string;
    // Estado de actividad del permiso
    Active: boolean;
}

// modelo para manipular los permisos selecionados en el front
export interface PermissionsSelectedModel extends PermissionsModel {
    // identificador para reconcer si el permiso fue selecionado o no
    Selected: boolean;
}



export interface IPermission
{
    Name: string;
    Description: string;
    PermissionType: PermissionType;
}

export enum PermissionType
{
    Create,
    Read,
    Update,
    Delete
}