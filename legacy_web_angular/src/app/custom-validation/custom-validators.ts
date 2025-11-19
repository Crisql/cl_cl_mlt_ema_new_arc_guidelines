import {AbstractControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ITypeaheadTag} from "../interfaces/i-settings";

export default class Validation {
  static pattern(controlName: string, _list: ITypeaheadTag[]): ValidatorFn {

    return (controls: AbstractControl) => {

      const value = controls.get(controlName)?.value || '';

      if(!_list || _list.length ===0 )  return null;

      if (!_list.filter(i => i.IsRequired).every((x) => value.includes(x.Tag))) {

        controls.get(controlName)?.setErrors({pattern: true});
        return {pattern: true};
      } else {
        return null;
      };
    }

  }

  static patternItem(controlName: string, _list: ITypeaheadTag[]): ValidatorFn {

    return (controls: AbstractControl) => {

      const value = controls.get(controlName)?.value || '';

      if(!_list || _list.length ===0 )  return null;

      if (!_list.filter(i => i.IsRequired).every((x) => value.includes(x.Tag))) {

        controls.get(controlName)?.setErrors({pattern: true});
        return {pattern: true};
      } else {
        return null;
      };
    }

  }

  static validateValueAutoComplete ( options: any[], controlName?: string,): ValidatorFn{

    return (controls: AbstractControl) => {

      const value = controls?.value;

      if(!value) return null;

      if(!options || options.length === 0 )  return null;

      if (!options.some(objeto => JSON.stringify(objeto) === JSON.stringify(value))) {

        if(controlName){
          controls.get(controlName)?.setErrors({pattern: true});
        }else {
          controls?.setErrors({pattern: true});
        }
        return {pattern: true};
      } else {
        return null;
      }
    }
  }

}
