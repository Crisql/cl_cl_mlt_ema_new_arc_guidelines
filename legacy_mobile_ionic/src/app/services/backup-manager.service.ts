import { Injectable } from '@angular/core';
import { SyncService } from './sync.service';
import { CommonService  } from './common.service';
import { LocalStorageService } from './local-storage.service';
import { DocumentService } from './document.service';
import { AlertType, LogEvent } from '../common';
import { IDocumentToSync } from 'src/app/models/db/Doc-model';
import { LogManagerService } from './log-manager.service';
import { Repository } from './repository.service';
import {concatMap, filter, finalize, map, toArray} from "rxjs/operators";
import {EMPTY, from} from "rxjs";
import {IOfflineDocument, IOfflineDocumentHandler} from "../models/db/i-offline-document";
import {DocumentSyncStatus, LocalStorageVariables} from "../common/enum";

@Injectable({
  providedIn: 'root'
})
export class BackupManagerService {
  //VARBOX
  private documentHandlerList: IOfflineDocumentHandler[] = [];
  private documents: IOfflineDocument[];
  constructor(private localStorageService: LocalStorageService
    , private commonService: CommonService
    , private repositoryDocument: Repository.Document
    , private apiDocumentService: DocumentService
    , private syncService: SyncService
    , private logManagerService: LogManagerService
  ) { }

  /**
   * 
   * @constructor
   */
  async RequestDocumentsBackUp(): Promise<void> 
  {
    let loader = await this.commonService.Loader(this.commonService.Translate(`Procesando, espere por favor`, `Working on it, please wait`));

    loader.present();
    
    let logMessage: string = "";

    this.documents = [];

    this.repositoryDocument.GetAllDocuments()
      .pipe(
          map(documents => documents.filter(d => d.TransactionStatus == DocumentSyncStatus.NotSynchronized)),
          concatMap(documents => {
            this.documents = documents;
            
            if(documents && documents.length > 0)
            {
              logMessage = this.commonService.Translate(`Se enviaran a sincronizar ${documents.length} documentos`, `${documents.length} documents will be sent to synchronize`);

              this.logManagerService.Log(LogEvent.INFO, logMessage);
              
              return this.apiDocumentService.SendOfflineDocuments(this.documents);
            }

            this.localStorageService.SetIsBackingUpDocuments(false);

            this.commonService.documentTransactionManager.next(1);

            logMessage = this.commonService.Translate(`No hay documentos pendientes de respaldar`, `There is no documentos to backup`)

            this.logManagerService.Log(LogEvent.INFO, logMessage);

            this.commonService.Alert(AlertType.INFO, logMessage, logMessage);
            
            return EMPTY;
          }),
          concatMap(response => from(response.Data)),
          concatMap(syncedDocument => {
              return this.repositoryDocument.UpdateDocumentTransactionStatus(syncedDocument.TransactionStatus, syncedDocument.TransactionDetail, syncedDocument.Id)
                  .pipe(
                      map(result => syncedDocument)
                  );
          }),
          toArray(),
          finalize(() => loader.dismiss())
      )
      .subscribe({
        next: (synchronizedDocuments) => {
          this.localStorageService.SetIsBackingUpDocuments(false);

          this.commonService.toast(this.commonService.Translate(`Proceso terminado`, `Finished process`), 'dark', 'bottom');

          logMessage = this.commonService.Translate(`Se sincronizaron ${synchronizedDocuments.length} de ${this.documents.length} documentos correctamente`, `${synchronizedDocuments.length} of ${this.documents.length} documents successfully synced`);

          this.logManagerService.Log(LogEvent.INFO, logMessage);

          this.commonService.documentTransactionManager.next(1);

          this.localStorageService.set('isOnSyncMode', true, true);

          this.syncService.SyncSeries();

          this.localStorageService.set('isOnSyncMode', false, true);
        },
        error: (error) => {
          logMessage = this.commonService.Translate(`Error al sincronizar los documentos. [ERROR] - ${error}`, `Error synchronizing documents. [ERROR] - ${error}`);

          this.logManagerService.Log(LogEvent.ERROR, logMessage);

          this.commonService.documentTransactionManager.next(1);

          this.commonService.Alert(AlertType.ERROR, error, error);

          this.localStorageService.SetIsBackingUpDocuments(false);
        }
      });
  }

  /**
   * Convert the offline document list to the list that API need
   * @constructor
   * @private
   */
  private ParseDocuments(): IDocumentToSync[] 
  {
    try 
    {
      let documentsToCreate = this.documentHandlerList.filter(
        (handler) => !handler.Finished || (handler.Finished && !handler.Result)
      );

      if (documentsToCreate && documentsToCreate.length > 0) 
      {
        let documents: IDocumentToSync[] = [];

        documentsToCreate.forEach((handler) => {

          let document: IDocumentToSync = JSON.parse(handler.OfflineDocument.RawDocument);
 
          let documentKey: string = document.Document.Udfs.find(udf => udf.Name === "U_DocumentKey").Value; 

          let logMessage: string = this.commonService.Translate(`Documento a sincronizar ${documentKey}`,`Document to sync ${documentKey}`);

          this.logManagerService.Log(LogEvent.INFO, logMessage, '', documentKey);

          document.Id = handler.OfflineDocument.Id;

          documents.push(document);

        });

        return documents;
      }
    }
    catch (exception) 
    {
      let logMessage: string = this.commonService.Translate(`Error al parsear los documentos. Detalle: ${exception}`,`Error parsing the documents. Detail: ${exception}`);

      this.logManagerService.Log(LogEvent.ERROR, logMessage);

      console.info(exception);
    }
  }
}

