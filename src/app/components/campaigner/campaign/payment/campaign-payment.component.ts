import { Router, ActivatedRoute } from '@angular/router';
import { Component, Renderer, OnInit } from '@angular/core';
import { APP_CONFIG } from '../../../../environment';
import * as _ from 'lodash';
import { Campaign } from '../../../../models';
import { CampaignService, CampaignPaymentService, AuthService, CampaignStatusService } from '../../../../services';
import { Logger } from 'angular2-logger/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Component({
  selector: 'campaign-payment',
  templateUrl: './campaign-payment.component.html',
  styleUrls: ['./campaign-payment.component.css']
})
export class CampaignPaymentComponent implements OnInit {
  public campaign: Campaign;
  selectedCampaign: Campaign;
  public plans: any[];
  public plan: string;
  public commission: number = 0;
  public cardToken: string = null;
  public currentUserData: any = null;
  loading: boolean = false;
  globalListener: any;

  paymentInterval: Object = {
    month: 'Monthly',
    year: 'Yearly'
  };

  constructor(
    public authService: AuthService,
    private toastr: ToastsManager,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer,
    private logger: Logger,
    private campaignService: CampaignService,
    private campaignPaymentService: CampaignPaymentService,
    private campaignStatusService: CampaignStatusService) {
  }

  ngOnInit(): void {
    this.plan = '';
    this.campaign = this.route.snapshot.data['campaign'];
    this.globalListener = function(): void {};
    this.authService.waitForCurrentUserData().then((currentUserData) => {
      this.currentUserData = currentUserData;
    });
    this.campaignPaymentService.getPlan()
      .then((result) => {
        this.plans =  result.data;
        //this.plan = this.plans[0].id;
        this.plan = 'per250ContactStandard';
      })
      .catch((error) => {
        this.logger.error(error);
      });
    this.getCampaignBudget(this.campaign.id);
  }

  openCheckout(): void {
    let $this = this;
    let handler = (<any>window).StripeCheckout.configure({
      key: APP_CONFIG.stripe.key,
      locale: 'auto',
      billingAddress: true,
      label: 'Next',
      email: this.currentUserData.email,
      token: function (token: any): void {
        $this.cardToken = token.id;
      }
    });

    handler.open({
      name: 'Upcall',
      description: 'Subscribe to a plan',
      allowRememberMe: false
    });

    this.globalListener = this.renderer.listenGlobal('window', 'popstate', () => {
      handler.close();
    });
  }

  subscription(): boolean {
    if (this.cardToken === '') {
      this.toastr.info('Please select a payment method.');
      return false;
    } else if (this.plan === '') {
      this.toastr.info('Please select a plan.');
      return false;
    }

    this.loading = true;

    let stripe = {
      planId    : this.plan,
      cardToken : this.cardToken,
      couponId  : '',
      companyId : this.currentUserData.company.id
    };

    this.campaignPaymentService.subscription(stripe)
      .then((result) => {
        if (result.errors) {
          this.loading = false;
          this.toastr.info('Your payment has failed. Please try later');
          return false;
        }
        localStorage.setItem('createdSubscription', 'true');

        this.selectedCampaign = this.campaign;
        let status: any = 'run';
        this.selectedCampaign.status = status;
        this.campaignStatusService.updateStatus(this.selectedCampaign)
          .then((res) => {
            this.campaign.status = res.status;
            this.router.navigateByUrl('/campaigns/' + this.campaign.id);
          })
          .catch((error) => {
            this.toastr.info('The status of Campaign was not updated unfortunately.');
            this.logger.error(error);
          });
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  getCampaignBudget(id: string): void {
    let subs = this.campaignService.getItem(id, {
      include: 'campaignBudget'
    }).subscribe(
      campaign => {
        if (campaign.campaignBudget) {
          this.commission = campaign.campaignBudget.commission;
        }
      },
      err => this.logger.error('Error fetching campaign ID:' + id + '. ' + err.detail),
      () => subs.unsubscribe()
    );
  }

  changePlan(cplan: string): void {
    this.plan = cplan;
  }

  goBack(): void {
    let temp: any = this.campaign.status;
    if (temp === 'pending') {
      this.router.navigateByUrl('/campaigns/' + this.campaign.id + '/express');
    } else {
      this.router.navigateByUrl('/campaigns/' + this.campaign.id);
    }
  }

  ngOnDestroy(): void {
    this.globalListener();
  }
}
