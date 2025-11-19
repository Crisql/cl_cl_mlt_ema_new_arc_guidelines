import {FormGroup} from "@angular/forms";
import {IPermissionbyUser} from "@app/interfaces/i-roles";

export interface IActionButton {
  Text?: string;
  MatIcon?: string;
  MatColor?: string;
  Key: string;
  Options?: IActionButton[]
  /**
   * Condicion que se usara para deshabilitar el boton
   * @param _form Formulario al que esta asociado el boton
   * @constructor
   */
  DisabledIf?: (_form?: FormGroup, _userPermssions?: IPermissionbyUser[]) => boolean;

}
