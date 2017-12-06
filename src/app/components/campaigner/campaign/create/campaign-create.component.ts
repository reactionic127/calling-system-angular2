import { Component, OnInit, OnDestroy } from '@angular/core';
import { Campaign, CampaignTypesByCategory, CampaignBudget } from '../../../../models';
import { CampaignService, TranslateService, CampaignBudgetService, AuthService } from '../../../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector   : 'campaign-create',
  templateUrl: './campaign-create.component.html'
})
export class CampaignCreateComponent implements OnInit, OnDestroy {
  campaign: Campaign;
  campaignForm: FormGroup;
  budget: CampaignBudget;
  categories: any = CampaignTypesByCategory;
  subs: Subscription;

  constructor(private service: CampaignService,
              private formBuilder: FormBuilder,
              private router: Router,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private _authService: AuthService,
              private campaignBudgetService: CampaignBudgetService) {
  }

  ngOnInit(): void {
    this.campaignForm = this.formBuilder.group({
      name            : ['', Validators.required],
      noOfSeats       : ['1', Validators.required],
      campaign_budget : ['250', Validators.required],
      alwaysOpen      : ['false', Validators.required],
      kind            : ['lead_gen', Validators.required],
      instructions    : ['', [Validators.required, Validators.minLength(5)]]
    });
    let requestParams = {
      page: {
        number: 1,
        size  : 1
      }
    };
    // TODO, find the method to retrieve only ids
    // We should not use this method to retrieve the campaign list, we should have an end point which should return the number of campaigns only
    let subs = this.service.getListPaged(requestParams).subscribe(
      items => {
        let campaignsCount = items[1] ? (parseInt(items[1], 10) + 1) : 1;
        this.campaignForm.patchValue({name: this.translateService.translate('My campaign') + ' ' + campaignsCount});
      },
      err => err, // TODO, add toastr
      () => subs.unsubscribe()
    );
  }

  createCampaign(): void {
    // TODO, find a solution to map the object
    let newCampaign = {
      name            : this.campaignForm.value.name,
      noOfSeats       : this.campaignForm.value.noOfSeats,
      alwaysOpen      : this.campaignForm.value.alwaysOpen,
      kind            : this.campaignForm.value.kind,
      instructions    : this.campaignForm.value.instructions,
      companyId       : this._authService.currentUserData.company.id,
      costType        : 'cost_per_contact'
    };

    this.subs = this.service.updateItem(newCampaign).subscribe(
      (item: Campaign) => {
        this.campaign = item;

        let subss = this.service.getItem(this.campaign.id, { include: 'campaignBudget' }).subscribe(
          campaign => {
            if (campaign.campaignBudget) {
              this.budget = campaign.campaignBudget;
              this.budget.maxExpenseType = 'max_contacts_per_month';
              this.budget.monthlyContactsVolume = this.campaignForm.value.campaign_budget;
              this.budget.commission = 0;
              let subsss = this.campaignBudgetService.updateItem(this.budget).subscribe(
                (item: any) => {
                  this.campaign.campaignBudget = item;
                  this.router.navigateByUrl('/campaigns/' + this.campaign.id + '/express');
                },
                err => {},
                () => subsss.unsubscribe()
              );
            }
          },
          err => {},
          () => subss.unsubscribe()
        );
      },
      err => err, // TODO, add toastr
    );
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }
}
