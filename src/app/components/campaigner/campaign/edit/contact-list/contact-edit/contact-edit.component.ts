import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CONTACT_LIST_TABS } from '../contact-list.component';
import { CampaignContact, FollowUpActions, Country } from '../../../../../../models';
import { ToastsManager } from 'ng2-toastr';
import { ContactAddressService, TranslateService, PhoneService, CampaignContactService, ContactSocialLinksService, ContactKeyValuesService, UtilsService } from '../../../../../../services';
import * as CountryList from 'country-list'; // todo: replace with iso3166_2
import * as _ from 'lodash';


@Component({
  selector   : 'contact-edit',
  templateUrl: './contact-edit.component.html'
})
export class ContactEditComponent implements OnInit {
  @Input() contact: CampaignContact;
  @Input() openTab: CONTACT_LIST_TABS;
  @Output() chgOpenTab: EventEmitter<any> = new EventEmitter();

  tabs: any                            = CONTACT_LIST_TABS;
  followUpAction: FollowUpActions      = {} as FollowUpActions;
  countries: Country[];
  debouncedUpdateContact: Function     = this.debounce(this.updateContact);
  debouncedUpdateSocialLinks: Function = this.debounce(this.updateSocialLinks);
  debouncedUpdateAddress: Function     = this.debounce(this.updateAddress);
  debouncedUpdatePhone: Function       = this.debounce(this.updatePhone);
  debouncedUpdateKeyValues: Function   = this.debounce(this.updateKeyValues);
  errorsStore: any                     = {
    address   : {},
    phone     : {},
    socialLink: {},
    contact   : {},
    keyvalues : []
  };

  private _countryListService: any;

  debounce(modelFn: Function): Function {
    return _.debounce((...args) => modelFn.apply(this, args), 1000, {trailing: true});
  }

  constructor(private _toastr: ToastsManager,
              private _addressService: ContactAddressService,
              private _translateService: TranslateService,
              private _phoneService: PhoneService,
              private _campaignContactService: CampaignContactService,
              private _contactSocialLinksService: ContactSocialLinksService,
              private _contactKeyValuesService: ContactKeyValuesService,
              private _utilsService: UtilsService) {
    this._countryListService = new CountryList();
  }

  ngOnInit(): void {
    this.contact.address         = this.contact.address || this._addressService.getNewModel();
    this.contact.address.country = this.contact.address.country || '';
    this.contact.phone           = this.contact.phone || this._phoneService.getNewModel();
    this.contact.socialLink      = this.contact.socialLink || this._contactSocialLinksService.getNewModel();
    this.contact.keyvalues       = this.contact.keyvalues || [];
    this.errorsStore.keyvalues   = this.contact.keyvalues.map(() => ({}));
    this.countries               = this._countryListService.getData();
  }

  setOpenTab(tab: string): void {
    this.chgOpenTab.emit(tab);
  }

  updateContact(): void {
    this._utilsService.emptyObject(this.errorsStore.contact);
    let subs = this._campaignContactService.updateItem(this.contact).subscribe(
      (item: any) => {
        this.contact = item;
        this.messageSuccess('Saved');
      },
      this._utilsService.extractApiErrors(this.errorsStore.contact),
      () => subs.unsubscribe()
    );
  }

  updatePhone(): void {
    this._utilsService.emptyObject(this.errorsStore.phone);
    this.contact.phone.contactId = this.contact.id;
    let subs                     = this._phoneService.updateItem(this.contact.phone).subscribe(
      (item: any) => {
        this.contact.phone = item;
        this.contact.phone.updateFullNumber();
        this.messageSuccess('Saved');
      },
      this._utilsService.extractApiErrors(this.errorsStore.phone),
      () => subs.unsubscribe()
    );
  }

  updateAddress(): void {
    this._utilsService.emptyObject(this.errorsStore.address);
    this.contact.address.contactId = this.contact.id;
    let subs                       = this._addressService.updateItem(this.contact.address).subscribe(
      (item: any) => {
        this.contact.address = item;
        this.messageSuccess('Saved');
      },
      this._utilsService.extractApiErrors(this.errorsStore.address),
      () => subs.unsubscribe()
    );
  }

  updateSocialLinks(): void {
    this._utilsService.emptyObject(this.errorsStore.socialLink);
    this.contact.socialLink.contactId = this.contact.id;
    let subs                          = this._contactSocialLinksService.updateItem(this.contact.socialLink).subscribe(
      (item: any) => {
        this.contact.socialLink = item;
        this.messageSuccess('Saved');
      },
      this._utilsService.extractApiErrors(this.errorsStore.socialLinks),
      () => subs.unsubscribe()
    );
  }

  updateKeyValues(idx: any): void {
    this._utilsService.emptyObject(this.errorsStore.keyvalues[idx]);
    this.contact.keyvalues[idx].contactId = this.contact.id;
    let subs                              = this._contactKeyValuesService.updateItem(this.contact.keyvalues[idx]).subscribe(
      (item: any) => {
        this.contact.keyvalues[idx] = item;
        this.messageSuccess('Saved');
      },
      this._utilsService.extractApiErrors(this.errorsStore.keyvalues[idx]),
      () => subs.unsubscribe()
    );
  }

  addKeyValue(): void {
    this.errorsStore.keyvalues.push({});
    this.contact.keyvalues.push(this._contactKeyValuesService.getNewModel());
  }

  removeKeyValue(idx: any): void {

    let _removeKeyValueUi = (_idx: any): void => {
      this.contact.keyvalues.splice(_idx, 1);
      this.errorsStore.keyvalues.splice(_idx, 1);
      this.messageSuccess('Removed');
    };
    if (!this.contact.keyvalues[idx].id) {
      _removeKeyValueUi(idx);
      return;
    }

    this.contact.keyvalues[idx].contactId = this.contact.id;
    let subs                              = this._contactKeyValuesService.deleteItem(this.contact.keyvalues[idx]).subscribe(
      (item: any) => {
        _removeKeyValueUi(idx);
      },
      this._utilsService.extractApiErrors(this.errorsStore.keyvalues[idx]),
      () => subs.unsubscribe()
    );

  }

  messageSuccess(msg: string): void {
    this._toastr.success(this._translateService.translate(msg), '', {maxShown: 1});
  }
}
