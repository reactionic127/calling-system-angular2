import { Component, OnInit } from '@angular/core';
import { InstantiableComponent } from '../../../../../instantiable.component';
import { TranslateService, UtilsService, AuthService, CallerIdService } from '../../../../../../services';
import { ToastsManager } from 'ng2-toastr';
import { Router } from '@angular/router';
import { Logger } from 'angular2-logger/core';
import * as iso3166_2 from 'iso-3166-2';
import { CallerId } from '../../../../../../models';

@Component({
  selector   : 'caller-id-rent-id',
  templateUrl: './rent-id.component.html'
})
export class CallerIdRentIdComponent extends InstantiableComponent implements OnInit {

  defaultTitle: string      = 'Rent an ID';
  defaultInfo: string       = 'settings.rent-id.general-information';
  countries: any[]          = iso3166_2.data;
  phoneNumbers: CallerId[];
  componentChanges: boolean = false;
  formData: any             = {
    country    : null,
    state      : null,
    phoneNumber: null
  };
  errorsStore: any          = {};
  currentUserData: any      = null;

  constructor(public callerIdService: CallerIdService,
              public logger: Logger,
              public authService: AuthService,
              public toastr: ToastsManager,
              public router: Router,
              private utilsService: UtilsService,
              private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.currentUserData = this.authService.currentUserData;
  }

  getAvailableNumbers(): void {
    if (!this.phoneFiltersSelected()) {
      return;
    }
    this.clearErrorsStrore();
    this.phoneNumbers = [];
    this.callerIdService.getAvailableCallerIds({
      filter: {
        country : this.formData.country,
        state   : this.formData.state ? this.utilsService.getStateCodeFromISO_3166_2Code(this.formData.state) : '',
        areaCode: this.formData.areaCode || ''
      }
    }).then((data) => {
      this.phoneNumbers = data.slice(0, 6);
    }).catch((err) => this.handleServerErrors(err));
  }


  saveAndGoToUrl(url: string): void {
    if (!this.formData.phoneNumber) {
      return;
    }

    this.callerIdService.buyCallerId(this.formData.phoneNumber, this.currentUserData.company.id)
      .then((result) => {
        this.toastr.success(
          this.translateService.translate('CallerId bought')
        );
        this.goToUrl(url);
      })
      .catch((err) => this.handleServerErrors(err));
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  clearErrorsStrore(): void {
    this.errorsStore = {};
  }

  phoneFiltersSelected(): boolean {
    return this.formData.state || this.formData.areaCode;
  }

  handleServerErrors(err: any): void {
    this.utilsService.extractApiErrors(this.errorsStore)(err);
    this.toastr.error(this.utilsService.getApiErrors(err));
    this.logger.error(err);
  }


}
