/**
 * Represent the model of the SAP attachment
 */
export interface IDocumentAttachment {
    /**
   * Unique identifier of the attachment
   */
  AbsoluteEntry: number;
  /**
   * Collection of attachment lines. Represent the files of this attachment object
   */
  Attachments2_Lines: IAttachments2Line[];
}


/**
 * Represent the line model of the SAP attachment
 */
export interface IAttachments2Line {
  /**
   * Local identifier
   */
  Id: number;
  /**
   * The unique identifier of the attachment
   */
  AbsoluteEntry: number;
  /**
   * The line number of the attachment
   */
  LineNum: number;
  /**
   * The physical path where the attachment file is stored
   */
  SourcePath: string;
  /**
   * Name of the attachment file
   */
  FileName: string;
  /**
   * The file extension of the attachment
   */
  FileExtension: string;
  /**
   * Last modified date of the attachment
   */
  AttachmentDate: string;
  /**
   * Indicates if should override the attachment file
   */
  Override: string;
  /**
   * Description about attachment file
   */
  FreeText: string;
}

/**
 * Extended interface to send the CardCode when uploading an attachment for a Business Partner
 */
export interface IAttachments2 extends IDocumentAttachment {
  CardCode: string;
}
