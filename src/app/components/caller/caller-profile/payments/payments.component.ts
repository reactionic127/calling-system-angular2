import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, PaymentsService, PayPalAccountService, TranslateService, CallerStatsService, UserService, CallersService } from '../../../../services';
import { Payment, CallerPayMethod, User, Caller } from '../../../../models';
import { ModalDirective } from 'ng2-bootstrap';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';


@Component({
  selector: 'dashboard',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})

export class PaymentsComponent implements OnInit {
  @ViewChild('payPalModal') public modal: ModalDirective;
  @ViewChild('paymentsModal') public paymentsModal: ModalDirective;

  public loadingFinished: boolean = false;
  payments: Payment[];
  callerPayMethod: CallerPayMethod;
  callerPaypalEmail: string;
  shouldDisableSendPaymentButton: boolean = false;
  callerStats: any;
  user: User;
  caller: Caller;

  get loggedUser(): any {
    return this._authService.currentUserData;
  };

  constructor(
    private _authService: AuthService,
    private _paymentService: PaymentsService,
    private _paypalService: PayPalAccountService,
    private toastr: ToastsManager,
    private translateService: TranslateService,
    private callerStatsService: CallerStatsService,
    private _userService: UserService,
    private _callersService: CallersService,
  ) { }

  getPayments(): void {
    this.loadingFinished = false;
    let requestParams = {
      id: this.loggedUser.caller.id,
      include: 'callerUser.callerPayMethod'
    };
    let subs = this._paymentService.getPayments(requestParams).subscribe(
      (items: any[]) => {
        this.payments = items;
        this.loadingFinished = true;
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  getUser(): void {
    this.user = this._userService.getNewModel();
    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.user = currentUserData;
      let requestParams = {
        include: 'callerPayMethod'
      };
      let subs = this._callersService.getItemWithParams(this.user.caller.id, requestParams).subscribe(
        (item: Caller) => {
          this.caller = item;
          if (this.caller.callerPayMethod !== undefined) {
            this.callerPayMethod = this.caller.callerPayMethod;
            this.callerPaypalEmail = this.callerPayMethod.paypalEmail;
          } else {
            this.callerPayMethod = this._paypalService.getNewModel();
          }
          this.loadingFinished = true;
        },
        err => err,
        () => subs.unsubscribe()
      );
    });

  }

  getCallerStats(id: string): void {
    let subs = this.callerStatsService.getCallerStats(id).subscribe(
      (data: any) => {
        this.callerStats = data;
        this.callerStats.nextPayment = Math.abs(this.callerStats.nextPayment);
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  updatePaypalMethod(): void {
    this.callerPayMethod.paypalEmail = this.callerPaypalEmail;

    let subs = this._paypalService.updateItem(this.callerPayMethod).subscribe(
      (response: any) => {
        this.callerPayMethod = response;
        this.callerPaypalEmail = this.callerPayMethod.paypalEmail;
        this.loadingFinished = true;
        this.modal.hide();
      },
      err => err,
      () => subs.unsubscribe()
    );
  }

  openPaymentModal(): void {
    this.paymentsModal.show();
  }

  makePayment(): void {
    this.shouldDisableSendPaymentButton = true;
    let subs = this._paymentService.makePayment(this.loggedUser.caller.id).subscribe(
      (response: any) => {
        if (response.payoutErrors != null) {
          this.toastr.info(this.translateService.translate('We are processing your payment'));
        } else {
          this.toastr.error(this.translateService.translate(response.payoutErrors));
        }
        this.shouldDisableSendPaymentButton = false;
      },
      error => {
        this.toastr.error(this.translateService.translate(error.errors[0].detail));
        this.shouldDisableSendPaymentButton = false;
        // tslint:disable-next-line:no-unused-expression
        () => subs.unsubscribe();
      }
    );
    this.paymentsModal.hide();
  }

  showChildModal(payMethod: CallerPayMethod): void {
    this.modal.show();
  }

  hideChildModal(): void {
    this.modal.hide();
  }
  ngOnInit(): void {
    this.getUser();
    this.getPayments();
    this.getCallerStats(this.loggedUser.caller.id);
  }
}
