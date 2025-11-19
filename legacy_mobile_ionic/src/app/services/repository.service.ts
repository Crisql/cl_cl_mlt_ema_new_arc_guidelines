import {Injectable, Injector} from '@angular/core';
import {LocalStorageService} from './local-storage.service';
import {IChart} from '../models/db/i-chart';
import {IPriceListInfo} from '../models/db/i-price-list-info';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite/ngx";
import {Platform} from "@ionic/angular";
import {BehaviorSubject, forkJoin, from, Observable, of, Subject, throwError} from "rxjs";
import {CheckType, RouteStatus, SQLITE_BD_NAME} from "src/app/common";
import {
    IBaseReponse,
    BusinessPartnersModel,
    CustomerCRUDModel,
    IExchangeRate,
    IGeoConfig,
    IBlanketAgreement,
    ITaxCodeDetermination,
    IMeasurementUnit,
    PromotionsModel,
    ITax,
    BusinessPartnerMinified,
    ICompanyInformation,
    IWarehouse, ICurrency, IOTCXValidator, ISetting
} from "src/app/models";
import {ILogMobile} from '../models/db/i-log-mobile';
import {IDiscountGroup} from '../models/db/discount-group';
import {IDiscountHierarchy} from '../models/db/discount-hierarchy';
import {IDocumentTypeLabel} from '../models/db/Doc-model';
import {IUserToken} from "../models/db/user-token";
import {IPermission} from "../models/db/permissions";
import {IProductPrice} from "../models/db/priceList-model";
import {IClSqliteTable} from "../models/i-cl-sqlite-table";
import {catchError, concatMap, map, toArray} from "rxjs/operators";
import {IUser} from "../models/i-user";
import {IItem} from "../models/i-item";
import {IBusinessPartner} from "../models/i-business-partner";
import { ICard } from '../models/i-card';
import {IUdfContext, IUdfDevelopment, IUdfInvoke} from "../interfaces/i-udfs";
import {ISeries} from "../interfaces/i-serie";
import {HttpParams} from "@angular/common/http";
import {ICalculatedPrice, IPriceList} from "../models/i-price-list";
import {formatDate} from "@angular/common";
import {IDecimalSetting, IMobileAppConfiguration} from "../interfaces/i-settings";
import {DocumentSyncStatus, LocalStorageVariables} from "../common/enum";
import {ICompany} from "../models/db/companys";
import {IOfflineDocument} from "../models/db/i-offline-document";
import {IRoute, IRouteLine, IRouteWithLines} from "../models/db/route-model";
import {IRouteHistory} from "../interfaces/i-route-history";
import {IBillOfMaterial, IBillOfMaterialToSync} from "../interfaces/i-item";
import {IAccount} from "../models/i-account";
import {FormatDate} from "../common/function";
import {CalculationService} from "./calculation.service";
import {IMenuMobile} from "../interfaces/i-menu";
import { IPrintFormatZPLOffline, IPrintFormatZPLOfflineToSync } from '../interfaces/i-print';
import { IPayTerms } from '../interfaces/i-pay-terms';


export namespace Repository {
    @Injectable({
        providedIn: 'root'
    })
    export class RepositoryService {
        Repositories: { [K: string]: Function } = {
            GetProducPrices: (_itemCode: string, _priceList: number, _cardCode: string) => this.repositoryProduct.GetProductPrices(_itemCode, _priceList, _cardCode),
            GetMeasurementUnits: _ => this.repositoryMeasurementUnit.GetMeasurementUnits(),
            GetTaxCodesDetermination: _ => this.repositoryTax.GetTaxCodeDeterminations(),
            GetCharts: _ => this.repositoryChart.GetCharts(),

            GetCustomer: (_httpParams: HttpParams) => this.repositoryCustomer.GetCustomer(_httpParams.get("CardCode")),
            GetBlanketAgreements: () => this.repositoryCustomer.GetBlanketAgreements(),
            GetMinifiedCustomers: (_httpParams: HttpParams) => this.repositoryCustomer.GetMinifiedCustomers(_httpParams.get("FilterBusinessPartner")),
            GetExchangeRate: () => this.repositoryExchangeRate.GetExchangeRate(),
            GetWarehouses: () => this.repositoryWarehouse.GetWarehouses(),
            GetCards: () => this.repositoryCard.GetCards(),
            GetDocumentTypeLabels: () => this.repositoryDocument.GetDocumentTypeLabels(),
            GetGeoConfigurations: () => this.repositoryGeoConfiguration.GetGeoConfigurations(),
            GetCompanyInformation: () => this.repositoryCompany.GetCompanyInformation(),
            GetDiscountHierarchies: () => this.repositoryDiscountHierarchy.GetDiscountHierarchies(),
            GetTaxes: () => this.repositoryTax.GetTaxes(),
            GetCurrencies: () => this.repositoryCurrencies.GetCurrencies(),
            GetUdfs: (_httpParams: HttpParams) => this.repositoryCompany.GetUdfs(_httpParams.get("Category")),
            GetDevelopmentUdfs: (_httpParams: HttpParams) => this.repositoryCompany.GetDevelopmentUdfs(_httpParams.get("Table")),
            GetMinifiedItems: (_httpParams: HttpParams) => this.repositoryProduct.GetMinifiedItems(_httpParams.get("ItemCode")?? ''),
            GetItemDetails: (_httpParams: HttpParams) => this.repositoryProduct.GetItem(_httpParams.get("ItemCode"), _httpParams.get("CardCode"), +_httpParams.get("PriceList")),
            GetPriceListsInfo: (_httpParams: HttpParams) => this.repositoryPriceList.GetPriceListsInfo(),
            GetPriceListInfo: (_httpParams: HttpParams) => this.repositoryPriceList.GetPriceListInfo(+_httpParams.get("PriceListNum")),
            GetSettingDecimal: () => this.repositoryCompany.GetSettingDecimal(),
            GetSettingMobileAppConfiguration: () => this.repositoryCompany.GetSettingMobileAppConfiguration(),
            GetNumberingSeries: () => this.repositorySerie.GetNumberingSeries(),
            GetPermissions: () => this.repositoryPermissions.GetPermissions(),
            GetAccounts: _ => this.repositoryAccount.GetAccounts(),
            GetConfiguration: (_httpParams: HttpParams) => this.repositoryConfiguration.GetConfiguration(_httpParams.get("Code")),
            GetMenu: (_httpParams: HttpParams)=> this.repositoryMenu.GetMenu(_httpParams.get("Language")),
            GetPayTerms: _ => this.repositoryPayTerms.GetPayTerms(),
            GetAllConfigurations: _ => this.repositoryConfiguration.GetAllConfigurations(),
        };

        constructor(
            private localStorageService: LocalStorageService,
            private repositoryProduct: Repository.Product,
            private repositoryExchangeRate: Repository.ExchangeRate,
            private repositoryWarehouse: Repository.Warehouse,
            private repositoryAccount: Repository.Account,
            private repositoryCard: Repository.Card,
            private repositoryChart: Repository.Chart,
            private repositoryCompany: Repository.Company,
            private repositoryCustomer: Repository.Customer,
            private repositoryDiscountHierarchy: Repository.DiscountHierarchy,
            private repositoryMeasurementUnit: Repository.MeasurementUnit,
            private repositoryPriceList: Repository.PriceList,
            private repositoryTax: Repository.Tax,
            private repositorySerie: Repository.Serie,
            private repositoryDocument: Repository.Document,
            private repositoryGeoConfiguration: Repository.GeoConfiguration,
            private repositoryCurrencies: Repository.Currency,
            private repositoryPermissions: Repository.Permission,
            private repositoryConfiguration: Repository.Configuration,
            private repositoryMenu: Repository.Menu,
            private repositoryPayTerms: Repository.PayTerms,
        ) {
        }

        /**
         * Execute a method of repository service by his name and return the local database information
         * @param _name The name of the method to execute
         * @param _params Http params to pass to the method
         * @constructor
         */
        FunctionInvoker(_name: string, _params: HttpParams) {
            if (this.Repositories[_name]) {
                return this.Repositories[_name](_params);
            }

            throw new Error(`The redirect method '${_name}' is not implemented.`);
        }
    }

    @Injectable({
        providedIn: "root",
    })
    export class DatabaseService {
        public database: SQLiteObject;
        private dbState: BehaviorSubject<boolean>;
        private databaseTables: IClSqliteTable[];

        constructor(private platform: Platform, private sqlite: SQLite) {
            this.dbState = new BehaviorSubject<boolean>(false);
            this.databaseTables = this.DefineTables();
            this.CreateDB();
        }

        private CreateDB() {
            this.platform.ready().then(() => {
                this.sqlite
                    .create({name: `${SQLITE_BD_NAME}`, location: "default"})
                    .then((db: SQLiteObject) => {
                        this.database = db;
                        this.CreateTables()
                            .subscribe(next => {
                                    console.log(next);
                                }, error => {
                                    console.error(error);
                                }, () => {
                                    this.dbState.next(true);
                                }
                            );
                    }).catch(error => console.error(`Error on database creation`, error));
            });
        }

        private DefineTables(): IClSqliteTable[] {
            return [
                {
                    Name: "users",
                    SQL: `CREATE TABLE IF NOT EXISTS users
                          (
                              Id            INTEGER PRIMARY KEY AUTOINCREMENT,
                              UserAssignId  INTEGER,
                              CompanyId     INTEGER,
                              Name          TEXT,
                              LastName      TEXT,
                              Email         TEXT,
                              EmailType     INTEGER,
                              EmailPassword TEXT,
                              Password      TEXT,
                              SlpCode       TEXT,
                              SlpName       TEXT,
                              CenterCost    TEXT,
                              WhsCode        TEXT,
                              UseScheduling NUMERIC,
                              Discount      INTEGER,
                              CreatedDate   TEXT,
                              CreatedBy     TEXT,
                              UpdateDate    TEXT,
                              UpdatedBy     TEXT,
                              SellerCode    TEXT,
                              BuyerCode     TEXT,
                              IsActive      NUMERIC
                              
                          )`
                },
                {
                    Name: "customers",
                    SQL: `CREATE TABLE IF NOT EXISTS customers
                          (
                              id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                              CardCode             TEXT,
                              CardName             TEXT,
                              Currency             TEXT,
                              ShipToDef            TEXT,
                              TaxCode              TEXT,
                              CreditLine           TEXT,
                              Balance              TEXT,
                              Phone1               TEXT,
                              Cellular             TEXT,
                              E_mail               TEXT,
                              Discount             REAL,
                              PriceListNum         INTEGER,
                              PayTermsCode         INTEGER,
                              BPGroup              INTEGER,
                              U_MaxDiscBP          REAL,
                              U_Lat                TEXT,
                              U_Lng                TEXT,
                              ContactPerson        TEXT,
                              U_TipoIdentificacion TEXT,
                              LicTradNum           TEXT,
                              U_provincia          TEXT,
                              U_canton             TEXT,
                              U_distrito           TEXT,
                              U_barrio             TEXT,
                              U_direccion          TEXT,
                              SubTipo              TEXT,
                              CashCustomer         INTEGER,
                              HeaderDiscount       REAL,
                              OTCXCondition        TEXT
                          )`
                },
                {
                    Name: "Products",
                    SQL: `CREATE TABLE IF NOT EXISTS Products
                          (
                              id               INTEGER PRIMARY KEY AUTOINCREMENT,
                              ItemCode         TEXT,
                              ItemName         TEXT,
                              TaxCode          TEXT,
                              MaxDiscount      REAL,
                              ShortDescription TEXT,
                              GroupCode        INTEGER,
                              UgpEntry         INTEGER,
                              UoMEntry         INTEGER,
                              PriceUnit        INTEGER,
                              Family           TEXT,
                              Freight          INTEGER,
                              AllowUnits       TEXT,
                              VATLiable        INTEGER,
                              OTCXCondition    TEXT,
                              EvalSystem       TEXT,
                              ManBtchNum       TEXT,
                              ManSerNum        TEXT,
                              TreeType         TEXT
                          )`
                },
                {
                    Name: "PriceList",
                    SQL: `CREATE TABLE IF NOT EXISTS PriceList
                          (
                              id        INTEGER PRIMARY KEY AUTOINCREMENT,
                              ItemCode  TEXT,
                              Price     REAL,
                              PriceList INTEGER,
                              Currency  TEXT,
                              UomEntry  INTEGER
                          )`
                },
                {
                    Name: "Documents",
                    SQL: `CREATE TABLE IF NOT EXISTS Documents
                          (
                              Id                INTEGER PRIMARY KEY AUTOINCREMENT,
                              RawDocument          TEXT,
                              ShouldSend              INTEGER,
                              DocumentType         TEXT,
                              TransactionType   TEXT,
                              DocumentTotal          REAL,
                              DocumentKey   TEXT,
                              TransactionStatus TEXT,
                              TransactionDetail TEXT,
                              OfflineDate   TEXT,
                              UserAssignId INTEGER
                          )`
                },
                {
                    Name: "Routes",
                    SQL: `CREATE TABLE IF NOT EXISTS Routes
                          (
                            LocalId                 INTEGER PRIMARY KEY AUTOINCREMENT,
                            Name                    TEXT,
                            ExpirationDate          DATE,
                            Status                  INTEGER,
                            Type                    INTEGER,
                            TotalDistance           REAL,
                            TotalDuration           REAL,
                            CloseDetail             TEXT,
                            CloseUser               TEXT,
                            CloseDate               DATE,
                            TotalEstimatedDistance  REAL,
                            TotalEstimatedDuration  REAL,
                            Id                      INTEGER,
                            CreatedDate             DATE,
                            CreatedBy               TEXT,
                            UpdateDate              DATE,
                            UpdatedBy               DATE,
                            DownloadDate            DATE
                          )`
                },
                {
                    Name: "RoutesLines",
                    SQL: `CREATE TABLE IF NOT EXISTS RoutesLines
                          (
                              LocalId           INTEGER PRIMARY KEY AUTOINCREMENT,
                              Address           TEXT,
                              Latitude          REAL,
                              Longitude         REAL,
                              CardCode          TEXT,
                              CardName          TEXT,
                              AddressLineId     INTEGER,
                              CheckStatus       INTEGER,
                              Status            INTEGER,
                              AddressType       INTEGER,
                              VisitingTime      TEXT,
                              VisitEndTime      TEXT,
                              AddressLineNum    INTEGER,
                              RouteId           INTEGER,
                              Id                INTEGER,
                              CreatedDate       DATE,
                              CreatedBy         TEXT,
                              UpdateDate        DATE,
                              UpdatedBy         TEXT,
                              OrderNum          INTEGER
                          )`
                },
                {
                    Name: "RouteHistories",
                    SQL: `CREATE TABLE IF NOT EXISTS RouteHistories
                          (
                              Id                 INTEGER PRIMARY KEY AUTOINCREMENT,
                              Latitude           REAL,
                              Longitude          REAL,
                              RouteId            INTEGER,
                              Comments           TEXT,
                              CardCode           TEXT,
                              CardName           TEXT,
                              Address            TEXT,
                              CheckType          INTEGER,
                              RouteLineId        INTEGER,
                              IsSynchronized     INTEGER,
                              AddressType        INTEGER,
                              CreatedDate        DATE,
                              CreatedBy          TEXT,
                              UpdateDate         DATE,
                              UpdatedBy          TEXT,
                              Photos             TEXT
                          )`
                },
                {
                    Name: "taxes",
                    SQL: `CREATE TABLE IF NOT EXISTS taxes
                          (
                              id      INTEGER PRIMARY KEY AUTOINCREMENT,
                              TaxCode TEXT,
                              TaxRate INTEGER
                          )`
                },
                {
                    Name: "Configurations",
                    SQL: `CREATE TABLE IF NOT EXISTS Configurations
                          (
                              id          INTEGER PRIMARY KEY AUTOINCREMENT,
                              Code        TEXT,
                              Value       TEXT,
                              IsActive     NUMERIC   
                          )`
                },
                {
                    Name: "Permissions",
                    SQL: `CREATE TABLE IF NOT EXISTS Permissions
                          (
                              id          INTEGER PRIMARY KEY AUTOINCREMENT,
                              PermissionType        INTEGER,
                              Name        TEXT,
                              Description TEXT
                          )`
                },
                {
                    Name: "CompanyInformation",
                    SQL: `CREATE TABLE IF NOT EXISTS CompanyInformation
                          (
                              Id              INTEGER PRIMARY KEY AUTOINCREMENT,
                              CompanyName     TEXT,
                              Direction       TEXT,
                              Phone           TEXT,
                              UseBillingRange INTEGER,
                              BillingRange    REAL,
                              UseFreight      INTEGER,
                              OnlineOnly      INTEGER,
                              Identification  TEXT,
                              LinePriceDecimals INTEGER,
                              LineTotalDecimals INTEGER,
                              DocumentTotalDecimals INTEGER,
                              CompanyId             INTEGER,
                              ConnectionId          INTEGER,
                              DatabaseCode          TEXT
                          )`
                },
                {
                    Name: "wareHouses",
                    SQL: `CREATE TABLE IF NOT EXISTS wareHouses
                          (
                              id      INTEGER PRIMARY KEY AUTOINCREMENT,
                              WhsCode TEXT,
                              WhsName TEXT
                          )`
                },
                {
                    Name: "promotions",
                    SQL: `CREATE TABLE IF NOT EXISTS promotions
                          (
                              id              INTEGER PRIMARY KEY AUTOINCREMENT,
                              Rule            TEXT,
                              Quantity        REAL,
                              UnitMeasurement TEXT,
                              ItemCode        TEXT,
                              Discount        REAL,
                              DiscountType    INTEGER,
                              Sequence        INTEGER,
                              UseDescripPromo NUMERIC,
                              DescripPromo    TEXT,
                              CompanyId       INTEGER
                          )`
                },
                {
                    Name: "cards",
                    SQL: `CREATE TABLE IF NOT EXISTS cards
                          (
                              id         INTEGER PRIMARY KEY AUTOINCREMENT,
                              CardName   TEXT,
                              CreditCard TEXT,
                              AcctCode   TEXT,
                              Currency   TEXT
                          )`
                },
                {
                    Name: "Accounts",
                    SQL: `CREATE TABLE IF NOT EXISTS Accounts
                          (
                              LocalId   INTEGER PRIMARY KEY AUTOINCREMENT,
                              AcctName  TEXT,
                              AcctCode  TEXT,
                              ActCurr   TEXT,
                              Id        INTEGER,
                              Type      INTEGER
                          )`
                },
                {
                    Name: "ExchangeRates",
                    SQL: `CREATE TABLE IF NOT EXISTS ExchangeRates
                          (
                              id    INTEGER PRIMARY KEY AUTOINCREMENT,
                              Date  TEXT,
                              Rate  REAL
                          )`
                },
                {
                    Name: "tokens",
                    SQL: `CREATE TABLE IF NOT EXISTS tokens
                          (
                              id           INTEGER PRIMARY KEY AUTOINCREMENT,
                              access_token TEXT,
                              ExpireTime   TEXT,
                              UserEmail    TEXT,
                              UserId       TEXT
                          )`
                },
                {
                    Name: "documentTypes",
                    SQL: `CREATE TABLE IF NOT EXISTS documentTypes
                          (
                              id   INTEGER PRIMARY KEY AUTOINCREMENT,
                              type INTEGER,
                              name TEXT
                          )`
                },
                {
                    Name: "GeoConfigs",
                    SQL: `CREATE TABLE IF NOT EXISTS GeoConfigs
                          (
                              Id         INTEGER PRIMARY KEY AUTOINCREMENT,
                              Name       TEXT,
                              Key        INTEGER,
                              UserMappId INTEGER
                          )`
                },
                {
                    Name: "Series",
                    SQL: `CREATE TABLE IF NOT EXISTS Series
                          (
                              Id               INTEGER PRIMARY KEY AUTOINCREMENT,
                              UserAssingId     INTEGER,
                              CompanyId        INTEGER,
                              NoSerie          INTEGER,
                              DocumentType     INTEGER,
                              SerieType        INTEGER,
                              SerieDescription TEXT,
                              IsSerial         BOOLEAN,
                              CreatedDate      DATETIME,
                              CreatedBy        TEXT,
                              UpdateDate       DATETIME,
                              UpdatedBy        TEXT
                          )`
                },
                {
                    Name: "FESeries",
                    SQL: `CREATE TABLE IF NOT EXISTS FESeries
                          (
                              Id         INTEGER PRIMARY KEY AUTOINCREMENT,
                              SerieName       TEXT,
                              BranchOffice   INTEGER,
                              Terminal       INTEGER,
                              NextNumber     INTEGER,
                              SeriesByUserId INTEGER
                          )`
                },
                {
                    Name: "CompanyUDFs",
                    SQL: `CREATE TABLE IF NOT EXISTS CompanyUDFs
                          (
                              Id             INTEGER PRIMARY KEY AUTOINCREMENT,
                              Name           TEXT,
                              TableId        TEXT,
                              Description    TEXT,
                              FieldType      INTEGER,
                              DataSource     TEXT,
                              TargetToOverride TEXT,
                              PostTransactionObject TEXT,
                              IsRequired     INTEGER,
                              IsRendered     INTEGER,
                              IsTypeahead    INTEGER,
                              FieldID        INTEGER,
                              IsForDevelopment INTEGER
                          )`
                },
                {
                    Name: "UDFsValues",
                    SQL: `CREATE TABLE IF NOT EXISTS UDFsValues
                        (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            UdfName TEXT,
                            Value TEXT,
                            Description TEXT,
                            TableId TEXT
                        )`
                },
                {
                    Name: "MeasurementUnits",
                    SQL: `CREATE TABLE IF NOT EXISTS MeasurementUnits
                          (
                              Id          INTEGER PRIMARY KEY AUTOINCREMENT,
                              UgpEntry    INTEGER,
                              GroupCode   TEXT,
                              GroupName   TEXT,
                              UoMEntry    INTEGER,
                              UoMCode     TEXT,
                              MeasureUnit TEXT,
                              BaseQty     REAL
                          )`
                },
                {
                    Name: "DiscountHierarchies",
                    SQL: `CREATE TABLE IF NOT EXISTS DiscountHierarchies
                          (
                              Id        INTEGER PRIMARY KEY AUTOINCREMENT,
                              Type      INTEGER,
                              Hierarchy INTEGER,
                              Active    INTEGER
                          )`
                },
                {
                    Name: "DiscountGroups",
                    SQL: `CREATE TABLE IF NOT EXISTS DiscountGroups
                          (
                              Id        INTEGER PRIMARY KEY AUTOINCREMENT,
                              AbsEntry  INTEGER,
                              Type      INTEGER,
                              CardCode  TEXT,
                              BPGroup   INTEGER,
                              ItemCode  TEXT,
                              ItemGroup INTEGER,
                              AuxField  TEXT,
                              Discount  REAL
                          )`
                },
                {
                    Name: "TaxCodeDeterminations",
                    SQL: `CREATE TABLE IF NOT EXISTS TaxCodeDeterminations
                          (
                              Id        INTEGER PRIMARY KEY AUTOINCREMENT,
                              DocEntry  INTEGER,
                              DocType   TEXT,
                              LineNum   INTEGER,
                              BusArea   INTEGER,
                              Cond1     INTEGER,
                              UDFTable1 TEXT,
                              NumVal1   INTEGER,
                              StrVal1   TEXT,
                              MnyVal1   REAL,
                              Cond2     INTEGER,
                              UDFTable2 TEXT,
                              NumVal2   INTEGER,
                              StrVal2   TEXT,
                              MnyVal2   REAL,
                              Cond3     INTEGER,
                              UDFTable3 TEXT,
                              NumVal3   INTEGER,
                              StrVal3   TEXT,
                              MnyVal3   REAL,
                              Cond4     INTEGER,
                              UDFTable4 TEXT,
                              NumVal4   INTEGER,
                              StrVal4   TEXT,
                              MnyVal4   REAL,
                              Cond5     INTEGER,
                              UDFTable5 TEXT,
                              NumVal5   INTEGER,
                              StrVal5   TEXT,
                              MnyVal5   REAL,
                              UDFAlias1 TEXT,
                              UDFAlias2 TEXT,
                              UDFAlias3 TEXT,
                              UDFAlias4 TEXT,
                              UDFAlias5 TEXT,
                              LnTaxCode TEXT,
                              Descr     TEXT,
                              FrLnTax   TEXT,
                              FrHdrTax  TEXT
                          )`
                },
                {
                    Name: "Charts",
                    SQL: `CREATE TABLE IF NOT EXISTS Charts
                          (
                              Id      INTEGER PRIMARY KEY AUTOINCREMENT,
                              type    TEXT,
                              data    TEXT,
                              options TEXT
                          )`
                },
                {
                    Name: "OOAT",
                    SQL: `CREATE TABLE IF NOT EXISTS OOAT
                          (
                              Id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                              AbsID               INTEGER,
                              RawBlanketAgreement TEXT
                          )`
                },
                {
                    Name: "LogsMobile",
                    SQL: `CREATE TABLE IF NOT EXISTS LogsMobile
                          (
                              Id              INTEGER PRIMARY KEY AUTOINCREMENT,
                              Event           INTEGER,
                              View            TEXT,
                              Detail          TEXT,
                              Date            TEXT,
                              User            TEXT,
                              SyncStatus      INTEGER,
                              DocumentKey     TEXT,
                              TransactionType TEXT,
                              UserSign        INTEGER
                          )`
                },
                {
                    Name: "PriceListInfo",
                    SQL: `CREATE TABLE IF NOT EXISTS PriceListInfo
                          (
                              Id        INTEGER PRIMARY KEY AUTOINCREMENT,
                              ListName  TEXT,
                              ListNum   INTEGER,
                              BaseNum   INTEGER,
                              Factor    REAL,
                              GroupCode INTEGER,
                              PrimCurr  TEXT
                          )`
                },
                {
                    Name: "DocumentTypeLabels",
                    SQL: `CREATE TABLE IF NOT EXISTS DocumentTypeLabels
                          (
                              Id      INTEGER PRIMARY KEY AUTOINCREMENT,
                              DocType INTEGER,
                              Label   TEXT
                          )`
                },
                {
                    Name: "Currencies",
                    SQL: `CREATE TABLE IF NOT EXISTS Currencies
                          (
                              Id TEXT,
                              Name TEXT,
                              Symbol TEXT,
                              IsLocal INTEGER
                          )`
                },
                {
                    Name: "BillOfMaterials",
                    SQL: `CREATE TABLE IF NOT EXISTS BillOfMaterials
                          (
                              Id INTEGER PRIMARY KEY AUTOINCREMENT,
                              FatherCode TEXT,
                              ItemCode TEXT,
                              Quantity REAL
                          )`
                },
                {
                    Name: "Menu",
                    SQL: `CREATE TABLE IF NOT EXISTS Menu
                          (
                              Id INTEGER PRIMARY KEY AUTOINCREMENT,
                              Key TEXT,
                              Description TEXT,
                              Icon TEXT,
                              Route TEXT,
                              Visible INTEGER,
                              Nodes TEXT,
                              Category TEXT,
                              NextId INTEGER,
                              NamePermission TEXT,
                              Language TEXT,
                              NeedConnection INTEGER,
                              Type INTEGER
                          )`
                },
                {
                    Name: "PrintFormatZPLOffline",
                    SQL: `CREATE TABLE IF NOT EXISTS PrintFormatZPLOffline
                          (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            FormatZPLOffline TEXT
                            )`
                },
                {
                    Name: "PayTerms",
                    SQL: `CREATE TABLE IF NOT EXISTS PayTerms
                          (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            GroupNum INTEGER,
                            PymntGroup TEXT,
                            Type INTEGER,
                            Months INTEGER,
                            Days INTEGER
                            )`
                }
            ];
        }

        CreateTables(): Observable<string> {
            return from(this.databaseTables).pipe(
                concatMap(next => {
                    return from(this.database.executeSql(next.SQL, [])).pipe(
                        map(_ => `Executed SQL CREATE ${next.Name}`),
                        catchError(error => {
                            console.error(`Error on execute SQL CREATE ${next.Name}`);
                            return throwError(error);
                        })
                    )
                })
            );
        }

        public Ready() {
            return new Promise((resolve, reject) => {
                if (this.dbState.getValue()) {
                    resolve(true);
                } else {
                    this.dbState.subscribe((ready: boolean) => {
                        if (ready) {
                            resolve(true);
                        }
                    });
                }
            });
        }
    }

    @Injectable({
        providedIn: 'root',
    })
    export class Account {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Indicates if there are some account in the SQL Lite database
         * @constructor
         */
        public async AreAccountsSynchronized(): Promise<boolean> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT COUNT(*) AS count FROM Accounts;", []))),
                    map(selectResult => selectResult.rows.length && selectResult.rows.item(0).count),
                    catchError(error => {
                        console.error(error);
                        return of(false);
                    })
                ).toPromise();
        }

        /**
         * Delete all accounts store in the SQL Lite database
         * @constructor
         */
        public DeleteAccounts(): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM Accounts", []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql("DELETE FROM sqlite_sequence WHERE name=?", ["Accounts"]))),
                    map(resetSequenceResult => 1)
                );
        }

        /**
         * Retrieves all accounts stored in the SQL Lite database
         * @constructor
         */
        public async GetAccounts(): Promise<IAccount[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Accounts", []))),
                    map(selectResult => {
                        let accounts: IAccount[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            accounts.push(selectResult.rows.item(i));
                        }
                        
                        return accounts;
                    })
                ).toPromise();
        }

        /**
         * Insert an account in the SQL Lite database
         * @param _account The account information to insert
         * @constructor
         */
        public StoreAccount(_account: IAccount): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO Accounts(AcctName, AcctCode, ActCurr, Id, Type)
                     VALUES (?,?,?,?,?)
                    `, [
                        _account.AcctName,
                        _account.AcctCode,
                        _account.ActCurr,
                        _account.Id,
                        _account.Type
                    ]))),
                    map(insertResult => 1)
                )
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Card {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Indicates if cards were synchronized
         * @constructor
         */
        public async AreCardsSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(async () => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM cards;", [])
                    .then((data) => {
                        return data.rows.length > 0;
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        public async DeleteCards(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(`DELETE
                                                                 FROM cards`, []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "cards";',
                        []
                    );
                });
            });
        }

        /**
         * Insert a card in SQL Lite database
         * @param _card
         * @constructor
         */
        public async StoreCard(_card: ICard): Promise<number> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            `INSERT INTO cards(CardName, CreditCard, AcctCode, Currency)
                             VALUES (?,?,?,?);`,
                            [_card.CardName, _card.CreditCard, _card.AcctCode, _card.Currency]
                        )
                        .then((result) => {
                            return result.insertId;
                        })
                        .catch(error => {
                            console.error(error);
                            return -1;
                        });
                });
        }

        /**
         * Retrieves all synchronized cards
         * @constructor
         */
        public async GetCards(): Promise<ICard[]> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM cards", [])
                        .then((data) => {
                            let lists: ICard[] = [];
                            
                            for (let i = 0; i < data.rows.length; i++) 
                            {
                                lists.push(data.rows.item(i));
                            }
                            
                            return lists;
                        })
                        .catch(error => {
                            console.error(error);
                            return [];
                        });
                });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Chart {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async AddChart(Chart: IChart): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO charts(data, options, type)
                         VALUES (?, ?, ?);`,
                        [JSON.stringify(Chart.data), Chart.options, Chart.type]
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async GetCharts(): Promise<IChart[]> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("SELECT * FROM charts", [])
                    .then((data) => {
                        let lists: IChart[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            let chart = data.rows.item(i);
                            chart.data = JSON.parse(chart.data);
                            lists.push(chart as IChart);
                        }
                        return lists;
                    });
            });
        }

        public async DeleteCharts(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM charts", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "charts";',
                        []
                    );
                });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class RouteHistory {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Get all unsynchronized route histories from SQL Lite database
         * @constructor
         */
        public GetUnsynchronizedRoutesHistories(): Observable<IRouteHistory[]> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM RouteHistories WHERE IsSynchronized=? ORDER BY CreatedDate ASC;", [0]))),
                    map(selectResult => {
                        let lists: IRouteHistory[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            let history = selectResult.rows.item(i) as IRouteHistory;
                            
                            lists.push({
                                ...history,
                                CreatedDate: formatDate(new Date(history.CreatedDate), "yyyy-MM-dd HH:mm:ss", 'en')
                            });
                        }
                        return lists.map(rHistory => ({
                            ...rHistory,
                            RouteLineId: rHistory.RouteLineId || null
                        }));
                    })
                );
        }

        /**
         * Get all route histories of an specific route from SQL Lite database
         * @constructor
         */
        public GetRouteHistories(_routeId: number): Observable<IRouteHistory[]> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM RouteHistories WHERE RouteId=? ORDER BY CreatedDate ASC;", [_routeId]))),
                    map(selectResult => {
                        let lists: IRouteHistory[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++)
                        {
                            lists.push(selectResult.rows.item(i));
                        }

                        return lists.map(rHistory => ({
                            ...rHistory,
                            RouteLineId: rHistory.RouteLineId || null
                        }));
                    })
                );
        }
        
        /**
         * Insert a route history in the SQL Lite database
         * @param _routeHistory The route history information to insert
         * @constructor
         */
        public StoreRouteHistory(_routeHistory: IRouteHistory): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database
                        .executeSql(`INSERT INTO RouteHistories(Latitude, Longitude, CheckType, Comments, CardCode, CardName, Address, AddressType, RouteLineId, RouteId, IsSynchronized, CreatedDate, CreatedBy, UpdateDate, UpdatedBy, Photos)
                             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
                                [
                                    _routeHistory.Latitude,
                                    _routeHistory.Longitude,
                                    _routeHistory.CheckType,
                                    _routeHistory.Comments,
                                    _routeHistory.CardCode,
                                    _routeHistory.CardName,
                                    _routeHistory.Address,
                                    _routeHistory.AddressType,
                                    _routeHistory.RouteLineId,
                                    _routeHistory.RouteId,
                                    +_routeHistory.IsSynchronized,
                                    _routeHistory.CreatedDate,
                                    _routeHistory.CreatedBy,
                                    _routeHistory.UpdateDate,
                                    _routeHistory.UpdatedBy,
                                    _routeHistory.Photos
                                ]
                            )
                    )),
                    map(insertResult => 1)
                );
        }

        /**
         * Delete the synchronized routes histories from the SQL Lite database
         * @constructor
         */
        public DeleteSynchronizedRoutesHistories(): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM RouteHistories WHERE IsSynchronized=?", [1]))),
                    map(deleteResult => 1)
                );
        }
        
        /**
         * Delete the route histories from the SQL Lite database
         * @param _routeId The route id to delete the histories
         * @constructor
         */
        public DeleteRouteHistories(_routeId: number): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM RouteHistories WHERE RouteId=?", [_routeId]))),
                    map(deleteResult => 1)
                );
        }

        /**
         * Delete a route history from the SQL Lite database
         * @param _routeHistoryLocalId The route history local id to delete the histories
         * @constructor
         */
        public DeleteRouteHistory(_routeHistoryLocalId: number): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM RouteHistories WHERE Id=?", [_routeHistoryLocalId]))),
                    map(deleteResult => 1)
                );
        }

        /**
         * Update the route history sync status
         * @param _id The id of the local route history
         * @param _isSynchronized The new sync status
         * @constructor
         */
        public async UpdateRouteHistorySyncStatus(_id: number, _isSynchronized: boolean): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("UPDATE RouteHistories SET IsSynchronized=? WHERE Id=?", [+_isSynchronized, _id]))),
                    map(updateResult => 1)
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Company {
        constructor(private databaseService: Repository.DatabaseService,
                    private localStorageService: LocalStorageService) {
        }

        /**
         * Retrieves synchronized company information
         * @constructor
         */
        public async GetCompanyInformation(): Promise<ICompanyInformation> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    "SELECT * FROM CompanyInformation",
                    []
                ).then((data) => {
                    if (!data.rows || data.rows.length === 0) {
                        return {} as ICompanyInformation
                    }
                    data.rows.item(0).UseBillingRange = !!data.rows.item(0).UseBillingRange;
                    data.rows.item(0).OnlineOnly = !!data.rows.item(0).OnlineOnly;
                    data.rows.item(0).UseFreight = !!data.rows.item(0).UseFreight;
                    return data.rows.item(0);
                });
            });
        }

        /**
         * Indicates if the company information is synchronized
         * @constructor
         */
        public async IsCompanyInformationSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM CompanyInformation", [])
                    .then((data) => {
                        if (data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } 
                        else 
                        {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Delete all company information from database
         * @constructor
         */
        public async DeleteCompanyInformation(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("DELETE FROM CompanyInformation", [])
                    .then(() => {
                        return this.databaseService.database.executeSql(
                            'DELETE FROM sqlite_sequence WHERE name = "CompanyInformation";',
                            []
                        );
                    });
            });
        }

        /**
         * Insert the company information in the SQL Lite database
         * @param _cmpInfo The company information to insert
         * @constructor
         */
        public async StoreCompanyInformation(_cmpInfo: ICompanyInformation): Promise<number> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            `INSERT INTO CompanyInformation(CompanyName, Direction, Phone, UseBillingRange, BillingRange, 
                            UseFreight, OnlineOnly, Identification, LinePriceDecimals, LineTotalDecimals, DocumentTotalDecimals, CompanyId, ConnectionId, DatabaseCode)
                             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [_cmpInfo.CompanyName, _cmpInfo.Direction, _cmpInfo.Phone, +_cmpInfo.UseBillingRange, _cmpInfo.BillingRange,
                            +_cmpInfo.UseFreight, +_cmpInfo.OnlineOnly, _cmpInfo.Identification, _cmpInfo.LinePriceDecimals, _cmpInfo.LineTotalDecimals,
                            _cmpInfo.DocumentTotalDecimals, +_cmpInfo.CompanyId, +_cmpInfo.ConnectionId, _cmpInfo.DatabaseCode]
                        )
                        .then((result) => {
                            return result.insertId ?? -1;
                        })
                        .catch(error => {
                            console.error(error);
                            return -1;
                        });
                });
        }

        /**
         * Delete all synchronized UDFs and his values from SQL Lite database
         * @constructor
         */
        public async DeleteUdfs(): Promise<any> 
        {
            return this.databaseService.Ready()
                .then(() => {
                    return from(this.databaseService.database.executeSql("DELETE FROM CompanyUDFs", []))
                        .pipe(
                            concatMap(deleteResult => this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "CompanyUDFs";', [])),
                            concatMap(resetSequenceResult => this.databaseService.database.executeSql("DELETE FROM UDFsValues", [])),
                            concatMap(deleteResult => this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "UDFsValues";', [])),
                            map(resetSequenceResult => 1),
                            catchError(error => {
                                console.error(error);
                                return of(-1);
                            })
                        ).toPromise();
                });
        }

        /**
         * Insert the user defined field (UDF) in the SQL Lite database
         * @param _UDF The UDF information to insert
         * @constructor
         */
        public async StoreUdfs(_UDF: IUdfContext): Promise<number> 
        {
            return this.databaseService.Ready()
                .then(() => {
                    return from(this.databaseService.database
                        .executeSql(
                            `INSERT INTO CompanyUDFs (Name, TableId, Description, FieldType, DataSource, TargetToOverride,
                            PostTransactionObject, IsRequired, IsRendered, IsTypeahead, FieldID, IsForDevelopment)
                             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [
                                _UDF.Name,
                                _UDF.TableId,
                                _UDF.Description,
                                _UDF.FieldType,
                                _UDF.DataSource,
                                _UDF.TargetToOverride,
                                _UDF.PostTransactionObject,
                                +_UDF.IsRequired,
                                +_UDF.IsRendered,
                                +_UDF.IsTypehead,
                                +_UDF.FieldID,
                                +_UDF.IsForDevelopment
                            ]
                        ))
                        .pipe(
                            concatMap(insertResult => {
                                return of(_UDF.MappedValues)
                                    .pipe(
                                        concatMap(mappedValues => of(...mappedValues)),
                                        concatMap(mappedValue => from(this.databaseService.database
                                            .executeSql(
                                                `INSERT INTO UDFsValues (UdfName, Value, Description, TableId)
                                                        VALUES (?,?,?,?)`,
                                                [_UDF.Name, mappedValue.Value, mappedValue.Description, _UDF.TableId]
                                            )))
                                    )
                            }),
                            map(result => 1),
                            catchError(error => {
                                console.error(error);
                                return of(-1);
                            })
                        ).toPromise();
                });
        }

        /**
         * Retrieves all synchronized udfs
         * @constructor
         */
        public async GetUdfs(_category: string): Promise<IUdfContext[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => {
                        return from(this.databaseService.database.executeSql("SELECT * FROM CompanyUDFs WHERE TableId=? AND IsForDevelopment=?", [_category,0]))
                            .pipe(
                                concatMap(result => {
                                    let lists: IUdfContext[] = [];

                                    for (let i = 0; i < result.rows.length; i++)
                                    {
                                        lists.push(result.rows.item(i));
                                    }

                                    return of(...lists);
                                }),
                                concatMap(udf => this.GetUdfsValues(_category, udf.Name)
                                    .pipe(
                                        map(result => ({
                                            ...udf,
                                            MappedValues: result
                                        }))
                                    )
                                ),
                                toArray()
                            )
                    })
                ).toPromise();
        }

        /**
         * Retrieves all synchronized udfs marked as development udf
         * @param _category The SAP Table name where the udfs are
         * @constructor
         */
        GetDevelopmentUdfs(_category: string): Promise<IUdfDevelopment[]>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => {
                        return from(this.databaseService.database.executeSql("SELECT TableId AS Tables, Name, Description AS Key, FieldType FROM CompanyUDFs WHERE TableId=? AND IsForDevelopment=?", [_category,1]))
                            .pipe(
                                concatMap(result => {
                                    let lists: IUdfDevelopment[] = [];

                                    for (let i = 0; i < result.rows.length; i++)
                                    {
                                        lists.push(result.rows.item(i));
                                    }

                                    return of(...lists);
                                }),
                                concatMap(udf => this.GetUdfsValues(_category, udf.Name)
                                    .pipe(
                                        map(result => ({
                                            ...udf,
                                            MappedValues: result
                                        }))
                                    )
                                ),
                                toArray()
                            )
                    })
                ).toPromise();
        }
        
        /**
         * Retrieves all synchronized udfs values
         * @param _udfName The name of the udf to retrieve his values
         * @param _category The SAP Table name where the udf are
         * @constructor
         */
        GetUdfsValues(_category: string, _udfName: string): Observable<IUdfInvoke[]>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM UDFsValues WHERE UdfName=? AND TableId=?", [_udfName, _category]))),
                    map(result => {
                        let udfValues: IUdfInvoke[] = [];

                        for (let i = 0; i < result.rows.length; i++)
                        {
                            udfValues.push(result.rows.item(i));
                        }

                        return udfValues;
                    })
                );
        }

        /**
         * Retrieves the information of the Decimals setting
         * @constructor
         */
        public async GetSettingDecimal(): Promise<ISetting>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.GetCompanyInformation())),
                    map(companyInformation => {
                        let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;
                        
                        return {
                            Json: JSON.stringify([{
                                TotalLine: companyInformation.LineTotalDecimals,
                                Price: companyInformation.LinePriceDecimals,
                                TotalDocument: companyInformation.DocumentTotalDecimals,
                                CompanyId: company.Id
                            } as IDecimalSetting])
                        } as ISetting;
                    }),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })
                ).toPromise()
        }

        /**
         * Retrieves the information of the MobileAppConfiguration setting
         * @constructor
         */
        public async GetSettingMobileAppConfiguration(): Promise<ISetting>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.GetCompanyInformation())),
                    map(companyInformation => {
                        let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;

                        return {
                            Json: JSON.stringify([{
                                OnlineOnly: companyInformation.OnlineOnly,
                                BillingRange: companyInformation.BillingRange,
                                UseFreight: companyInformation.UseFreight,
                                UseBillingRange: companyInformation.UseBillingRange,
                                CompanyId: company.Id
                            } as IMobileAppConfiguration])
                        } as ISetting;
                    }),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })
                ).toPromise()
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Currency {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Indicates if the currencies are synchronized
         * @constructor
         */
        public async AreCurrenciesSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM Currencies", [])
                    .then((data) => {
                        if (data.rows.length > 0)
                        {
                            return data.rows.item(0).count > 0;
                        }
                        else
                        {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Insert a currency in the SQL Lite database
         * @param _currency The currency information to insert
         * @constructor
         */
        public async StoreCurrency(_currency: ICurrency): Promise<any> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            `INSERT INTO Currencies (Id, Name, Symbol, IsLocal) VALUES (?,?,?,?)`,
                            [_currency.Id, _currency.Name, _currency.Symbol, +_currency.IsLocal]
                        )
                        .then((result) => {
                            return result.insertId ?? -1;
                        })
                        .catch(error => {
                            console.error(error);
                            return -1;
                        });
                });
        }

        /**
         * Delete all currencies from database
         * @constructor
         */
        public async DeleteCurrencies(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("DELETE FROM Currencies", [])
                    .then(() => {
                        return this.databaseService.database.executeSql(
                            'DELETE FROM sqlite_sequence WHERE name = "Currencies";',
                            []
                        );
                    });
            });
        }

        /**
         * Retrieves all synchronized currencies
         * @constructor
         */
        public async GetCurrencies(): Promise<ICurrency[]> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    "SELECT * FROM Currencies",
                    []
                ).then((data) => {
                    let currencies: ICurrency[] = [];

                    for (let i = 0; i < data.rows.length; i++) 
                    {
                        data.rows.item(i).IsLocal = !!data.rows.item(i).IsLocal;
                        
                        currencies.push(data.rows.item(i));
                    }
                    
                    return currencies;
                });
            });
        }
    }
    @Injectable({
        providedIn: 'root'
    })
    export class Configuration {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Retrieve the synchronized configuration
         * @param _code The configuration identifier
         * @constructor
         */
        public async GetConfiguration(_code: string): Promise<ISetting | null> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Configurations WHERE Code=? LIMIT 1", [_code]))),
                    map(selectResult => ({...selectResult.rows.item(0), Json: selectResult.rows.item(0)?.Value || ''} as ISetting)),
                    catchError(error => {
                        console.error(error);
                        return of(null);
                    })
                ).toPromise();
        }

        public async AddToken(_userToken: IUserToken): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO tokens (access_token, ExpireTime, UserEmail, UserId)
                         VALUES (?, ?, ?, ?);`,
                        [_userToken.access_token, _userToken['ExpireTime'], _userToken.UserEmail, _userToken.UserId]
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async GetUserToken(_userEmail: string): Promise<IUserToken[] | null> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `SELECT *
                         FROM tokens
                         WHERE UserEmail = '${_userEmail}'
                         ORDER BY ExpireTime DESC
                         LIMIT 1;`,
                        []
                    )
                    .then((data) => {
                        let lists: IUserToken[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    })
                    .catch((e) => {
                        console.error(e);
                        return null;
                    });
            });
        }

        /**
         * Insert a configuration in the SQL Lite database
         * @param _key The unique identifier of the configuration
         * @param _value The serialized value of the configuration
         * @param _isActive The status value of the configuration
         * @constructor
         */
        public async StoreConfiguration(_key: string, _value: string, _isActive: boolean = true): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO Configurations(Code, Value, IsActive) VALUES (?, ?, ?);`, [_key, _value, _isActive]))),
                    map(insertResult => 1)
                ).toPromise();
        }

        /**
         * Delete all or a single configuration from SQL Lite database
         * @param _key The key of the configuration to delete (Optional)
         * @constructor
         */
        public async DeleteConfigurations(_key: string = null): Promise<any> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => {
                        if(_key)
                        {
                            return from(this.databaseService.database.executeSql("DELETE FROM Configurations WHERE Code=?;", [_key]));
                        }
                        
                        return from(this.databaseService.database.executeSql("DELETE FROM Configurations WHERE Code NOT IN (?,?);", ['URL', 'PrintingType']))
                    }),
                    map(deleteResult => 1)
                ).toPromise();
        }


         /**
         * Retrieve the synchronized configurations
         * @constructor
         */
        public async GetAllConfigurations(): Promise<ISetting[] | null> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Configurations", []))),
                     map(selectResult => {
                        const settings: ISetting[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) {
                            const row = selectResult.rows.item(i);
                            settings.push({
                                ...row,
                                Json: row?.Value || ''
                            } as ISetting);
                        }

                        return settings;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of(null);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Customer {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Retrieves a list of simplified customer records (CardCode and CardName)
         * from the local SQLite database using a case-insensitive partial match filter.
         *
         * @param _filterBusinessPartner - A search string used to filter customers by `CardCode` or `CardName`.
         * @returns A promise that resolves with an array of `BusinessPartnerMinified` objects matching the filter.
         *
         * The method prepares a SQL `LIKE` query using uppercase transformation to allow
         * case-insensitive filtering. It returns only basic customer info to minimize payload size.
         */
        public async GetMinifiedCustomers(_filterBusinessPartner: string): Promise<any> {
            const likeFilter = `%${_filterBusinessPartner.toUpperCase()}%`;

            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT CardCode, CardName FROM customers WHERE UPPER(CardCode) LIKE ? OR UPPER(CardName) LIKE ?", [likeFilter, likeFilter])
                    .then((data) => {
                        let list: BusinessPartnerMinified[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            list.push(data.rows.item(i));
                        }
                        return list;
                    });
            });
        }

        /**
         * Indicates if the customers were synchronized
         * @constructor
         */
        public async AreCustomerSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM customers;", [])
                    .then((data) => {
                        if (data && data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } else {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        public async DeleteCustomers(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM customers", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "customers";',
                        []
                    );
                });
            });
        }

        public async AddCustomer(_customer: BusinessPartnersModel): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO customers(CardCode, CardName, Currency, ShipToDef, TaxCode, CreditLine, Balance,
                                               Phone1,
                                               Cellular, E_mail, Discount, PriceListNum, PayTermsCode, BPGroup,
                                               U_MaxDiscBP, U_Lat, U_Lng, ContactPerson,
                                               U_TipoIdentificacion, LicTradNum, U_provincia, U_canton, U_distrito,
                                               U_barrio, U_direccion, SubTipo, CashCustomer, HeaderDiscount,
                                               OTCXCondition)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                                 ?);`,
                        [
                            _customer.CardCode,
                            _customer.CardName,
                            _customer.Currency,
                            _customer.ShipToDef,
                            _customer.TaxCode,
                            _customer.CreditLine,
                            _customer.Balance,
                            _customer.Phone1,
                            _customer.Cellular,
                            _customer.E_mail,
                            _customer.Discount,
                            _customer.PriceListNum,
                            _customer.PayTermsGrpCode,
                            _customer.GroupCode,
                            _customer.U_MaxDiscBP,
                            _customer.U_Lat,
                            _customer.U_Lng,
                            _customer.ContactPerson,
                            _customer.U_TipoIdentificacion,
                            _customer.LicTradNum,
                            _customer.U_provincia,
                            _customer.U_canton,
                            _customer.U_distrito,
                            _customer.U_barrio,
                            _customer.U_direccion,
                            _customer.SubTipo,
                            _customer.CashCustomer ? 1 : 0,
                            _customer.HeaderDiscount,
                            _customer.OTCXCondition
                        ]
                    )
                    .then(() => {
                        response = {result: true, errorInfo: null};
                        return response;
                    })
                    .catch((e) => {
                        console.log(e);
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }

        public async StoreCustomer(_customer: IBusinessPartner): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    `
                        SELECT COUNT(*) as count
                        FROM customers
                        WHERE CardCode = '${_customer.CardCode}';
                    `,
                    [])
                    .then((result) => {
                        if (result.rows.length > 0 && result.rows.item(0).count > 0) {
                            return this.databaseService.database.executeSql(
                                `
                                    UPDATE
                                        customers
                                    SET CardCode             = ?,
                                        CardName             = ?,
                                        Currency             = ?,
                                        ShipToDef            = ?,
                                        TaxCode              = ?,
                                        CreditLine           = ?,
                                        Balance              = ?,
                                        Phone1               = ?,
                                        Cellular             = ?,
                                        E_mail               = ?,
                                        Discount             = ?,
                                        PriceListNum         = ?,
                                        PayTermsCode         = ?,
                                        BPGroup              = ?,
                                        U_MaxDiscBP          = ?,
                                        U_Lat                = ?,
                                        U_Lng                = ?,
                                        ContactPerson        = ?,
                                        U_TipoIdentificacion = ?,
                                        LicTradNum           = ?,
                                        U_provincia          = ?,
                                        U_canton             = ?,
                                        U_distrito           = ?,
                                        U_barrio             = ?,
                                        U_direccion          = ?,
                                        SubTipo              = ?,
                                        CashCustomer         = ?,
                                        HeaderDiscount       = ?,
                                        OTCXCondition        = ?
                                    WHERE CardCode = '${_customer.CardCode}';
                                `,
                                [
                                    _customer.CardCode,
                                    _customer.CardName,
                                    _customer.Currency,
                                    _customer.ShipToDef,
                                    _customer.TaxCode,
                                    _customer.CreditLine,
                                    _customer.Balance,
                                    _customer.Phone1,
                                    _customer.Cellular,
                                    _customer.EMail,
                                    _customer.Discount,
                                    _customer.PriceListNum,
                                    _customer.PayTermsCode,
                                    _customer.BPGroup,
                                    _customer.Discount,
                                    _customer.Lat,
                                    _customer.Lng,
                                    _customer.ContactPerson,
                                    _customer.TipoIdentificacion,
                                    _customer.LicTradNum,
                                    _customer.Provincia,
                                    _customer.Canton,
                                    _customer.Distrito,
                                    _customer.Barrio,
                                    _customer.Direccion,
                                    _customer.SubTipo,
                                    _customer.CashCustomer ? 1 : 0,
                                    _customer.HeaderDiscount,
                                    _customer.OTCXCondition
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        } else {
                            return this.databaseService.database.executeSql(
                                `
                                    INSERT INTO customers(CardCode,
                                                          CardName,
                                                          Currency,
                                                          ShipToDef,
                                                          TaxCode,
                                                          CreditLine,
                                                          Balance,
                                                          Phone1,
                                                          Cellular,
                                                          E_mail,
                                                          Discount,
                                                          PriceListNum,
                                                          PayTermsCode,
                                                          BPGroup,
                                                          U_MaxDiscBP,
                                                          U_Lat,
                                                          U_Lng,
                                                          ContactPerson,
                                                          U_TipoIdentificacion,
                                                          LicTradNum,
                                                          U_provincia,
                                                          U_canton,
                                                          U_distrito,
                                                          U_barrio,
                                                          U_direccion,
                                                          SubTipo,
                                                          CashCustomer,
                                                          HeaderDiscount,
                                                          OTCXCondition)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                                            ?, ?, ?, ?, ?);
                                `,
                                [
                                    _customer.CardCode,
                                    _customer.CardName,
                                    _customer.Currency,
                                    _customer.ShipToDef,
                                    _customer.TaxCode,
                                    _customer.CreditLine,
                                    _customer.Balance,
                                    _customer.Phone1,
                                    _customer.Cellular,
                                    _customer.EMail,
                                    _customer.Discount,
                                    _customer.PriceListNum,
                                    _customer.PayTermsCode,
                                    _customer.BPGroup,
                                    _customer.Discount,
                                    _customer.Lat,
                                    _customer.Lng,
                                    _customer.ContactPerson,
                                    _customer.TipoIdentificacion,
                                    _customer.LicTradNum,
                                    _customer.Provincia,
                                    _customer.Canton,
                                    _customer.Distrito,
                                    _customer.Barrio,
                                    _customer.Direccion,
                                    _customer.SubTipo,
                                    _customer.CashCustomer ? 1 : 0,
                                    _customer.HeaderDiscount,
                                    _customer.OTCXCondition
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        }
                    }).catch((e) => {
                        console.log(e);
                        return null;
                    });
            });
        }

        /**
         * Retrieves a synchronized business partner by his code
         * @param _cardCode The code of the business partner
         * @constructor
         */
        public async GetCustomer(_cardCode: string): Promise<IBusinessPartner | null> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT *, PayTermsCode AS PayTermsGrpCode, E_mail AS Email FROM customers WHERE CardCode=?", [_cardCode]))),
                    map(selectResult => selectResult.rows.item(0)),
                    catchError(error => {
                        console.error(error);
                        return of(null);
                    })
                ).toPromise();
        }

        public async GetCustomers(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT * FROM customers", [])
                    .then((data) => {
                        let lists: BusinessPartnersModel[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    });
            });
        }

        public async UpdateCustomer(customer: CustomerCRUDModel): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `UPDATE customers
                         SET CardName=?,
                             Currency=?,
                             Phone1=?,
                             Cellular=?,
                             E_mail=?,
                             U_MaxDiscBP=?,
                             BPGroup=?,
                             U_Lat=?,
                             U_Lng=?,
                             U_TipoIdentificacion=?,
                             LicTradNum=?,
                             U_provincia=?,
                             U_canton=?,
                             U_distrito=?,
                             U_barrio=?,
                             U_direccion=?
                         WHERE CardCode = ?`,
                        [
                            customer.CardName,
                            customer.Currency,
                            customer.Phone1,
                            customer.Cellular,
                            customer.E_Mail,
                            customer.U_MaxDiscBP,
                            customer.GroupCode,
                            customer.U_lat,
                            customer.U_lng,
                            customer.U_TipoIdentificacion,
                            customer.LicTradNum,
                            customer.U_provincia,
                            customer.U_canton,
                            customer.U_distrito,
                            customer.U_barrio,
                            customer.U_direccion,
                            customer.CardCode,
                        ]
                    )
                    .then((result) => {
                        return result;
                    });
            });
        }

        public async AddBlanketAgreementRecord(_blankAgreement: IBlanketAgreement): Promise<void> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO OOAT(AbsID, RawBlanketAgreement)
                         VALUES (?, ?);`, [_blankAgreement.AbsID, JSON.stringify(_blankAgreement)]).then((result) => {
                        if (result.insertId) {
                            return result.insertId;
                        }
                    }).catch(error => {
                        console.log(error);
                    });
            });
        }

        public async StoreBlanketAgreement(_blankAgreement: IBlanketAgreement): Promise<void> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    `
                        SELECT COUNT(*) as count
                        FROM OOAT
                        WHERE AbsID = ${_blankAgreement.AbsID};
                    `,
                    [])
                    .then((result) => {
                        if (result.rows.length > 0 && result.rows.item(0).count > 0) {
                            return this.databaseService.database.executeSql(
                                `
                                    UPDATE
                                        OOAT
                                    SET AbsID               = ?,
                                        RawBlanketAgreement = ?
                                    WHERE AbsID = ${_blankAgreement.AbsID};
                                `,
                                [
                                    _blankAgreement.AbsID,
                                    JSON.stringify(_blankAgreement)
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        } else {
                            return this.databaseService.database.executeSql(
                                `
                                    INSERT INTO OOAT(AbsID,
                                                     RawBlanketAgreement)
                                    VALUES (?, ?);
                                `,
                                [
                                    _blankAgreement.AbsID,
                                    JSON.stringify(_blankAgreement)
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        }
                    }).catch((e) => {
                        console.log(e);
                        return null;
                    });
            });
        }

        public async DeleteBlanketAgreement(): Promise<void> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("DELETE FROM OOAT", [])
                    .then(() => {
                        return this.databaseService.database.executeSql(
                            'DELETE FROM sqlite_sequence WHERE name = "OOAT";', []);
                    }).catch(err => {
                        console.info(err);
                    });
            });
        }

        /**
         * Retrieves the synchronized blanket agreements
         * @constructor
         */
        public async GetBlanketAgreements(): Promise<IBlanketAgreement[]> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            "SELECT * FROM OOAT", [])
                        .then((data) => {
                            let blanketAgrement: IBlanketAgreement[] = [];
    
                            if (data && data.rows) 
                            {
                                for (let c = 0; c < data.rows.length; c++) 
                                {
                                    blanketAgrement.push(JSON.parse(data.rows.item(c)['RawBlanketAgreement']) as IBlanketAgreement);
                                }
                            }
                            return blanketAgrement;
                            
                        }).catch(error => {
                            console.error(error);
                            return [];
                        });
                });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class DiscountGroup {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async StoreDiscountGroup(discGroup: IDiscountGroup): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    `
                        SELECT COUNT(*) as count
                        FROM DiscountGroups
                        WHERE AbsEntry = ${discGroup.AbsEntry}
                          AND CardCode = '${discGroup.CardCode}'
                          AND BPGroup = ${discGroup.BPGroup}
                          AND ItemCode = '${discGroup.ItemCode}'
                          AND ItemGroup = ${discGroup.ItemGroup};
                    `,
                    [])
                    .then((result) => {
                        if (result.rows.length > 0 && result.rows.item(0).count > 0) {
                            return this.databaseService.database.executeSql(
                                `
                                    UPDATE
                                        DiscountGroups
                                    SET AbsEntry  = ?,
                                        Type      = ?,
                                        CardCode  = ?,
                                        BPGroup   = ?,
                                        ItemCode  = ?,
                                        ItemGroup = ?,
                                        AuxField  = ?,
                                        Discount  = ?
                                    WHERE AbsEntry = ${discGroup.AbsEntry}
                                      AND CardCode = '${discGroup.CardCode}'
                                      AND BPGroup = ${discGroup.BPGroup}
                                      AND ItemCode = '${discGroup.ItemCode}'
                                      AND ItemGroup = ${discGroup.ItemGroup};
                                `,
                                [
                                    discGroup.AbsEntry,
                                    discGroup.Type,
                                    discGroup.CardCode,
                                    discGroup.BPGroup,
                                    discGroup.ItemCode,
                                    discGroup.ItemGroup,
                                    discGroup.AuxField,
                                    discGroup.Discount
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        } else {
                            return this.databaseService.database.executeSql(
                                `
                                    INSERT INTO DiscountGroups(AbsEntry,
                                                               Type,
                                                               CardCode,
                                                               BPGroup,
                                                               ItemCode,
                                                               ItemGroup,
                                                               AuxField,
                                                               Discount)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `,
                                [
                                    discGroup.AbsEntry,
                                    discGroup.Type,
                                    discGroup.CardCode,
                                    discGroup.BPGroup,
                                    discGroup.ItemCode,
                                    discGroup.ItemGroup,
                                    discGroup.AuxField,
                                    discGroup.Discount,
                                ]
                            ).then((result) => {
                                return result.insertId;
                            }).catch((e) => {
                                console.log(e);
                                return null;
                            });
                        }
                    }).catch((e) => {
                        console.log(e);
                        return null;
                    });
            });
        }

        public async AddDiscountGroup(discGroup: IDiscountGroup): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql(
                        "INSERT INTO DiscountGroups (AbsEntry, Type, CardCode, BPGroup, ItemCode, ItemGroup, AuxField, Discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            discGroup.AbsEntry,
                            discGroup.Type,
                            discGroup.CardCode,
                            discGroup.BPGroup,
                            discGroup.ItemCode,
                            discGroup.ItemGroup,
                            discGroup.AuxField,
                            discGroup.Discount,
                        ]
                    )
                    .then(() => {
                        response = {result: true, errorInfo: null};
                        return response;
                    })
                    .catch((e) => {
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }

        public async GetDiscountGroups(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let lists: DiscountGroup[] = [];
                return this.databaseService.database
                    .executeSql("SELECT * FROM DiscountGroups", [])
                    .then((data) => {
                        for (let i = 0; i < data.rows.length; i++) {
                            let disc: DiscountGroup = data.rows.item(i);
                            lists.push(disc);
                        }
                        return lists;
                    })
                    .catch((e) => {
                        console.log(e);
                        return lists;
                    });
            });
        }

        public async DeleteDiscountGroups(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql("DELETE FROM DiscountGroups", [])
                    .then(() => {
                        return this.databaseService.database
                            .executeSql(
                                'DELETE FROM sqlite_sequence WHERE name = "DiscountGroups";',
                                []
                            )
                            .then(() => {
                                response = {result: true, errorInfo: null};
                                return response;
                            });
                    })
                    .catch((e) => {
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class DiscountHierarchy {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Insert a discount hierarchy in the SQL Lite database
         * @param _discHierarchy The discount hierarchy information to insert
         * @constructor
         */
        public async StoreDiscountHierarchy(_discHierarchy: IDiscountHierarchy): Promise<number> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            "INSERT INTO DiscountHierarchies (Type, Hierarchy, Active) VALUES (?, ?, ?)",
                            [_discHierarchy.Type, _discHierarchy.Hierarchy, _discHierarchy.Active]
                        )
                        .then((result) => {
                            return result.insertId;
                        })
                        .catch((e) => {
                            console.error(e);
                            return -1;
                        });
                });
        }

        /**
         * Retrieves all synchronized discount hierarchies
         * @constructor
         */
        public async GetDiscountHierarchies(): Promise<IDiscountHierarchy[]> 
        {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM DiscountHierarchies", [])
                        .then((data) => {
                            let lists: IDiscountHierarchy[] = [];
                            
                            for (let i = 0; i < data.rows.length; i++) 
                            {
                                let disc: IDiscountHierarchy = data.rows.item(i);
                                
                                lists.push(disc);
                            }
                            
                            return lists;
                        })
                        .catch((e) => {
                            console.error(e);
                            return [];
                        });
                });
        }

        public async DeleteDiscHierarchies(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql("DELETE FROM DiscountHierarchies", [])
                    .then(() => {
                        return this.databaseService.database
                            .executeSql(
                                'DELETE FROM sqlite_sequence WHERE name = "DiscountHierarchies";',
                                []
                            )
                            .then(() => {
                                response = {result: true, errorInfo: null};
                                return response;
                            });
                    })
                    .catch((e) => {
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Document {
        constructor(private databaseService: Repository.DatabaseService,
                    private localStorageService: LocalStorageService) {
        }

        /**
         * Save the document information in the SQL Lite database
         * @param _offlineDocument The offline document information to store
         * @constructor
         */
        public StoreDocument(_offlineDocument: IOfflineDocument): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO Documents(
                      RawDocument, 
                      ShouldSend, 
                      DocumentType, 
                      DocumentTotal, 
                      DocumentKey,
                      TransactionStatus, 
                      TransactionDetail, 
                      OfflineDate, 
                      UserAssignId,
                      TransactionType)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                            [_offlineDocument.RawDocument, 
                                _offlineDocument.ShouldSend, 
                                _offlineDocument.DocumentType, 
                                _offlineDocument.DocumentTotal,
                                _offlineDocument.DocumentKey, 
                                DocumentSyncStatus.NotSynchronized, 
                                _offlineDocument.TransactionDetail, 
                                _offlineDocument.OfflineDate, 
                                _offlineDocument.UserAssignId, 
                                _offlineDocument.TransactionType]
                        ))),
                    map(insertResult => insertResult.insertId),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })
                );
        }

        /**
         * Get all offline documents in the SQL Lite database
         * @constructor
         */
        public GetAllDocuments(): Observable<IOfflineDocument[]> 
        {
            let userAssignId = this.localStorageService.get(LocalStorageVariables.UserAssignment).Id;
            
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Documents WHERE UserAssignId=?", [userAssignId]))),
                    map(selectResult => {
                        let documents: IOfflineDocument[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            documents.push(selectResult.rows.item(i));
                        }
                        
                        return documents;
                    })
                );
        }

        /**
         * Update the transaction details of the synchronized documents
         * @param _transactionStatus Status of the transaction result
         * @param _transactionDetail Details of the transaction result
         * @param _documentLocalId Id of the document in the SQL Lite database
         * @constructor
         */
        public UpdateDocumentTransactionStatus(_transactionStatus, _transactionDetail: string, _documentLocalId: number): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("UPDATE Documents SET TransactionStatus = ?, TransactionDetail = ? WHERE Id = ?", [_transactionStatus, _transactionDetail, _documentLocalId]))),
                    map(updateResult => 1)
                );
        }

        /**
         * Get the document types labels to show in the print voucher
         * @constructor
         */
        public async GetDocumentTypeLabels(): Promise<IDocumentTypeLabel[]> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM DocumentTypeLabels", [])
                        .then(data => {
                            let lists: IDocumentTypeLabel[] = [];
                            for (let i = 0; i < data.rows.length; i++) {
                                lists.push(data.rows.item(i));
                            }
                            return lists;
                        });
                });
        }

        /**
         * Indicates if the document types labels are synchronized
         * @constructor
         */
        public async AreDocumentTypeLabelsSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM DocumentTypeLabels", [])
                    .then(data => {
                        if (data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } 
                        else 
                        {
                            return false;
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        return false;
                    });
            });
        }

        public async AddDocumentTypeLabel(_documentTypeLabel: IDocumentTypeLabel): Promise<number> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("INSERT  INTO DocumentTypeLabels(DocType, Label) VALUES (?, ?)", [_documentTypeLabel.DocType, _documentTypeLabel.Label])
                    .then(result => {
                        return result.insertId;
                    });
            });
        }

        public async DeleteDocumentTypeLabels(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("DELETE FROM DocumentTypeLabels", []).then(() => {
                        return this.databaseService.database.executeSql(
                            'DELETE FROM sqlite_sequence WHERE name = "DocumentTypeLabels";',
                            []
                        );
                    });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class ExchangeRate {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Create or update an exchange rate
         * @param _exchangeRate
         * @constructor
         */
        public async UpdateOrInsertExchangeRate(_exchangeRate: IExchangeRate): Promise<number>
        {
            const dateValue = _exchangeRate.date?.toString().split("T")[0] || FormatDate();
            
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`
                        SELECT COUNT(*) as count
                        FROM ExchangeRates
                        WHERE Date = '${dateValue}'
                    `,[]))),
                    concatMap(selectResult => {
                        if (selectResult.rows.length > 0 && selectResult.rows.item(0).count > 0)
                        {
                            return this.UpdateExchangeRate(_exchangeRate);
                        }

                        return this.StoreExchangeRate(_exchangeRate);
                    }),
                    map(result => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Insert the exchange rate in the SQL Lite database
         * @param _exchangeRate The exchange rate information to insert
         * @constructor
         */
        public async StoreExchangeRate(_exchangeRate: IExchangeRate): Promise<any> {
            const dateValue = _exchangeRate.date?.toString().split("T")[0]  ||  FormatDate();
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO ExchangeRates(Date, Rate) VALUES (?, ?);`, [dateValue, _exchangeRate.Rate]))),
                    map(insertResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Update an existing exchange Rate in the SQL Lite database
         * @param _exchangeRate The new exchangeRate information
         * @constructor
         */
        public UpdateExchangeRate(_exchangeRate: IExchangeRate): Observable<number> {
            const dateValue = _exchangeRate.date?.toString().split("T")[0]  ||  FormatDate();
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                        `
                                    UPDATE ExchangeRates
                                    SET Rate = ?
                                    WHERE Date = '${dateValue}';
                                `,
                        [
                            _exchangeRate.Rate
                        ]
                    ))),
                    map(updateResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Retrieves the exchange rate from SQL Lite database
         * @constructor
         */
        public async GetExchangeRate(): Promise<IExchangeRate> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM ExchangeRates WHERE Date = DATE(DATETIME('now', '-6 hours')) ORDER BY Date DESC LIMIT 1", []))),
                    map(selectResult => selectResult.rows.item(0)),
                    catchError(error => {
                        console.error(error);
                        return of(null);
                    })
                ).toPromise();
        }

        /**
         * Indicates if the exchange rate was synchronized
         * @constructor
         */
        public async AreExchangeRateSynchronized(): Promise<boolean> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM ExchangeRates WHERE Date = DATE(DATETIME('now', '-6 hours'))", []))),
                    map(selectResult => selectResult.rows.length > 0),
                    catchError(error => {
                        console.error(error);
                        return of(false);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class GeoConfiguration {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async AddGeoConfiguration(config: IGeoConfig, userMappId: number): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        "INSERT INTO GeoConfigs(Name, Key, UserMappId) VALUES(?, ?, ?);",
                        [config.Name, config.Key, userMappId]
                    )
                    .then((result) => {
                        return result ? (result.insertId ? result.insertId : null) : null;
                    });
            });
        }

        /**
         * Retrieves all synchronized geo configurations
         * @constructor
         */
        public async GetGeoConfigurations(): Promise<IGeoConfig[]> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM GeoConfigs", [])
                        .then((data) => {
                            let lists: IGeoConfig[] = [];
                            
                            for (let i = 0; i < data.rows.length; i++) 
                            {
                                lists.push(data.rows.item(i));
                            }
                            return lists;
                        });
                });
        }

        public async DeleteGeoConfigurations(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(`DELETE
                                                                 FROM GeoConfigs`, []).then(() => {
                    return this.databaseService.database
                        .executeSql(
                            'DELETE FROM sqlite_sequence WHERE name = "GeoConfigs";',
                            []
                        )
                        .catch((e) => console.log(e));
                });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class MeasurementUnit {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async AddMeasurementUnit(_mesurmentUnit: IMeasurementUnit): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql(
                        "INSERT INTO MeasurementUnits (UgpEntry, GroupCode, GroupName, UoMEntry, UoMCode, MeasureUnit, BaseQty) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [
                            _mesurmentUnit.UgpEntry,
                            _mesurmentUnit.GroupCode,
                            _mesurmentUnit.GroupName,
                            _mesurmentUnit.UoMEntry,
                            _mesurmentUnit.UoMCode,
                            _mesurmentUnit.MeasureUnit,
                            _mesurmentUnit.BaseQty,
                        ]
                    )
                    .then(() => {
                        response = {result: true, errorInfo: null};
                        return response;
                    })
                    .catch((e) => {
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }

        public async DeleteMeasurementUnits(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let response: IBaseReponse;
                return this.databaseService.database
                    .executeSql("DELETE FROM MeasurementUnits", [])
                    .then(() => {
                        return this.databaseService.database
                            .executeSql(
                                'DELETE FROM sqlite_sequence WHERE name = "MeasurementUnits";',
                                []
                            )
                            .then(() => {
                                response = {result: true, errorInfo: null};
                                return response;
                            });
                    })
                    .catch((e) => {
                        response = {result: false, errorInfo: {Code: -1, Message: e}};
                        return response;
                    });
            });
        }

        /**
         * Retrieves all synchronized measurement units
         * @constructor
         */
        public async GetMeasurementUnits(): Promise<IMeasurementUnit[]>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM MeasurementUnits", []))),
                    map(selectResult => {
                        let lists: IMeasurementUnit[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++)
                        {
                            let serie: IMeasurementUnit = selectResult.rows.item(i);

                            lists.push(serie);
                        }

                        return lists;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Retrieves all measurement units of an specific group
         * @param _ugpEntry The code of the group of measurement units
         * @constructor
         */
        public async GetMeasurementUnitsByGroup(_ugpEntry: number): Promise<IMeasurementUnit[]>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM MeasurementUnits WHERE UgpEntry=?", [_ugpEntry]))),
                    map(selectResult => {
                        let lists: IMeasurementUnit[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++)
                        {
                            let serie: IMeasurementUnit = selectResult.rows.item(i);

                            lists.push(serie);
                        }

                        return lists;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Permission {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Delete all permissions from SQL Lite database
         * @constructor
         */
        public async DeletePermission(): Promise<any> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM Permissions", []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "Permissions";',[]))),
                    map(resetSequenceResult => 1)
                ).toPromise();
        }

        /**
         * Insert a permission in the SQL Lite database
         * @param _permission The permission information to insert
         * @constructor
         */
        public async StorePermission(_permission: IPermission): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO Permissions(PermissionType, Name, Description) VALUES (?,?,?);`,
                            [_permission.PermissionType, _permission.Name, _permission.Description]
                        ))),
                    map(insertResult => 1)
                ).toPromise();
        }

        /**
         * Retrieves all permission from SQL Lite database
         * @constructor
         */
        public async GetPermissions(): Promise<IPermission[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Permissions", []))),
                    map(selectResult => {
                        let lists: IPermission[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            lists.push(selectResult.rows.item(i));
                        }
                        return lists;
                    }),
                    catchError(err => {
                        console.error(err);
                        return of([]);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class PriceList {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Indicates if the price list are synchronized
         * @constructor
         */
        public async ArePriceListsSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM PriceList;", [])
                    .then((data) => {
                        if (data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } 
                        else 
                        {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Retrieves all synchronized price lists
         * @constructor
         */
        public async GetPriceLists(): Promise<IPriceList[]> {
            
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM PriceList;", []))),
                    map(selectResult => {
                        let priceLists: IPriceList[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            priceLists.push(selectResult.rows.item(i));
                        }
                        
                        return priceLists;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Retrieves all price lists of an specific item
         * @param _itemCode The code of the item to retrieve the price lists
         * @constructor
         */
        public async GetPriceListsByItem(_itemCode: string): Promise<IPriceList[]> {

            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM PriceList WHERE ItemCode=?;", [_itemCode]))),
                    map(selectResult => {
                        let priceLists: IPriceList[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++)
                        {
                            priceLists.push(selectResult.rows.item(i));
                        }

                        return priceLists;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Insert a price list in the SQL Lite database
         * @param _priceList The price list information to insert
         * @constructor
         */
        public StorePriceList(_priceList: IPriceList): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO PriceList(ItemCode, Price, PriceList, Currency, UomEntry) VALUES (?, ?, ?, ?, ?);`,
                        [_priceList.ItemCode, _priceList.Price, _priceList.PriceList, _priceList.Currency, _priceList.UomEntry]))),
                    map(insertResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Updates the information of an existing price list in the SQL Lite database
         * @param _priceList The new price list information
         * @constructor
         */
        public UpdatePriceList(_priceList: IPriceList): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`
                                    UPDATE PriceList
                                    SET ItemCode  = ?,
                                        Price     = ?,
                                        PriceList = ?,
                                        Currency  = ?,
                                        UomEntry  = ?
                                    WHERE ItemCode = '${_priceList.ItemCode}'
                                      AND PriceList = ${_priceList.PriceList}
                                      AND UomEntry = ${_priceList.UomEntry};
                                `,
                        [_priceList.ItemCode, _priceList.Price, _priceList.PriceList, _priceList.Currency, _priceList.UomEntry]
                    ))),
                    map(updateResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Insert or update a price list in the SQL Lite database
         * @param _priceList The price list to insert or update
         * @constructor
         */
        public async UpdateOrInsertPriceList(_priceList: IPriceList): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`
                        SELECT COUNT(*) as count
                        FROM PriceList
                        WHERE ItemCode = '${_priceList.ItemCode}'
                          AND PriceList = ${_priceList.PriceList}
                          AND UomEntry = ${_priceList.UomEntry};
                    `,[]))),
                    concatMap(selectResult => {
                        if (selectResult.rows.length > 0 && selectResult.rows.item(0).count > 0) 
                        {
                            return this.UpdatePriceList(_priceList);
                        }
                        
                        return this.StorePriceList(_priceList);
                    }),
                    map(result => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Delete all synchronized price lists
         * @constructor
         */
        public async DeletePriceLists(): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM PriceList", []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "PriceList";',[]))),
                    map(resetSequenceResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Indicates if the price lists information is synchronized
         * @constructor
         */
        public async ArePriceListsInformationSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM PriceListInfo;", [])
                    .then((data) => {
                        if (data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } 
                        else 
                        {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Retrieve a single price list information
         * @param _priceListNum The list number to retrieve the information
         * @constructor
         */
        public async GetPriceListInfo(_priceListNum: number): Promise<IPriceListInfo>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`SELECT * FROM PriceListInfo WHERE ListNum=?`, [_priceListNum]))),
                    map(selectResult => {
                        return selectResult.rows.item(0);
                    }),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })
                ).toPromise();
        }

        /**
         * Retrieves all synchronized price lists information
         * @constructor
         */
        public async GetPriceListsInfo(): Promise<IPriceListInfo[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`SELECT * FROM PriceListInfo`, []))),
                    map(selectResult => {
                        let priceListsInfo: IPriceListInfo[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            priceListsInfo.push(selectResult.rows.item(i));
                        }
                        
                        return priceListsInfo;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Save price list information in the SQL Lite database
         * @param ListName Price list name
         * @param ListNum Price list number
         * @param BaseNum Price list base num
         * @param Factor Price list factor
         * @param GroupCode Price list group code
         * @param PrimCurr Price list currency
         * @constructor
         */
        public async StorePriceListsInformation(ListName: string, ListNum: number, BaseNum: number, Factor: number, GroupCode: number, PrimCurr: string): Promise<number> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO PriceListInfo(ListName, ListNum, BaseNum, Factor, GroupCode, PrimCurr)
                         VALUES (?, ?, ?, ?, ?, ?);`,
                        [ListName, ListNum, BaseNum, Factor, GroupCode, PrimCurr]
                    )
                    .then((result) => {
                        return result.insertId;
                    })
                    .catch(error => {
                        console.error(error);
                        return -1;
                    });
            });
        }

        /**
         * Insert or update an price list info depending if already exist in the SQL Lite database
         * @param _product The product information to update or insert
         * @constructor
         */
        public async UpdateOrCreatPriceListsInfo(_priceListInfo: IPriceListInfo): Promise<any> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`SELECT COUNT(*) as count FROM PriceListInfo WHERE ListNum = '${_priceListInfo.ListNum}';`,[]))),
                    concatMap(selectResult => {
                        if(selectResult.rows.length > 0 && selectResult.rows.item(0).count > 0)
                        {
                            return this.UpdatePriceListsInfo(_priceListInfo);
                        }
                        return this.StorePriceListsInformation(_priceListInfo.ListName, _priceListInfo.ListNum, _priceListInfo.BaseNum, _priceListInfo.Factor, _priceListInfo.GroupCode, _priceListInfo.PrimCurr);
                    })
                ).toPromise();
        }

        /**
         * Update an existing Price List Info in the SQL Lite database
         * @param _product The new product information
         * @constructor
         */
        public UpdatePriceListsInfo(_priceListInfo: IPriceListInfo): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                        `
                                    UPDATE PriceListInfo
                                    SET ListName = ?,
                                        BaseNum = ?,
                                        Factor = ?,
                                        GroupCode = ?,
                                        PrimCurr = ?
                                    WHERE ListNum = '${_priceListInfo.ListNum}';
                                `,
                        [
                            _priceListInfo.ListName,
                            _priceListInfo.BaseNum,
                            _priceListInfo.Factor,
                            _priceListInfo.GroupCode,
                            _priceListInfo.PrimCurr
                        ]
                    ))),
                    map(updateResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Delete content from price lists info
         * @constructor
         */
        public async DeletePriceListsInfo(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM PriceListInfo", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "PriceListInfo";',
                        []
                    );
                });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Product {
        constructor(private databaseService: Repository.DatabaseService,
                    private repositoryTax: Repository.Tax,
                    private repositoryCustomer: Repository.Customer,
                    private repositoryMUnits: Repository.MeasurementUnit,
                    private repositoryPrices: Repository.PriceList,
                    private repositoryCurrencies: Repository.Currency,
                    private repositoryExchangeRate: Repository.ExchangeRate,
                    private repositoryCompany: Repository.Company,
                    private calculationService: CalculationService
                    ) {
        }

        /**
         * Indicates if the products were synchronized
         * @constructor
         */
        public async AreProductsSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(`SELECT COUNT(*) as count FROM Products;`, [])
                    .then((data) => {
                        if (data.rows.length > 0) 
                        {
                            return data.rows.item(0).count > 0;
                        } else {
                            return false;
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Delete all synchronized products
         * @constructor
         */
        public async DeleteProducts(): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`DELETE FROM Products`, []))),
                    concatMap(deleteResult => this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "Products";', [])),
                    map(resetSequenceResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Save a product in the SQL Lite database
         * @param _product The product information to save
         * @constructor
         */
        public StoreProduct(_product: IItem): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database
                        .executeSql(
                            `INSERT INTO Products(
                     ItemCode, 
                     ItemName, 
                     TaxCode, 
                     MaxDiscount, 
                     ShortDescription, 
                     GroupCode,
                     UgpEntry,
                     UoMEntry, 
                     PriceUnit, 
                     Family, 
                     Freight,
                     AllowUnits,
                     VATLiable,
                     OTCXCondition,
                     EvalSystem,
                     ManBtchNum,
                     ManSerNum,
                     TreeType)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
                            [
                                _product.ItemCode,
                                _product.ItemName,
                                _product.TaxCode,
                                _product.MaxDiscount,
                                _product.ShortDescription,
                                _product.GroupCode,
                                _product.UgpEntry,
                                _product.UoMEntry,
                                _product.PriceUnit,
                                _product.Family,
                                +_product.Freight,
                                _product.AllowUnits,
                                +_product.VATLiable,
                                _product.OTCXCondition,
                                _product.EvalSystem,
                                _product.ManBtchNum,
                                _product.ManSerNum,
                                _product.TreeType ?? ''
                            ]
                        ))
                    ),
                    map(insertResult => 1),
                    catchError(err => {
                        console.error(err);
                        return of(-1);
                    })
                );
        }

        /**
         * Retrieves all items with his basic information
         * @constructor
         */
        public async GetMinifiedItems(_itemCode: string = ""): Promise<IItem[]> 
        {
            const likeFilter = `%${_itemCode.toUpperCase()}%`;

            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(
                        this.databaseService.database
                        .executeSql("SELECT ItemCode,ItemName,ManBtchNum,ManSerNum FROM Products  WHERE UPPER(ItemCode) LIKE ? OR UPPER(ItemName) LIKE ?",
                             [likeFilter, likeFilter]))),
                    map(selectResult => {
                        let products: IItem[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            products.push(selectResult.rows.item(i));
                        }
                        
                        return products;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Retrieve a synchronized product by his code
         * @param _itemCode The item code of the product to retrieve
         * @constructor
         */
        public async GetItem(_itemCode: string, _cardCode: string, _priceList: number): Promise<IItem> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => this.databaseService.database.executeSql("SELECT * FROM Products where ItemCode=?", [_itemCode])),
                    concatMap(selectResult => {
                        if (selectResult.rows.length === 0) {
                            return of(null); 
                        }
                        const item = { ...selectResult.rows.item(0) } as IItem;

                        return forkJoin({
                            Prices: from(this.repositoryPrices.GetPriceListsByItem(item.ItemCode)),
                            Currencies: from(this.repositoryCurrencies.GetCurrencies()),
                            ExchangeRate: from(this.repositoryExchangeRate.GetExchangeRate()),
                            BusinessPartner: from(this.repositoryCustomer.GetCustomer(_cardCode)),
                            MeasurementUnit: from(this.repositoryMUnits.GetMeasurementUnitsByGroup(item.UgpEntry)),
                            CompanyInformation: from(this.repositoryCompany.GetCompanyInformation()),
                            TaxCodeDeterminations: from(this.repositoryTax.GetTaxCodeDeterminations()),
                            Item: of(item)
                        });
                    }),
                    concatMap(results => {
                        if (!results) return of(null);

                        if(results.Item.TreeType == 'S')
                        {
                            return this.GetBillOfMaterials(results.Item.ItemCode)
                                .pipe(
                                    map(billOfMaterials => {
                                        if(billOfMaterials && billOfMaterials.length)
                                        {
                                            results.Item.BillOfMaterial = billOfMaterials as IBillOfMaterial[];
                                        }

                                        return results;
                                    })
                                );
                        }
                        
                        return of(results);
                    }),
                    map(results => {
                        if (!results) return null;

                        if(results.Prices && results.Prices.length)
                        {
                            let calculatedPrice: ICalculatedPrice = this.calculationService.CalculateItemPrice(results.Item, results.Prices, results.MeasurementUnit, _priceList, results.CompanyInformation.LinePriceDecimals);

                            let isLocalCurrency: boolean = results.Currencies.find(curr => curr.Id === calculatedPrice.Currency)?.IsLocal ?? false;

                            results.Item.UnitPrice =  this.calculationService.RoundTo(isLocalCurrency ? calculatedPrice.Price : (results.ExchangeRate.Rate * calculatedPrice.Price), results.CompanyInformation.LinePriceDecimals);
                        }

                        results.Item.UoMMasterData = [];

                        results.MeasurementUnit.forEach(mUnit =>
                        {
                            let calculatedPrice: ICalculatedPrice = this.calculationService.CalculateMeasurementUnitPrice(results.Prices, mUnit, results.CompanyInformation.LinePriceDecimals);

                            let isLocalCurrency: boolean = results.Currencies.find(curr => curr.Id === calculatedPrice.Currency)?.IsLocal ?? false;

                            results.Item.UoMMasterData.push({
                                UomCode: mUnit.UoMCode,
                                UoMEntry: mUnit.UoMEntry,
                                UomName: mUnit.MeasureUnit,
                                UnitPrice: this.calculationService.RoundTo(isLocalCurrency ? calculatedPrice.Price : (results.ExchangeRate.Rate * calculatedPrice.Price), results.CompanyInformation.LinePriceDecimals),
                                UnitPriceFC: this.calculationService.RoundTo(isLocalCurrency ? (calculatedPrice.Price / results.ExchangeRate.Rate) : calculatedPrice.Price, results.CompanyInformation.LinePriceDecimals)
                            })
                        });

                        const IC = JSON.parse(results?.Item?.OTCXCondition || null) as IOTCXValidator; // IC ITEM CONDITION

                        const BPC = JSON.parse(results?.BusinessPartner?.OTCXCondition || null) as IOTCXValidator; // BPC BUSINESS PARTNER CONDITION

                        let otcxRecord = results?.TaxCodeDeterminations.find(
                            x => x.Cond1 == BPC?.Condition && x.UDFTable1 == BPC?.UDFTable && x.UDFAlias1 == BPC?.UDFAlias && x.StrVal1 == BPC?.StrVal &&
                                x.Cond2 == IC?.Condition && x.UDFTable2 == IC?.UDFTable && x.UDFAlias2 == IC?.UDFAlias && x.StrVal2 == IC?.StrVal
                        );

                        if (!otcxRecord)
                        {
                            otcxRecord = results.TaxCodeDeterminations.find(
                                x => x.Cond2 == BPC.Condition && x.UDFTable2 == BPC.UDFTable && x.UDFAlias2 == BPC.UDFAlias && x.StrVal2 == BPC.StrVal &&
                                    x.Cond1 == IC.Condition && x.UDFTable1 == IC.UDFTable && x.UDFAlias1 == IC.UDFAlias && x.StrVal1 == IC.StrVal
                            );
                        }

                        if (!otcxRecord)
                        {
                            otcxRecord = results.TaxCodeDeterminations.find(
                                x => x.Cond1 == BPC.Condition && x.UDFTable1 == BPC.UDFTable && x.UDFAlias1 == BPC.UDFAlias && x.StrVal1 == BPC.StrVal &&
                                    !x.Cond2 && !x.UDFTable2 && !x.UDFAlias2 && !x.StrVal2
                            );
                        }

                        if (!otcxRecord) 
                        {
                            otcxRecord = results.TaxCodeDeterminations.find(
                                x => x.Cond1 == IC.Condition && x.UDFTable1 == IC.UDFTable && x.UDFAlias1 == IC.UDFAlias && x.StrVal1 == IC.StrVal &&
                                    !x.Cond2 && !x.UDFTable2 && !x.UDFAlias2 && !x.StrVal2
                            );
                        }

                        if (otcxRecord) 
                        {
                            results.Item.TaxCode = otcxRecord.LnTaxCode;
                        }
                        
                        if(!results.Item.TaxCode)
                        {
                            results.Item.TaxCode = '';
                        }

                        return results.Item;
                    }),
                    catchError(err => {
                        console.error(err);
                        return throwError(err);
                    })
                ).toPromise();
        }
        public async GetProductPrices(ItemCode: string, listNum: number, cardCode: string): Promise<any> {
            return this.databaseService.Ready().then(() => {
                let prices: IProductPrice[] = [];
                return this.databaseService.database
                    .executeSql(
                        "SELECT * FROM priceList WHERE PriceList=? AND ItemCode=?",
                        [listNum, ItemCode]
                    )
                    .then((data) => {
                        if (data.rows.length > 0) {
                            for (let i = 0; i < data.rows.length; i++) {
                                prices.push({...data.rows.item(i)});
                            }

                            return prices;
                        } else {
                            return null;
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                        return null;
                    });
            });
        }

        /**
         * Insert or update an item depending if already exist in the SQL Lite database
         * @param _product The product information to update or insert
         * @constructor
         */
        public async UpdateOrCreateProduct(_product: IItem): Promise<any> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`SELECT COUNT(*) as count FROM Products WHERE ItemCode = '${_product.ItemCode}';`,[]))),
                    concatMap(selectResult => {
                        if(selectResult.rows.length > 0 && selectResult.rows.item(0).count > 0)
                        {
                            return this.UpdateProduct(_product);
                        }
                        
                        return this.StoreProduct(_product);
                    })
                ).toPromise();
        }

        /**
         * Update an existing product in the SQL Lite database
         * @param _product The new product information
         * @constructor
         */
        public UpdateProduct(_product: IItem): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                        `
                                    UPDATE Products
                                    SET ItemName         = ?,
                                        TaxCode          = ?,
                                        MaxDiscount     = ?,
                                        ShortDescription = ?,
                                        GroupCode        = ?,
                                        Family           = ?,
                                        UgpEntry         = ?,
                                        UoMEntry        = ?,
                                        PriceUnit        = ?,
                                        Freight          = ?,
                                        AllowUnits       = ?,
                                        VATLiable        = ?,
                                        OTCXCondition    = ?,
                                        EvalSystem       = ?,
                                        ManBtchNum       = ?,
                                        ManSerNum        = ?,
                                        TreeType         = ?
                                    WHERE ItemCode = '${_product.ItemCode}';
                                `,
                        [
                            _product.ItemName,
                            _product.TaxCode,
                            _product.MaxDiscount,
                            _product.ShortDescription,
                            _product.GroupCode,
                            _product.Family,
                            _product.UgpEntry,
                            _product.UoMEntry,
                            _product.PriceUnit,
                            +_product.Freight,
                            _product.AllowUnits,
                            +_product.VATLiable,
                            _product.OTCXCondition,
                            _product.EvalSystem,
                            _product.ManBtchNum,
                            _product.ManSerNum,
                            _product.TreeType ?? ''
                        ]
                    ))),
                    map(updateResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Retrieves all child items of the specified item if it has a bill of materials
         * @param _itemCode The parent item code
         * @constructor
         */
        public GetBillOfMaterials(_itemCode: string): Observable<IItem[]>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT ItemCode, Quantity FROM BillOfMaterials WHERE FatherCode=?", [_itemCode]))),
                    concatMap(selectResult => {
                        let childItem: IBillOfMaterialToSync[] = [];
                        
                        for(let i = 0; i < selectResult.rows.length; i++)
                        {
                            childItem.push(selectResult.rows.item(i));
                        }
                        
                        return from(childItem);
                    }),
                    concatMap(childItem => from(this.databaseService.database.executeSql("SELECT * FROM Products WHERE ItemCode=?", [childItem.ItemCode]))
                        .pipe(
                            map(selectResult => ({
                                ...(selectResult.rows.item(0) as IItem),
                                Quantity: childItem.Quantity
                            }))
                        )
                    ),
                    toArray()
                );
        }

        /**
         * Store the information of the bill of material in the SQL Lite database
         * @param _billOfMaterialInfo The bill of material information to store
         * @constructor
         */
        StoreBillOfMaterialInformation(_billOfMaterialInfo: IBillOfMaterialToSync): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("INSERT INTO BillOfMaterials (FatherCode, ItemCode, Quantity) VALUES (?,?,?)", 
                        [_billOfMaterialInfo.FatherCode, _billOfMaterialInfo.ItemCode, _billOfMaterialInfo.Quantity]))
                    ),
                    map(insertResult => 1)
                );
        }

        /**
         * Insert or update an BillOfMaterial depending if already exist in the SQL Lite database
         * @param _billOfMaterialInfo The BillOfMaterial information to update or insert
         * @constructor
         */
        public async UpdateOrCreateBillOfMaterials(_billOfMaterialInfo: IBillOfMaterialToSync): Promise<any> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`SELECT COUNT(*) as count FROM BillOfMaterials WHERE ItemCode = '${_billOfMaterialInfo.ItemCode}' AND FatherCode = '${_billOfMaterialInfo.FatherCode}';`,[]))),
                    concatMap(selectResult => {
                        if(selectResult.rows.length > 0 && selectResult.rows.item(0).count > 0)
                        {
                            return this.UpdateBillOfMaterial(_billOfMaterialInfo);
                        }

                        return this.StoreBillOfMaterialInformation(_billOfMaterialInfo);
                    })
                ).toPromise();
        }

        /**
         * Update an existing BillOfMaterial in the SQL Lite database
         * @param _billOfMaterialInfo The new BillOfMaterial information
         * @constructor
         */
        public UpdateBillOfMaterial(_billOfMaterialInfo: IBillOfMaterialToSync): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                        `
                                    UPDATE BillOfMaterials
                                    SET Quantity = ?
                                    WHERE ItemCode = '${_billOfMaterialInfo.ItemCode}' AND FatherCode = '${_billOfMaterialInfo.FatherCode}';
                                `,
                        [
                            _billOfMaterialInfo.Quantity
                        ]
                    ))),
                    map(updateResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                );
        }

        /**
         * Delete all bill of materials from SQL Lite database
         * @constructor
         */
        DeleteBillOfMaterials(): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM BillOfMaterials", []))),
                    map(deleteResult => 1)
                );
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Promotion {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async AddPromotion(
            Rule: string,
            Quantity: number,
            UnitMeasurement: string,
            ItemCode: string,
            Discount: number,
            DiscountType: number,
            Sequence: number,
            UseDescripPromo: boolean,
            DescripPromo: string,
            CompanyId: number
        ): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO promotions(Rule, Quantity, UnitMeasurement, ItemCode, Discount, DiscountType,
                                                Sequence, UseDescripPromo, DescripPromo, CompanyId)
                         VALUES ('${Rule}', '${Quantity}', '${UnitMeasurement}', '${ItemCode}', '${Discount}',
                                 '${DiscountType}', '${Sequence}', '${UseDescripPromo}', '${DescripPromo}',
                                 '${CompanyId}');`,
                        []
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async GetPromotions(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT * FROM promotions", [])
                    .then((data) => {
                        let lists: PromotionsModel[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    });
            });
        }

        public async GetPromotionByItemCode(ItemCode: string): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `SELECT *
                         FROM promotions
                         WHERE ItemCode = '${ItemCode}'`,
                        []
                    )
                    .then((data) => {
                        let lists: PromotionsModel[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    });
            });
        }

        public async DeletePromotions(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM promotions", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "promotions";',
                        []
                    );
                });
            });
        }

        public async CountPromotions(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM promotions", [])
                    .then((data) => {
                        if (data.rows.length > 0) {
                            return data.rows.item(0).count;
                        } else {
                            return null;
                        }
                    })
                    .catch((e) => console.log(e));
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Route {
        
        onRouteClosed$: Subject<IRoute> = new Subject<IRoute>();
        
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Store a route and route lines in the SQL Lite database
         * @param _routeInfo The route information to store
         * @constructor
         */
        public async SaveRoute(_routeInfo: IRouteWithLines): Promise<number> 
        {
            await this.databaseService.Ready();

            const exists = await this.databaseService.database.executeSql(
                'SELECT 1 FROM Routes WHERE Id = ? LIMIT 1',
                [_routeInfo.Route.Id]
            );

            if (exists.rows.length > 0) {
                return this.UpdateRoute(_routeInfo);
            } else {
                return this.StoreRoute(_routeInfo);
            }
        }

        /**
         * Store a route and route lines in the SQL Lite database
         * @param _routeInfo The route information to store
         * @constructor
         */
        public async StoreRoute(_routeInfo: IRouteWithLines): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`INSERT INTO Routes 
                        (Name, 
                         ExpirationDate, 
                         Status,
                         Type,
                         TotalDistance,
                         TotalDuration,
                         CloseDetail,
                         CloseUser,
                         CloseDate,
                         TotalEstimatedDistance,
                         TotalEstimatedDuration,
                         Id,
                         CreatedDate,
                         CreatedBy,
                         UpdateDate,
                         UpdatedBy,
                         DownloadDate)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`, 
                        [
                            _routeInfo.Route.Name,
                            _routeInfo.Route.ExpirationDate,
                            RouteStatus.NotStarted,
                            _routeInfo.Route.Type,
                            _routeInfo.Route.TotalDistance,
                            _routeInfo.Route.TotalDuration,
                            _routeInfo.Route.CloseDetail,
                            _routeInfo.Route.CloseUser,
                            _routeInfo.Route.CloseDate,
                            _routeInfo.Route.TotalEstimatedDistance,
                            _routeInfo.Route.TotalEstimatedDuration,
                            _routeInfo.Route.Id,
                            _routeInfo.Route.CreatedDate,
                            _routeInfo.Route.CreatedBy,
                            _routeInfo.Route.UpdateDate,
                            _routeInfo.Route.UpdatedBy,
                            new Date()
                        ]))),
                    concatMap(insertResult => of(..._routeInfo.RouteLines)),
                    concatMap(routeLine => this.StoreRouteLine(routeLine))
                ).toPromise();
        }

        /**
         * Update a route and route lines in the SQL Lite database
         * @param _routeInfo The route information to update
         * @constructor
         */
        public async UpdateRoute(_routeInfo: IRouteWithLines): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => this.DeleteRouteLines(_routeInfo.Route.Id)),
                    concatMap(() => from(this.databaseService.database.executeSql(`UPDATE Routes SET
                        Name = ?, 
                        ExpirationDate = ?, 
                        Status = ?,
                        Type = ?,
                        TotalDistance = ?,
                        TotalDuration = ?,
                        CloseDetail = ?,
                        CloseUser = ?,
                        CloseDate = ?,
                        TotalEstimatedDistance = ?,
                        TotalEstimatedDuration = ?,
                        CreatedDate = ?,
                        CreatedBy = ?,
                        UpdateDate = ?,
                        UpdatedBy = ?,
                        DownloadDate = ? 
                        WHERE Id = ?;`, 
                        [
                            _routeInfo.Route.Name,
                            _routeInfo.Route.ExpirationDate,
                            _routeInfo.Route.Status,
                            _routeInfo.Route.Type,
                            _routeInfo.Route.TotalDistance,
                            _routeInfo.Route.TotalDuration,
                            _routeInfo.Route.CloseDetail,
                            _routeInfo.Route.CloseUser,
                            _routeInfo.Route.CloseDate,
                            _routeInfo.Route.TotalEstimatedDistance,
                            _routeInfo.Route.TotalEstimatedDuration,
                            _routeInfo.Route.CreatedDate,
                            _routeInfo.Route.CreatedBy,
                            _routeInfo.Route.UpdateDate,
                            _routeInfo.Route.UpdatedBy,
                            new Date(),
                            _routeInfo.Route.Id
                        ]))),
                    concatMap(updateResult => of(..._routeInfo.RouteLines)),
                    concatMap(routeLine => this.StoreRouteLine(routeLine))
                ).toPromise();
        }

        /**
         * Retrieves all routes from SQL Lite database
         * @constructor
         */
        public async GetRoutes(): Promise<IRouteWithLines[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Routes", []))),
                    map(selectResult => {
                        let routes: IRoute[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            routes.push(selectResult.rows.item(i));
                        }
                        
                        return routes;
                    }),
                    concatMap(routes => of(...routes)),
                    concatMap(route => this.GetRouteLines(route.Id)
                        .pipe(
                            map(routeLines => ({Route: route, RouteLines: routeLines} as IRouteWithLines))
                        )),
                    toArray(),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }

        /**
         * Delete all routes and lines from SQL Lite database
         * @constructor
         */
        public DeleteDueRoutes(): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT Id FROM Routes WHERE DATE(DownloadDate) < DATE(DATETIME('now', '-6 hours'))", []))
                        .pipe(
                            map(selectResult => {
                                let ids: number[] = [];
                                
                                for (let i = 0; i < selectResult.rows.length; i++)
                                {
                                    ids.push(selectResult.rows.item(i).Id);
                                }

                                return ids;
                            })
                        )),
                    map(routesIds => routesIds.length ? routesIds : [0]),
                    concatMap((routesIds) => from(this.databaseService.database.executeSql("DELETE FROM Routes WHERE Id IN (?)", [routesIds.join(',')]))
                            .pipe(
                                map(deleteResult => routesIds)
                            )
                    ),
                    concatMap((routesIds) => from(this.databaseService.database.executeSql("DELETE FROM RoutesLines WHERE RouteId IN (?)", [routesIds.join(',')]))),
                    concatMap(deleteResult => from(this.AreRoutesSynchronized())
                        .pipe(
                            concatMap(areRoutesSynchronized => {
                                if(areRoutesSynchronized)
                                {
                                    return of(1);
                                }
                                
                                return forkJoin([
                                    from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name="Routes"', [])),
                                    from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name="RoutesLines"', []))
                                ]);
                            })
                        )
                    ),
                    map(result => 1)
                );
        }

        
        /**
         * Delete the specified route and lines from SQL Lite database
         * @param _routeId The route id to delete
         * @constructor
         */
        public async DeleteRoute(_routeId: number): Promise<any> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM Routes WHERE Id=?", [_routeId]))),
                    concatMap(deleteResult => this.DeleteRouteLines(_routeId)),
                    map(resetSequenceResult => 1)
                );
        }

        /**
         * Indicates if the routes are synchronized
         * @constructor
         */
        public async AreRoutesSynchronized(): Promise<boolean> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT COUNT(*) as count FROM Routes", []))),
                    map(selectResult => selectResult.rows.length > 0),
                    catchError(error => {
                        console.error(error);
                        return of(false);
                    })
                ).toPromise();
        }

        /**
         * Get the current active route in the SQL Lite database
         * @constructor
         */
        public GetActiveRoute(): Observable<IRouteWithLines | null> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql('SELECT * FROM Routes WHERE Status=? LIMIT 1', [RouteStatus.Active]))),
                    map(selectResult => (selectResult.rows.item(0) as IRoute)),
                    concatMap(route => {
                        if(route)
                        {
                            return from(this.GetRouteLines(route.Id))
                                .pipe(
                                    map(routeLines => ({Route: route, RouteLines: routeLines} as IRouteWithLines))
                                );
                        }
                        
                        return of(null);
                    }),
                    catchError(error => {
                        console.error(error);
                        
                        return of(null);
                    })
                );
        }

        /**
         * Retrieves a route from SQL Lite database by it's id
         * @param _routeId The id of the route to retrieve
         * @constructor
         */
        public GetRoute(_routeId: number): Observable<IRouteWithLines>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Routes WHERE Id=?", [_routeId]))),
                    map(selectResult => {
                        if(selectResult.rows.length)
                        {
                            return selectResult.rows.item(0);
                        }
                        
                        return null;
                    }),
                    concatMap(route => {
                        if(route)
                        {
                            return this.GetRouteLines(route.Id)
                                .pipe(
                                    map(routeLines => ({ Route: route, RouteLines: routeLines }))
                                );
                        }
                        
                        return of(null);
                    }),
                    catchError(err => {
                        console.error(err);
                        
                        return of(null);
                    })
                );
        }

        /**
         * Update the specified route status
         * @param _routeId Id of the route to update
         * @param _newStatus New status of the route
         * @constructor
         */
        public UpdateRouteStatus(_routeId: number, _newStatus: RouteStatus): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("UPDATE Routes SET Status=? WHERE Id=?", [_newStatus, _routeId]))),
                    map(updateResult => 1)
                );
        }

        /**
         * Update the route line check status
         * @param _routeLineId The route line identifier
         * @param _checkStatus The new check status for the route line
         * @constructor
         */
        public UpdateRouteLineCheckStatus(_routeLineId: number, _checkStatus: CheckType): Observable<number>
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("UPDATE RoutesLines SET CheckStatus=? WHERE Id=?", [_checkStatus, _routeLineId]))),
                    map(updateResult => 1)
                );
        }

        /**
         * Store a route line in the SQL Lite database
         * @param _routeLine The route line information to store
         * @constructor
         */
        public StoreRouteLine(_routeLine: IRouteLine): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database
                        .executeSql(
                            `INSERT INTO RoutesLines
                        (
                         Address,
                         Latitude,
                         Longitude,
                         CardCode,
                         CardName,
                         AddressLineId,
                         CheckStatus,
                         Status,
                         AddressType,
                         VisitingTime,
                         VisitEndTime,
                         AddressLineNum,
                         RouteId,
                         Id,
                         CreatedDate,
                         CreatedBy,
                         UpdateDate,
                         UpdatedBy,
                         OrderNum
                        )
                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
                            [
                                _routeLine.Address,
                                _routeLine.Latitude,
                                _routeLine.Longitude,
                                _routeLine.CardCode,
                                _routeLine.CardName,
                                _routeLine.AddressLineId,
                                CheckType.CheckNoApply,
                                _routeLine.Status,
                                _routeLine.AddressType,
                                _routeLine.VisitingTime,
                                _routeLine.VisitEndTime,
                                _routeLine.AddressLineNum,
                                _routeLine.RouteId,
                                _routeLine.Id,
                                _routeLine.CreatedDate,
                                _routeLine.CreatedBy,
                                _routeLine.UpdateDate,
                                _routeLine.UpdatedBy,
                                _routeLine.OrderNum
                            ]
                        ))),
                    map(insertResult => 1)
                );
        }

        /**
         * Update a route line in the SQL Lite database
         * @param _routeLine The route line information to update
         * @constructor
         */
        public UpdateRouteLine(_routeLine: IRouteLine): Observable<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database
                        .executeSql(
                        `UPDATE RoutesLines SET
                        Address = ?,
                        Latitude = ?,
                        Longitude = ?,
                        CardCode = ?,
                        CardName = ?,
                        AddressLineId =?,
                        CheckStatus = ?,
                        Status = ?,
                        AddressType = ?,
                        VisitingTime = ?,
                        VisitEndTime = ?,
                        AddressLineNum = ?,
                        RouteId = ?,
                        CreatedDate = ?,
                        CreatedBy = ?,
                        UpdateDate = ?,
                        UpdatedBy = ?,
                        OrderNum = ?
                        WHERE Id = ?;`,
                            [
                                _routeLine.Address,
                                _routeLine.Latitude,
                                _routeLine.Longitude,
                                _routeLine.CardCode,
                                _routeLine.CardName,
                                _routeLine.AddressLineId,
                                _routeLine.CheckStatus,
                                _routeLine.Status,
                                _routeLine.AddressType,
                                _routeLine.VisitingTime,
                                _routeLine.VisitEndTime,
                                _routeLine.AddressLineNum,
                                _routeLine.RouteId,
                                _routeLine.CreatedDate,
                                _routeLine.CreatedBy,
                                _routeLine.UpdateDate,
                                _routeLine.UpdatedBy,
                                _routeLine.OrderNum,
                                _routeLine.Id,
                            ]
                        ))),
                    map(updateResult => 1)
                );
        }

        /**
         * Retrieves all route lines from SQL Lite database
         * @param _routeId The id of the route to retrieve the lines
         * @constructor
         */
        public GetRouteLines(_routeId: number): Observable<IRouteLine[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM RoutesLines WHERE RouteId=? ORDER BY OrderNum ASC", [_routeId]))),
                    map(selectResult => {
                        let routeLines: IRouteLine[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            routeLines.push(selectResult.rows.item(i));
                        }
                        
                        return routeLines;
                    })
                );
        }

        /**
         * Delete all lines of the specified route
         * @param _routeId The route id to delete the lines
         * @constructor
         */
        public DeleteRouteLines(_routeId: number): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM RoutesLines WHERE RouteId=?",[_routeId]))),
                    map(deleteResult => 1)
                );
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Serie {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Insert a series in the SQL Lite database
         * @param _series The series information to insert
         * @constructor
         */
        public async StoreSeries(_series: ISeries): Promise<number> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                            "INSERT INTO Series(Id,UserAssingId, CompanyId, NoSerie, DocumentType, SerieType, SerieDescription, IsSerial, CreatedDate, CreatedBy, UpdateDate, UpdatedBy) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                            [
                                _series.Id,
                                _series.UserAssingId,
                                _series.CompanyId,
                                _series.NoSerie,
                                _series.DocumentType,
                                _series.SerieType,
                                _series.SerieDescription,
                                _series.IsSerial,
                                _series.CreatedDate,
                                _series.CreatedBy,
                                _series.UpdateDate,
                                _series.UpdatedBy
                            ]
                        ))),
                    concatMap(insertResult => {
                        if(_series.FESerie)
                        {
                            return from(this.databaseService.database.executeSql(
                                "INSERT INTO FESeries (Id, SerieName, BranchOffice, Terminal, NextNumber, SeriesByUserId) VALUES (?, ?, ?, ?, ?, ?)",
                                [
                                    _series.FESerie.Id,
                                    _series.FESerie.SerieName,
                                    _series.FESerie.BranchOffice,
                                    _series.FESerie.Terminal,
                                    _series.FESerie.NextNumber,
                                    _series.FESerie.SeriesByUserId
                                ]
                            ));
                        }
                        
                        return of(1)
                    }),
                    map(insertResult => 1)
                ).toPromise();
        }

        /**
         * Delete all series and FE series
         * @constructor
         */
        public DeleteSeries(): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(`DELETE FROM Series`, []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql(`DELETE FROM FESeries`, []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "FESeries";',[]))),
                    map(resetSequenceResult => 1),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })    
                );
        }

        /**
         * Retrieves all synchronized numbering series
         * @constructor
         */
        public async GetNumberingSeries(): Promise<ISeries[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM Series", []))),
                    map(selectResult => {
                        let seriesList: ISeries[] = [];
                        
                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            seriesList.push(selectResult.rows.item(i));
                        }
                        
                        return seriesList;
                    }),
                    concatMap(seriesList => of(...seriesList)),
                    concatMap(series => from(this.databaseService.database.executeSql("SELECT * FROM FESeries WHERE SeriesByUserId = ?", [series.Id]))
                        .pipe(
                            map(selectResult => ({...series, FESerie: selectResult.rows.item(0)}))
                        )),
                    toArray()
                ).toPromise();
        }

        /**
         * Update a series and FE Series depending of the parameter value
         * @param _series The series to update
         * @param _updateFESerie Indicates if should update the FE Series
         * @constructor
         */
        public async UpdateSeries(_series: ISeries, _updateFESerie: boolean): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => {
                        if(_series.FESerie && _updateFESerie)
                        {
                            return from(this.databaseService.database.executeSql("UPDATE FESeries SET NextNumber = ? WHERE Id = ?;", [
                                _series.FESerie.NextNumber,
                                _series.FESerie.Id
                            ]));
                        }
                        
                        return of(1);
                    }),
                    map(result => 1),
                    catchError(error => {
                        console.error(error);
                        return throwError(error);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Tax {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async CountTaxes(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql("SELECT COUNT(*) as count FROM taxes;", [])
                    .then((data) => {
                        if (data.rows.length > 0) {
                            return data.rows.item(0).count;
                        } else {
                            return null;
                        }
                    });
            });
        }

        /**
         * Insert a tax into SQL Lite database
         * @param _tax The tax information to insert
         * @constructor
         */
        public async StoreTax(_tax: ITax): Promise<number> {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql(
                            `INSERT INTO taxes(TaxCode, TaxRate) VALUES (?,?);`,
                            [_tax.TaxCode, _tax.TaxRate]
                        )
                        .then((result) => {
                            return result.insertId;
                        })
                        .catch(error => {
                            console.error(error);
                            return -1;
                        });
                });
        }

        /**
         * Retrieves all synchronized taxes
         * @constructor
         */
        public async GetTaxes(): Promise<ITax[]> 
        {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM taxes", [])
                        .then((data) => {
                            let lists: ITax[] = [];
                            
                            for (let i = 0; i < data.rows.length; i++) 
                            {
                                lists.push(data.rows.item(i));
                            }
                            return lists;
                        });
                });
        }

        public async GetOneTaxByCode(TaxCode: string): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(`SELECT *
                                 FROM taxes
                                 WHERE TaxCode = '${TaxCode}'`, [])
                    .then((data) => {
                        let lists: ITax[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    });
            });
        }

        public async DeleteTaxes(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM taxes", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "taxes";',
                        []
                    );
                });
            });
        }

        /**
         * Delete all synchronized tax code determinations in the SQL Lite database
         * @constructor
         */
        public async DeleteTaxCodeDeterminations(): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM TaxCodeDeterminations", []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql('DELETE FROM sqlite_sequence WHERE name = "TaxCodeDeterminations";', []))),
                    map(resetSequenceResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Insert a tax code determination in the SQL Lite database
         * @param _otcxRecord The tax code determination information to insert
         * @constructor
         */
        public async StoreTaxCodeDetermination(_otcxRecord: ITaxCodeDetermination): Promise<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql(
                            `INSERT INTO TaxCodeDeterminations(
                                  DocEntry, 
                                  DocType,
                                  LineNum, 
                                  BusArea, 
                                  Cond1, 
                                  UDFTable1, 
                                  NumVal1, 
                                  StrVal1, 
                                  MnyVal1,
                                  Cond2,
                                  UDFTable2, 
                                  NumVal2, 
                                  StrVal2,
                                  MnyVal2,
                                  Cond3,
                                  UDFTable3,
                                  NumVal3,
                                  StrVal3,
                                  MnyVal3,
                                  Cond4,
                                  UDFTable4,
                                  NumVal4,
                                  StrVal4,
                                  MnyVal4,
                                  Cond5,
                                  UDFTable5,
                                  NumVal5,
                                  StrVal5,
                                  MnyVal5,
                                  UDFAlias1, 
                                  UDFAlias2,
                                  UDFAlias3,
                                  UDFAlias4,
                                  UDFAlias5,
                                  LnTaxCode, 
                                  Descr,
                                  FrLnTax,
                                  FrHdrTax)
                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
                            [
                                _otcxRecord.DocEntry,
                                _otcxRecord.DocType,
                                _otcxRecord.LineNum,
                                _otcxRecord.BusArea,
                                _otcxRecord.Cond1,
                                _otcxRecord.UDFTable1,
                                _otcxRecord.NumVal1,
                                _otcxRecord.StrVal1,
                                _otcxRecord.MnyVal1,
                                _otcxRecord.Cond2,
                                _otcxRecord.UDFTable2,
                                _otcxRecord.NumVal2,
                                _otcxRecord.StrVal2,
                                _otcxRecord.MnyVal2,
                                _otcxRecord.Cond3,
                                _otcxRecord.UDFTable3,
                                _otcxRecord.NumVal3,
                                _otcxRecord.StrVal3,
                                _otcxRecord.MnyVal3,
                                _otcxRecord.Cond4,
                                _otcxRecord.UDFTable4,
                                _otcxRecord.NumVal4,
                                _otcxRecord.StrVal4,
                                _otcxRecord.MnyVal4,
                                _otcxRecord.Cond5,
                                _otcxRecord.UDFTable5,
                                _otcxRecord.NumVal5,
                                _otcxRecord.StrVal5,
                                _otcxRecord.MnyVal5,
                                _otcxRecord.UDFAlias1,
                                _otcxRecord.UDFAlias2,
                                _otcxRecord.UDFAlias3,
                                _otcxRecord.UDFAlias4,
                                _otcxRecord.UDFAlias5,
                                _otcxRecord.LnTaxCode,
                                _otcxRecord.Descr,
                                _otcxRecord.FrLnTax,
                                _otcxRecord.FrHdrTax]))),
                    map(insertResult => 1),
                    catchError(error => {
                        console.error(error);
                        return of(-1);
                    })
                ).toPromise();
        }

        /**
         * Retrieves all synchronized tax codes determinations
         * @constructor
         */
        public async GetTaxCodeDeterminations(): Promise<ITaxCodeDetermination[]> {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() =>  from(this.databaseService.database.executeSql("SELECT * FROM TaxCodeDeterminations", []))),
                    map(selectResult => {
                        let taxCodesDetermination: ITaxCodeDetermination[] = [];

                        if (selectResult && selectResult.rows) 
                        {
                            for (let c = 0; c < selectResult.rows.length; c++) 
                            {
                                taxCodesDetermination.push(selectResult.rows.item(c) as ITaxCodeDetermination);
                            }
                        }
                        return taxCodesDetermination;
                    }),
                    catchError(error => {
                        console.error(error);
                        return of([]);
                    })
                ).toPromise();
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class User {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async DeleteUsers(): Promise<any> {
            return this.databaseService.Ready().then(async () => {
                return this.databaseService.database
                    .executeSql(`DELETE
                                 FROM users`, [])
                    .then(async () => {
                        return this.databaseService.database
                            .executeSql('DELETE FROM sqlite_sequence WHERE name = "users";', [])
                            .catch((e) => console.log(e));
                    })
                    .catch((e) => console.log(e));
            });
        }

        public async AddUser(_user: IUser): Promise<any> {
            return this.databaseService.Ready().then(async () => {
                return this.databaseService.database
                    .executeSql(`
                                INSERT INTO users(UserAssignId,
                                                  CompanyId,
                                                  Name,
                                                  LastName,
                                                  Email,
                                                  EmailType,
                                                  EmailPassword,
                                                  Password,
                                                  SlpCode,
                                                  SlpName,
                                                  CenterCost,
                                                  WhsCode,
                                                  UseScheduling,
                                                  Discount,
                                                  CreatedDate,
                                                  CreatedBy,
                                                  UpdateDate,
                                                  UpdatedBy,
                                                  SellerCode,
                                                  BuyerCode,
                                                  IsActive)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
                        [
                            _user.UserAssignId,
                            _user.CompanyId,
                            _user.Name,
                            _user.LastName,
                            _user.Email,
                            _user.EmailType,
                            _user.EmailPassword,
                            _user.Password,
                            _user.SlpCode,
                            _user.SlpName,
                            _user.CenterCost,
                            _user.WhsCode,
                            _user.UseScheduling,
                            _user.Discount,
                            _user.CreatedDate,
                            _user.CreatedBy,
                            _user.UpdateDate,
                            _user.UpdatedBy,
                            _user.SellerCode,
                            _user.BuyerCode,
                            _user.IsActive
                        ]
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async GetUserLogin(_userEmail: string, _password: string): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        "SELECT * FROM users WHERE upper(Email)=? AND Password=?",
                        [_userEmail, _password]
                    )
                    .then((data) => {
                        let lists: IUser[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i));
                        }
                        return lists;
                    });
            });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Warehouse {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Indicates if the warehouses were synchronized
         * @constructor
         */
        public async AreWarehousesSynchronized(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                let sql = "SELECT * FROM wareHouses LIMIT 1";
                return this.databaseService.database
                    .executeSql(sql, [])
                    .then((data) => {
                        return data.rows.length > 0;
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        public async DeleteWarehouses(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM wareHouses", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "wareHouses";',
                        []
                    );
                });
            });
        }

        public async AddWarehouse(WhsCode: string, WhsName: string): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(`INSERT INTO wareHouses(WhsCode, WhsName)
                                 VALUES (?, ?);`, [
                        WhsCode,
                        WhsName,
                    ])
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        /**
         * Retrieves all synchronized warehouse
         * @constructor
         */
        public async GetWarehouses(): Promise<IWarehouse[]> 
        {
            return this.databaseService.Ready()
                .then(() => {
                    return this.databaseService.database
                        .executeSql("SELECT * FROM wareHouses", [])
                        .then((data) => {
                            let lists: IWarehouse[] = [];
                            
                            for (let i = 0; i < data.rows.length; i++) 
                            {
                                lists.push(data.rows.item(i));
                            }
                            
                            return lists;
                        });
                });
        }
    }

    @Injectable({
        providedIn: 'root'
    })
    export class Log {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        public async GetLogs(): Promise<ILogMobile[]> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("SELECT * FROM LogsMobile ORDER BY Date DESC", [])
                    .then((data) => {
                        let lists: ILogMobile[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i) as ILogMobile);
                        }
                        return lists;
                    });
            });
        }

        public async AddLogMobile(
            logMobile: ILogMobile
        ): Promise<number> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO LogsMobile(Event, View, Detail, Date, User, SyncStatus, DocumentKey,
                                                TransactionType, UserSign)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [logMobile.Event, logMobile.View, logMobile.Detail, logMobile.Date, logMobile.User, logMobile.SyncStatus, logMobile.DocumentKey, logMobile.TransactionType, logMobile.UserSign]
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async DeleteLogs(): Promise<void> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM LogsMobile", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "LogsMobile";',
                        []
                    );
                });
            });
        }

        public async UpdateLogMobile(logMobile: ILogMobile): Promise<number> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(
                        `UPDATE LogsMobile
                         SET Event           = ?,
                             View            = ?,
                             Detail          = ?,
                             Date            = ?,
                             User            = ?,
                             SyncStatus      = ?,
                             DocumentKey     = ?,
                             TransactionType = ?,
                             UserSign        = ?
                         WHERE Id = ?;`,
                        [logMobile.Event, logMobile.View, logMobile.Detail, logMobile.Date, logMobile.User, logMobile.SyncStatus, logMobile.DocumentKey, logMobile.TransactionType, logMobile.UserSign, logMobile.Id]
                    )
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        public async GetUnsyncLogs(): Promise<ILogMobile[]> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("SELECT * FROM LogsMobile WHERE SyncStatus = 0", [])
                    .then((data) => {
                        let lists: ILogMobile[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            lists.push(data.rows.item(i) as ILogMobile);
                        }
                        return lists;
                    });
            });
        }
    }


    @Injectable({
        providedIn: 'root'
    })
    export class Menu {
        constructor(private databaseService: Repository.DatabaseService) {
        }

        /**
         * Insert a menu into SQL Lite database
         * @param _menu The menu information to insert
         * @constructor
         */
        public async AddMenu(_menu: IMenuMobile): Promise<any> {
            return this.databaseService.Ready().then(() => {
                const nodesString = JSON.stringify(_menu.Nodes);
                return this.databaseService.database
                    .executeSql(
                        `INSERT INTO Menu(Key,
                                  Description,
                                  Icon,
                                  Route,
                                  Visible,
                                  Nodes,
                                  Category,
                                  NextId,
                                  NamePermission,
                                  Language,
                                  NeedConnection,
                                  Type
                        )
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                        [
                            _menu.Key,
                            _menu.Description,
                            _menu.Icon,
                            _menu.Route,
                            _menu.Visible,
                            nodesString,
                            _menu.Category,
                            _menu.NextId,
                            _menu.NamePermission,
                            _menu.Language,
                            _menu.NeedConnection,
                            _menu.Type
                        ]
                    )
                    .then((result) => {
                        return result.insertId;
                    })
                    .catch(error => {
                        console.error('Error inserting menu:', error); // Muestra cualquier error
                    });
            });
        }

        /**
         * Retrieves all menu entries from the SQL Lite database that match the specified language.
         *
         * @param _language - The language code used to filter the menu entries.
         * @returns A promise that resolves to an array of `IMenuMobile` objects representing the menu entries.
         */
        public async GetMenu(_language: string): Promise<IMenuMobile[]> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(`SELECT *
                                                                 FROM Menu
                                                                 WHERE Language = '${_language}'`, [])
                    .then((data) => {
                        let lists: IMenuMobile[] = [];
                        for (let i = 0; i < data.rows.length; i++) {
                            let menu = data.rows.item(i);
                            menu.Nodes = menu.Nodes != null ? JSON.parse(data.rows.item(i)['Nodes']) as IMenuMobile : [];
                            lists.push(menu as IMenuMobile);
                        }
                        return lists;
                    });
            });
        }

        /**
         * Deletes all entries from the Menu table in the SQL Lite database and resets the sequence.
         *
         * @returns A promise that resolves when the operation is complete.
         */
        public async DeleteMenu(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM Menu", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "Menu";',
                        []
                    );
                });
            });
        }
    }

    /**
     * Service to manage offline ZPL print format records in a local SQLite database.
     * This is primarily used for enabling printing functionality when the application is offline.
     */
    @Injectable({
        providedIn: 'root'
    })
    export class PrintFormatZPLOffline {
        constructor(private databaseService: Repository.DatabaseService) {}

        /**
         * Checks whether an offline ZPL print format exists in the local database.
         * 
         * @returns A promise that resolves to true if at least one print format record exists, false otherwise.
         */
        public async IsPrintFormatZPLOffline(): Promise<boolean> {
            return this.databaseService.Ready().then(() => {
                let sql = "SELECT * FROM PrintFormatZPLOffline LIMIT 1";
                return this.databaseService.database
                    .executeSql(sql, [])
                    .then((data) => {
                        return data.rows.length > 0;
                    })
                    .catch((e) => {
                        console.error(e);
                        return false;
                    });
            });
        }

        /**
         * Deletes all offline ZPL print format records from the local database.
         * Also resets the auto-increment counter for the table.
         * 
         * @returns A promise that resolves when the operation is complete.
         */
        public async DeletePrintFormatZPLOffline(): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql("DELETE FROM PrintFormatZPLOffline", []).then(() => {
                    return this.databaseService.database.executeSql(
                        'DELETE FROM sqlite_sequence WHERE name = "PrintFormatZPLOffline";',
                        []
                    );
                });
            });
        }

        /**
         * Inserts a new offline ZPL print format record into the local database.
         * 
         * @param formatZPL The ZPL format object to be inserted.
         * @returns A promise that resolves with the ID of the inserted record.
         */
        public async AddPrintFormatZPLOffline(formatZPL: IPrintFormatZPLOfflineToSync): Promise<any> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database
                    .executeSql(`INSERT INTO PrintFormatZPLOffline(FormatZPLOffline)
                                VALUES (?);`, [
                        formatZPL.FormatZPLOffline
                    ])
                    .then((result) => {
                        return result.insertId;
                    });
            });
        }

        /**
         * Retrieves the stored offline ZPL print format from the local database.
         * 
         * @returns A promise that resolves to the stored `IPrintFormatZPLOffline` object,
         *          or an empty object if no data is found.
         */
        public async GetPrintFormatZPLOffline(): Promise<IPrintFormatZPLOffline> {
            return this.databaseService.Ready().then(() => {
                return this.databaseService.database.executeSql(
                    "SELECT * FROM PrintFormatZPLOffline",
                    []
                ).then((data) => {
                    if (!data.rows || data.rows.length === 0) {
                        return {} as IPrintFormatZPLOffline;
                    }

                    let printFormat = JSON.parse(data.rows.item(0)["FormatZPLOffline"]) as IPrintFormatZPLOffline;

                    printFormat.DocumentsInvoice = JSON.parse(printFormat.DocumentsInvoice.toString() || '[]') as [number];

                    return printFormat; 
                });
            });
        }
    }

     @Injectable({
        providedIn: 'root'
    })
    export class PayTerms {
        constructor(private databaseService: Repository.DatabaseService) {}

        /**
         * Insert an PayTerms in the SQL Lite database
         * @param _payTerm The Payterm information to insert
         * @constructor
         */
        public StorePayTerm(_payTerm: IPayTerms): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database
                        .executeSql(`INSERT INTO PayTerms(GroupNum, PymntGroup, Type, Months, Days)
                     VALUES (?,?,?,?,?)
                    `, [
                        _payTerm.GroupNum,
                        _payTerm.PymntGroup,
                        _payTerm.Type,
                        _payTerm.Months,
                        _payTerm.Days
                    ]))),
                    map(insertResult => 1)
                )
        }

        /**
         * Delete all PayTerms store in the SQL Lite database
         * @constructor
         */
        public DeletePayTerms(): Observable<number> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("DELETE FROM PayTerms", []))),
                    concatMap(deleteResult => from(this.databaseService.database.executeSql("DELETE FROM sqlite_sequence WHERE name=?", ["PayTerms"]))),
                    map(resetSequenceResult => 1)
                );
        }

        /**
         * Retrieves all PayTerms stored in the SQL Lite database
         * @constructor
         */
        public async GetPayTerms(): Promise<IPayTerms[]> 
        {
            return from(this.databaseService.Ready())
                .pipe(
                    concatMap(() => from(this.databaseService.database.executeSql("SELECT * FROM PayTerms", []))),
                    map(selectResult => {
                        let payTerms: IPayTerms[] = [];

                        for (let i = 0; i < selectResult.rows.length; i++) 
                        {
                            payTerms.push(selectResult.rows.item(i));
                        }
                        
                        return payTerms;
                    })
                ).toPromise();
        }
    }
}

