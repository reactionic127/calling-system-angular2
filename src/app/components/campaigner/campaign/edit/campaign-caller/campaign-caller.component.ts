import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CampaignCaller } from '../../../../../models';
import { UtilsService } from '../../../../../services';

@Component({
  selector   : 'campaign-caller',
  templateUrl: './campaign-caller.component.html'
})
export class CampaignCallerComponent implements OnInit {
  campaignCaller: CampaignCaller;

  selectedTab: string = 'profile';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this.campaignCaller = this.route.snapshot.data['campaignCaller'];

    let subs = this.route.queryParams.subscribe(
      (param: any) => this.selectedTab = param['tab'] ? param['tab'] : this.selectedTab,
      error => error,
      () => subs.unsubscribe()
    );
  }

  close(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.router.navigateByUrl(segmentedUrl);
  }
}
