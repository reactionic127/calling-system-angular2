import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { CampaignCaller, Rating, Caller } from '../../../../../../models';
import { CampaignCallersService, AuthService, TranslateService, UtilsService } from '../../../../../../services';
import { ModalRejectCallerComponent } from '../../../modals/caller-reject/caller-reject.modal';

import * as moment from 'moment-timezone';
import * as Languages from 'language-list';
import { Router } from '@angular/router';

@Component({
  selector   : 'campaign-caller-profile',
  templateUrl: './campaign-caller-profile.component.html'
})
export class CampaignCallerProfileComponent implements OnInit {
  averageRating: number;
  localTime: string;
  ratings: Array<Rating>;
  languages: any                = Languages();
  industryShowLimit: number     = 10;
  hasIndustryShowLimit: boolean = true;
  caller: Caller;

  @Input() campaignCaller: CampaignCaller;
  @ViewChild(ModalRejectCallerComponent) rejectCallerModal: ModalRejectCallerComponent;

  constructor(private router: Router,
              private campaignCallersService: CampaignCallersService,
              private utilsService: UtilsService,
              private _authService: AuthService,
              private toastr: ToastsManager,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.caller        = this.campaignCaller.caller;
    this.localTime     = this.getLocalTime();
    this.averageRating = this.caller.getAverageRating();
  }

  get chanelId(): any {
    if (this._authService.currentUserData && this.campaignCaller.user) {
      return `${this._authService.currentUserData.id},${this.campaignCaller.user.id}`;
    } else {
      return '';
    }
  }

  goBack(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.router.navigateByUrl(segmentedUrl);
  }

  removeCaller(removalReason: string, removalOtherReason: string = null): void {
    this.campaignCaller.status             = 'reject';
    this.campaignCaller.removalReason      = removalReason;
    this.campaignCaller.removalOtherReason = removalOtherReason;

    let subs = this.campaignCallersService.updateStatus(this.campaignCaller, removalReason, removalOtherReason).subscribe(
      () => {
        this.toastr.success(
          this.translateService.translate('Campaign caller was successfully removed')
        );
        this.goBack();
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getLocalTime(): string {
    let timezone = '';

    if (this.caller) {
      timezone = moment().tz(this.caller.timezone).format('h:mm a');
    }

    return timezone;
  }

  onClickShowMoreOrLessIndustries(): void {
    this.hasIndustryShowLimit = !this.hasIndustryShowLimit;
  }
}
