import {Injectable} from "@angular/core";
import {StorageKey} from "../enums/e-storage-keys";
import {ICurrentSession} from "../interfaces/i-localStorage";
import {Repository} from "@clavisco/core";
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class CurrentSessionService {

  private whsName: string = '';
  private rate: number = 0;

  constructor() {
    this.getLocalStorage();
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(value: number): void {
    this.rate = value;
  }

  public getWhsName(): string {
    return this.whsName;
  }

  public setWhsName(value: string): void {
    this.whsName = value;
  }

  private getLocalStorage(): void {
    const dataStorage = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) || {} as ICurrentSession;
    if (dataStorage) {
      this.rate = dataStorage.Rate;
      this.whsName = dataStorage.WhsName;
    }
  }




}
