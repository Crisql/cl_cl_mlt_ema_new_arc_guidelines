export interface IDownloadBase64 {
  Base64: string;
  FileName: string;
  BlobType: string;
  FileExtension: string;
}

export interface IPrintReport
{
  Printable: string;
  Type: string;
  IsBase64: boolean;
}

