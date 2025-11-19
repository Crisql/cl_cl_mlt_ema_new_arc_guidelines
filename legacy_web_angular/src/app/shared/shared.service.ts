import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {CLPrint, Repository, Structures} from '@clavisco/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {StorageKey} from '../enums/e-storage-keys';
import {IActionButton} from '../interfaces/i-action-button';
import {ICompany} from '../interfaces/i-company';
import {HttpHeaders} from "@angular/common/http";
import {FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import Validation from "@app/custom-validation/custom-validators";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {IChart} from "@app/interfaces/i-chart";
import { IConection } from '@app/interfaces/i-conection';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private readonly currentPage$: Subject<string>;
  private readonly actionsButtons$: Subject<IActionButton[]>;
  private readonly actionButtonClicked$: Subject<IActionButton>;
  private readonly onPageInit$: Subject<boolean>;
  private readonly enableItem$: Subject<boolean>;
  readonly onAutcompleteBp$: Subject<boolean>;
  public changeWarehouse$ = new Subject<string>();
  public refreshRate$ = new Subject<number>();
  public focusItem$ = new Subject<void>();
  public getCharts$ = new Subject<IChart[]>();


  constructor(private router: Router) {
    this.currentPage$ = new Subject<string>();
    this.actionsButtons$ = new Subject<IActionButton[]>();
    this.actionButtonClicked$ = new Subject<IActionButton>();
    this.onPageInit$ = new Subject<boolean>();
    this.onAutcompleteBp$ = new Subject<boolean>();
    this.enableItem$ = new Subject<boolean>();
  }

  Logout(_shouldNavigate: boolean = true): void {
    Repository.Behavior.DeleteStorageObject(StorageKey.Session);
    Repository.Behavior.DeleteStorageObject(StorageKey.CurrentCompany);
    Repository.Behavior.DeleteStorageObject(StorageKey.CurrentUserAssign);
    Repository.Behavior.DeleteStorageObject(StorageKey.DocumentInMemories);
    Repository.Behavior.DeleteStorageObject(StorageKey.CurrentSession);
    Repository.Behavior.DeleteStorageObject(StorageKey.Ports);
    Repository.Behavior.DeleteStorageObject(StorageKey.Permissions);
    Repository.Behavior.DeleteStorageObject(StorageKey.Menu);
    Repository.Behavior.DeleteStorageObject(StorageKey.LocalPrinter);
    if (_shouldNavigate) this.router.navigate(['/login']);
  }

  OnPageInit(): Observable<boolean> {
    return this.onPageInit$.asObservable();
  }

  PageInit(): void {
    this.onPageInit$.next(true);
  }

  get EnableItem(): Observable<boolean> {
    return this.enableItem$.asObservable();
  }

  EmitEnableItem(){
    this.enableItem$.next(true);
  }

  GetCurrentRouteSegment(): string {
    return this.router.url.split('?').shift() || '/';
  }

  /**
   * Agrega al toolbar el nombre de la pagina actual
   * @param _page Nombre de la pagina
   */
  SetCurrentPage(_page: string): void {
    this.currentPage$.next(_page);
  }

  /**
   * Detecta cambios del nombre de la pagina actual
   * @returns Nombre de la pagina actual
   */
  OnCurrentPageChange(): Observable<string> {
    return this.currentPage$.asObservable();
  }

  /**
   * Guarda la compañía seleccionada en el localstorage y emite un valor observable
   * @param _company Compañia seleccionada
   */
  SetCurrentCompany(_company: ICompany): void {
    Repository.Behavior.SetStorage(_company, StorageKey.CurrentCompany)
  }

  /**
   * Guarda la conección seleccionada en el localstorage y emite un valor observable
   * @param _connection Conección seleccionada
   */
  SetCurrentConnection(_connection: IConection): void {
    Repository.Behavior.SetStorage(_connection, StorageKey.CurrentConnection)
  }

  /**
   * Detecta cambios de compañía seleccionada
   * @returns Compañía seleccionada
   */
  OnCurrentCompanyChange(): ICompany | null {
    return Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
  }

  /**
   * Agrega botones de acciones en la barra de acciones
   * @param _actionButtons Lista de botones de acciones
   */
  SetActionButtons(_actionButtons: IActionButton[]): void {
    this.actionsButtons$.next(_actionButtons);
  }

  /**
   * Obtiene los botones de acciones
   * @returns Lista de los botones de acciones
   */
  GetActionsButtons(): Observable<IActionButton[]> {
    return this.actionsButtons$.asObservable();
  }

  /**
   * Emite el boton al que se le ha dado click
   * @param _actionButton Boton clickeado
   */
  EmitActionButtonClickEvent(_actionButton: IActionButton): void {
    this.actionButtonClicked$.next(_actionButton);
  }

  /**
   * Escucha cuando se ha clickeado un boton de accion
   * @returns Boton clickeado
   */
  OnActionButtonClicked(_func: (_actionButton: IActionButton) => void): Subscription {
    return this.actionButtonClicked$.asObservable()
      .subscribe({
        next: _func
      });
  }

  MapTableColumns<T extends Object>(_item: T, _columns: string[]): T {
    let mappedObject: T = {} as T;

    _columns.forEach(x => {
      if (Object.prototype.hasOwnProperty.call(_item, x)) {
        mappedObject[x as keyof object] = _item[x as keyof object];
      }
    });

    return mappedObject;
  }


}


/**
 * Hace imutable un array y sus valores
 * @param _array Array a hacer imutable
 * @constructor
 */
export function Copy<T>(_object: T): T {
  return JSON.parse(JSON.stringify(_object)) as T;
}

export function DefineDescriptionHeader(_descriptions: { OnError: string, OnSuccess: string}, _headers: HttpHeaders | null | undefined = undefined): HttpHeaders
{
  if(_headers)
  {
    return _headers.set('Cl-Request-Success-Description', _descriptions.OnSuccess).set('Cl-Request-Error-Description', _descriptions.OnError);
  }

  return new HttpHeaders().set('Cl-Request-Success-Description', _descriptions.OnSuccess).set('Cl-Request-Error-Description', _descriptions.OnError);
}

export function PrinterWorker():boolean {
  let printerMethod =  Repository.Behavior.GetStorageObject<ILocalPrinter>(StorageKey.LocalPrinter) as ILocalPrinter;
  return printerMethod && printerMethod?.UseLocalPrint;
}

/**
 * Agrega un custom form validation al control de un autocomplete.
 * Valida que la opcion ingresada sea parte de la lista de opciones
 * @param {FormGroup} formGroup : FormGroup del componente
 * @param {string} controlName : Nombre del control al que se le asignara la validacion
 * @param {any[]}  options : Arreglo de las opciones
 * @param {ValidatorFn} validator : Ultima validacion agregada
 * @return {ValidatorFn} : Ultima validacion agregada
 */
export function AddValidatorAutoComplete (formGroup: FormGroup | FormControl, options: any[], controlName? : string, validator: ValidatorFn = Validators.nullValidator): ValidatorFn{
  if(controlName){
    if(validator != Validators.nullValidator){
      formGroup.get(controlName)?.removeValidators([validator]);
    }
    const validation = Validation.validateValueAutoComplete(options, controlName,);
    formGroup.get(controlName)?.addValidators([validation]);
    formGroup.updateValueAndValidity();
    return validation;
  }

  if(validator != Validators.nullValidator){
    formGroup?.removeValidators([validator]);
  }
  const validation = Validation.validateValueAutoComplete(options);
  formGroup?.addValidators([validation]);
  formGroup.updateValueAndValidity();
  return validation;
}


