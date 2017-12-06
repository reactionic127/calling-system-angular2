import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { Logger } from 'angular2-logger/core';
import { Campaign, CampaignStatus } from '../../../../../models';
import { CampaignService, UtilsService } from '../../../../../services';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './caller-id.component.html'
})
export class CallerIdComponent implements OnInit {

  public mainComponent: any;
  public campaign: Campaign    = null;
  public campaignStatuses: any = CampaignStatus;

  budgetLink: string;
  closeLink: string;
  outcomeLink: string;
  importLink: string;
  currentUrl: string;
  urlSubs: Subscription;

  isExpress: boolean;

  constructor(public logger: Logger,
              public activatedRoute: ActivatedRoute,
              public toastr: ToastsManager,
              public router: Router,
              public campaignService: CampaignService,
              private utilsService: UtilsService,
              private ref: ChangeDetectorRef) {
    this.urlSubs = router.events.subscribe((stateSnapshot: any) => {
      this.currentUrl = stateSnapshot.urlAfterRedirects;
      setTimeout(() => {
        this.ref.detectChanges();
      }, 100);
    });
  }

  ngOnInit(): void {
    this.campaign = this.activatedRoute.snapshot.parent.parent.data['campaign'];
    this.buildInternalLinks();
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.closeLink   = segmentedUrl;
    this.budgetLink  = `${segmentedUrl}/budget`;
    this.outcomeLink = `${segmentedUrl}/outcome`;
    this.importLink  = `${segmentedUrl}/contacts/import`;

    let segments   = segmentedUrl.split('/');
    this.isExpress = (segments[3] && segments[3] === 'express');
  }

  ngOnDestroy(): void {
    this.urlSubs.unsubscribe();
  }
}
