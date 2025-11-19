import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Events } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {

  private publisher: Subject<any>;

  constructor() {
    this.publisher = new Subject<any>();
  }

  publish(publication: Events) {
    this.publisher.next(publication);
  }

  getObservable(): Subject<Events> {
    return this.publisher;
  }

}
