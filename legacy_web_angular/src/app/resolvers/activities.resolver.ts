import {Injectable} from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, EMPTY, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {IActivitiesComponentResolvedData} from "@app/interfaces/i-resolvers";
import {ActivitiesService} from "@app/services/activities.service";
import {SAPUsersService} from "@app/services/sapusers.service";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IActivities, IContactPersonActivities} from "@app/interfaces/i-activities";
import {StructuresService} from "@app/services/structures.service";

@Injectable({
  providedIn: 'root'
})
export class ActivitiesResolver implements Resolve<IActivitiesComponentResolvedData | null> {

  constructor(
    private activitiesService: ActivitiesService,
    private SAPUsersService: SAPUsersService,
    private structurService: StructuresService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IActivitiesComponentResolvedData | null> {

    let detailActivity$;
    if (route.queryParamMap.has('Code')) {
      let Code = route.queryParamMap.get('Code') ?? 0;
      detailActivity$ = this.activitiesService.GetDetailActivity(+Code).pipe(
        catchError(error => of({Message: ''} as ICLResponse<IActivities>))
      );
    } else {
      detailActivity$ = of({Message: ''} as ICLResponse<IActivities>);
    }

    return forkJoin({
      TypeActivities: this.activitiesService.GetTypeActivities().pipe(catchError(error => of(null))),
      SubjectActivities: this.activitiesService.GetSubjectActivities().pipe(catchError(error => of(null))),
      PriorityActivities: this.activitiesService.GetPriorityActivities().pipe(catchError(error => of(null))),
      RecurrenceActivities: this.activitiesService.GetRecurrenceActivities().pipe(catchError(error => of(null))),
      LocationActivities: this.activitiesService.GetLocationActivities().pipe(catchError(error => of(null))),
      OptionActivities: this.activitiesService.GetOptionActivities().pipe(catchError(error => of(null))),
      DayOfWeekActivities: this.activitiesService.GetDayOfWeekActivities().pipe(catchError(error => of(null))),
      WeekActivities: this.activitiesService.GetWeekActivities().pipe(catchError(error => of(null))),
      MonthActivities: this.activitiesService.GetMonthActivities().pipe(catchError(error => of(null))),
      ObjectSAPActivities: this.activitiesService.GetObjectSAPActivities().pipe(catchError(error => of(null))),
      SAPUsers: this.SAPUsersService.GetSAPUsers().pipe(catchError(error => of(null))),
      ActivityStates: this.activitiesService.GetActivityStates().pipe(catchError(error => of(null))),
      TypesActivityReminders: this.structurService.Get('TypesActivityReminders').pipe(catchError(error => of(null))),
      DetailActivity: detailActivity$
    }).pipe(
      map(response => ({

          TypeActivities: response?.TypeActivities?.Data ?? [],
          SubjectActivities: response?.SubjectActivities?.Data ?? [],
          PriorityActivities: response?.PriorityActivities?.Data ?? [],
          RecurrenceActivities: response?.RecurrenceActivities?.Data ?? [],
          LocationActivities: response?.LocationActivities?.Data ?? [],
          OptionActivities: response?.OptionActivities?.Data ?? [],
          DayOfWeekActivities: response?.DayOfWeekActivities?.Data ?? [],
          WeekActivities: response?.WeekActivities?.Data ?? [],
          MonthActivities: response?.MonthActivities?.Data ?? [],
          ObjectSAPActivities: response?.ObjectSAPActivities?.Data ?? [],
          SAPUsers: response?.SAPUsers?.Data ?? [],
          DetailActivity:response?.DetailActivity.Data,
          TypeActivityReminders: response?.TypesActivityReminders?.Data ?? [],
          ActivityStates: response?.ActivityStates?.Data ?? []
      } as IActivitiesComponentResolvedData)
    ),
    switchMap((callback)=> {
      const data = callback;
      if(data?.DetailActivity){
        return this.activitiesService.GetContactPerson(data?.DetailActivity.CardCode).pipe(
          map(ContactPerson => ({...data, ContactPerson: ContactPerson?.Data ?? []} as IActivitiesComponentResolvedData)),
          catchError(() => of(data))
        )
      }

      return of(data);
    }),
      switchMap((callback)=> {
        const data = callback;
        if(data?.DetailActivity && data?.DetailActivity.Country){
          return this.activitiesService.GetCountryActivity(data?.DetailActivity.Country).pipe(
            map(country => ({...data, CountryActivity: country?.Data ?? []} as IActivitiesComponentResolvedData)),
            catchError(() => of(data))
          )
        }

        return of(data);
      }),
      switchMap((callback)=> {
        const data = callback;
        if(data?.DetailActivity && data?.DetailActivity.Country){
          return this.activitiesService.GetStatesCountriesActivity(data?.DetailActivity.Country).pipe(
            map(states => ({...data, StatesCountryActivity: states?.Data ?? []} as IActivitiesComponentResolvedData)),
            catchError(() => of(data))
          )
        }

        return of(data);
      }),
      switchMap((callback)=> {
        const data = callback;
        if(data?.DetailActivity){
          return this.activitiesService.GetBPAddress(data?.DetailActivity.CardCode,'').pipe(
            map(states => ({...data, BusinessPartnersAddress: states?.Data ?? []} as IActivitiesComponentResolvedData)),
            catchError(() => of(data))
          )
        }

        return of(data);
      }),
      switchMap((callback)=> {
        const data = callback;
        if(data?.DetailActivity){
          return this.activitiesService.GetCountriesActivities(String(data?.DetailActivity.Country)).pipe(
            map(states => ({...data, CountriesActivity: states?.Data ?? []} as IActivitiesComponentResolvedData)),
            catchError(() => of(data))
          )
        }

        return of(data);
      })
    )

  }
}
