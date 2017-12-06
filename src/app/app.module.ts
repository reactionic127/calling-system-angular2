import { JsonApiModule } from 'angular2-jsonapi';
import {
  NgModule,
  ApplicationRef
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Http,
  HttpModule,
  RequestOptions,
  XHRBackend
} from '@angular/http';
import { RouterModule } from '@angular/router';
import 'rxjs/add/operator/share';

import {
  removeNgStyles,
  createNewHosts,
  createInputTransfer
} from '@angularclass/hmr';
import { Logger, Options as LoggerOptions, Level as LogLevel } from 'angular2-logger/core';
import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { RatingModule } from 'ng2-rating';
import { Ng2ImgFallbackModule } from 'ng2-img-fallback';
import { DatePickerModule } from 'ng2-datepicker';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NouisliderComponent } from 'ng2-nouislider';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import * as Pipes from './pipes';
import { AuthHttp } from './services/auth/auth.http';
import { AuthService } from './services/auth/auth.service';
import {
  AppState,
  InteralStateType
} from './app.service';
import { App } from './components/app.component';
import * as AllComponents from './components';
import * as AllDirectives from './directives';
import { ModalModule, PaginationModule, TooltipModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';

import { APP_PROVIDERS } from './providers';
import { DashboardModule } from './components/caller/dashboard/dashboard.module';
import { MyCampaignsModule } from './components/caller/campaign/campaign.module';
import { CallerProfileModule } from './components/caller/caller-profile/caller-profile.module';
import { TopFiveLeadersPipe } from './pipes/leaders.pipe';
import { CallDurationPipe } from './pipes/call-duration.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { FileNamePipe } from './pipes/fileName.pipe';

type StoreType = {
  state: InteralStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstrapping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    TopFiveLeadersPipe,
    TruncatePipe,
    FileNamePipe,
    CallDurationPipe,
    ...(Object.keys(Pipes).map(k => Pipes[k])),
    ...(Object.keys(AllComponents).map(k => AllComponents[k])),
    ...(Object.keys(AllDirectives).map(k => AllDirectives[k])),
    NouisliderComponent
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    ModalModule,
    PaginationModule,
    TooltipModule,
    DatepickerModule,
    RatingModule,
    ToastModule.forRoot(<ToastOptions>{positionClass: 'toast-bottom-right', toastLife: 4000, enableHTML: true}),
    Ng2ImgFallbackModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JsonApiModule,
    DashboardModule,
    MyCampaignsModule,
    CallerProfileModule,
    DatePickerModule,
    ChartsModule,
    RouterModule.forRoot(ROUTES, {useHash: true})
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    {
      provide: Http,
      useFactory: (backend: XHRBackend, defaultOptions: RequestOptions, authService: AuthService) =>
        new AuthHttp(backend, defaultOptions, authService),
      deps: [XHRBackend, RequestOptions, AuthService]
    },
    Logger,
    { provide: LoggerOptions, useValue: { level: ENV === 'production' ? LogLevel.ERROR : LogLevel.LOG } }
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {
  }

  hmrOnInit(store: StoreType): void {
    if (!store || !store.state) return;
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }
    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType): void {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType): void {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
