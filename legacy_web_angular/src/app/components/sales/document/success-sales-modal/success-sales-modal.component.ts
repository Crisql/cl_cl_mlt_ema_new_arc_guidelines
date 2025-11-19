import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {catchError, finalize, map, of, switchMap} from "rxjs";
import {GetError, PinPad, PrintBase64File} from "@clavisco/core";
import {ReportsService} from "@app/services/reports.service";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import ITerminal = PinPad.Interfaces.ITerminal;
import {PrinterWorker} from "@app/shared/shared.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {Titles} from "@app/enums/enums";

@Component({
  selector: 'app-success-sales-modal',
  templateUrl: './success-sales-modal.component.html',
  styleUrls: ['./success-sales-modal.component.scss']
})
export class SuccessSalesModalComponent implements OnInit {

  currentDate = new Date();

  isDraftDocument: boolean = false;
  title: string = '';
  alertIcon: string = 'check_circle';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ISuccessSalesInfo,
    private matDialogRef: MatDialogRef<SuccessSalesModalComponent>,
    private reportsService: ReportsService,
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService
  ) {
  }

  ngOnInit(): void {
    this.isDraftDocument = this.data.Title === Titles.Draft;
    if(this.isDraftDocument){
      this.title = 'Documento requiere un proceso de autorización';
      this.alertIcon = 'warning';
    }
    else
    {
      this.title = `${this.data?.Title} ${this.data?.Accion ? this.data.Accion : 'creada'} correctamente`;
    }
  }

  public Acept(): void {
    this.matDialogRef.close(this.data);
  }

  public Print(): void {

    if (!this.data?.TypeReport) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No hay reporte configurado para ${this.data.Title}.`
      })
      return;
    }

    this.overlayService.OnGet();


    if (this.data.PPTransactions && this.data.PPTransactions.length > 0) {
      let rawData = `>count:${this.data.PPTransactions.length}`;

      this.data.PPTransactions.forEach((x, index) => {

        const EMVS_STREAM = JSON.parse(this.data.PPTransactions[index].SerializedTransaction)['EMVStreamResponse'];
        const RIGHT_SIDE = +EMVS_STREAM.salesAmount.slice(0, -2);
        const LEFT_SIDE = +`0.${EMVS_STREAM.salesAmount.slice(-2, EMVS_STREAM.salesAmount.length)}`;

        const TERMINAL = this.data.Terminals.find(y => y.TerminalId == this.data.PPTransactions[index].TerminalId) as ITerminal;

        const IS_QUICK_PAY = (RIGHT_SIDE + LEFT_SIDE <= TERMINAL?.QuickPayAmount)
          && (EMVS_STREAM.entryMode.includes('CLC') || EMVS_STREAM.entryMode.includes('CHP'));

        const OFFSET = index + 1;
        rawData += `>cdn${OFFSET}:${EMVS_STREAM['maskedCardNumber']}`;
        rawData += `>aut${OFFSET}:${EMVS_STREAM['authorizationNumber']}`;
        rawData += `>ref${OFFSET}:${EMVS_STREAM['referenceNumber']}`;
        rawData += `>ter${OFFSET}:${x.TerminalId}`;
        rawData += `>amt${OFFSET}:${RIGHT_SIDE + LEFT_SIDE}`;
        rawData += `>cur${OFFSET}:${TERMINAL.Currency}`;
        rawData += `>qkp${OFFSET}:${+IS_QUICK_PAY}`;
        rawData += `>ptt${OFFSET}:${EMVS_STREAM['printTags']['string']}`
        rawData += `>end${OFFSET}`;
      });
      this.reportsService.PrintReportPinpad(this.data.DocEntry, rawData, this.data.TypeReport).pipe(
        switchMap(res => {
          if (PrinterWorker()) {
            return this.printerWorkerService.Post(res.Data)
              .pipe(
                map(printLocal => res),
                catchError((err) => {
                  this.modalService.Continue({
                    title: 'Se produjo un error al imprimir',
                    subtitle: GetError(err),
                    type: CLModalType.ERROR
                  });
                  return of(err);
                })
              );
          } else {
            PrintBase64File({base64File: res.Data, blobType: 'application/pdf', onNewWindow: false});
            return of(res);
          }
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe();


    } else {
      this.reportsService.PrintReport(this.data.DocEntry, this.data.TypeReport).pipe(
        switchMap(res => {
          if (PrinterWorker()) {
            return this.printerWorkerService.Post(res.Data.Base64)
              .pipe(
                map(printLocal => res),
                catchError((err) => {
                  this.modalService.Continue({
                    title: 'Se produjo un error al imprimir',
                    subtitle: GetError(err),
                    type: CLModalType.ERROR
                  });
                  return of(err);
                })

              );
          } else {
            PrintBase64File({base64File: res.Data.Base64, blobType: 'application/pdf', onNewWindow: false});
            return of(res);
          }
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe();

    }

  }

}
