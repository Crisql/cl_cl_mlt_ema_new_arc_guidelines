import { Injectable } from "@angular/core";
import { File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor(
    private fileOpener: FileOpener,
    private fileService: File,
    private commonService: CommonService
  ) {}

    /**
   * Writes a PDF file to the external data directory.
   *
   * @param file - The base64-encoded content of the PDF.
   * @param fileName - The name to save the PDF file as (without extension).
   * @returns A promise resolving when the file has been written.
   */
  async writeFile(file: string, fileName: string) {
    return await this.fileService.writeFile(
      this.fileService.externalDataDirectory,
      `${fileName}.pdf`,
      this.commonService.convertBase64ToBlob(
        file,
        "data:application/pdf;base64"
      ),
      { replace: true }
    );
  }

  /**
   * Opens a PDF file using the system's default PDF viewer.
   *
   * @param filePath - The full file path to the PDF.
   * @returns A promise that resolves when the file is opened or rejects if it fails.
   */
  async openPDF(filePath: string) {
    return await this.fileOpener.open(filePath, "application/pdf");
  }

  /**
   * Writes any file to the external data directory using the provided base64 content and MIME type.
   *
   * @param _base64File - The base64-encoded content of the file.
   * @param _fileName - The name to save the file as (without extension).
   * @param _blobType - The MIME type of the file (e.g., "application/pdf", "image/png").
   * @param _fileExtension - The extension to use when saving the file (e.g., "pdf", "png").
   * @returns A promise resolving when the file has been written.
   */
  async WriteAttachmentFile(_base64File: string, _fileName: string, _blobType: string, _fileExtension: string) {
   
    const folderPath =  this.fileService.externalRootDirectory + 'Download/';
    try{
      return await this.fileService.writeFile(
        folderPath,
        `${_fileName}.${_fileExtension}`,
        this.commonService.convertBase64ToBlob(
          _base64File,
          _blobType
        ),
        { replace: true }
      );
    }catch(err){
      throw new Error(err?.message ?? 'Desconocido') 
    }
    
  }

  /**
   * Opens a file using the system's default application for the given MIME type.
   *
   * @param filePath - The full file path to open.
   * @param _fileExtension - The extension to use when saving the file (e.g., "pdf", "png").
   * @returns A promise that resolves when the file is opened or rejects if it fails.
   */
  async OpenAttachmentFiles(filePath: string, _fileExtension: string) {
    return await this.fileOpener.open(filePath, this.GetMimeType(_fileExtension));
  }

  /**
  * Gets the MIME type based on the extension
  */
  GetMimeType(extension: string): string {
    const map = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };
    return map[extension.toLowerCase()] || 'application/octet-stream';
  }
}
