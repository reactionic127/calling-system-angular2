import { Component, OnInit, Input } from '@angular/core';
import { Campaign } from '../../../../../models';
import { CampaignService, AuthService, CampaignPaymentService, CampaignStatusService } from '../../../../../services';
import { Router } from '@angular/router';

@Component({
  selector   : 'campaign-pending-header',
  templateUrl: './campaign-pending-header.component.html'
})
export class CampaignPendingHeaderComponent implements OnInit {
  @Input() campaign: Campaign;
           selectedCampaign: Campaign;
  public currentUserData: any = null;

  paid: boolean = true;

  categoryTypes: any;
  launching: boolean = false;

  constructor(private router: Router,
              private service: CampaignService,
              private authService: AuthService,
              private campaignPaymentService: CampaignPaymentService,
              private campaignStatusService: CampaignStatusService) {
  }

  ngOnInit(): void {
    this.categoryTypes   = this.campaign.getSameCategoryTypes();
    this.currentUserData = this.authService.currentUserData;
  }

  launchCampaign(): void {
    this.launching = true;
    // we will redirect to payment page if the client is not paid yet
    let subs       = this.service.updateItem(this.campaign).subscribe(
      (item: Campaign) => {
        // we will test here if the client paid already
        let data = {
          companyId: this.currentUserData.company.id
        };
        this.campaignPaymentService.getSubscription(data)
          .then((result) => {
            if (result.data) {
              this.selectedCampaign        = this.campaign;
              let status: any              = 'run';
              this.selectedCampaign.status = status;
              this.campaignStatusService.updateStatus(this.selectedCampaign)
                .then((res) => {
                  this.campaign.status = res.status;
                  localStorage.setItem('createdSubscription', 'true');
                  this.router.navigateByUrl('/campaigns/' + this.campaign.id);
                })
                .catch((error) => {
                  console.log('The status of Campaign was not updated');
                });
            } else {
              this.router.navigateByUrl('/campaigns/' + this.campaign.id + '/pay');
            }
          })
          .catch(error => error);
      },
      err => err, // TODO, add toastr
      () => subs.unsubscribe()
    );
  }

  saveCampaign(): void {
    let subs = this.service.updateItem(this.campaign).subscribe(
      (item: Campaign) => this.router.navigateByUrl('/campaigns'),
      err => err, // TODO, add toastr
      () => subs.unsubscribe()
    );
  }
}
