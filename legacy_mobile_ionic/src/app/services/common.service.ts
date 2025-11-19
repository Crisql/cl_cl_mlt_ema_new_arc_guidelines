import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import {
  ActionSheetButton,
  ActionSheetController,
  AlertController,
  IonInput,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { AlertButton } from "@ionic/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject, timer } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { AlertType, AppConstants, DocumentType, LogEvent } from "../common";
import { Structures } from "../common/constants";
import { ISpeedTestSetting } from "../models/api/i-setting";
import { IInputOptions } from "../models/i-input-options";
import {ApiResponse, ErrorInfo, ICLResponse} from "../models/responses/response";
import { LogManagerService } from "./log-manager.service";
import {Local} from "protractor/built/driverProviders";
import {LocalStorageService} from "./local-storage.service";
import {IUdfContext, IUdfDevelopment} from "../interfaces/i-udfs";
import {NavigationStart, Router} from "@angular/router";
import {IItem} from "../models/i-item";
import {ICalculatedPrice, IPriceList} from "../models/i-price-list";
import {IMeasurementUnit} from "../models";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  //varbox
  eventManager: Subject<number>;
  documentTransactionManager: Subject<any>;
  connectionSpeedMbps: number;
  
  
  //Speed test funcionality
  speedTestMbps: Subject<number>;
  private downloadedTimes: number[] = [];
  private timesDownloaded: number = 0;
  private timesToDownload: number = 0;
  private speedTestImageURL: string = '';
  private dummyImage = new Image();
  constructor(
    private translateService: TranslateService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private logManageService: LogManagerService,
    private localStorageService: LocalStorageService
  ) {
    this.eventManager = new Subject<number>();
    this.documentTransactionManager = new Subject<any>();
    this.speedTestMbps = new Subject<number>();
    this.speedTestMbps.subscribe({next: (speed) => this.connectionSpeedMbps = speed});
  }

  async alert(type: AlertType, pSubTitle: string, pTitle?: string) {
    if([pSubTitle, pTitle].includes("CL_IN_OFFLINE_MODE")) return;
    
    if (!pTitle){
      switch(type){
        case AlertType.INFO:
          pTitle = this.translateService.currentLang === "es" ? "Información": "Information";
          break;
        case AlertType.QUESTION:
          pTitle = this.translateService.currentLang === "es" ? "Confirmación": "Confirmation";
          break;
        case AlertType.SUCCESS:
          pTitle = this.translateService.currentLang === "es" ? "Éxito": "Success";
          break;
        case AlertType.WARNING:
          pTitle = this.translateService.currentLang === "es" ? "Advertencia": "Warning";
          break;
        case AlertType.ERROR:
          pTitle = this.translateService.currentLang === "es" ? "Error": "Error";
          break;
        default:
          pTitle = '';
      }
    }
    
    let alert = await this.alertCtrl.create({
      header: pTitle,
      backdropDismiss: false,
      message: pSubTitle,
      buttons: [`${this.translateService.currentLang === 'es' ? 'Continuar': 'Ok'}`],

    });
    
    alert.getElementsByClassName("alert-title").item(0).innerHTML = 
        `${this.GetAlertIcon(type)}${alert.getElementsByClassName("alert-title").item(0).innerHTML}`;

        alert.getElementsByClassName("alert-message").item(0).setAttribute('style', 'padding-bottom: 0px');
        alert.getElementsByClassName("alert-message").item(0).innerHTML += `<p style="color: rgba(0,0,0,.4); font-size: 13px; margin-bottom: 2px;">${formatDate(new Date(), 'MMM d, y, h:mm:ss a', 'en')}</p>`;

    alert.present();
  }

  async Alert(type: AlertType, _subTitulo: string, _subTitle: string, _titulo?: string, _title?: string, _buttons?: (string | AlertButton)[], _showConnectionSpeed: boolean = false): Promise<void> {
    if([_subTitle, _subTitulo, _title, _titulo].includes("CL_IN_OFFLINE_MODE")) return;
    
    try {
      const SUBTITLE =  this.translateService.currentLang === "es" ? _subTitulo : _subTitle;
      let title = undefined;
     
      let titleNotPermittedValues = ['', undefined, null];

      if (!titleNotPermittedValues.includes(_titulo) && !titleNotPermittedValues.includes(_title)) {
          title = this.translateService.currentLang === "es" ? _titulo : _title;
      }
      else {
          switch(type){
            case AlertType.INFO:
              title = this.translateService.currentLang === "es" ? "Información": "Information";
              break;
            case AlertType.QUESTION:
              title = this.translateService.currentLang === "es" ? "Confirmación": "Confirmation";
              break;
            case AlertType.SUCCESS:
              title = this.translateService.currentLang === "es" ? "Éxito": "Success";
              break;
            case AlertType.WARNING:
              title = this.translateService.currentLang === "es" ? "Advertencia": "Warning";
              break;
            case AlertType.ERROR:
              title = this.translateService.currentLang === "es" ? "Error": "Error";
              break;
            default:
              title = '';
          }
      }

      let buttons = _buttons && _buttons.length ? _buttons :  [`${this.translateService.currentLang === 'es' ? 'Continuar': 'Continue'}`];

      let alert = await this.alertCtrl.create({
        header: title,
        backdropDismiss: false,
        message: SUBTITLE,
        buttons
      });

      alert.getElementsByClassName("alert-title").item(0).innerHTML = 
        `${this.GetAlertIcon(type)}${alert.getElementsByClassName("alert-title").item(0).innerHTML}`;
  
        
        alert.getElementsByClassName("alert-message").item(0).setAttribute('style', 'padding-bottom: 0px');
        alert.getElementsByClassName("alert-message").item(0).innerHTML += `<p style="color: rgba(0,0,0,.4); font-size: 13px; margin-bottom: 2px;">${formatDate(new Date(), 'MMM d, y, h:mm:ss a', 'en')}</p>`;
        
      // NOTA!!! - Esta funcionalidad se comenta debido a que consume muchos datos - Isaac Herrera
      // let connectionSpeedText = this.Translate('Velocidad de conexión: ', 'Connection speed: ');
      // if(_showConnectionSpeed)
      // {
      //   alert.getElementsByClassName("alert-message").item(0).innerHTML += `<p style="color: rgba(0,0,0,.4); font-size: 12px; margin-top: 0px;">${connectionSpeedText}${this.connectionSpeedMbps}/Mbps</p>`;
      // }


      alert.present();
    }
    catch (error) {
      let alert = await this.alertCtrl.create({
        header: 'Syntax Error',
        backdropDismiss: false,
        message: AppConstants.GetError(error),
        buttons: [`${this.translateService.currentLang === 'es' ? 'Continuar': 'Continue'}`],
      });

      alert.getElementsByClassName("alert-title").item(0).innerHTML = 
        `${this.GetAlertIcon(AlertType.ERROR)}${alert.getElementsByClassName("alert-title").item(0).innerHTML}`;
  
      alert.present();
    }
  }
  async loading(message: string) {
    let loading = await this.loadingController.create({
      animated: true,
      message,
      spinner: "crescent",
    });

    return loading;
  }

  /**
   * Converts a Base64-encoded string into a Blob object.
   *
   * @param b64Data - The Base64 string to be converted.
   * @param contentType - The MIME type of the resulting Blob (e.g., "image/png").
   * @returns A Blob object created from the Base64 string.
   */
  convertBase64ToBlob(b64Data, contentType): Blob {
    contentType = contentType || "";
    const sliceSize = 512;
    b64Data = b64Data.replace(/^[^,]+,/, "");
    b64Data = b64Data.replace(/\s/g, "");
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  async toast(message: string, color = "dark", pos = "bottom") {
    if(message.includes("CL_IN_OFFLINE_MODE")) return;
    
    let toast = await this.toastController.create({
      animated: true,
      color,
      message,
      position: pos === "top" ? "top" : pos === "bottom" ? "bottom" : "middle",
      duration: 5000,
    });

    toast.present();
  }

  getErrorDescription(errorObject: any) {
    return errorObject
      ? errorObject.errorInfo
        ? errorObject.errorInfo.Message
        : "Unknown error"
      : "Unknow error";
  }

  /**
   * 
   * @param _es Texto en espanol
   * @param _en Texto en ingles
   * @returns Va a devolver el texto segun el idioma de la app
   */
  Translate(_es: string, _en: string): string {
    return this.translateService.currentLang === "es" ? _es: _en;
  }

  /**
   * This method is used to get currentMenu
   */
  public CurrentMenu(): boolean {
    return this.translateService.currentLang === 'es';
  }

  async Loader(etiqueta?: string, label?: string, spinner?: "bubbles" | "circles" | "circular" | "crescent" | "dots" | "lines" | "lines-small"): Promise<HTMLIonLoadingElement> {
    etiqueta = etiqueta || 'Procesando...';
    label = label || 'Processing...';
    spinner = spinner || "crescent";
    

    let loader = await this.loadingController.create({
      message:
        this.translateService.currentLang === "es" ? etiqueta : label,
        animated: true,
        spinner: spinner,
    });
    return loader;
  }

  /**
   * Obtiene el ultimo loader activo
   * @returns El ultimo loader activo
   */
  async GetTopLoader(): Promise<HTMLIonLoadingElement> {
    return await this.loadingController.getTop();
  }


  GetAlertIcon(type: AlertType){
    switch(type){
      case AlertType.INFO:
        return `<div class="icon-center"><ion-icon color="info" name="clvs-alert-info"></ion-icon></div>`;
      case AlertType.QUESTION:
        return `<div class="icon-center"><ion-icon color="primary" name="clvs-alert-question"></ion-icon></div>`;
      case AlertType.SUCCESS:
        return `<div class="icon-center"><ion-icon color="success" name="clvs-alert-success"></ion-icon></div>`;
      case AlertType.WARNING:
          return `<div class="icon-center"><ion-icon color="warning" name="clvs-alert-warning"></ion-icon></div>`;
      case AlertType.ERROR:
        return `<div class="icon-center"><ion-icon color="danger" name="clvs-alert-error"></ion-icon></div>`;
      default:
        return ``;
    }
  }

  BetweenDates(_from, _to, _toCheck): boolean {// Aqui no indicamos el tipo de dato de las variables para que el tipo de las mismas sea definido segun el parseo
    try {
      _from = Date.parse(_from);
      _to = Date.parse(_to);
      _toCheck = Date.parse(_toCheck);
  
      return (_toCheck <= _to && _toCheck >= _from);
    }
    catch (exception) {
      console.info(exception);
      return false;
    }
  }

  ParseError(_data: any): ErrorInfo {
    if (_data) {
      if (_data.ErrorMessage && !_data.result) {
        return {
          Code: -100,
          Message: _data.ErrorMessage
        } as ErrorInfo;
      }
      else {
        return null;
      }
    }
    else {
      return {
        Code: -100,
        Message: 'No records found on local RI'
      } as ErrorInfo;
    }
  }

  ParseUrlParams(url: string) {

    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    let obj = {};

    if (queryString) {

      queryString = queryString.split('#')[0];

      let arr = queryString.split('&');

      for (var i = 0; i < arr.length; i++) {
        let a = arr[i].split('=');

        let paramName = a[0];
        let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

        if (paramName.match(/\[(\d+)?\]$/)) {
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];

          if (paramName.match(/\[\d+\]$/)) {
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            obj[key].push(paramValue);
          }
        } else {
          if (!obj[paramName]) {
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string') {
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            obj[paramName].push(paramValue);
          }
        }
      }
    }

    return obj;
  }

  GetDocumentTable(_docType: DocumentType): string
  {
    switch (_docType) {
      case DocumentType.CashInvoice:
      case DocumentType.CashReserveInvoice:
      case DocumentType.CreditInvoice:
      case DocumentType.ReserveInvoice: 
          return "OINV";
      case DocumentType.SaleOffer:
          return "OQUT";
      case DocumentType.SaleOrder:
          return "ORDR";
      case DocumentType.IncommingPayment:
        return "ORCT";
      case DocumentType.Delivery:
        return "ODLN";
      default:
        return "";
    }
  }

  /**
   * 
   * @param _formControl FormControl al que se le va a setear el valor seleccionado
   * @param _options Configuracion para mostrar las opciones en el ActionSheet
   * @returns Devuelve el valor del campo *DescriptionPropName* de el parametro *_options*
   */
  async ShowInputOptions<T>(_formControl: AbstractControl, _options: IInputOptions, _icon: string): Promise<T | undefined>
  {
    let returnedValue: T | undefined = undefined;

    try
    {
      let buttons: ActionSheetButton[] = [];

      const CANCELL_OPTION: ActionSheetButton = {
        icon: "close-outline",
        role: "cancel",
        text: this.Translate("Cancelar", "Cancel")
      };

      buttons = _options.List.map(opt => ({
        role: _options.DataPropsNames.reduce((acc, val) => {acc.push(opt[val]); return acc;}, []).join(_options.DataPropsSepartor),
        text: opt[_options.DescriptionPropName],
        icon: _icon
      } as ActionSheetButton));

      buttons.push(CANCELL_OPTION);

      const actionSheet = await this.actionSheetController.create({
        buttons,
        header: _options.ActionSheetHeader
      });

      await actionSheet.present();

      const {role} = await actionSheet.onDidDismiss();

      if(!['cancel', 'backdrop'].includes(role))
      {
        _formControl.patchValue(role);
        returnedValue = (_options.List.find(opt => _options.DataPropsNames.reduce((acc, val) => {acc.push(opt[val]); return acc;}, []).join(_options.DataPropsSepartor) === role)[_options.DescriptionPropName] as T);
      }
    }
    catch(exception)
    {
      if(typeof exception !== 'string')
      {
        exception = JSON.stringify(exception);
      }

      this.Alert(AlertType.ERROR, exception, exception);
    }

    return returnedValue;
  }

  /**
   * Verifica si un objeto pertenece a una interfaz mendiante una lista de propiedades
   * @param _object Objecto a validar
   * @param _propsToCheck Lista de propiedades para validar
   * @returns True si todas las propiedades estan en el objeto y false si no
   */
  instanceOf<T>(_object: any, _propsToCheck: string[]): _object is T
  {
    return _propsToCheck.every(p => Object.keys(_object).includes(p));
  }


  /**
   * Calcula la distancia entre dos puntos
   * @param lat1 Latitud uno
   * @param lon1 Longitud uno
   * @param lat2 Latitud dos
   * @param lon2 Longitud dos
   * @returns La distancia en metros entre los dos puntos
   */
  DistanceBetweenTowPoints(lat1: number, lon1: number, lat2: number, lon2: number)
  { 
    const EARTH_RADIUS = 6378.137; 
    let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180; 
    let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180; 
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    let d = EARTH_RADIUS * c; 
    return d * 1000;
  }

  CLPrint(_data: any, _logEvent: LogEvent = LogEvent.ERROR): void {

    let message = _data;
    let background = `#cc3300`;
    const CALLER_REFERENCE = (new Error()).stack;

    let callerPath = ``;

    if (CALLER_REFERENCE && CALLER_REFERENCE.split("\n").length > 1 && CALLER_REFERENCE.split("\n")[2].trim().split(" ").length > 0) {
        callerPath = ` ocurred on ${CALLER_REFERENCE.split("\n")[2].trim().split(" ")[1]} function.`;

        CALLER_REFERENCE.split("\n").forEach(x => callerPath += `\n ${x}`)
    }


    if (typeof _data !== 'string') {
        message = AppConstants.GetError(_data);
    }

    if (_data instanceof Structures.Clases.GuardValidation) {
      _logEvent = LogEvent.INFO;
    }

    if (_data instanceof Structures.Clases.GuardWarning) {
      _logEvent = LogEvent.WARNING;
    }

    try {
        // Selects the color the console background
        switch (_logEvent) {
            case LogEvent.SUCCESS:
                background = `#00cc66`;
                break;

            case LogEvent.INFO:
                background = `#0099ff`;
                break;

            case LogEvent.WARNING:
                background = `#ff9900`;
                break;
        }
        console.log(`%c[${`CLVS - `}${LogEvent[_logEvent]}]`,
            `background: ${background}; color: #fff; padding: 0px; font-size: 12px;`,
            message + callerPath);

        this.logManageService.Log(_logEvent, message);
    }
    catch {
        // this switch tries to log the error in case that a formated console logs fail
        switch (_logEvent) {
            case LogEvent.SUCCESS:
                console.log(message);
                break;

            case LogEvent.INFO:
                console.info(message);
                break;


            case LogEvent.WARNING:
                console.warn(message);
                break;

            case LogEvent.ERROR:
                console.error(message);
                break;
        }
    }
}


  GetOfflineFunctionToRise(_requestUrl: string, _withController: boolean = false): string
  {
    let splitedUrl = _requestUrl.split('/');

    let functionToRaiseWithController = splitedUrl.slice(splitedUrl.length - 2, splitedUrl.length).join('/');

    if (functionToRaiseWithController.includes('?')) 
    {
      functionToRaiseWithController = functionToRaiseWithController.slice(0, functionToRaiseWithController.indexOf('?'));
    }
    
    if(!_withController)
    {
      return functionToRaiseWithController.split('/')[1];
    }

    return functionToRaiseWithController;

  }

  StartSpeedTestProcess(_speedTestSetting: ISpeedTestSetting): void
  {
    //NOTA!!! - Esta funcionalidad se comenta debido a que consume muchos datos - Isaac Herrera

    // let imageBits = _speedTestSetting.SizeInBits;
    // this.timesToDownload = _speedTestSetting.TimesToDownload;
    // this.speedTestImageURL = _speedTestSetting.ImageUrl;

    // timer(0, _speedTestSetting.DownloadInterval)
    // .pipe(
    //   tap(x => this.SpeedTest((avg: number) => {
    //       if(avg)
    //       {
    //         let duration = avg / 1000;
    //         let speedBps = Number((imageBits / duration).toFixed(2)); 
    //         let speedKbps = Number((speedBps / 1024).toFixed(2)); 
    //         let speedMbps = Number((speedKbps / 1024).toFixed(2));
            
    //         this.speedTestMbps.next(speedMbps);
    //       }
    //       else
    //       {
    //         this.speedTestMbps.next(0);
    //       }
    //     })
    //   )
    // ).subscribe();
  }

  private SpeedTest(callback: any): void {
    let tStart = new Date().getTime();

    if (this.timesDownloaded < this.timesToDownload - 1) 
    {
      this.dummyImage.src = this.speedTestImageURL + '?t=' + tStart;

      this.dummyImage.onload = () => {
        let tEnd = new Date().getTime();

        let tTimeTook = tEnd-tStart;

        this.downloadedTimes[this.timesDownloaded] = tTimeTook;

        this.SpeedTest(callback);

        this.timesDownloaded++;
      };

      this.dummyImage.onerror = () => {
        this.downloadedTimes = [0];

        this.SpeedTest(callback);

        this.timesDownloaded++;
      }
    } 
    else 
    {
      let sum = this.downloadedTimes.reduce(function(a, b) { return a + b; });

      let avg = sum ? sum / this.downloadedTimes.length : 0;

      callback(avg);

      this.timesDownloaded = 0;

      this.downloadedTimes = [];
    }
  }

  MapSubscriptionValue<T>(_reponse:ApiResponse<T>, _defValue: T): T
  {
    if(_reponse.result)
    {
      if(_reponse.errorInfo)
      {
        this.Alert(AlertType.INFO, _reponse.errorInfo.Message, _reponse.errorInfo.Message);
      }

      return _reponse.Data || _defValue;
    }
    else
    {
      this.Alert(AlertType.ERROR, _reponse.errorInfo.Message, _reponse.errorInfo.Message);

      this.logManageService.Log(
        LogEvent.ERROR,
        `(${_reponse.errorInfo.Code}) ${_reponse.errorInfo.Message}`
      );
    }

    return _defValue;
  }

  CLMapSubscriptionValue<T>(_reponse:ICLResponse<T>, _defValue: T): T
  {
    if(_reponse.Data)
    {
      if(_reponse.Message)
      {
        this.Alert(AlertType.INFO, _reponse.Message, _reponse.Message);
      }

      return _reponse.Data || _defValue;
    }
    else
    {
      this.Alert(AlertType.ERROR, _reponse.Message, _reponse.Message);

      this.logManageService.Log(
          LogEvent.ERROR,
          `(No code) ${_reponse.Message} - Method CLMapSubscriptionValue`
      );
    }

    return _defValue;
  }

  GenerateDocumentUniqueID(): string {
    
    const USER = this.localStorageService.data.get("Session").UserId || '';

    const DATE = new Date();

    const DAYS = DATE.getDate() < 10 ? '0' + DATE.getDate() : DATE.getDate().toString();
    const MONTS = (DATE.getMonth() + 1) < 10 ? '0' + (DATE.getMonth() + 1) : (DATE.getMonth() + 1).toString();
    const YEAR = DATE.getFullYear().toString().slice(2, 4);

    const HOURS = DATE.getHours() < 10 ? '0' + DATE.getHours() : DATE.getHours();
    const MINUTES = DATE.getMinutes() < 10 ? '0' + DATE.getMinutes() : DATE.getMinutes();
    const SECONDS = DATE.getSeconds() < 10 ? '0' + DATE.getSeconds() : DATE.getSeconds();

    const uniqueID = `${USER + DAYS + MONTS + YEAR + HOURS + MINUTES + SECONDS}`;

    return `M${uniqueID}`;

  }

  /**
   * Map the development UDF object to a UDF Context object (Commonly used for synchronization)
   * @param _source The development UDF
   * @constructor
   */
  MapUdfDevelopmentToUdfContext(_source: IUdfDevelopment): IUdfContext {
    return {
      TableId: _source.Tables,
      Name: _source.Name,
      Description: _source.Key,
      FieldType: _source.FieldType,
      Values: '[]',
      MappedValues: [],
      DataSource: '',
      TargetToOverride: '',
      PostTransactionObject: '',
      IsActive: true,
      IsRequired: false,
      IsRendered: false,
      IsTypehead: false,
      FieldID: 0,
      HeaderId: -1,
      LinesId: -1,
      DescriptionLines: '',
      IsForDevelopment: true
    } as IUdfContext;
  }

}
