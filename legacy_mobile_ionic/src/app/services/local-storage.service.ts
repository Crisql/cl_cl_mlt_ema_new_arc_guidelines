import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { UserToken } from "../models";
import { SyncDetails } from "../models/db/sync-model";
import { IChangedInformation } from "../models/i-changed-information";
import { ISessionInfo } from "../models/session-info";
import {ICompany} from "../models/db/companys";
import {ChangeElement} from "../common/enum";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  data: Map<string, any>;

  private lastLogin$: Subject<string>;

  private syncDetail$: Subject<SyncDetails>;
  
  OnSelectCompany$: Subject<ICompany>;

  constructor() {
    this.data = new Map<string, any>();

    this.lastLogin$ = new Subject<string>();

    this.syncDetail$ = new Subject<SyncDetails>();
    this.OnSelectCompany$ =  new Subject<ICompany>();
  }


  set(key: string, value: any, saveInLocalStorage = false) {
    this.data.set(key, value);
    if (saveInLocalStorage) {
      localStorage.removeItem(key);
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  Remove(_key: string): boolean {
    try {
      localStorage.removeItem(_key);
      return true;
    }
    catch(error) {
      console.log(error);
      return false;
    }
  }

  get(key: string): any {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  clear() {
    localStorage.clear();
  }

  HasMixedMode(): boolean {
    try {
      return this.get('Session').HasMixedMode.toLowerCase() == 'true';
    }
    catch {
      return false;
    }
  }

  GetHasFreight(): boolean {
    try {
      return this.get('Session').HasFreight.toLowerCase() === 'true';
    }
    catch (error) {
      return false;
    }
  }

  GetHasHeaderDiscount(): boolean {
    try {
      return this.get('Session').HasHeaderDiscount.toLowerCase() === 'true';
    }
    catch (error) {
      return false;
    }
  }

  GetIsOnSyncMode(): boolean {
    try {
      return this.get('isOnSyncMode');
    }
    catch (error) {
      return false;
    }
  }

  GetReportManagerURL(): string {
    try {
      return this.get('Session').ReportManagerURL;
    }
    catch (error) {
      return '';
    }
  }

  SetModalBackupStatus(_isModalRaised: boolean): void {
    try {
      localStorage.setItem('isModalRaised', +_isModalRaised + '');
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  GetModalBackupStatus(): boolean {
    try {
      return !!+localStorage.getItem('isModalRaised');
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  SetIsBackingUpDocuments(_isBackingUpDocuments: boolean) {
    try {
      localStorage.setItem('isBackingUpDocuments', +_isBackingUpDocuments + '');
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  GetIsBackingUpDocuments(): boolean {
    try {
      return !!+localStorage.getItem('isBackingUpDocuments');
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  // Se debe buscar la forma de agregar el API_KEY desde codigo, mediante un servicio
  SetGoogleApiKey(key: string): void {
    try {
      localStorage.setItem('API_KEY',  key);
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  GetGoogleApiKey(): string {
    try {
      return localStorage.getItem('API_KEY');
    }
    catch (exception) {
      console.warn(exception);
    }
  }

  SetLastSession(currentUser: string){
    this.setLastLogin(currentUser);
    let lastLogin = this.getLastLogin(currentUser);
    this.lastLogin$.next(lastLogin);
  }

  GetLastSession(): Observable<string> {
    return this.lastLogin$.asObservable();
  }

  private getLastLogin(currentUser: string): string{
      const DATA = localStorage.getItem("SessionInfo");

      const SESSION_INFO: ISessionInfo = DATA ? JSON.parse(DATA) : {} as ISessionInfo;

      return SESSION_INFO.lastLogin ?? "";
  }

  private setLastLogin(currentUser: string): void{
    try {
      const DATA = localStorage.getItem('SessionInfo');
  
      const SESSION_INFO: ISessionInfo = DATA ? JSON.parse(DATA) : {} as ISessionInfo;
      
      if(SESSION_INFO.userSession && SESSION_INFO.userSession !== currentUser){
        SESSION_INFO.lastLogin =  SESSION_INFO.currentLogin = new Date().toUTCString();
      
        SESSION_INFO.lastSynchronization = "";

        SESSION_INFO.userSession = currentUser;

      }else{
        SESSION_INFO.currentLogin = SESSION_INFO.currentLogin ?? new Date().toUTCString();
        
        SESSION_INFO.lastLogin = SESSION_INFO.currentLogin;
        
        SESSION_INFO.currentLogin = new Date().toUTCString();
      
        SESSION_INFO.userSession = currentUser;
      }

      localStorage.setItem("SessionInfo", JSON.stringify(SESSION_INFO));

    } catch (error) {
      console.warn(error);
    }
  }

  GetLastSynchronization(currentUser: string): string{
    const DATA = localStorage.getItem("SessionInfo");

    const SESSION_INFO: ISessionInfo = DATA ? JSON.parse(DATA) : {} as ISessionInfo;

    return SESSION_INFO.lastSynchronization ?? "";
  }

  SetLastSynchronization(currentUser: string): void{
    const DATA = localStorage.getItem("SessionInfo");
   
    const SESSION_INFO: ISessionInfo = DATA ? JSON.parse(DATA) : {} as ISessionInfo;

    SESSION_INFO.lastSynchronization = new Date().toUTCString();

    localStorage.setItem("SessionInfo", JSON.stringify(SESSION_INFO));
  }
  
  GetUrlPadron(): string{
    const SESSION: UserToken = this.get("Session");

    return SESSION ? SESSION.UrlPadron : "https://notconfiguredurlpadron.com/";
  }

  GetSyncDates(): IChangedInformation[] {
    return JSON.parse(localStorage.getItem("SyncDates")) || [];
  }

  GetSyncDate(_type: ChangeElement): IChangedInformation {
    let currentSyncDates = this.GetSyncDates();
    return currentSyncDates.find(x => x.Type === _type);
  }

  SetSyncDates(_changes_datas: IChangedInformation[]): void{
    localStorage.setItem("SyncDates", JSON.stringify(_changes_datas));
  }

  SetSyncDate(_changes_data: IChangedInformation): void {
    let currentSyncDates = this.GetSyncDates();
    let updatedSyncDates = currentSyncDates.filter(x => x.Type !== _changes_data.Type);
    updatedSyncDates.push(_changes_data);
    this.SetSyncDates(updatedSyncDates);
  }

}
