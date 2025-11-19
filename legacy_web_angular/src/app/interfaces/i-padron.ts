import {IStructures} from "@app/interfaces/i-structures";

export interface IPadron {
  nombre: string;
  tipoIdentificacion: string;
}

export interface IFeData{
  IdType:string;
  Identification: string;
  Email: string;
  Nombre:string;
  ConsultFE: boolean;
  EditDocument: boolean;
}

