import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IHistoryFiltersDialogData, IHistoryFiltersDialogResult} from "@app/interfaces/i-dialog-data";
import {IStructures} from "@app/interfaces/i-structures";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import Validation from "@app/custom-validation/custom-validators";

@Component({
  selector: 'app-history-filters',
  templateUrl: './history-filters.component.html',
  styleUrls: ['./history-filters.component.scss']
})
export class HistoryFiltersComponent implements OnInit {

  visibleRouteChecks:IStructures[] = [];
  routeChecks: IStructures[] = [];
  routeUsers: IUser[] = [];
  filteredRouteUsers: IUser[] = [];
  routeCustomers: IBusinessPartner[] = [];
  filteredRouteCustomers: IBusinessPartner[] = [];
  filtersForm!: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) private data: IHistoryFiltersDialogData,
              private matDialogRef: MatDialogRef<HistoryFiltersComponent>,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.visibleRouteChecks = [...this.data.VisibleRouteCheckTypes || []];
    this.routeChecks = [...this.data.RouteCheckTypes || []];
    this.routeUsers =  [...this.data.RouteAssignedUsers || []];
    this.routeCustomers = [...this.data.RouteCustomers || []];
    this.filteredRouteUsers = [...this.routeUsers];
    this.filteredRouteCustomers = [...this.routeCustomers];
    this.filtersForm = this.formBuilder.group({
      DateTo: [this.data.DateTo],
      DateFrom: [this.data.DateFrom],
      Customer: [''],
      UserAssign: ['']
    });

    this.ListenCustomerAutocompleteChanges();
    this.ListenUsersAutocompleteChanges();
    this.SetValidatorAutoComplete();
  }

  SetValidatorAutoComplete(): void{
    this.filtersForm.get('UserAssign')?.addValidators(Validation.validateValueAutoComplete(this.routeUsers));
    this.filtersForm.get('Customer')?.addValidators(Validation.validateValueAutoComplete(this.routeCustomers));

  }

  IsChecked(_check: IStructures): boolean
  {
    return this.data?.VisibleRouteCheckTypes.some(x => x.Key === _check.Key);
  }

  ToggleCheck(_check: IStructures): void
  {
    let indexOfCheck = this.visibleRouteChecks.findIndex(x => x.Key === _check.Key);

    if(indexOfCheck != -1)
    {
      this.visibleRouteChecks.splice(indexOfCheck, 1);
    }
    else
    {
      this.visibleRouteChecks.push(_check);
    }
  }

  /**
   * Filter users
   * @param _user -Autocomplete of the user to search
   * @constructor
   */
  UserAssingAutocompleteDisplayWith = (_user: IUser | string): string => {
    if(typeof _user === "string") return _user;

    if(!_user) return '';

    return `${_user.Id} - ${_user.Name} ${_user.LastName}`;
  }

  /**
   * Filter business partners
   * @param _customer -Autocomplete of the business partners to search
   * @constructor
   */
  CustomerAutocompleteDisplayWith = (_customer: IBusinessPartner | string): string => {
    if(typeof _customer === "string") return _customer;

    if(!_customer) return '';

    return `${_customer.CardCode} - ${_customer.CardName}`;
  }

  ListenUsersAutocompleteChanges(): void
  {
    this.filtersForm.get('UserAssign')?.valueChanges.subscribe({
      next: (value) => {
        if(typeof value === "string")
        {
          this.filteredRouteUsers = this.routeUsers.filter(u => (`${u.Id} - ${u.Name} ${u.LastName}`).toLowerCase().includes(value.toLowerCase()));
        }
      }
    });

    this.filtersForm.get('UserAssign')?.patchValue(this.data.SelectedUser ?? '');

  }

  ListenCustomerAutocompleteChanges(): void
  {
    this.filtersForm.get('Customer')?.valueChanges.subscribe({
      next: (value) => {
        if(typeof value === "string")
        {
          this.filteredRouteCustomers = this.routeCustomers.filter(u => (`${u.CardCode} - ${u.CardName}`).toLowerCase().includes(value.toLowerCase()));
        }
      }
    });

    this.filtersForm.get('Customer')?.patchValue(this.data.SelectedCustomer ?? '');
  }

  Search(): void
  {
    this.matDialogRef.close({
      VisibleRouteCheckTypes: this.visibleRouteChecks,
      SelectedCustomer: typeof this.filtersForm.get('Customer')?.value === 'object' ? this.filtersForm.get('Customer')?.value as IBusinessPartner : undefined,
      SelectedUserAssign: typeof this.filtersForm.get('UserAssign')?.value === 'object' ? this.filtersForm.get('UserAssign')?.value as IUser : undefined,
      DateFrom: this.filtersForm.get("DateFrom")?.value,
      DateTo: this.filtersForm.get("DateTo")?.value
    } as IHistoryFiltersDialogResult);
  }
}
