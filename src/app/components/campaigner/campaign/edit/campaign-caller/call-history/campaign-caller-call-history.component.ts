import { Component, OnInit, Input } from '@angular/core';
import { CampaignCaller, CampaignCall, CallStatuses } from '../../../../../../models';
import { CampaignCallService } from '../../../../../../services';
import { Logger } from 'angular2-logger/core';
import * as moment from 'moment';

@Component({
  selector: 'campaign-caller-call-history',
  templateUrl: './campaign-caller-call-history.component.html'
})
export class CampaignCallerCallHistoryComponent implements OnInit {
  // todo: move to pipe
  moment: any = moment;
  calls: CampaignCall[];
  statuses: any = CallStatuses;
  totalItems: string;

  currentPage: number = 1;
  itemsPerPage: number = 10;

  @Input() campaignCaller: CampaignCaller;

  constructor(private campaignCallService: CampaignCallService,
              private logger: Logger) {
  }

  ngOnInit(): void {
    this.updateMainList();
  }

  getCalls(params: any): void {
    let subs = this.campaignCallService.getListPaged(params).subscribe(
      (items: any[]) => {
        this.calls = items[0];
        this.totalItems = items[1];
      },
      error => this.logger.error(
        'Error while fetching campaign caller calls list for caller ID: ' + this.campaignCaller.id,
        error
      ),
      () => subs.unsubscribe()
    );
  }

  updateMainList(): void {
    let params = {
      campaignCallerId: this.campaignCaller.id,
      page: { number: this.currentPage, size: this.itemsPerPage }
    };

    this.getCalls(params);
  }

  changePage(navData: any): void {
    this.currentPage = navData.page;
    this.itemsPerPage = navData.itemsPerPage || this.itemsPerPage;
    this.updateMainList();
  }

}
