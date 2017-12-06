import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import * as CountryList from 'country-list'; // todo: replace with iso3166_2
import * as _ from 'lodash';
import { TranslateService, UtilsService, CompanyService, UserService, AuthService, CompanyAddressService } from '../../../../services';
import { Country, Address, Company, User } from '../../../../models';

@Component({
  selector   : 'campaigner-account-edit',
  templateUrl: './account-edit.component.html'
})
export class CampaignerAccountEditComponent implements OnInit {
  company: Company;
  user: User;
  countries: Country[];
  address: Address;
  debouncedUpdateAddress: Function = this.debounce(this.updateAddress);
  debouncedUpdateUser: Function    = this.debounce(this.updateUser);

  errorsStore: any = {
    address : {},
    phone   : {},
    password: {},
    user    : {}
  };
  password: any    = {
    currentPassword     : '',
    password            : '',
    passwordConfirmation: ''
  };

  enableSubmit: boolean = false;
  private _countryListService: any;

  debounce(modelFn: Function): Function {
    return _.debounce((...args) => modelFn.apply(this, args), 1000, {trailing: true});
  }

  constructor(private _toastr: ToastsManager,
              private _translateService: TranslateService,
              private _userService: UserService,
              private _authService: AuthService,
              private _addressService: CompanyAddressService,
              private _companyService: CompanyService,
              private _utilsService: UtilsService) {
    this._countryListService = new CountryList();
  }

  ngOnInit(): void {
    this.countries = this._countryListService.getData({company: ''});
    this.address   = this._addressService.getNewModel();
    this.user      = this._userService.getNewModel();

    this._authService.waitForCurrentUserData().then(user => {
      this.user = user;
      let subs  = this._companyService.getItem(user.company.id, {
        include: 'address'
      }).subscribe(
        (item: any) => {
          this.company = item;
          this.address = item.address || this.address;
        },
        err => this._utilsService.extractApiErrors(this.errorsStore.address),
        () => subs.unsubscribe()
      );
    });
  }

  messageSuccess(msg: string): void {
    this._toastr.success(this._translateService.translate(msg), '', {maxShown: 1});
  }

  updateAddress(): void {
    this._utilsService.emptyObject(this.errorsStore.address);
    this.address.companyId = this.user.company.id;

    let subs = this._addressService.updateItem(this.address).subscribe(
      (item: any) => {
        this.address = item;
        this.messageSuccess('Saved');
      },
      err => this._utilsService.extractApiErrors(this.errorsStore.address),
      () => subs.unsubscribe()
    );
  }

  updateUser(): void {
    this._utilsService.emptyObject(this.errorsStore.user);

    let subs = this._userService.updateItemAdvanced(this.user).subscribe(
      (item: any) => {
        this.user = item;
        this.messageSuccess('Saved');
      },
      err => this._utilsService.extractApiErrors(this.errorsStore.user),
      () => subs.unsubscribe()
    );
  }

  updatePassword(): void {
    for (let key of _.keys(this.password)) {
      if (!this.password[key] || this.password[key] === '') {
        this.errorsStore.password[key] = this._translateService.translate(`This item is required!`);
      } else {
        this.errorsStore.password[key] = '';
      }
    }

    if (this.errorsStore.password.currentPassword !== ''
      || this.errorsStore.password.password !== ''
      || this.errorsStore.password.passwordConfirmation !== '') {
      return void (0);
    } else {
      this._utilsService.emptyObject(this.errorsStore.password);

      let updatedItem: any = {
        id                  : this.user.id,
        currentPassword     : this.password.currentPassword,
        password            : this.password.password,
        passwordConfirmation: this.password.passwordConfirmation
      };

      let subs = this._userService.updatePassword(updatedItem).subscribe(
        (user: any) => {
          this.emptyPasswordFields();
          this.enableSubmit = false;
          this.messageSuccess('New password saved');
        },
        err => {
          this._utilsService.extractApiErrors(this.errorsStore.password);

          if (_.isEmpty(this.errorsStore.password)) {
            this._toastr.error(
              this._translateService.translate(this._utilsService.getApiErrors(err)),
              null,
              {dismiss: 'click', showCloseButton: true}
            );
          }
        },
        () => subs.unsubscribe()
      );
    }
  }

  emptyPasswordFields(): void {
    this.password.currentPassword      = '';
    this.password.password             = '';
    this.password.passwordConfirmation = '';
  }

  validateCurrentPass(event: any): void {
    if (event.trim() === '') {
      this.errorsStore.password.currentPassword = this._translateService.translate(`This item is required!`);
    } else {
      this.errorsStore.password.currentPassword = '';
    }

    this.checkSubmit();
  }

  // TODO - event is passed in case we need to validate password complexity, length etc
  validateNewPassMatch(event: any, property: string): void {
    if (this.password[property].trim() === '') {
      this.errorsStore.password[property] = this._translateService.translate(`This item is required!`);
    } else if (this.password.password !== this.password.passwordConfirmation) {
      this.errorsStore.password[property] = this._translateService.translate(`New password doesn't match!`);
    } else {
      this.errorsStore.password.password             = '';
      this.errorsStore.password.passwordConfirmation = '';
    }

    this.checkSubmit();
  }

  checkSubmit(): void {
    this.enableSubmit = (this.password.currentPassword !== '' && this.password.password !== '' && this.password.passwordConfirmation !== '');
  }
}
