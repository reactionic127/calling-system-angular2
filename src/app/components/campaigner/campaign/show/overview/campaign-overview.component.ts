import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Campaign, CampaignCaller } from '../../../../../models';
import { CampaignCallersService, CampaignService } from '../../../../../services';
import { Logger } from 'angular2-logger/core';
import { ModalCreatedCampaignComponent } from '../../modals/created-campaign/created-campaign.modal';

@Component({
  selector   : 'campaign-overview',
  templateUrl: './campaign-overview.component.html'
})
export class CampaignOverviewComponent implements OnInit {
  campaign: Campaign;
  callers: CampaignCaller[];
  // TODO, get this from a service or database
  tips: Array<string>  = [ // Referred to as 'help and tips array'
    'Overview Tip 1',
    'Overview Tip 2',
    'Overview Tip 3',
    'Overview Tip 4',
    'Overview Tip 5'
  ];
  currentTip: any;
  currentIndex: number = 0;

  @ViewChild(ModalCreatedCampaignComponent) createdCampaignModal: ModalCreatedCampaignComponent;

  constructor(private campaignCallersService: CampaignCallersService,
              private campaignService: CampaignService,
              private router: Router,
              private route: ActivatedRoute,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.parent.data['campaign'];
    this.refreshCampaign(this.campaign.id);
    this.getList();
    this.currentTip = this.tips[0];
  }

  refreshCampaign(id: string): void {
    this.campaignService.getItem(id).subscribe(campaign => {
      this.campaign = campaign;
      let temp: any = this.campaign.status;
      if (temp === 'pending') {
        this.router.navigateByUrl('/campaigns/' + this.campaign.id + '/express');
      }
    });
  }

  getList(): void {
    let params = {
      campaignId: this.campaign.id,
      page      : {size: 10},
      filter    : {
        status  : 'approved'
      },
      sort      : '-successCalls'
    };
    let subs   = this.campaignCallersService.getListPaged(params).subscribe(
      (items: any[]) => this.callers = items[0],
      err => this.logger.error('Error while fetching callers list', err),
      () => subs.unsubscribe()
    );
  }

  showNext(): void {
    this.currentIndex++;
    if (this.currentIndex > this.tips.length - 1) {
      this.currentIndex = 0;
    }
    this.currentTip = this.tips[this.currentIndex];
  }

  ngAfterViewInit(): void {
    let createdSub = localStorage.getItem('createdSubscription');
    if (createdSub) {
      this.createdCampaignModal.show();
      localStorage.setItem('createdSubscription', '');
    }
  }
}
