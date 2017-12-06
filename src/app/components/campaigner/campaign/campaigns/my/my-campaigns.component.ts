import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CampaignService, TranslateService, UtilsService } from '../../../../../services';
import { Campaign } from '../../../../../models';
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector       : 'my-campaigns-page',
  templateUrl    : './my-campaigns.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyCampaignsPage {
  cssStatuses: any = {
    draft     : 'draft',
    pending   : 'pending',
    ready     : 'running',
    paused    : 'paused',
    low_credit: 'paused',
    completed : 'completed',
    archived  : 'gray'
  };

  // based on Michael list from Dash-214
  filteringStatuses: any     = {
    ''       : 'All statuses',
    draft    : 'Draft',
    ready    : 'Running',
    completed: 'Completed',
    archived : 'Archived'
  };
  currentFilterValue: string = this.filteringStatuses[''];
  currentFilterKey: string   = '';

  // based on Michael list from Dash-214
  sortingColumns: any         = {
    ''       : 'Order by',
    createdAt: 'Creation date',
    startDate: 'Start date',
    kind     : 'Type',
    status   : 'Status'
  };
  currentSortingValue: string = this.sortingColumns[''];
  currentSortingKey: string   = '-createdAt';
  cloneToastr: any;

  filtering: boolean = false;

  campaigns: Campaign[];
  loadingFinished: boolean = false;

  currentPage: number  = 1;
  itemsPerPage: number = 150;

  constructor(private service: CampaignService,
              private cd: ChangeDetectorRef,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private utilsService: UtilsService) {
  }

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    let params = {
      page: {number: this.currentPage, size: this.itemsPerPage}
    };

    if (this.currentSortingKey !== '') {
      params['sort'] = this.currentSortingKey;
    }

    if (this.currentFilterKey !== '') {
      params['filter']           = {};
      params['filter']['status'] = this.currentFilterKey;
    }

    let subs = this.service.getList(params).subscribe(
      (items: any[]) => {
        this.campaigns = this.currentSortingKey ? items : items.sort((a, b) => b.startDate - a.startDate);
        this.cd.markForCheck();
        this.loadingFinished = true;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  sortBy(sortKey: string): void {
    this.loadingFinished     = false;
    this.currentSortingKey   = sortKey;
    this.currentSortingValue = this.sortingColumns[sortKey];

    this.getList();
  }

  filterByStatus(status: string): void {
    this.loadingFinished    = false;
    this.campaigns          = [];
    this.filtering          = !!status;
    this.currentFilterValue = this.filteringStatuses[status];
    this.currentFilterKey   = status;

    this.getList();
  }

  cloneCampaign(campaign: Campaign): void {
    this.toastr.info(this.translateService.translate('Please wait, cloning %s', {params: [campaign.name]}), '',
      {dismiss: 'controlled'}).then((toastr) => {
      this.cloneToastr = toastr;
    });
    this.service.cloneItem(campaign).toPromise()
      .then((item: Campaign) => {
        this.campaigns.unshift(item);
        this.cd.markForCheck();
        this.messageSuccess('Item cloned');
      })
      .then(() => this.toastr.dismissToast(this.cloneToastr))
      .catch((err) => this.handleServerErrors(err));
  }

  messageSuccess(msg: string): void {
    this.toastr.success(this.translateService.translate(msg), '', {maxShown: 1});
  }

  handleServerErrors(err: any): void {
    this.toastr.error(this.utilsService.getApiErrors(err));
  }
}
