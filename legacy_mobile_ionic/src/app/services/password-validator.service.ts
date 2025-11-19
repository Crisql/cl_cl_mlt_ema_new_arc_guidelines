import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class PasswordValidatorService {
  static MatchPassword(AC: AbstractControl) {
    let password = AC.get("pass").value;
    let confirmPassword = AC.get("passConfirmation").value;

    if (password !== confirmPassword) {
      AC.get("passConfirmation").setErrors({ MatchPassword: true });
    } else {
      return null;
    }
  }
}
