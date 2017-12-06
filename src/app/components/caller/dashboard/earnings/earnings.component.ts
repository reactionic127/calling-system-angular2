import { Component, OnInit } from '@angular/core';
import { AuthService, CallersEarningsService, CampaignService } from '../../../../services';
import { Logger } from 'angular2-logger/core';
import { Earning, Campaign, CallStatuses } from '../../../../models';

@Component({
  selector: 'dashboard-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.css'],
})

export class DashboardEarningsComponent implements OnInit {
  loadingFinished: boolean = false;
  earnings: Earning[];
  callerCampaigns: any[];
  ascSortingByDate: boolean = false;
  ascSortingByRating: boolean = false;
  showNoEarningMessage: boolean = false;
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public sortColumn: string;
  selectedCampaign: Campaign;
  statuses: any = CallStatuses;

  constructor(
    private _authService: AuthService,
    private _callersEarningsService: CallersEarningsService,
    private logger: Logger,
    private _campaignService: CampaignService
  ) { }

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  getEarningsByCampaign(campaign: Campaign): void {
    this.currentPage = 1;
    this.selectedCampaign = campaign;
    this.updateMainList();
  }

  resetFilteringByCampaign(): void {
    this.selectedCampaign = null;
    this.updateMainList();
  }

  showClockIcon(earning: Earning): boolean {
    let currentTime = new Date();
    let lastCalledDate = new Date(earning.calledAt);
    let timeDiff = Math.abs(currentTime.getTime() - lastCalledDate.getTime());
    let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays < 7 ? true : false;
  }

  getCallerCampaigns(): void {
    let params = {
      id: this.loggedUser.caller.id,
      include: 'company'
    };
    let subs = this._campaignService.getApprovedCampaigns(params).subscribe(
      (data: any) => {
        this.callerCampaigns = data;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getEearningsByPage(params: any): void {
    let subs = this._callersEarningsService.getEarningsList(params).subscribe(
      (items: any[]) => {
        this.earnings = items[0];
        this.totalItems = items[4];
        this.earnings.length > 0 ? this.showNoEarningMessage = false : this.showNoEarningMessage = true;
      },
      error => this.logger.error(
        'Error while fetching caller campaigns for caller ID: ' + this.loggedUser.caller.id,
        error
      ),
      () => subs.unsubscribe()
    );
  }

  updateMainList(): void {
    let params: any = {
      id: this.loggedUser.caller.id,
      page: { number: this.currentPage, size: this.itemsPerPage },
      sort: this.sortColumn
    };
    if (this.selectedCampaign != null) {
      params['filter[campaignId]'] = this.selectedCampaign.id;
    }
    this.getEearningsByPage(params);
  }

  changePage(navData: any): void {
    this.currentPage = navData.page;
    this.updateMainList();
  }

  // tslint:disable-next-line:typedef
  onSortRequested($event): void {
    if ($event.sortDir === 'desc') {
      this.sortColumn = '-' + $event.field;
    } else {
      this.sortColumn = $event.field;
    }
    this.updateMainList();
  }

  ngOnInit(): void {
    this.getCallerCampaigns();
  }
}
