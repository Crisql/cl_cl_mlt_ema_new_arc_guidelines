import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnInit, ViewChild } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';
import SignaturePad from "signature_pad";
import { CommonService } from 'src/app/services';
import { CustomModalController } from 'src/app/services/custom-modal-controller.service';

/**
 * A component for capturing simple handwritten signatures on a canvas element.
 * Provides functionality to draw, clear, resize, and export the signature as an image.
 */
@Component({
  selector: 'app-simple-signature',
  templateUrl: './simple-signature.component.html',
  styleUrls: ['./simple-signature.component.scss'],
})
export class SimpleSignatureComponent {
  
  @ViewChild('sigCanvas', { static: true }) sigCanvas!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;

  constructor(private modalController: CustomModalController,
             private commonService: CommonService
  ) {}
 
  ionViewDidEnter(): void {
    this.signaturePad = new SignaturePad(this.sigCanvas.nativeElement, {
      penColor: '#000',
      minWidth: 1.5,         // trazo más visible
      backgroundColor: 'rgba(0,0,0,0)'
    });

    this.resizeCanvas(true);
  }

  ngOnDestroy(): void {
    this.signaturePad?.off();
  }

  /**
   * Resizes the canvas element to fit its parent while maintaining the aspect ratio.
   * @param clearOnInit Indicates whether to clear the canvas after resizing.
   */
  private resizeCanvas(clearOnInit: boolean): void {
    const canvas = this.sigCanvas.nativeElement;
    const parent = canvas.parentElement!;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const cssWidth  = parent.clientWidth;
    const cssHeight = parent.clientHeight;

    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(ratio, ratio);

    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';

    if (clearOnInit) this.signaturePad.clear();
  }

  /**
   * Clears the signature pad.
   */
  Clear(): void {
    this.signaturePad.clear();
  }

  /**
   * Dismisses the modal and captures the signature.
   * @param _close Indicates whether to close the modal after capturing the signature.
   * @returns 
   */
  Dismiss(_close: boolean = false): void {

    if(_close) this.modalController.dismiss();

    if (this.signaturePad.isEmpty()) {
      this.commonService.toast(this.commonService.Translate('Por favor, ingrese una firma', 'Please enter a signature'), 'dark', 'bottom');
      return;
    }
    const dataUrl = this.signaturePad.toDataURL('image/png');
    const fileName = this.BuildSignatureFileName();

    this.modalController.dismiss({ dataUrl, fileName, mime: 'image/png' }, 'ok');
  }

  /**
   * Builds the filename for the signature image.
   * @returns string The generated filename for the signature image.
   */
  private BuildSignatureFileName(): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `Firma.png`;
  }

}
