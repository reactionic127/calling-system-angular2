import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Campaign, BudgetExpenseType } from '../../../../../models';
import { CampaignService } from '../../../../../services';

@Component({
  selector   : 'campaign-settings',
  templateUrl: './campaign-settings.component.html'
})
export class CampaignSettingsComponent implements OnInit {
  campaign: Campaign;
  budgetExpenseType: any = BudgetExpenseType;

  scriptsCompleted: boolean  = false;
  contactsCompleted: boolean = false;
  budgetCompleted: boolean   = false;

  // TODO, get this from a service or database
  campaignTips: Array<string> = [ // Referred to as 'help and tips array'
    'Tip 1',
    'Tip 2',
    'Tip 3',
    'Tip 4',
  ];

  constructor(private campaignService: CampaignService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.parent.data['campaign'];
    this.refreshCampaign(this.campaign.id);

  }

  refreshCampaign(id: string): void {
    this.campaignService.getItem(id, {
      include: 'callerId,campaignBudget'
    }).toPromise()
      .then(campaign => {
          this.campaign = campaign;
          this.updateFlags();
        }
      );
  }

  updateFlags(): void {
    this.scriptsCompleted  = !!(this.campaign.pitch || this.campaign.numberOfQuestions);
    this.contactsCompleted = !!this.campaign.numberOfContacts;
    this.budgetCompleted   = !!this.campaign.campaignBudget;
  }
}
