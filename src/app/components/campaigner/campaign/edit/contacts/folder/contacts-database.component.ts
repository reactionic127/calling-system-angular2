import { Component, OnInit } from '@angular/core';
import { CampaignSettingsService, CampaignService, CampaignQueryService, TranslateService, UtilsService } from '../../../../../../services';
import { Campaign, CampaignSettings, CampaignQuery } from '../../../../../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from 'angular2-logger/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector   : 'contacts-database',
  templateUrl: './contacts-database.component.html'
})
export class ContactsDatabaseComponent implements OnInit {
  campaign: Campaign;
  campaignQuery: CampaignQuery;
  queryFields: any;
  selectedQueryKey: string;
  selectedQueryFields: any;

  importLink: string;
  crmLink: string;
  scriptsLink: string;
  closeLink: string;

  formValues: any = {
    scrubForDoNotCall : false,
    campaignAlwaysOpen: false
  };

  componentChanges: boolean = false;
  isExpress: boolean;

  //Fields for Geolocation Tab
  geoFields: Array<string> = [
    'city',
    'state',
    'street',
    'zip'
  ];

  constructor(private route: ActivatedRoute,
              private campaignSettingsService: CampaignSettingsService,
              private campaignService: CampaignService,
              private campaignQueryService: CampaignQueryService,
              private utilsService: UtilsService,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private logger: Logger,
              private router: Router) {
  }

  ngOnInit(): void {
    this.campaign                 = this.route.snapshot.parent.parent.parent.data['campaign'];
    this.campaign.campaignSetting = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.campaignQuery            = this.campaignQueryService.getNewModel({campaignId: +this.campaign.id});
    this.getCampaignSettings(this.campaign.id);
    this.getCampaignQuery(this.campaign.id);
    this.getCampaignDbQueryFields(this.campaign.id);
    this.buildInternalLinks();
  }

  getCampaignQuery(campaignId: string): void {
    this.campaignQueryService.getCampaignQuery(campaignId)
      .then(res => {
        this.campaignQuery = res.data.attributes;
        this.campaignQuery.campaignId = campaignId;
        // Set Default DB
        if(this.queryFields) {
          this.selectedQueryKey = this.campaignQuery.databaseName;
          this.selectedQueryFields = this.queryFields[this.selectedQueryKey];
        }
      })
      .catch(res => {});
  }

  getCampaignDbQueryFields(campaignId: string): void {
    this.campaignQueryService.getCampaignDbQueryFields(campaignId)
      .then(res => {
        this.queryFields = res;
        // Set Default DB
        if(this.campaignQuery.databaseName) {
          this.selectedQueryKey = this.campaignQuery.databaseName;
          this.selectedQueryFields = this.queryFields[this.selectedQueryKey];
        }
      })
      .catch(res => {});
  }

  setQueryFields(queryField: any): void {
    this.selectedQueryKey = queryField.key;
    this.selectedQueryFields = queryField.value;

    if(this.selectedQueryKey !== this.campaignQuery.databaseName) {
      this.campaignQuery.databaseName = queryField.key;
      this.campaignQuery.fields = {};
    }
  }

  changesDetected(): void {
    this.componentChanges = true;
    console.log(this.campaignQuery);
    this.campaignQueryService.calculateQuery(this.campaignQuery)
      .then(res => {
        this.campaignQuery = res.data.attributes;
        this.campaignQuery.campaignId = this.campaign.id;
      })
      .catch(res => {
        this.logger.error('Error saving campaign query', res.data);
      });
  }

  updateBoolean(key: string, value: boolean): void {
    this.campaignQuery.fields[key] = value;
    this.changesDetected();
  }

  isGeoFields(type: string): Boolean {
    return this.geoFields.indexOf(type) !== -1;
  }

  saveQuery(): void {
    this.campaignQueryService.saveCampaignQuery(this.campaignQuery)
      .then(response => {
        console.log(response);
      })
      .catch(response => {
        this.toastr.error(this.translateService.translate('Error saving campaign query'));
        this.logger.error('Error saving campaign query', response);
      });
  }

  getCampaignSettings(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting'
    }).toPromise()
      .then((campaign: Campaign) => {
          if (campaign.campaignSetting) {
            this.campaign.campaignSetting = campaign.campaignSetting;
          }

          this.formValues.scrubForDoNotCall  = this.campaign.campaignSetting.scrub;
          this.formValues.campaignAlwaysOpen = this.campaign.alwaysOpen;
        }
      );
  }

  saveAndGoToUrl(url: string): void {
    this.campaign.campaignSetting.scrub = this.formValues.scrubForDoNotCall || false;

    this.campaignSettingsService.updateItem(this.campaign.campaignSetting).toPromise()
      .then((result: CampaignSettings) => {
        this.saveCampaign(url);
      })
      .catch((result) => {
        this.toastr.error(this.translateService.translate('Error saving campaign settings'));
        this.logger.error('Error saving campaign settings', result);
      });
  }

  saveCampaign(url: string): void {
    this.campaign.alwaysOpen = this.formValues.campaignAlwaysOpen;
    this.campaignService.updateItem(this.campaign).toPromise()
      .then((result: Campaign) => {
        this.campaign = result;
        this.toastr.success(this.translateService.translate('Campaign saved'));
        this.goToUrl(url);
      })
      .catch((result) => {
        this.toastr.error(this.translateService.translate('Error saving campaign'));
        this.logger.error('Error saving campaign', result);
      });
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.importLink   = `${segmentedUrl}/contacts/import`;
    this.crmLink      = `${segmentedUrl}/contacts/from-crm`;
    this.scriptsLink  = `${segmentedUrl}/scripts`;
    this.closeLink    = segmentedUrl;

    let segments   = segmentedUrl.split('/');
    this.isExpress = (segments[3] && segments[3] === 'express');
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
