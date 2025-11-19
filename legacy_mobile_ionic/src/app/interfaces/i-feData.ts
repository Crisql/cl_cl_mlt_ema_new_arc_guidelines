/**
 * This interface is used mapping models FE data
 */
export interface IFeData {
    //Mapiing property Nombre
    nombre: string;
    //Mapiing property Tipo de indentificacion
    tipoIdentificacion: string;
    //Mapiing property Regimen
    regimen: IRegimen;
    //Mapiing property Situacion
    situacion: ISituacion;
    //Mapiing property Actividades
    actividades: any[];
}

/**
 * This interface is used mapping models FE data
 */
export interface IRegimen {
    //Mapiing property codigo
    codigo: number;
    //Mapiing property descripcion
    descripcion: string;
}

/**
 * This interface is used mapping models FE data
 */
export interface ISituacion {
    //Mapiing property Moroso
    moroso: string;
    //Mapiing property omiso
    omiso: string;
    //Mapiing property estado
    estado: string;
    //Mapiing property Administracon tributaria
    administracionTributaria: string;
    //Mapiing property mensaje
    mensaje: string;
}
