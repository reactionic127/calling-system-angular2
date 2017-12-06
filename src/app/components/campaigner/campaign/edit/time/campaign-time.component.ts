import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';

import { TranslateService, CampaignSettingsService, UtilsService, CampaignService, CampaignTimeService } from '../../../../../services';

import { Campaign, CampaignSettings } from '../../../../../models';

import * as _ from 'lodash';

@Component({
  selector   : 'campaign-time',
  templateUrl: './campaign-time.component.html'
})
export class TimeComponent implements OnInit {
  campaign: Campaign;
  campaignSettings: CampaignSettings;
  campaignTimes: any[];
  componentChanges: boolean = false;
  campaignClone: Campaign;

  budgetLink: string;
  closeLink: string;

  now: any = new Date;
  campaignStartDate: any;

  timeSlots: any = {
    '9am - 12am': {
      startTime: 540,
      endTime  : 720,
      id       : undefined,
      checked  : false
    },
    '12am - 2pm': {
      startTime: 720,
      endTime  : 840,
      id       : undefined,
      checked  : false
    },
    '2pm - 6pm' : {
      startTime: 840,
      endTime  : 1080,
      id       : undefined,
      checked  : false
    },
    '6pm - 9pm' : {
      startTime: 1080,
      endTime  : 1260,
      id       : undefined,
      checked  : false
    }
  };

  dialAttempts: Array<number> = [1, 2, 3];
  intervalFailedCalls: any    = {
    5  : '5min',
    15 : '15min',
    30 : '30min',
    60 : '60min',
    120: '2h',
    180: '3h',
    240: '4h',
    300: '5h',
    360: '6h'
  };

  defaultTitle: string = 'Time';
  defaultInfo: string  = 'side_help.general-information';
  contextualInfo: string;
  contextualTitle: string;

  constructor(private route: ActivatedRoute,
              private toastr: ToastsManager,
              private router: Router,
              private translateService: TranslateService,
              private campaignService: CampaignService,
              private campaignSettingsService: CampaignSettingsService,
              private campaignTimeService: CampaignTimeService,
              private utilsService: UtilsService,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.campaign      = this.route.snapshot.parent.parent.data['campaign'];
    this.campaignClone = _.clone(this.campaign);

    this.initializeEmptyModels();
    this.refreshCampaign(this.campaign.id);

    // set campaignSettings default values
    this.campaignSettings.callsInterval = this.campaignSettings.callsInterval || 30;
    this.campaignSettings.retries       = this.campaignSettings.retries || 3;

    this.buildInternalLinks();
    this.checkCampaignTimes();

    this.campaignStartDate = this.campaign.startDate ? new Date(this.campaign.startDate) : undefined;
  }

  initializeEmptyModels(): void {
    this.campaignSettings = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.campaignTimes    = [];
  }

  refreshCampaign(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting,campaignTimes'
    }).toPromise()
      .then(campaign => {
          if (campaign.campaignSetting) {
            this.campaignSettings = campaign.campaignSetting;
          }
          if (campaign.campaignSetting.campaignTimes) {
            this.campaignTimes = _.map(this.campaign.campaignSetting.campaignTimes, _.clone);
          }
        }
      );
  }

  checkCampaignTimes(): void {
    if (this.campaignTimes.length) {
      this.campaignTimes.forEach(
        time => {
          _.forEach(this.timeSlots, slot => {
            if (slot.startTime === time.startTime && slot.endTime === time.endTime) {
              slot.id      = time.id;
              slot.checked = true;
            }
          });
        }
      );
    }
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.budgetLink = `${segmentedUrl}/contacts/budget`;
    this.closeLink  = segmentedUrl;
  }

  saveAndGoToUrl(url: string): void {
    Promise.all([this.saveTimes(), this.saveCampaignSettings()])
      .then(
        () => {
          let subs = this.campaignService.updateItem(this.campaignClone).subscribe(
            (item: Campaign) => {
              this.campaign = item;
              this.toastr.success(this.translateService.translate('Campaign saved'));

              this.goToUrl(url);
            },
            err => {
              this.toastr.error(
                this.translateService.translate(this.utilsService.getApiErrors(err)),
                null,
                {dismiss: 'click', showCloseButton: true}
              );
              this.logger.error('Error while saving campaign', err);
            },
            () => subs.unsubscribe()
          );
        }
      )
      .catch(
        err => {
          this.toastr.error(
            this.translateService.translate(this.utilsService.getApiErrors(err)),
            null,
            {dismiss: 'click', showCloseButton: true}
          );
          this.logger.error('Error while saving campaign', err);
        }
      );
  }

  saveTimes(): any {
    let promises = [];

    _.forEach(this.timeSlots, slot => {
      if (slot.checked && slot.id || slot.checked && !slot.id) { // if it's checked, create/update time
        slot.campaignSettingId = this.campaignSettings.id;
        promises.push(this.campaignTimeService.updateItem(slot).toPromise());
      } else if (!slot.checked && slot.id) { // if time exists and is unchecked, then delete it
        promises.push(this.campaignTimeService.deleteItem(slot).toPromise());
      }
    });

    return Promise.all(promises);
  }

  saveCampaignSettings(): Promise<any> {
    return this.campaignSettingsService.updateItem(this.campaignSettings).toPromise()
      .then(
        (item: CampaignSettings) => this.campaign.campaignSetting = item
      );
  }

  changesDetected(): void {
    this.componentChanges = true;
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  handleDatepickerEvent(event: any): void {
    if (event.type === 'dateChanged') {
      this.campaignClone.startDate = event.data.year + '-' + event.data.month + '-' + event.data.day;
    }
  }

  selectTimeSlot(slot: any): void {
    slot.checked = !slot.checked;
  }
}
