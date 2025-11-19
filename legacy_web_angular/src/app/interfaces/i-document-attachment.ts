import {IAttachments2Line} from "@app/interfaces/i-business-partner";

/**
 * Represent the model of the SAP attachment
 */
export interface IDocumentAttachment
{
  /**
   * Unique identifier of the attachment
   */
  AbsoluteEntry: number;
  /**
   * Collection of attachment lines. Represent the files of this attachment object
   */
  Attachments2_Lines: IAttachments2Line[];
}
