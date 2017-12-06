import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';

import { TranslateService, CampaignBudgetService, UtilsService, CampaignService } from '../../../../../services';

import { Campaign, CampaignBudget } from '../../../../../models';

import * as _ from 'lodash';

@Component({
  selector   : 'campaign-budget',
  templateUrl: './campaign-budget.component.html'
})
export class BudgetComponent implements OnInit {
  campaign: Campaign;
  budget: CampaignBudget;
  componentChanges: boolean = false;
  sliderExpense: number = 200;
  sliderCommission: number = 0;

  importLink: string;
  callerIdLink: string;
  closeLink: string;

  defaultTitle: string = 'Budget';
  defaultInfo: string  = 'side_help.budget-info';
  contextualInfo: string;
  contextualTitle: string;

  constructor(private route: ActivatedRoute,
              private toastr: ToastsManager,
              private router: Router,
              private translateService: TranslateService,
              private campaignService: CampaignService,
              private campaignBudgetService: CampaignBudgetService,
              private utilsService: UtilsService,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.parent.data['campaign'];
    this.budget   = this.campaignBudgetService.getNewModel({campaignId: this.campaign.id});
    this.getCampaignBudget(this.campaign.id);
    this.buildInternalLinks();
  }

  getCampaignBudget(id: string): void {
    let subs = this.campaignService.getItem(id, {
      include: 'campaignBudget'
    }).subscribe(
      campaign => {
        if (campaign.campaignBudget) {
          this.budget = campaign.campaignBudget;
          this.sliderExpense = this.budget.monthlyContactsVolume;
          this.sliderCommission = this.budget.commission;
        }
      },
      err => this.logger.error('Error fetching campaign ID:' + id + '. ' + err.detail),
      () => subs.unsubscribe()
    );
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.importLink   = `${segmentedUrl}/contacts/import`;
    this.callerIdLink = `${segmentedUrl}/caller-id`;
    this.closeLink    = segmentedUrl;
  }

  saveAndGoToUrl(url: string): void {

    this.budget.commission = this.sliderCommission;
    if(this.campaign.costType === 'cost_per_contact') {
      this.budget.monthlyContactsVolume = this.sliderExpense;
    }

    let subs = this.campaignBudgetService.updateItem(this.budget).subscribe(
      (item: any) => {
        this.campaign.campaignBudget = item;
        this.toastr.success(this.translateService.translate('Campaign budget saved'));
        this.goToUrl(url);
      },
      err => {
        this.toastr.error(
          this.translateService.translate(this.utilsService.getApiErrors(err)),
          null,
          {dismiss: 'click', showCloseButton: true}
        );
        this.logger.error('Error while saving campaign budget', err);
      },
      () => subs.unsubscribe()
    );
  }

  changesDetected(): void {
    this.componentChanges = true;
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }
}
