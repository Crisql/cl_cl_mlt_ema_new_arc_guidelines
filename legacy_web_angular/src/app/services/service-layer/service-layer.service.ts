import { Injectable } from '@angular/core';
import { StorageKey } from '@app/enums/e-storage-keys';
import { ICompany } from '@app/interfaces/i-company';
import { IConection } from '@app/interfaces/i-conection';
import { IUserAssign } from '@app/interfaces/i-user';
import { SharedService } from '@app/shared/shared.service';
import { Repository } from '@clavisco/core';
import { LicensesService } from '../licenses.service';
import { ILicense } from '@app/interfaces/i-license';

@Injectable({
  providedIn: 'root'
})
export class ServiceLayerService {

  private readonly CONTROLLER = 'Login';

  constructor(
    private licensesService: LicensesService
  ) {
  }

  /**
   * Authenticates the user by sending a login request to the remote SAP service.
   * Fetches license credentials, builds the request payload, and handles the response.
   */
  Login(): void{

    let currentCcompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    let currentConnection = Repository.Behavior.GetStorageObject<IConection>(StorageKey.CurrentConnection);
    let currentUserAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign);

    this.licensesService.Get<ILicense>(currentUserAssign?.LicenseId).subscribe(license => {
      let path: string = `${currentConnection?.SLUrl}${this.CONTROLLER}`;

      fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          CompanyDB: currentCcompany?.DatabaseCode,
          UserName: license.Data.User,  //'CLAVISCO\\cl.desarrollo.sql1',
          Password: license.Data.Password //'JzjF#yK7Gs'
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Login exitoso:', data);
      })
      .catch(error => {
        console.error('Error en login:', error);
      });
    }, error => {
      console.error(error);
    })
  }

  // Esto es un ejemplo de como consumir una vista de SL

  // GetExcangeRate(sessionId: string): Promise<Response>{
  //   const today = new Date().toISOString().slice(0, 10); // formato YYYY-MM-DD

  //   let path: string = `https://clapp44.clavisco.com:50000/${this.CONTROLLER}/view.svc/CLVS_D_MLT_SLT_EXCHANGERATE_B1SLQuery`;

  //   return fetch(path, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Cookie': `B1SESSION=${sessionId}` // si estás en navegador
  //       // En Node.js también puedes usar: 'Cookie': sessionCookie
  //     },
  //     credentials: 'include'
  //   });
  // }
}
