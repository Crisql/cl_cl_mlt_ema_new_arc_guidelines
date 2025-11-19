import { Pipe, PipeTransform } from '@angular/core';
import {DocumentSyncStatus} from "@app/enums/enums";

@Pipe({
  name: 'syncDocumentStatusName'
})
export class SyncDocumentStatusNamePipe implements PipeTransform {

  transform(value: DocumentSyncStatus): string {
    switch (value) {
      case DocumentSyncStatus.Success:
        return 'Completado';
      case DocumentSyncStatus.Errors:
        return 'Con errores';
      case DocumentSyncStatus.InQueue:
        return 'En cola';
      case DocumentSyncStatus.Processing:
        return 'Procesando';
      default:
        return value;
    }
  }

}
