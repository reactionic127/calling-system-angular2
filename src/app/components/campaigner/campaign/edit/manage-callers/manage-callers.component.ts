import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';

import { TranslateService, CampaignSettingsService, UtilsService, CampaignService } from '../../../../../services';

import { Campaign, CampaignSettings } from '../../../../../models';

import * as _ from 'lodash';

@Component({
  templateUrl: './manage-callers.component.html'
})
export class ManageCampaignCallersComponent implements OnInit {
  campaign: Campaign;
  campaignSettings: CampaignSettings;
  componentChanges: boolean = false;

  outcomeLink: string;
  closeLink: string;

  defaultTitle: string = 'Manage Upcallers';
  defaultInfo: string  = 'settings.manage-callers.general-information';
  contextualInfo: string;
  contextualTitle: string;

  constructor(private route: ActivatedRoute,
              private toastr: ToastsManager,
              private router: Router,
              private translateService: TranslateService,
              private campaignService: CampaignService,
              private campaignSettingsService: CampaignSettingsService,
              private utilsService: UtilsService,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.campaign         = _.clone(this.route.snapshot.parent.parent.data['campaign']);
    this.campaignSettings = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.getCampaignSettings(this.campaign.id);
    this.buildInternalLinks();
  }

  getCampaignSettings(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting'
    }).toPromise()
      .then((campaign: Campaign) => {
          if (campaign.campaignSetting) {
            this.campaignSettings = campaign.campaignSetting;
          }
        }
      );
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);
    this.outcomeLink = `${segmentedUrl}/outcome`;
    this.closeLink   = segmentedUrl;
  }

  saveAndGoToUrl(url: string): void {
    Promise.all([this.saveCampaignSettings()])
      .then(
        () => {
          this.toastr.success(this.translateService.translate('Campaign saved'));
          this.goToUrl(url);
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

  saveCampaignSettings(): Promise<any> {
    return this.campaignSettingsService.updateItem(this.campaignSettings).toPromise()
      .then((item: CampaignSettings) => {
        this.campaignSettings = this.route.snapshot.parent.parent.data['campaign'].campaignSetting = item;
      });
  }

  changesDetected(): void {
    this.componentChanges = true;
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
