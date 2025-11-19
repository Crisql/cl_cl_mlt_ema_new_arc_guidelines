import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {
  IActivities, IActivityStates,
  IContactPersonActivities, ICountriesActivity,
  IDayOfWeekActivities,
  IDocumentsActivities,
  IItemsActivities,
  ILocationActivities,
  IMonthActivities,
  IObjectSAPActivities,
  IOptionActivities,
  IPriority,
  IRecurrenceActivities,
  ISearchDocumentsActivity, IStatesCountriesActivity,
  ISubjectActivities,
  ITypeActivities,
  IWeekActivities
} from "@app/interfaces/i-activities";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IBPAddresses} from "@app/interfaces/i-business-partner";

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  private readonly CONTROLLER: string = 'api/Activities';

  constructor(
    private http: HttpClient
  ) {
  }

  /**
   * This method is used to get contact person
   * @param _cardCode parameter card code of the business parther
   * @constructor
   */
  GetContactPerson(_cardCode: string): Observable<ICLResponse<IContactPersonActivities[]>> {
    return this.http.get<ICLResponse<IContactPersonActivities[]>>(`${this.CONTROLLER}/GetContactPerson?CardCode=${encodeURIComponent(_cardCode)}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Contactos por socio de negocio obtenidos',
              OnError: 'No se puedieron obtener contactos por socio de negocios'
            }
          )
      });
  }

  /**
   * This method is used to get type activities
   * @constructor
   */
  GetTypeActivities(): Observable<ICLResponse<ITypeActivities[]>> {
    return this.http.get<ICLResponse<ITypeActivities[]>>(`${this.CONTROLLER}/GetTypeActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Tipos de actividades obtenidos',
              OnError: 'No se puedieron obtener los tipos de actividades'
            }
          )
      });
  }

  /**
   * This method is used to get subject
   * @constructor
   */
  GetSubjectActivities(): Observable<ICLResponse<ISubjectActivities[]>> {
    return this.http.get<ICLResponse<ISubjectActivities[]>>(`${this.CONTROLLER}/GetSubjectActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Asuntos obtenidos',
              OnError: 'No se puedieron obtener los asuntos'
            }
          )
      });
  }

  /**
   * This method is used to get Location
   * @constructor
   */
  GetLocationActivities(): Observable<ICLResponse<ILocationActivities[]>> {
    return this.http.get<ICLResponse<ILocationActivities[]>>(`${this.CONTROLLER}/GetLocationActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Localidades obtenidas',
              OnError: 'No se puedieron obtener las localidades'
            }
          )
      });
  }

  /**
   * This method is used to get recurrence
   * @constructor
   */
  GetRecurrenceActivities(): Observable<ICLResponse<IRecurrenceActivities[]>> {
    return this.http.get<ICLResponse<IRecurrenceActivities[]>>(`${this.CONTROLLER}/GetRecurrenceActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Opciones de repetición obtenidas.',
              OnError: 'No se puedieron obtener las opciones de repetición.'
            }
          )
      });
  }

  /**
   * This method is used to get prioritys
   * @constructor
   */
  GetPriorityActivities(): Observable<ICLResponse<IPriority[]>> {
    return this.http.get<ICLResponse<IPriority[]>>(`${this.CONTROLLER}/GetPriorityActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Prioridades obtenidas',
              OnError: 'No se puedieron obtener las prioridades'
            }
          )
      });
  }

  /**
   * This method is used to get option activities
   * @constructor
   */
  GetOptionActivities(): Observable<ICLResponse<IOptionActivities[]>> {
    return this.http.get<ICLResponse<IOptionActivities[]>>(`${this.CONTROLLER}/GetOptionActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Opciones de actividad obtenidas',
              OnError: 'No se puedieron obtener las opciones de actividad'
            }
          )
      });
  }

  /**
   * This method is used to get week
   * @constructor
   */
  GetDayOfWeekActivities(): Observable<ICLResponse<IDayOfWeekActivities[]>> {
    return this.http.get<ICLResponse<IDayOfWeekActivities[]>>(`${this.CONTROLLER}/GetDayOfWeek`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Días de la semana obtenidos.',
              OnError: 'No se puedieron obtener los días de la semana.'
            }
          )
      });
  }

  /**
   * This method is used to get week
   * @constructor
   */
  GetWeekActivities(): Observable<ICLResponse<IWeekActivities[]>> {
    return this.http.get<ICLResponse<IWeekActivities[]>>(`${this.CONTROLLER}/GetWeek`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Orden de la semana obtenidos.',
              OnError: 'No se puedieron obtener el orden de la semana'
            }
          )
      });
  }

  /**
   * This method is used to get month
   * @constructor
   */
  GetMonthActivities(): Observable<ICLResponse<IMonthActivities[]>> {
    return this.http.get<ICLResponse<IMonthActivities[]>>(`${this.CONTROLLER}/GetMonth`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Meses obtenidos.',
              OnError: 'No se puedieron obtener los meses.'
            }
          )
      });
  }

  /**
   * This method is used to get object SAP
   * @constructor
   */
  GetObjectSAPActivities(): Observable<ICLResponse<IObjectSAPActivities[]>> {
    return this.http.get<ICLResponse<IObjectSAPActivities[]>>(`${this.CONTROLLER}/GetObjectSAPActivities`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Lista de Objetos de SAP obtenidos.',
              OnError: 'No se puedieron obtener los objetos de SAP.'
            }
          )
      });
  }

  /**
   * This method is used to get documents data
   * @param _docType parameter type document
   * @param _docNum parameter number document
   * @constructor
   */
  GetDocumentsActivities(_docType: number, _docNum: number): Observable<ICLResponse<IDocumentsActivities[]>> {
    return this.http.get<ICLResponse<IDocumentsActivities[]>>(`${this.CONTROLLER}/GetDocumentsActivities?docType=${_docType}&docNum=${_docNum}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Documentos para actividad obtenidos',
              OnError: 'No se puedieron obtener los documentos para actividad.'
            }
          )
      });
  }

  /**
   * This method is used to obtain a list of items for the activity screen
   * @param _value parameter filter value
   * @constructor
   */
  GetItemsActivities(_value: string): Observable<ICLResponse<IItemsActivities[]>> {
    return this.http.get<ICLResponse<IItemsActivities[]>>(`${this.CONTROLLER}/GetItemsActivities?Description=${encodeURIComponent(_value)}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Artículos para actividad obtenidos',
              OnError: 'No se puedieron obtener los artículos para actividad.'
            }
          )
      });
  }

  /**
   * This method is used insert activities
   * @param _activities
   * @constructor
   */
  Post(_activities: IActivities): Observable<ICLResponse<IActivities>> {
    return this.http.post<ICLResponse<IActivities>>(this.CONTROLLER, _activities);
  }

  /**
   * This method is used update activities
   * @param _activities
   * @constructor
   */
  Patch(_activities: IActivities): Observable<ICLResponse<IActivities>> {
    return this.http.patch<ICLResponse<IActivities>>(this.CONTROLLER, _activities);
  }

  /**
   * Retrieves documents based on a date range, code, and card code.
   *
   * @param _dateFrom The start date of the search range.
   * @param _dateTo The end date of the search range.
   * @param _code The code used to filter documents.
   * @param _cardCode The card code associated with the documents.
   * @constructor Creates an instance of the GetDocuments object.
   */
  GetDocuments(_dateForm: string, _dateTo: string, _code: number, _cardCode: string): Observable<ICLResponse<ISearchDocumentsActivity[]>> {
    return this.http.get<ICLResponse<ISearchDocumentsActivity[]>>(`${this.CONTROLLER}/GetSearchActivities?DateFrom=${_dateForm}&DateTo=${_dateTo}&ActivityCode=${_code}&CardCode=${_cardCode}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Actividades obtenidas.',
              OnError: 'No se puedieron obtener las actividades.'
            }
          )
      });
  }

  /**
   *
   * @param _code
   * @constructor
   */
  GetDetailActivity( _code: number): Observable<ICLResponse<IActivities>> {
    return this.http.get<ICLResponse<IActivities>>(`${this.CONTROLLER}/GetDetailActivity?ActivityCode=${_code}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Detalle de la actividad obtenido.',
              OnError: 'No se pudo obtener el detalle de la actividad.'
            }
          )
      });
  }

  /**
   * This method gets the states of activity type "Task"
   * @constructor
   */
  GetActivityStates(): Observable<ICLResponse<IActivityStates[]>> {
    return this.http.get<ICLResponse<IActivityStates[]>>(`${this.CONTROLLER}/GetActivityStates`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Estados de actividad obtenidos',
              OnError: 'No se pudo obtener los estados de actividad'
            }
          )
      });
  }

  /**
   * This method gets the countries of activity
   * @constructor
   */
  GetCountriesActivity(_country?: string): Observable<ICLResponse<ICountriesActivity[]>> {
    return this.http.get<ICLResponse<ICountriesActivity[]>>(`${this.CONTROLLER}/GetCountriesActivity?FilterCountry=${_country}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Países de actividad obtenidos',
              OnError: 'No se pudo obtener los países de actividad'
            }
          )
      });
  }

  /**
   * This method gets the countries of activity
   * @constructor
   */
  GetStatesCountriesActivity(_countryCode: string): Observable<ICLResponse<IStatesCountriesActivity[]>> {
    return this.http.get<ICLResponse<IStatesCountriesActivity[]>>(`${this.CONTROLLER}/GetStatesCountriesActivity?CountryCode=${_countryCode}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Estados por país obtenidos',
              OnError: 'No se pudo obtener los estados por país'
            }
          )
      });
  }

  /**
   * This method get the country of activity
   * @constructor
   */
  GetCountryActivity(_country: string): Observable<ICLResponse<ICountriesActivity>> {
    return this.http.get<ICLResponse<ICountriesActivity>>(`${this.CONTROLLER}/GetCountryActivity?FilterCountry=${_country}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'País de actividad obtenido',
              OnError: 'No se pudo obtener el país de actividad'
            }
          )
      });
  }
  /**
   * This method get the address of the SN
   * @constructor
   */
  GetBPAddress(_cardCode: string, _pattern: string): Observable<Structures.Interfaces.ICLResponse<IBPAddresses[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IBPAddresses[]>>(`${this.CONTROLLER}/GetBPAddresses?CardCode=${_cardCode}&Pattern=${_pattern}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Dirección de cliente obtenida',
          OnError: 'No se pudo obtener la dirección del cliente'
        })});
  }

  /**
   * This method get the country of activities
   * @constructor
   */
  GetCountriesActivities(_country?: string): Observable<ICLResponse<ICountriesActivity[]>> {
    return this.http.get<ICLResponse<ICountriesActivity[]>>(`${this.CONTROLLER}/GetCountriesActivityWithouPagination?FilterCountry=${_country}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Países de actividad obtenidos',
              OnError: 'No se pudo obtener los países de actividad'
            }
          )
      });
  }

}
