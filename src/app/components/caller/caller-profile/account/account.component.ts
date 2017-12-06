import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, TranslateService, ContactAddressService, UtilsService, UserService, CallersService,
  PayPalAccountService, PhoneService, UpdateUserService } from '../../../../services';
import { Address, Country, Company, User, Phone, Caller, CallerPayMethod } from '../../../../models';
import * as CountryList from 'country-list';
import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ModalDirective } from 'ng2-bootstrap';

@Component({
  selector: 'dashboard',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})

export class AccountComponent implements OnInit {
  public loadingFinished: boolean = false;
  company: Company;
  caller: Caller;
  public user: User;
  countries: Country[];
  address: Address;
  phone: Phone;
  password: any = {};
  debouncedUpdateAddress: Function = this.debounce(this.updateAddress);
  debouncedUpdateUser: Function = this.debounce(this.updateUser);
  callerPayMethod: CallerPayMethod;
  callerPaypalEmail: string;
  errorsStore: any = {
    address: {},
    phone: {},
    password: {},
    user: {}
  };
  _countryListService: any;

  get loggedUser(): any {
    return this._authService.currentUserData;
  };
  @ViewChild('payPalModal') public modal: ModalDirective;

  constructor(
    private _authService: AuthService,
    private _toastr: ToastsManager,
    private _translateService: TranslateService,
    private _userService: UserService,
    private _addressService: ContactAddressService,
    private _utilsService: UtilsService,
    private _callersService: CallersService,
    private _paypalService: PayPalAccountService,
    private _phoneService: PhoneService,
    private _updateUserService: UpdateUserService
  ) {
    this._countryListService = new CountryList();
  }


  debounce(modelFn: Function): Function {
    return _.debounce((...args) => modelFn.apply(this, args), 1000, { trailing: true });
  }

  getUser(): void {
    this.user = this._userService.getNewModel();
    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.user = currentUserData;
      let requestParams = {
        include: 'callerPayMethod,address,user,user.phone'
      };
      let subs = this._callersService.getItemWithParams(this.user.caller.id, requestParams).subscribe(
        (item: Caller) => {
          this.caller = item;
          this.user.phoneNumber = this.caller.user.phone.number;
          this.address = this.caller.address;
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

  messageSuccess(msg: string): void {
    this._toastr.success(this._translateService.translate(msg), '', { maxShown: 1 });
  }

  messageError(msg: string): void {
    this._toastr.error(this._translateService.translate(msg), '', { maxShown: 1 });
  }

  updateAddress(updatedField: string): void {
    this._utilsService.emptyObject(this.errorsStore.address);

    let subs = this._addressService.updateItem(this.address).subscribe(
      (item: any) => {
        this.address = item;
        this.messageSuccess('Saved');
      },
      err => {
        this.errorsStore.address[updatedField] = err.errors[0].detail;
        // tslint:disable-next-line:no-unused-expression
        () => subs.unsubscribe();
      }
    );
  }

  updateUser(updatedField: string): void {
    this._utilsService.emptyObject(this.errorsStore.user);
    let subs = this._updateUserService.updateItem(this.user).subscribe(
      (item: any) => {
        this.user = item;
        this.messageSuccess('Saved');
      },
      err => {
        this.errorsStore.user[updatedField] = err.errors[0].detail;
        // tslint:disable-next-line:no-unused-expression
        () => subs.unsubscribe();
      }

    );
  }

  updatePassword(): void {
    this._utilsService.emptyObject(this.errorsStore.password);
    let updatedItem: any = {
      id: this.user.id,
      currentPassword: this.password.oldPass,
      password: this.password.newPass,
      passwordConfirmation: this.password.reNewPass
    };
    let subs = this._userService.updatePassword(updatedItem).subscribe(
      (item: any) => {
        this.password = {};
        this.messageSuccess('Password updated');
      },
      err => {
        let errorMessage = err.errors[0].detail !== undefined ? err.errors[0].detail : err.errors[0];
        this.messageError(errorMessage);
      },
      () => subs.unsubscribe()
    );
  }

  updatePaypalMethod(): void {
    this.callerPayMethod.paypalEmail = this.callerPaypalEmail;
    if (this.callerPayMethod.createdAt === undefined || this.callerPayMethod.updatedAt === undefined) {
      // create caller's paypal method for the first time
      let subs = this._paypalService.postCallerPaypalMethod(this.loggedUser.caller.id, this.callerPayMethod).subscribe(
        (response: any) => {
          this.callerPayMethod = response;
          this.callerPaypalEmail = this.callerPayMethod.paypalEmail;
          this.loadingFinished = true;
          this.modal.hide();
        },
        err => err,
        () => subs.unsubscribe()
      );
    } else {
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
  }

  showChildModal(payMethod: CallerPayMethod): void {
    this.modal.show();
  }

  hideChildModal(): void {
    this.modal.hide();
  }

  ngOnInit(): void {
    this.countries = this._countryListService.getData();
    this.address = this._addressService.getNewModel();
    this.phone = this._phoneService.getNewModel();
    this.getUser();
  }

}
