import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { CallerIdService, AuthService, CampaignService, UtilsService, TranslateService } from '../../../../../../services';
import { CallerId, Campaign, CampaignStatus } from '../../../../../../models';
import { Logger } from 'angular2-logger/core';
import { InstantiableComponent } from '../../../../../instantiable.component';

@Component({
  selector   : 'caller-id-my-id',
  templateUrl: './my-id.component.html'
})
export class CallerIdMyIdComponent extends InstantiableComponent implements OnInit {

  public campaign: Campaign = null;

  public sectionsAvailable: any = {
    USE_EXISTING_CALLER_ID: 'USE_EXISTING_CALLER_ID',
    CREATE_NEW_CALLER_ID  : 'CREATE_NEW_CALLER_ID'
  };
  public selectedSection: any   = this.sectionsAvailable.USE_EXISTING_CALLER_ID;

  public currentUserData: any = null;

  public existingCompanyCallerIds: Array<CallerId>;

  public selectedCallerId: any = null;

  public callerIdEditedPhone: any                = null;
  public callerIdEditedMask: any                 = null;
  public confirmationCode: any                   = null;
  public isWaitingForPhoneConfirmation: boolean  = false;
  public currentCallerIdBeingValidated: CallerId = null;
  public timeoutCheckCallerIdStatus: any         = null;
  public newCallerIdValidatedOk: boolean         = false;
  public showSubmitCreateCallerButton: boolean   = true;
  public showCallAgain: boolean                  = false;

  public componentChanges: boolean = false;
         campaignStatuses: any     = CampaignStatus;

  public errorsStore: any = {
    callerIdEditedPhone: null
  };

  budgetLink: string;
  closeLink: string;
  outcomeLink: string;
  importLink: string;

  isExpress: boolean;

  constructor(public callerIdService: CallerIdService,
              public logger: Logger,
              public authService: AuthService,
              public activatedRoute: ActivatedRoute,
              public toastr: ToastsManager,
              public router: Router,
              public campaignService: CampaignService,
              private utilsService: UtilsService,
              private translateService: TranslateService,
              private ref: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.currentUserData = this.authService.currentUserData;
    this.campaign        = this.activatedRoute.snapshot.parent.parent.data['campaign'];

    this.loadListOfExistingCompanyCallerIds()
      .then(() => {
        this.getCampaignCallerId(this.campaign.id).then((campaign: Campaign) => {
          this.campaign.callerId = campaign.callerId;
          // set as selected the callerId associated to current campaign
          this.selectCurrentCallerId();
        });
      });

    this.buildInternalLinks();
  }

  getCampaignCallerId(campaignId: string): Promise<Campaign> {
    return this.campaignService.getItem(campaignId, {
      include: 'callerId'
    }).toPromise();
  }

  selectCurrentCallerId(): void {
    if (this.campaign.callerId && this.campaign.callerId.id) {
      if (this.existingCompanyCallerIds) {
        let callerIdAssociatedToCampaign = this.existingCompanyCallerIds.find((existingCompanyCallerId: CallerId) => {
          return existingCompanyCallerId.id === this.campaign.callerId.id;
        });

        if (callerIdAssociatedToCampaign) {
          this.selectedCallerId = callerIdAssociatedToCampaign;
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutCheckCallerIdStatus) {
      window.clearTimeout(this.timeoutCheckCallerIdStatus);
    }
  }

  public loadListOfExistingCompanyCallerIds(): Promise<void> {
    return this.callerIdService.getCallerIdsByCompany(this.currentUserData.company.id).toPromise()
      .then((callerIds: Array<CallerId>) => {
        this.existingCompanyCallerIds = callerIds;
        setTimeout(() => this.ref.detectChanges(), 100);
      })
      .catch((error) => {
        this.logger.error('Error while fetching caller_ids list', error);
      });
  }

  public selectSection(sectionNameToSelect: any): void {
    this.selectedSection = sectionNameToSelect;
  }

  public beginVerifyNewPhone(inputCallerIdEditedPhone: any): void {
    this.showSubmitCreateCallerButton  = false;
    this.showCallAgain                 = false;
    this.currentCallerIdBeingValidated = null;
    this.callerIdEditedPhone           = inputCallerIdEditedPhone.value;
    // this.callerIdService.createNewCallerIdForCompany(this.currentUserData.companyId);

    this.isWaitingForPhoneConfirmation = false;
    let newCallerId                    = this.callerIdService.getNewModel({
      phoneNumber   : this.callerIdEditedPhone,
      phoneExtension: this.callerIdEditedMask
    });
    newCallerId.companyId              = this.currentUserData.company.id;
    let subscription                   = this.callerIdService.updateItem(newCallerId).subscribe(
      (createdCallerId: any) => {
        this.currentCallerIdBeingValidated   = createdCallerId;
        this.errorsStore.callerIdEditedPhone = null;
        this.confirmationCode                = createdCallerId.validationCode;
        this.isWaitingForPhoneConfirmation   = true;

        this.startPeriodicCheckOfCallerIdValidation();
      },
      (response) => {
        this.showSubmitCreateCallerButton = true;
        this.logger.error('Error while creating new caller_id', response);
        this.errorsStore.callerIdEditedPhone = response.errors[0].detail ? response.errors[0].detail : response.errors[0];
      },
      () => {
        subscription.unsubscribe();
      }
    );
  }

  public startPeriodicCheckOfCallerIdValidation(): void {
    if (!this.currentCallerIdBeingValidated || !this.currentCallerIdBeingValidated.id) {
      return;
    }

    let timeIntervalBetweenRequests = 2000;
    let totalTime                   = 0;
    let maxTimeAllowed              = 70 * 1000;

    let checkCallerIdStatusFunc = (): Promise<any> => {
      return this.callerIdService.getCallerIdById(this.currentCallerIdBeingValidated.id).toPromise()
        .then((callerId: CallerId) => {
          this.currentCallerIdBeingValidated = callerId;

          totalTime += timeIntervalBetweenRequests;

          if (totalTime < maxTimeAllowed && this.currentCallerIdBeingValidated.status === 'pending') {
            this.timeoutCheckCallerIdStatus = setTimeout(
              () => {
                checkCallerIdStatusFunc();
              },
              timeIntervalBetweenRequests
            );
          } else {
            this.isWaitingForPhoneConfirmation = false;
            if (this.currentCallerIdBeingValidated.status === 'pending') {
              this.showCallAgain                   = true;
              this.newCallerIdValidatedOk          = false;
              this.errorsStore.callerIdEditedPhone = 'Caller Id not validated in ' + (totalTime / 1000) + ' seconds; please wait';
            } else if (this.currentCallerIdBeingValidated.status === 'success') {
              this.showCallAgain          = false;
              this.newCallerIdValidatedOk = true;
              this.loadListOfExistingCompanyCallerIds().then(() => {
                let callerIdAssociatedToCampaign = this.existingCompanyCallerIds.find((existingCompanyCallerId: CallerId) => {
                  if (existingCompanyCallerId.id === this.currentCallerIdBeingValidated.id) {
                    return true;
                  }
                  return false;
                });
                if (callerIdAssociatedToCampaign) {
                  this.selectedCallerId = callerIdAssociatedToCampaign;
                }
              });
            } else {
              this.showCallAgain                   = true;
              this.newCallerIdValidatedOk          = false;
              this.errorsStore.callerIdEditedPhone = 'Error validating caller id, status: ' + this.currentCallerIdBeingValidated.status;
            }
          }
        })
        .catch((response) => {
          this.logger.error('Error getting the callerId for validation status', response);
        });
    };

    checkCallerIdStatusFunc();
  }

  public isSelected(callerId: CallerId): boolean {
    if (this.selectedCallerId && this.selectedCallerId.id === callerId.id) {
      return true;
    }
    return false;
  }

  public selectCallerId(callerIdToSelect: any): void {
    this.selectedCallerId = callerIdToSelect;
    this.componentChanges = true;
    setTimeout(() => this.ref.detectChanges(), 100);
  }

  saveAndGoToUrl(url: string): void {
    if (!this.selectedCallerId || !this.selectedCallerId.id) {
      return;
    }

    this.callerIdService.attachCallerIdToCampaign(this.campaign, this.selectedCallerId)
      .then((result) => {
        this.toastr.success(
          this.translateService.translate('CallerId attached to Campaign')
          + ' "' + this.campaign.name + '"'
        );
        this.campaignService.getItem(this.campaign.id).toPromise()
          .then((updatedCampaign) => {
            this.campaign.callerId = updatedCampaign.callerId;
            this.goToUrl(url);
          });
      })
      .catch((error) => {
        this.toastr.error(
          this.translateService.translate('There was an error attaching CallerId Campaign')
          + ' "' + this.campaign.name + '"'
        );
        this.logger.error(error);
      });
  }

  goToUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  public trackByCallerId(index: number, callerId: CallerId): string {
    return callerId.id;
  };

  buildInternalLinks(): void {
    let segmentedUrl = this.utilsService.getUrlByFirstSegments(this.router.url, 3);

    this.closeLink   = segmentedUrl;
    this.budgetLink  = `${segmentedUrl}/budget`;
    this.outcomeLink = `${segmentedUrl}/outcome`;
    this.importLink  = `${segmentedUrl}/contacts/import`;

    let segments   = segmentedUrl.split('/');
    this.isExpress = (segments[3] && segments[3] === 'express');
  }
}
