import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
// declare let ga: Function;

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector     : 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls    : [
    './app.style.scss',
    '../../assets/scss/includes.scss'
  ],
  templateUrl  : 'app.component.html'
})
export class App {
  name: string = 'Upcall';

  constructor(public router: Router) {
    this.router.events.subscribe(
      (event: Event) => {
        if (event instanceof NavigationEnd) {
          // register navigation change for Google Analytics
          // ga('send', 'pageview', event.urlAfterRedirects);

          // send update request so Intercom chat can look for new messages
          // (window as any).Intercom('update');
        }
      });
  }
}
