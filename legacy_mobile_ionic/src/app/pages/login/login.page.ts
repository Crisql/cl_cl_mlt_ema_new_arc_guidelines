import {Component, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ActionSheetController, AlertController, Platform, ToastController,} from "@ionic/angular";
import {Network} from "@ionic-native/network/ngx";
import {Device} from "@ionic-native/device/ngx";
import {Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import jsSHA from "jssha";
// Models
import {LogInModel, URLResponse} from "src/app/models";
// Services
import {
    CommonService,
    CompanyService,
    ConfigurationService,
    LocalStorageService,
    LoginService,
    LogManagerService,
    PermissionService,
    PublisherService,
    Repository,
    UserService
} from "src/app/services";
import {LocationAccuracy} from "@ionic-native/location-accuracy/ngx";
import {AlertType, LogEvent} from "src/app/common";
import {SyncService} from "src/app/services/sync.service";
import {CheckRouteService} from '../../services/check-route.service';
import {LocalStorageVariables, PublisherVariables} from "src/app/common/enum";
import {environment} from "src/environments/environment";
import {DatePipe} from "@angular/common";
import {finalize, switchMap} from "rxjs/operators";
import {IUserToken} from "../../models/db/user-token";
import {IPermission} from "../../models/db/permissions";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {IMobileAppConfiguration} from "../../interfaces/i-settings";
import {IUser} from "../../models/i-user";
import {IUserAssign} from "../../models/db/user-model";

@Component({
    selector: "app-login",
    templateUrl: "./login.page.html",
    styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit, OnDestroy {
    //varbox
    isProduction: boolean = environment.production;
    envName: string = environment.envName;
    passPlaceholder: string;
    userPlaceholder: string;
    btnLoginText: string;
    showPassword = false;
    passwordToggleIcon = 'eye';
    users: IUser[] = [];
    loginData: LogInModel;
    responseModel: any;
    public dbName: string;
    Home: string = "Home";
    connected: Subscription;
    disconnected: Subscription;
    public orders: any;
    idiom: boolean;
    idiomType: string;
    intervalo: any;
    lang: string;
    loginForm: FormGroup;
    workspaceForm: FormGroup;
    canLogin: boolean = false;
    workspace: string;
    validationTasksFinished: boolean;
    userToken: IUserToken;

    constructor(
        private datePipe: DatePipe,
        public network: Network,
        public platform: Platform,
        public alertCtrl: AlertController,
        private router: Router,
        private device: Device,
        private formBuilder: FormBuilder,
        public toastCtrl: ToastController,
        private translateService: TranslateService,
        private publisher: PublisherService,
        private localStorageService: LocalStorageService,
        public repositoryUser: Repository.User,
        public userService: UserService,
        public repositoryConfiguration: Repository.Configuration,
        public configurationService: ConfigurationService,
        public permissionService: PermissionService,
        private repositoryPermission: Repository.Permission,
        private loginService: LoginService,
        private syncService: SyncService,
        private locationAccuracy: LocationAccuracy,
        private commonService: CommonService,
        private companyService: CompanyService,
        private logManagerService: LogManagerService,
        private checkRouteService: CheckRouteService,
        private actionSheetController: ActionSheetController,
        private recaptchaV3Service: ReCaptchaV3Service,
        private renderer: Renderer2,
        private repositoryCompany: Repository.Company
    ) {
    }

    ngOnInit() {
        this.renderer.addClass(document.body, 'recaptcha');
        this.localStorageService.SetModalBackupStatus(true);
        this.idiom = false;
        this.dbName = "";
        this.lang = this.localStorageService.get(LocalStorageVariables.Lang) || 'es';
        this.translateService.use(this.lang);
        this.btnLoginText = this.commonService.Translate('Iniciar sesión', 'LOGIN');
        this.passPlaceholder = this.commonService.Translate('Contraseña', 'Password');
        this.userPlaceholder = this.commonService.Translate('Usuario', 'User');
        this.loginForm = this.formBuilder.group({
            email: [
                "",
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.pattern("[a-zA-Z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
                ],
            ],
            password: ["", Validators.required]
        });

        this.workspaceForm = this.formBuilder.group({
            Workspace: [(''), Validators.required],
        });
    }
    ngOnDestroy(): void {
        this.renderer.removeClass(document.body, 'recaptcha');
    }
    async ionViewWillEnter() {
        let URL = this.localStorageService.get('ApiURL');
        if (URL) {
            this.localStorageService.set('ApiURL', URL);
            this.canLogin = true;
        } else {
            let configurationURL = (await this.repositoryConfiguration.GetConfiguration("ApiURL")) || null;

            if (configurationURL && configurationURL?.Json) {
                this.localStorageService.set("ApiURL", configurationURL.Json, true);
                this.canLogin = true;
            } else {
                this.canLogin = false;
            }
        }
        this.validationTasksFinished = true;
    }

    SetGlobalOptions(): void {
        this.publisher.publish({
            Data: this.loginForm.get("email").value,
            Target: PublisherVariables.LoggedUser,
        });

        this.syncService.SyncLogsMobile();

        this.localStorageService.set(LocalStorageVariables.IsLoginLastPath, true, true);
        
        this.router.navigateByUrl("home", {replaceUrl: true});
    }

    RedirectToHome(loader: HTMLIonLoadingElement): void
    {
        if (this.network.type !== "none") 
        {
            loader.dismiss();

            this.localStorageService.set(LocalStorageVariables.IsLoginLastPath, true, true);
            
            this.router.navigateByUrl("home", {replaceUrl: true});
        } 
        else 
        {
            this.repositoryPermission
                .GetPermissions()
                .then((data: IPermission[]) => {
                    loader.dismiss();
                    
                    this.publisher.publish({Target: PublisherVariables.Permissions, Data: data});
                    
                    this.commonService.Translate("Bienvenido", "Welcome")
                    
                    this.Toast(`${this.commonService.Translate("Bienvenido", "Welcome")} ${this.loginForm.get("email").value}`,3000,"top");
                    
                    this.localStorageService.SetModalBackupStatus(false);
                    
                    this.syncService.VerifyAutomaticCheckProcessToStart();
                    
                    this.SetGlobalOptions();
                })
                .catch((error: any) => {
                    loader.dismiss();
                    this.commonService.alert(AlertType.ERROR, error);
                });
        }
    }

    HashSHA1(word: string): string {
        let shaObj = new jsSHA("SHA-1", "TEXT");
        shaObj.update(word);
        let hash = shaObj.getHash("HEX");
        return hash.toUpperCase();
    }

    async Exit(): Promise<void> {
        this.commonService.Alert(
            AlertType.QUESTION,
            '¿Salir de la aplicación?',
            'Exit application?',
            'Confirmación',
            'Confirmation',
            [
                {
                    text: this.translateService.currentLang == "es" ? 'Cancelar' : 'Cancel',
                    role: "cancel",
                },
                {
                    text: this.translateService.currentLang == "es" ? 'Continuar' : 'Continue',
                    handler: () => {
                        navigator["app"].exitApp();
                    },
                },
            ],
        );
    }

    async Toast(mensaje: string, duracion: number, posicion: string): Promise<void> {
        let toast = await this.toastCtrl.create({
            message: mensaje,
            duration: duracion,
            position: "bottom",
        });

        toast.present();
    }

    //actualizar el cambio de idioma de la aplicacion
    UpdateIdiom(idiom: boolean): void {
        if (idiom) {
            this.translateService.use("en");
            this.idiomType = "English";
        } else {
            this.translateService.use("es");
            this.idiomType = "Español";
        }
    }

    async Authenticate(): Promise<void> {
        let loader = await this.commonService.Loader();
        
        try {
            this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                .then(async () => {
                    
                    loader.present();

                    let temporalToken: IUserToken = await this.localStorageService.get("Session");

                    if (
                        this.network.type !== "none" ||
                        (!temporalToken ||
                            new Date( temporalToken['ExpireTime'] || temporalToken['.expires']) < new Date() ||
                            temporalToken.UserEmail !== this.loginForm.get("email").value)
                    )
                    {
                        let validToken: boolean = false;

                        if (this.network.type === 'none')
                        {
                            let tokens: IUserToken[] = await this.repositoryConfiguration.GetUserToken(
                                this.loginForm.get('email').value
                            );

                            if (tokens && tokens.length > 0)
                            {
                                temporalToken = tokens[0];
                                validToken = new Date(temporalToken['ExpireTime'] || temporalToken['.expires']) > new Date();
                            }
                        }

                        if (!validToken)
                        {
                            if (this.network.type !== 'none')
                            {
                                this.recaptchaV3Service?.execute('Login')
                                    .pipe(
                                        switchMap(token => this.loginService.login(this.loginForm.get('email').value, this.loginForm.get('password').value, token)),
                                        finalize(()=> loader?.dismiss())
                                    ).subscribe(
                                    (data: IUserToken) => {
                                        this.localStorageService.set("Session", data, true); // Correccion para evitar acceso nulo a la sesion

                                        this.repositoryConfiguration
                                            .AddToken(data)
                                            .then(() => {
                                                this.userToken = {...data};
                                                this.localStorageService.SetLastSession(data.UserEmail);
                                                this.RedirectToHome(loader);
                                            })
                                            .catch((error) => {
                                                loader.dismiss();
                                                this.commonService.alert(
                                                    AlertType.ERROR,
                                                    error.message || error
                                                );
                                            });
                                    },
                                    (error) => {
                                        loader.dismiss();
                                        this.commonService.alert(
                                            AlertType.ERROR,
                                            error
                                        );
                                    }
                                );
                            }
                            else
                            {
                                this.ValidateSessionOffline(loader, temporalToken);
                            }
                        }
                        else
                        {
                            this.ValidateSessionOffline(loader, temporalToken);
                        }
                    }
                    else
                    {
                        this.ValidateSessionOffline(loader, temporalToken);
                    }
                }, error => {
                    console.log('Error requesting location permissions ' + JSON.stringify(error))
                });
        }catch (error){
            this.commonService.alert(AlertType.ERROR, error)
        }finally {
            loader?.dismiss();
        }
        
    }
    
    async ValidateSessionOffline(_loader: HTMLIonLoadingElement, _temporalToken: IUserToken){
        let userPassword = this.HashSHA1(this.loginForm.get("password").value);

        this.users = await this.repositoryUser.GetUserLogin(
            this.loginForm.get("email").value.toUpperCase(),
            userPassword
        );

        if (this.network.type === "none" && (!this.users || this.users.length === 0))
        {
            _loader.dismiss();
            this.commonService.alert(AlertType.INFO,
                this.commonService.Translate("Puede que la información necesaria para iniciar sesión sin conexión no se ha sincronizado.", "It may be because the required information for offline login has not been synchronized."),
                this.commonService.Translate('Usuario y/o contraseña incorrecta', 'Incorrect username and/or password'));
            return;
        }

        let canDoLoginOffline = !((this.localStorageService.get(LocalStorageVariables.MobileAppConfiguration) as IMobileAppConfiguration)?.OnlineOnly ?? true);

        if(!canDoLoginOffline)
        {
            _loader.dismiss();
            this.commonService.alert(AlertType.INFO,
                this.commonService.Translate("La empresa no permite el uso de la aplicación en modo offline.", "The company does not allow the use of the application in offline mode"),
                this.commonService.Translate("Modo sin conexión no permitido", "Offline mode not allowed"));
            return;
        }
        
        if(!_temporalToken){
            _temporalToken = {
                UserEmail: this.loginForm.get("email").value,
                UserId: ''
            } as IUserToken;
        }

        this.localStorageService.set("Session", _temporalToken, true);

        this.localStorageService.SetLastSession(_temporalToken.UserEmail);
        
        let userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;
        
        this.localStorageService.data.delete(LocalStorageVariables.UserAssignment);
        
        userAssignment = {
            CompanyId: +this.users[0].CompanyId,
            BuyerCode: this.users[0].BuyerCode,
            CenterCost: this.users[0].CenterCost,
            Discount: this.users[0].Discount,
            SlpCode: this.users[0].SlpCode,
            Id: this.users[0].UserAssignId,
            SellerCode: this.users[0].SellerCode,
            WhsCode: this.users[0].WhsCode
        };

        //The user assign is updated with the logged in
        this.localStorageService.set(LocalStorageVariables.UserAssignment, userAssignment, true)
        

        this.RedirectToHome(_loader);
    }

    RecoverPass(): void {
        this.router.navigate(["recover-password"]);
    }

    async GetURL(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();

        this.configurationService
            .GetURL(this.workspaceForm.get("Workspace").value, this.device.uuid)
            .then(async (data: URLResponse) => {
                if (data.result) {
                    await this.repositoryConfiguration.StoreConfiguration("ApiURL", data.URL);
                    this.localStorageService.set("ApiURL", data.URL, true);
                    this.canLogin = true;
                } else {
                    if (!data) {
                        this.commonService.Alert(
                            AlertType.ERROR,
                            "No se pudo obtener el área de trabajo",
                            "Can't get workspace"
                        );
                    } else {
                        this.commonService.alert(
                            AlertType.ERROR,
                            data.errorInfo?.Message || JSON.stringify(data)
                        );
                    }
                }
                loader.dismiss();
            })
            .catch((error) => {
                loader.dismiss();
                this.commonService.alert(
                    AlertType.ERROR,
                    error.message || JSON.stringify(error)
                );
            });
    }

    TogglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    LoadSettings(): void {
        if (this.localStorageService.get("Settings")) {
            this.companyService.GetSettings().subscribe(req => {
                if (req.result) {
                    this.localStorageService.set("Settings", req.Data, true);
                } else {
                    this.logManagerService.Log(LogEvent.ERROR, `${req.errorInfo?.Message}`);
                }
            }, error => {
                this.logManagerService.Log(LogEvent.ERROR, error);
            });
        }
    }
}
