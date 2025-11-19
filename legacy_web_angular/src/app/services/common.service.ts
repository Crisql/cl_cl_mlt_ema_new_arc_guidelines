import { Injectable } from '@angular/core';
import {IUserToken} from "../interfaces/i-token";
import {StorageKey} from "../enums/e-storage-keys";
import {Repository} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  GenerateDocumentUniqueID(): string {

    const USER = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserId || '';

    const DATE = new Date();

    const DAYS = DATE.getDate() < 10 ? '0' + DATE.getDate() : DATE.getDate().toString();
    const MONTS = (DATE.getMonth() + 1) < 10 ? '0' + (DATE.getMonth() + 1) : (DATE.getMonth() + 1).toString();
    const YEAR = DATE.getFullYear().toString().slice(2, 4);

    const HOURS = DATE.getHours() < 10 ? '0' + DATE.getHours() : DATE.getHours();
    const MINUTES = DATE.getMinutes() < 10 ? '0' + DATE.getMinutes() : DATE.getMinutes();
    const SECONDS = DATE.getSeconds() < 10 ? '0' + DATE.getSeconds() : DATE.getSeconds();

    const uniqueID = `${USER + DAYS + MONTS + YEAR + HOURS + MINUTES + SECONDS}`;

    return `W${uniqueID}`;

  }
}
