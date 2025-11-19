import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {NavigationEnd, Router} from "@angular/router";
import {SharedService} from "@app/shared/shared.service";
type RouteHandler = (subRoute: string) => string;

@Injectable()
export class RoutingInterceptor implements HttpInterceptor {

  /**
   * Use data for map routes for different routings events
   * */
  routeMap: Map<RegExp, RouteHandler>;
  constructor(
    private router: Router,
    private sharedService: SharedService,
  ) {
    this.routeMap = new Map([
      [/^banks(?:\/([^?]+))?/, this.handleBanksManagement],
      [/^activities(?:\/([^?]+))?/, this.handleDocumentActivities],
      [/^inventory(?:\/([^?]+))?/, this.handleInventory],
      [/^maintenance(?:\/([^?]+))?/, this.handleMaintenance],
      [/^master-data(?:\/([^?]+))?/, this.handleMasterData],
      [/^offline(?:\/([^?]+))?/, this.handleOffline],
      [/^purchases(?:\/([^?]+))?/, this.handlePurchases],
      [/^route(?:\/([^?]+))?/, this.handleRoute],
      [/^sales(?:\/documents)?(?:\/([^?]+))?/, this.handleSales],
      [/^terminals(?:\/([^?]+))?/, this.handleTerminals],
      [/^home$/, () => 'Inicio'],
      [/^event-viewer$/, () => 'Visor de eventos'],
    ]);
  };

  /**
   * Method to validate url for define title toolbar
   * */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(() => {
        this.router.events.subscribe(event => {
          if( event instanceof NavigationEnd ){
            const url = this.removeParams(event.url.slice(1));
            for( const [regex, handler] of this.routeMap ){
              const match = url.match(regex);
              if(match){
                const page = handler.call(this, match.length == 1 ? match[0] : match[1].includes('/') ? match[1].split('/')[0] : match[1] || '' );
                this.sharedService.SetCurrentPage(page);
                return;
              }
            }
          }
        })
      })
    )
  };

  /**
   * Method to remove params o the URL
   * */
  private removeParams(url: string): string {
    return  url.split('?')[0];
  };

  /**
   *  Event to return data banks management
   * */
  private handleBanksManagement = (subRoute: string): string => {
    const banksManagementMap: { [key: string]: string } = {
      'incoming-payment': 'Pagos recibidos',
      'outgoing-payment': 'Pagos efectuados',
      'cancel-payment': 'Anular pagos',
      'internal-reconciliation': 'Reconciliación interna',
    };

    return banksManagementMap[subRoute] || 'Bancos';
  };

  /**
   *  Event to return data document activities
   * */
  private handleDocumentActivities = (subRoute: string): string => {
    const documentActivitiesMap: { [key: string]: string } = {
      'create': 'Actividad',
      'search': 'Buscar Actividades',
    };

    return documentActivitiesMap[subRoute] || 'Actividades';
  };

  /**
   * Event to return data inventory
   * */
  private handleInventory = (subRoute: string): string => {
    const inventoryMap: { [key: string]: string } = {
      'entry': 'Entrada de inventario',
      'output': 'Salida de inventario',
      'search-transfers': 'Buscar documentos',
      'transfer-request': 'Solicitud de traslado',
      'transfer': 'Transferencia de stock',
    };

    return inventoryMap[subRoute] || 'Inventario';
  };

  /**
   *  Event to return data maintenance
   * */
  private handleMaintenance = (subRoute: string): string => {
    const maintenanceMap: { [key: string]: string } = {
      'users': 'Usuarios',
      'roles-users': 'Roles',
      'geo-roles-users': 'Geo Roles',
      'companies': 'Compañías',
      'terminals': 'Terminales',
      'udfs': 'UDFs',
      'frequencies': 'Frecuencias',
      'activate-customers': 'Activación de clientes',
      'licenses': 'Licencias',
    };

    return maintenanceMap[subRoute] || 'Mantenimiento';
  };

  /**
   * Event to return data master-Data
   * */
  private handleMasterData = (subRoute: string): string => {
    const masterDataMap: { [key: string]: string } = {
      'business-partners': 'Socios de negocios',
      'items': 'Artículos',
    };

    return masterDataMap[subRoute] || 'Datos maestros';
  };

  /**
   *  Event to return data offline for mobile
   * */
  private handleOffline = (subRoute: string): string => {
    return subRoute === 'mobile' ? 'Movil' : 'Offline';
  };

  /**
   * Event to return data purchases
   * */
  private handlePurchases = (subRoute: string): string => {
    const purchasesMap: { [key: string]: string } = {
      'search-docs': 'Buscar documentos',
      'good-receipt': 'Entradas de mercancías',
      'return-good': 'Devolución de mercancía',
      'order': 'Orden de compra',
      'invoice': 'Factura de proveedores',
      'down-payments': 'Factura anticipos',
      'approvals': 'Autorizaciones',
    };

    return purchasesMap[subRoute] || 'Compras';
  };

  /**
   * Event to return data routes
   * */
  private handleRoute = (subRoute: string): string => {
    const routeMap: { [key: string]: string } = {
      'new': 'Nueva ruta',
      'list': 'Mis rutas',
    };

    return routeMap[subRoute] || 'Ruta';
  };

  /**
   * Event to return data sales
   * */
  private handleSales = (subRoute: string): string => {
    const salesMap: { [key: string]: string } = {
      'quotations': 'Cotización',
      'orders': 'Orden',
      'search-docs': 'Buscar documentos',
      'down-payments': 'Factura anticipos',
      'invoices': 'Factura (Contado/Crédito)',
      'delivery': 'Entrega',
      'reserve-invoice': 'Factura de reserva',
      'credit-memo': 'Notas de crédito',
      'cash-flow': 'Movimientos de dinero',
      'cash-closing': 'Cierres de caja',
      'approvals': 'Autorizaciones',
    };

    return salesMap[subRoute] || 'Ventas';
  };

  /**
   * Event to return data terminals
   * */
  private handleTerminals = (subRoute: string): string => {
    const terminalsMap: { [key: string]: string } = {
      'preclosing-cards': 'Precierres y cierres',
      'print-void-cards': 'Reimpresión anulaciones',
      'pendings': 'Transacciones pendientes',
    };

    return terminalsMap[subRoute] || 'Terminales';
  };
}
