import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IStructures} from "../interfaces/i-structures";
import {Observable, Subject} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {LocalStorageVariables} from "../common/enum";
import {ICLResponse} from "../models/responses/response";
import {ITaxCodeDetermination} from "../models";
import {TranslateService} from "@ngx-translate/core";
import {DatePipe} from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class StructuresService {
    private readonly URL = 'api/Structures';
    constructor(private http: HttpClient,
                private localStorageService: LocalStorageService,
                private translateService: TranslateService,
                private datePipe: DatePipe) { }

    /**
     * Retrieves a list of structures of a specific type from the API endpoint.
     * @param _structType The type of structures to retrieve.
     * @returns An Observable of type ICLResponse<IStructures[]> representing the response from the API.
     */
    Get(_structType: string): Observable<ICLResponse<IStructures[]>>
    {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/Structures/${_structType}`;
        return this.http.get<ICLResponse<IStructures[]>>(URL,);
    }
    
    /**
     * An observable stream that emits language codes for loading menus.
     * This observable allows subscribers to react to changes in the language
     * for which the menu should be loaded.
     *
     * @returns An Observable<string> that emits the language code.
     */
    private loadMenuSubject = new Subject<string>();
    loadMenu$ = this.loadMenuSubject.asObservable();
    /**
     * Triggers the load menu event with the specified language.
     * This function emits a new value to the loadMenuSubject, which can be observed by subscribers.
     * @param language - The language code to be emitted, indicating the language in which the menu should be loaded.
     */
    triggerLoadMenu(language: string) {
        this.loadMenuSubject.next(language);
    }
}
