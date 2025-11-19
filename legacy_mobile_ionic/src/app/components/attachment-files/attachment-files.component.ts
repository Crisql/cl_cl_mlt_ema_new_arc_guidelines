import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AlertType } from 'src/app/common';
import { IAttachments2Line, IDocumentAttachment } from 'src/app/interfaces/i-document-attachment';
import { CommonService, FileService } from 'src/app/services';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';
import { SimpleSignatureComponent } from '../simple-signature/simple-signature.component';

@Component({
  selector: 'app-attachment-files',
  templateUrl: './attachment-files.component.html',
  styleUrls: ['./attachment-files.component.scss'],
})
export class AttachmentFilesComponent implements OnInit {

  @Input() attachmentFiles: File[] = [];

  @Input() documentAttachment: IDocumentAttachment = {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;

  @Input() showSignatureButton: boolean = true;

  isAttachmentToggled: boolean = false;

  constructor(private commonService: CommonService,
              private attachmentService: AttachmentsService,
              private fileService: FileService,
              private modalCtrl: CustomModalController,
  ) { }

  ngOnInit() {}

     /**
     * Toggles the visibility attachment seccion.
     * This method changes the state of a boolean flag
     * to show or hide the attachments in the UI.
     *
     * @returns void
     */
    ToggleAttachments(): void {
        this.isAttachmentToggled = !this.isAttachmentToggled;
    }


    /**
   * Used to map the files to attachment lines
   * @param _event Event with the selected files
   * @constructor
   */
    OnAttachFile(_event: Event): void {
          let files = (_event.target as HTMLInputElement).files;

        if(!files) return;

        let hasDuplicatesFiles: boolean = false;

        // Remove duplicated files
        let attachmentFiles = Array.from(files).reduce((acc, val) => {
          if(![...this.attachmentFiles, ...acc].some(file => file.name == val.name))
          {
              acc.push(val);
          }
          else
          {
              hasDuplicatesFiles = true;
          }

          return acc;
        }, [] as File[]);

        this.attachmentFiles = [...this.attachmentFiles, ...attachmentFiles];

        if(this.attachmentFiles.some(file => file.name.split('.').length == 0))
        {
            this.commonService.Alert(AlertType.WARNING, `Hay archivos que no contienen extensión. Por favor agrégueles una extensión.`,  `There are files that don't have an extension. Please add one.`);
            return;
        }

        let validExtensions: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'ppt', 'xlsx', 'pptx'];

        let invalidFile = attachmentFiles.find(file => !validExtensions.includes(file.name.split('.').pop()!));

        if(invalidFile)
        {
              this.commonService.Alert(AlertType.WARNING, `La extensión del archivo ${invalidFile.name} no es permitida.`,  `The file extension ${invalidFile.name} is not allowed.`);
            return;
        }

        attachmentFiles.forEach((file, index) => {

          let date = new Date();

          let fileExtension = file.name.split('.').pop()!;

          let fileName = file.name.replace(`.${fileExtension}`, '');

          this.documentAttachment.Attachments2_Lines.push({
              Id: this.documentAttachment.Attachments2_Lines.length === 0 ? index + 1 : this.documentAttachment.Attachments2_Lines.length + 1,
              FileName: fileName,
              FreeText: '',
              AttachmentDate: formatDate(date, "yyyy-MM-dd", 'en'),
              FileExtension: fileExtension
          } as IAttachments2Line);

        });

        (_event.target as HTMLInputElement).value = "";

        if(hasDuplicatesFiles)
        {
            this.commonService.Alert(AlertType.WARNING, 'No es posible cargar archivos con el mismo nombre.', 'It is not possible to upload files with the same name.');
        }
    }


    /**
     * Removes an attachment from the current document attachment list by its index.
     * 
     * - Updates the attachment list (`Attachments2_Lines`) by removing the specified line.
     * - Reindexes the remaining attachment lines by updating their `Id` field.
     * - Also removes the corresponding file from the in-memory list `attachmentFiles`.
     * 
     * @param index - Index of the attachment to remove from the list.
     */
    RemoveAttachment(index: number) {
        let removedAttachmentLine = this.documentAttachment.Attachments2_Lines.splice(index, 1)[0];

        this.documentAttachment.Attachments2_Lines = this.documentAttachment.Attachments2_Lines.map((attL, index) => {
        return {
            ...attL,
            Id: index + 1
        }
        });

        this.attachmentFiles = this.attachmentFiles?.filter(attF => attF.name != `${removedAttachmentLine.FileName}.${removedAttachmentLine.FileExtension}`);
    }

    /**
     * Downloads and opens a file attachment from the server if it has been previously saved in SAP.
     * 
     * - Verifies if the attachment has an `AbsoluteEntry`.
     * - Requests the file from the backend using the full path.
     * - Converts the base64 response to a file and opens it using the file opener service.
     * 
     * @param attachmentLine - The attachment line object to be downloaded and opened.
     */
    async DownloadAttachment  (attachmentLine: IAttachments2Line) : Promise<void>{

      if(!attachmentLine.AbsoluteEntry)
      {
          this.commonService.Alert(AlertType.WARNING, 'Este adjunto aún no ha sido guardado en SAP.', 'This attachment has not yet been saved in SAP.');

          return
      }

      let loader = await this.commonService.Loader();

      loader.present();

      this.attachmentService.GetFile(`${attachmentLine.SourcePath}\\${attachmentLine.FileName}.${attachmentLine.FileExtension}`)
        .pipe(
          finalize(() => loader.dismiss())
        ).subscribe({
          next: (callback) => {
            if(callback.Data){
              this.fileService
                  .WriteAttachmentFile(callback.Data, attachmentLine.FileName, 'data:application/octet-stream;base64', attachmentLine.FileExtension)
                  .then((result) => {
                      this.fileService.OpenAttachmentFiles(result.nativeURL, attachmentLine.FileExtension);
                  })
                  .catch(error=>
                      this.commonService.Alert(
                              AlertType.WARNING,
                              error, error,
                              'Se produjo un error al descargar el adjunto', 'An error occurred while downloading the attachment.'
                          )
                  );
            }
          },
          error: (error) => {
            this.commonService.Alert(
                              AlertType.WARNING,
                              error, error,
                              'Se produjo un error al descargar el adjunto', 'An error occurred while downloading the attachment.'
                          );
          }
        });
    }

    /**
     * Gets the document attachment object.
     * @returns The document attachment object.
     */
    GetDocumentAttachment() : IDocumentAttachment {
      return this.documentAttachment;
    }

    /**
     * Gets the list of attachment files.
     * @returns The list of attachment files.
     */
    GetattachmentFiles() : File[] {
      return this.attachmentFiles;
    }

    /**
     * Resets the document attachment and attachment files to their initial state.
     */
    ResetDocumentAttachment(): void {
      this.documentAttachment = {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;
      this.attachmentFiles = [];
    }

    /**
     * Opens a modal dialog containing the SimpleSignatureComponent for capturing a signature.
     */
    async OpenSignature(){
      let modal = await this.modalCtrl.create({
                      component: SimpleSignatureComponent,
                  });
      modal.present();

      const { data, role } = await modal.onDidDismiss();
      if (role !== 'ok' || !data?.dataUrl) return;

      const fileNameFromModal: string = data.fileName || 'Firma.png';
      const mime: string = data.mime || 'image/png';

      // 1) convertir base64 -> File
      const file = this.Base64ToFile(data.dataUrl, fileNameFromModal, mime)
      // 3) agregar a attachmentFiles
      this.attachmentFiles = [...this.attachmentFiles, file as any];

      // 4) mapear a Attachments2_Lines (igual que en OnAttachFile)
      const date = new Date();
       const fullName = (file as any).name || fileNameFromModal;
      const fileExtension = fullName.split('.').pop()!;
      const fileNameNoExt = fullName.replace(`.${fileExtension}`, '');

      this.documentAttachment.Attachments2_Lines.push({
        Id: this.documentAttachment.Attachments2_Lines.length + 1,
        FileName: fileNameNoExt,
        FreeText: '',
        AttachmentDate: formatDate(date, 'yyyy-MM-dd', 'en'),
        FileExtension: fileExtension
      } as IAttachments2Line);

    }

    /**
     * Converts a data URL to a File object.
     * @param dataUrl The data URL to convert.
     * @param fileName The name of the file.
     * @param mime The MIME type of the file.
     * @returns A Promise that resolves to the File object.
     */
    Base64ToFile(base64: string, fileName: string, mime: string): Blob {
      const byteCharacters = atob(base64.split(',')[1]); // quitar encabezado data:
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      (blob as any).name = fileName;
      return blob;
    }

  }
