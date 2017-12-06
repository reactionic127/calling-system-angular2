import { Component, Renderer, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';
import { AuthService, CreditCardsService, TranslateService } from '../../../../services';
import { APP_CONFIG } from '../../../../environment';

@Component({
  selector   : 'campaigner-payment-method',
  templateUrl: './payment-method.component.html'
})
export class CampaignerPaymentMethodComponent implements OnInit {

  company_id: any ='';
  creditCards = [];
  cardToken: string = null;
  globalListener: any;

  constructor(private toastr: ToastsManager,
              private logger: Logger,
              private authService: AuthService,
              private translateService: TranslateService,
              private creditCardsService: CreditCardsService,
              private renderer: Renderer) {
  }

  ngOnInit(): void {
     this.company_id = this.authService.currentUserData.company.id;
     this.getCreditCards();
  }

  getCreditCards(): void {
    this.creditCardsService.getCompanyCreditCards({'company_id': this.company_id})
      .then(response => {
        this.creditCards = response.data;
      })
      .catch(response => {});
  }

  onSetDefault(id: any): void {
    this.creditCardsService.setDefault({'credit_card_id': id})
      .then(response => {
        this.toastr.success(this.translateService.translate('Credit Card set as default'));
        this.creditCards.forEach(
          creditCard => {
            creditCard.attributes.default = false;
            if(creditCard.id === id) {
              creditCard.attributes.default = true;
            }
          }
        );
      })
      .catch(response => {
        this.toastr.error(this.translateService.translate('Credit Card not set default'));
        this.logger.error('Error while setting default credit card ID:' + id, response);
      });
  }

  onDelete(data: any): void {
    let subs = this.creditCardsService.deleteItem(data)
      .subscribe(
        () => {
          this.toastr.success(this.translateService.translate('Credit Card removed'));
          this.creditCards.splice(this.creditCards.indexOf(data.id), 1);
        },
        error => {
          this.toastr.error(this.translateService.translate('Credit Card not removed'));
          this.logger.error('Error while removing credit card ID:' + data.id, error);
        },
        () => subs.unsubscribe()
      );
  }

  addCreditCard(): void {
    let $this = this;
    let handler = (<any>window).StripeCheckout.configure({
      key: APP_CONFIG.stripe.key,
      locale: 'auto',
      billingAddress: true,
      email: this.authService.currentUserData.email,
      token: function (token: any): void {
        $this.cardToken = token.id;
        $this.creditCardsService.addreditCard({'company_id': $this.company_id, 'card_token': $this.cardToken})
          .then(response => {
            $this.toastr.success($this.translateService.translate('Credit Card added'));
            $this.creditCards.push(response.data);
          })
          .catch(response => {
            this.toastr.error(this.translateService.translate('Credit Card not added'));
            this.logger.error('Error while adding credit card', response);
          });
      }
    });

    handler.open({
      name: 'Upcall',
      description: 'Credit Card Details',
      allowRememberMe: false
    });

    this.globalListener = this.renderer.listenGlobal('window', 'popstate', () => {
      handler.close();
    });
  }

  reset(): void {
    this.company_id = this.authService.currentUserData.company.id;
  }
}
