import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Campaign } from '../../../../models';

@Component({
  selector   : 'campaign',
  templateUrl: './campaign.component.html'
})
export class CampaignComponent implements OnInit {
  campaign: Campaign;

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.campaign = this.route.snapshot.data['campaign'];

    if (this.campaign.status === 'pending') {
      this.router.navigateByUrl('/campaigns/' + this.campaign.id + '/express');
    }
  }
}
