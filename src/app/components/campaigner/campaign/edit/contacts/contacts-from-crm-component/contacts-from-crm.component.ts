import { Component, OnInit } from '@angular/core';
import { CampaignSettingsService, CampaignService, TranslateService, UtilsService } from '../../../../../../services';
import { Campaign, CampaignSettings } from '../../../../../../models';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from 'angular2-logger/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector   : 'contacts-from-crm',
  templateUrl: './contacts-from-crm.component.html'
})
export class ContactsFromCrmComponent implements OnInit {
  campaign: Campaign;

  dbLink: string;
  importLink: string;
  budgetLink: string;
  closeLink: string;
  callerIdLink: string;

  formValues: any = {
    scrubForDoNotCall : false,
    campaignAlwaysOpen: false
  };

  componentChanges: boolean = false;
  isExpress: boolean;

  crmSources: any = [
    {
      name : 'Asana',
      image: 'asana.png'
    },
    {
      name : 'AutoPilot',
      image: 'autopilot.png'
    },
    {
      name : 'Base',
      image: 'base.png'
    },
    {
      name : 'Close.io',
      image: 'closeio.png'
    },
    {
      name : 'Dropbox',
      image: 'dropbox.png'
    },
    {
      name : 'Eventbrite',
      image: 'eventbrite.png'
    },
    {
      name : 'Evernote',
      image: 'evernote.png'
    },
    {
      name : 'Excel',
      image: 'excel.png'
    },
    {
      name : 'FreshDesk',
      image: 'freshdesk.png'
    },
    {
      name : 'Google Drive',
      image: 'googledrive.png'
    },
    {
      name : 'Google Sheets',
      image: 'googlesheets.png'
    },
    {
      name : 'Highrise',
      image: 'highrise.png'
    },
    {
      name : 'Hubspot',
      image: 'hubspot.png'
    },
    {
      name : 'Intercom',
      image: 'intercom.png'
    },
    {
      name : 'MailChimp',
      image: 'mailchimp.png'
    },
    {
      name : 'Marketo',
      image: 'marketo.png'
    },
    {
      name : 'MySQL',
      image: 'mysql.png'
    },
    {
      name : 'Office 365',
      image: 'office365.png'
    },
    {
      name : 'Pardot',
      image: 'pardot.png'
    },
    {
      name : 'Pipedrive',
      image: 'pipedrive.png'
    },
    {
      name : 'Salesforce',
      image: 'salesforce.png'
    },
    {
      name : 'Sendgrid',
      image: 'sendgrid.png'
    },
    {
      name : 'Shopify',
      image: 'shopify.png'
    },
    {
      name : 'Slack',
      image: 'slack.png'
    },
    {
      name : 'SugarCRM',
      image: 'sugarcrm.png'
    },
    {
      name : 'Surveymonkey',
      image: 'surveymonkey.png'
    },
    {
      name : 'Typeform',
      image: 'typeform.png'
    },
    {
      name : 'Wufoo',
      image: 'wufoo.png'
    },
    {
      name : 'Zendesk',
      image: 'zendesk.png'
    },
    {
      name : 'Zoho',
      image: 'zoho.png'
    },
  ];

  constructor(private route: ActivatedRoute,
              private campaignSettingsService: CampaignSettingsService,
              private campaignService: CampaignService,
              private utilsService: UtilsService,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private logger: Logger,
              private router: Router) {
  }

  ngOnInit(): void {
    this.campaign                 = this.route.snapshot.parent.parent.parent.data['campaign'];
    this.campaign.campaignSetting = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.getCampaignSettings(this.campaign.id);
    this.buildInternalLinks();
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

  setCampaignAlwaysOpen(flag: boolean): void {
    this.formValues.campaignAlwaysOpen = flag;
    this.changesDetected();
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

    this.dbLink       = `${segmentedUrl}/contacts/database`;
    this.importLink   = `${segmentedUrl}/contacts/import`;
    this.budgetLink   = `${segmentedUrl}/budget`;
    this.callerIdLink = `${segmentedUrl}/caller-id`;
    this.closeLink    = segmentedUrl;

    let segments   = segmentedUrl.split('/');
    this.isExpress = (segments[3] && segments[3] === 'express');
  }

  changesDetected(): void {
    this.componentChanges = true;
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
