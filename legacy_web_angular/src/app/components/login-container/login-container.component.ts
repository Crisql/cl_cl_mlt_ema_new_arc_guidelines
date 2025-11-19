import { Component, Inject, OnInit } from '@angular/core';
import { CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown } from '@clavisco/linker';
import { environment } from 'src/environments/environment';
import {Repository, Structures} from "@clavisco/core";
import {Login} from "@clavisco/login";

@Component({
  selector: 'app-access',
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.scss']
})
export class LoginContainerComponent implements OnInit {
  shouldResolve: boolean = true;
  pathToRedirect: string = '/home';

  apiUrl: string = environment.apiUrl;
  sessionName: string = 'Session';
  loginCmpId: string = 'LOGIN-01';
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  constructor(@Inject('LinkerService') private linkerService: LinkerService) { }

  LoginEvents(): void
  {
    Register<CL_CHANNEL>(this.loginCmpId, CL_CHANNEL.ERROR, this.LoginError, this.callbacks);
  }

  ngOnInit(): void {
    //Para escuchar todos los evento del componente
    this.linkerService.Flow()?.pipe(
      StepDown<CL_CHANNEL>(this.callbacks),
    ).subscribe({
      next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
      error: error => console.log(`mi error`, error)
    });

    //Solicita el token de recuperacion
    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.LOGN,
      setting: 'sendRecoverPasswordEmail',
      value: {
        urlVariableToReplaceWithEmail: '#EMAIL',
        endpointToRequest: `api/Passwords?userEmail=#EMAIL`
      } as Login.Structures.ISendRecoverPasswordEmailConfig
    })

    //Cambia como tal la contrasena en la recuracion
    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.LOGN,
      setting: 'recoverPassword',
      value: {
        endpointToRequest: '' +
          'api/Passwords/RecoveryPassword'
      }  as Login.Structures.IChangePasswordConfig
    })

    //Cambia la contasena
    Repository.Behavior.SetTokenConfiguration({
      token: Structures.Enums.TOKENS.LOGN,
      setting: 'changePassword',
      value: {
        endpointToRequest: 'api/Passwords/ChangePassword'
      } as Login.Structures.IChangePasswordConfig
    })


  }

  LoginError(_event: ICLEvent): void
  {
    console.log(_event);
  }

}
