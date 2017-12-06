import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Campaign, CampaignSettings, FollowUpActions } from '../../../../../models';
import { CampaignSettingsService, UtilsService, AuthService, FollowUpActionsService, TranslateService, CampaignService } from '../../../../../services';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';

import * as _ from 'lodash';

@Component({
  selector   : 'campaign-outcome',
  templateUrl: './campaign-outcome.component.html'
})
export class OutcomeComponent implements OnInit {

  timeSpan: Object = {
    30 : '30 min',
    60 : '1 h',
    120: '2 h',
    180: '3 h',
    360: '6 h',
  };

  campaign: Campaign;
  callerIdLink: string;
  closeLink: string;
  manageCallersLink: string;
  currentUserData: any;

  initialEmail: string      = null;
  initialSenderName: string = null;

  initialDontCallAfterVoicemail: boolean = null;
  initialVoicemailScriptText: string     = null;

  componentChanges: boolean = false;
  campaignSettings: CampaignSettings;
  followUpActions: FollowUpActions;
  voicemailChecked: boolean;

  constructor(private toastr: ToastsManager,
              private route: ActivatedRoute,
              private campaignService: CampaignService,
              private campaignSettingsService: CampaignSettingsService,
              private authService: AuthService,
              private followUpActionsService: FollowUpActionsService,
              private router: Router,
              private logger: Logger,
              private utilsService: UtilsService,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.parent.data['campaign'];
    this.initializeEmptyModels();
    this.getCampaignSettings(this.campaign.id);
    this.setInternalLinks();
  }

  initializeEmptyModels(): void {
    this.campaignSettings = this.campaignSettingsService.getNewModel({campaignId: +this.campaign.id});
    this.followUpActions  = this.followUpActionsService.getNewModel({campaignId: +this.campaign.id});
  }

  getCampaignSettings(campaignId: string): void {
    this.campaignService.getItem(campaignId, {
      include: 'campaignSetting,followUpAction'
    }).toPromise()
      .then((campaign: Campaign) => {
          if (campaign.campaignSetting) {
            this.campaignSettings = campaign.campaignSetting;
          }
          if (campaign.followUpAction) {
            this.followUpActions = campaign.followUpAction;
          }

          if (this.initialDontCallAfterVoicemail === null) {
            this.initialDontCallAfterVoicemail = this.campaignSettings.dontCallAfterVoicemail;
          }
          if (this.initialVoicemailScriptText === null) {
            this.initialVoicemailScriptText = this.campaignSettings.voicemailScriptText;
          }

          this.campaignSettings.voicemailScriptText = this.campaignSettings.voicemailScriptText || '';
          this.voicemailChecked                     = !!this.campaignSettings.voicemailScriptText;

          this.currentUserData = this.authService.currentUserData;
          if (!this.campaignSettings.emailReplyTo) {
            this.campaignSettings.emailReplyTo = this.currentUserData.email;
          }
          if (this.initialEmail === null) {
            this.initialEmail = this.campaignSettings.emailReplyTo;
          }
          if (!this.campaignSettings.emailSender) {
            this.campaignSettings.emailSender = this.currentUserData.fullName;

          }
          if (this.initialSenderName === null) {
            this.initialSenderName = this.campaignSettings.emailSender;
          }
        }
      );
  }

  setProperty(flag: boolean, propertyToSet: string): void {
    this.campaignSettings[propertyToSet] = flag;
    this.componentChanges                = true;
  }

  setVoiceMailScript(flag: boolean, propertyToSet: string): void {
    this.setProperty(flag, propertyToSet);
    if (!flag) {
      this.resetVoiceMailFields();
    }
  }

  setAutomaticFollowUp(flag: number): void {
    this.followUpActions.email = flag;
    if (flag === 0) {
      this.resetEmailFields();
    }
  }

  setScript(e: any, voiceMailScriptInput: any): void {
    if (e.target.checked) {
      voiceMailScriptInput.disabled = false;
      this.voicemailChecked         = true;
    } else {
      this.voicemailChecked         = false;
      voiceMailScriptInput.disabled = true;

      // remove text if the user removed it
      if (this.campaignSettings.voicemailScriptText === '') {
        this.campaignSettings.voicemailScriptText = '';
      } else {
        this.campaignSettings.voicemailScriptText = this.initialVoicemailScriptText;
      }
    }
  }

  resetVoiceMailFields(): void {
    this.campaignSettings.dontCallAfterVoicemail = this.initialDontCallAfterVoicemail;
    this.campaignSettings.voicemailScriptText    = this.initialVoicemailScriptText;
  }

  resetEmailFields(): void {
    this.campaignSettings.emailSender  = this.initialSenderName;
    this.campaignSettings.emailReplyTo = this.initialEmail;
  }

  setInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.callerIdLink      = `${segmentedUrl}/caller-id`;
    this.manageCallersLink = `${segmentedUrl}/manage-callers`;
    this.closeLink         = segmentedUrl;
  }

  saveAndGoToUrl(url: string): void {
    if (!this.checkVoicemailScriptText()) {
      return;
    }

    this.campaignSettingsService.updateItem(this.campaignSettings).subscribe(
      (item: any) => {
        this.campaign.campaignSetting = item;

        this.followUpActionsService.updateItem(this.followUpActions).subscribe(
          (fa: any) => {
            this.campaign.followUpAction = fa;
            this.toastr.success(this.translateService.translate('Call settings successfully saved'));
            this.goToUrl(url);
          },
          err => {
            this.toastr.error(
              this.translateService.translate(this.utilsService.getApiErrors(err)),
              null,
              {dismiss: 'click', showCloseButton: true}
            );
            this.logger.error(err);
          });
      },
      err => {
        this.toastr.error(
          this.translateService.translate(this.utilsService.getApiErrors(err)),
          null,
          {dismiss: 'click', showCloseButton: true}
        );
        this.logger.error(err);
      }
    );
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  checkVoicemailScriptText(): boolean {
    if (this.voicemailChecked && !this.campaignSettings.voicemailScriptText) {
      this.toastr.error(this.translateService.translate('You must fill the script'));
      return false;
    }
    return true;
  }
}
