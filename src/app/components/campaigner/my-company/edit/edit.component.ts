import { Component } from '@angular/core';
import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr';
import * as CountryList from 'country-list'; // todo: replace with iso3166_2
import { CompanyService, AuthService, CompanyPictureService, UtilsService, TranslateService, CompanySocialLinkService, CompanyFaqService,
CompanyDocumentService, CompanyAddressService, IndustryService } from '../../../../services';
import { Company, Picture, Industry, Country, Faq, Document } from '../../../../models';
import { Logger } from 'angular2-logger/core';
import { JSONAPIBase } from '../../../../services/json-api.base';
import { Observable } from 'rxjs/Observable';
import { APP_CONFIG } from '../../../../environment';

@Component({
  templateUrl: './edit.component.html'
})
export class MyCompanyEditComponent {
  company: Company;
  industries: Industry[];
  countries: Country[];
  removedFaqs: string[] = [];
  errorsStore: any      = {
    company   : {},
    socialLink: {},
    address   : {},
    faqs      : {},
    documents : {},
  };
  newFaqItem: any       = {
    title  : '',
    content: ''
  };

  private countryListService: any;

  constructor(private companyService: CompanyService,
              private authService: AuthService,
              private companyPictureService: CompanyPictureService,
              private companySocialLinkService: CompanySocialLinkService,
              private companyDocumentService: CompanyDocumentService,
              private companyAddressService: CompanyAddressService,
              private companyFaqService: CompanyFaqService,
              private industryService: IndustryService,
              private utilsService: UtilsService,
              private translateService: TranslateService,
              private toastr: ToastsManager) {
    this.countryListService = new CountryList();
  }

  ngOnInit(): void {
    this.getIndustryList();
    this.getCompanyData();
    this.countries = this.countryListService.getData();

  }

  getCompanyData(): Promise<any> {
    return this.companyService.getItem(
      this.authService.currentUserData.company.id,
      {
        include: 'picture,socialLink,address,phone,documents,faqs'
      }).toPromise().then(
      (item: Company) => {
        this.company            = _.clone(item);
        this.company.socialLink = this.company.socialLink || this.companySocialLinkService.getNewModel({companyId: this.company.id});
        this.company.address    = this.company.address || this.companyAddressService.getNewModel({companyId: this.company.id});
        this.company.faqs       = this.company.faqs || [];
        this.company.documents  = this.company.documents || [];
      });
  }

  getIndustryList(): void {
    this.industryService.getList().toPromise()
      .then((data: Industry[]) => {
        this.industries = data;
      });
  }

  updateCompany(): void {
    this.utilsService.emptyObject(this.errorsStore.company);
    let subs = this.companyService.updateItem(this.company).subscribe(
      (item: any) => {
        this.authService.currentUserData.company = _.clone(item);
        this.messageSuccess('Saved');
      },
      this.utilsService.extractApiErrors(this.errorsStore.company),
      () => subs.unsubscribe()
    );
  }

  updateAddress(): void {
    this.utilsService.emptyObject(this.errorsStore.address);
    this.company.address.companyId = this.company.id;
    let subs                       = this.companyAddressService.updateItem(this.company.address).subscribe(
      (item: any) => {
        this.company.address = item;

        this.authService.currentUserData.company = _.clone(this.company);
        this.messageSuccess('Saved');
      },
      this.utilsService.extractApiErrors(this.errorsStore.address),
      () => subs.unsubscribe()
    );
  }

  updateFaqs(): Promise<any[]> {
    let promises = [];
    this.utilsService.emptyObject(this.errorsStore.faqs);

    this.removedFaqs.forEach((id) => {
      promises.push(this.companyFaqService.deleteItem({id: id}).toPromise().then(() => {
        this.removedFaqs.splice(this.removedFaqs.indexOf(id), 1);
      }));
    });

    this.company.faqs.forEach((faq) => {
      faq.companyId = this.company.id;
      promises.push(this.companyFaqService.updateItemAdvanced(faq).toPromise()
        .then((item: Faq) => JSONAPIBase.updateStorageWith(faq, item)));
    });

    return Promise.all(promises);
  }

  addFaqItem(): void {
    if (!this.newFaqItem.title || !this.newFaqItem.content) {
      return;
    }
    this.company.faqs.push(this.companyFaqService.getNewModel({
      title  : this.newFaqItem.title,
      content: this.newFaqItem.content
    }));
    this.newFaqItem.title   = '';
    this.newFaqItem.content = '';
  }

  removeFaqItem(faq: Faq): void {
    if (faq.id) {
      this.removedFaqs.push(faq.id);
    }
    this.company.faqs.splice(this.company.faqs.indexOf(faq), 1);
  }

  updateSocialLinks(): void {
    this.utilsService.emptyObject(this.errorsStore.socialLink);
    this.company.socialLink.companyId = this.company.id;

    let subs = this.companySocialLinkService.updateItem(this.company.socialLink).subscribe(
      (item: any) => {
        this.company.socialLink = item;

        this.authService.currentUserData.company = _.clone(this.company);
        this.messageSuccess('Saved');
      },
      this.utilsService.extractApiErrors(this.errorsStore.socialLink),
      () => subs.unsubscribe()
    );
  }

  messageSuccess(msg: string): void {
    this.toastr.success(this.translateService.translate(msg), '', {maxShown: 1});
  }

  updateAll(): void {
    this.updateCompany();
    this.updateSocialLinks();
    this.updateAddress();
    this.updateFaqs().then(() => {
    });
  }

  uploadDocument(): void {
    (window as any).filepicker.setKey(APP_CONFIG.filestack.key);

    (window as any).filepicker.pick(
      {
        mimetype: [
          'text/csv',
          'application/msword,application/excel',
          'application/vnd.ms-excel,application/x-excel',
          'application/x-msexcel',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
      },
      fileData => this.saveDocument(fileData),
      FPError => this.handleFileStackError(FPError)
    );
  }

  uploadLogo(): void {
    (window as any).filepicker.setKey(APP_CONFIG.filestack.key);

    (window as any).filepicker.pick(
      {
        mimetype: 'image/*'
        // services: ['COMPUTER', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_DRIVE', 'DROPBOX']
      },
      fileData => this.savePicture(fileData),
      error => this.handleFileStackError(error)
    );
  }

  savePicture(fileData: any): void {
    let subs = this.companyPictureService.updateItem({
      id          : this.company.picture.id,
      imageUrlBase: fileData.url,
      companyId   : this.authService.currentUserData.company.id
    }).subscribe(
      (picture: Picture) => this.company.picture = picture,
      error => this.toastr.error(
        this.translateService.translate('There was an error while saving picture')
      ),
      () => subs.unsubscribe()
    );
  }

  saveDocument(fileData: any): void {
    let subs = this.companyDocumentService.updateItem({
      url      : fileData.url,
      companyId: this.authService.currentUserData.company.id
    }).subscribe(
      (doc: Document) => {
        this.company.documents.push(doc);

        this.toastr.success(
          this.translateService.translate('Document successfully saved')
        );
      },
      error => this.toastr.error(
        this.translateService.translate('There was an error while saving document')
      ),
      () => subs.unsubscribe()
    );
  }

  handleFileStackError(error: any): void {
    // TODO - update function after filestack's response with error response structure
    this.toastr.error(this.translateService.translate(error.toString()));
  }

  deleteDocument(doc: Document): void {
    let subs = this.companyDocumentService.deleteItem(doc).subscribe(
      () => {
        for (let idx in this.company.documents) {
          if (this.company.documents[idx] && this.company.documents[idx].id === doc.id) {
            this.company.documents.splice(+idx, 1);
            break;
          }
        }

        this.toastr.success(this.translateService.translate('Document successfully removed'));
      },
      err => this.toastr.error(this.translateService.translate('There was an error while removing file')),
      () => subs.unsubscribe()
    );
  }
}
