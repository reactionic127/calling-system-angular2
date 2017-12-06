import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, JoinCampaignService, TranslateService } from '../../../../services';
import { Router } from '@angular/router';
import { Logger } from 'angular2-logger/core';
import { Campaign, CampaignTypesByCategory } from '../../../../models';
import { ModalDirective } from 'ng2-bootstrap';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'dashboard',
  templateUrl: './join-campaign.component.html',
  styleUrls: ['./join-campaign.component.css'],
})

export class JoinCampaignComponent implements OnInit {
  @ViewChild('applyCampaignModal') public modal: ModalDirective;

  loadingFinished: boolean = false;
  campaigns: Campaign[];
  callerCampaigns: any[];
  selectedCampaignId: string;
  public sortItems: any = [
    { id: 'name', name: 'Name' },
    { id: 'status', name: 'Status' },
    { id: 'kind', name: 'Kind' },
    { id: 'startDate', name: 'Start Date' }
  ];
  public currentPage: number = 1;
  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public selectedSort: any = this.sortItems[3];
  public campaignId: string;
  public selectedCampaign: Campaign;

  constructor(
    private _authService: AuthService,
    private logger: Logger,
    private _joinCampaignService: JoinCampaignService,
    private router: Router,
    private toastr: ToastsManager,
    private translateService: TranslateService,
  ) { }

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  showChildModal(selCampaign: Campaign): void {
    this.selectedCampaign = selCampaign;
    this.selectedCampaignId = this.selectedCampaign.id;
    this.modal.show();
  }

  hideChildModal(): void {
    this.modal.hide();
  }

  backToMyCampaigns(): void {
    this.router.navigate(['/myCampaigns']);
  }

  getCampaignsByPage(params: any): void {
    let subs = this._joinCampaignService.getListPaged(params).subscribe(
      (items: any[]) => {
        this.campaigns = items[0];
        this.totalItems = items[4];
        this.loadingFinished = true;
      },
      error => {
        this.logger.error(
          'Error while fetching caller campaigns for caller ID: ' + this.loggedUser.caller.id,
          error
        );
        // tslint:disable-next-line:no-unused-expression
        () => subs.unsubscribe();
        this.loadingFinished = true;
      }
    );
  }

  updateMainList(): void {
    let params: any = {
      page: { number: this.currentPage, size: this.itemsPerPage },
      include: 'company,company.picture,company.industry,campaignBudget,campaignSetting',
      callerId: this.loggedUser.caller.id
    };
    this.getCampaignsByPage(params);
  }

  changePage(navData: any): void {
    this.currentPage = navData.page;
    this.updateMainList();
  }

  joinNewCampaign(): void {
    let params: any = {
      campaignId: this.selectedCampaign.id,
      callerId: this.loggedUser.caller.id
    };
    let subs = this._joinCampaignService.postCampaign(params, this.selectedCampaign).subscribe(
      (item: any) => {
        if (item.status === 'pending') {
          this.toastr.info(this.translateService.translate('Joined campaign is pending'));
        } else {
          this.toastr.success(this.translateService.translate('You have successfully joined the campaign'));
          this.router.navigate(['/myCampaigns/' + this.selectedCampaignId + '/information']);
        }
      },
      error => {
        this.logger.error(
          'Error while posting new campaign for caller ID: ' + this.loggedUser.caller.id, error
        );
        if (error === 'Not Found') {
          this.toastr.error(this.translateService.translate(error));
        } else if (error.errors[0].detail.message !== undefined) {
          this.toastr.error(this.translateService.translate(error.errors[0].detail.message));
        } else {
          this.toastr.error(this.translateService.translate(error.errors[0].detail));
        }
        // tslint:disable-next-line:no-unused-expression
        () => subs.unsubscribe();
      }
    );
    this.hideChildModal();
  }

  sortyBy(sortBy: string): void {
    let params: any = {
      page: { number: this.currentPage, size: this.itemsPerPage },
      sort: this.selectedSort.id,
      callerId: this.loggedUser.caller.id
    };
    this.getCampaignsByPage(params);
  }

  getCategoryValue(campaignType: Campaign): any {
    let sameTypes = '';
    CampaignTypesByCategory.forEach(
      category => {
        for (let type of Object.keys(category.types)) {
          if (type === <string>campaignType.kind) {
            sameTypes = category.types[type];
            break;
          }
        }
      }
    );
    return sameTypes;
  }

  ngOnInit(): void {
    this.updateMainList();
  }
}
