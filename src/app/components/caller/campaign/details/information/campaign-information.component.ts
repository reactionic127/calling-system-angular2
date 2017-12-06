import { Component, OnInit } from '@angular/core';
import { AuthService, CampaignService } from '../../../../../services';
import { Router, ActivatedRoute } from '@angular/router';
import { Campaign, CampaignTypesByCategory, Company } from '../../../../../models';

@Component({
  selector: 'dashboard',
  templateUrl: './campaign-information.component.html',
  styleUrls: ['./campaign-information.component.css'],
})

export class CampaignInformationComponent implements OnInit {
  public loadingFinished: boolean = false;
  campaign: Campaign;
  campaignType: string;
  company: Company;
  public campaignId: string;

  constructor(
    private _authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private _campaignService: CampaignService
    ) { }

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  backToMyCampaigns(): void {
    this.router.navigate(['/myCampaigns']);
  }

  goToTheCallPage(): void {
    this.router.navigate(['/myCampaigns/' + this.campaignId + '/call']);
  }

  getCampaign(): void {
    this.campaignId = this.route.snapshot.params['id'];
    let requestParams = {
      include: 'company,company.picture,company.documents,company.socialLink,company.address,company.industry,campaignBudget'
    };
    let subs = this._campaignService.getItemWithParams(this.campaignId, requestParams).subscribe(
      (item: Campaign) => {
        this.campaign = item;
        this.getCategoryValue();
        this.loadingFinished = true;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getCategoryValue(): any {
    CampaignTypesByCategory.forEach(
      category => {
        for (let type of Object.keys(category.types)) {
          if (type === <string>this.campaign.kind) {
            this.campaignType = category.types[type];
            break;
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.loadingFinished = true;
    this.getCampaign();
  }
}
