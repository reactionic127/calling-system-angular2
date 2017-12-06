import { Component } from '@angular/core';
import { CompanyService, AuthService, CompanyPictureService, CompanySocialLinkService, CompanyAddressService, IndustryService } from '../../../../services';
import { Company, Picture, Industry } from '../../../../models';
import { Logger } from 'angular2-logger/core';
import * as _ from 'lodash';

@Component({
  templateUrl: './show.component.html'
})
export class MyCompanyShowComponent {
  industry: Industry;
  company: Company;
  companyLogo: Picture;
  countryName: string;

  constructor(private companyService: CompanyService,
              private authService: AuthService,
              private logger: Logger,
              private companyPictureService: CompanyPictureService,
              private companySocialLinkService: CompanySocialLinkService,
              private industryService: IndustryService,
              private companyAddressService: CompanyAddressService) {
  }

  ngOnInit(): void {
    this.getCompanyData()
      .then(() => this.getIndustry());

  }

  getIndustry(): Promise<any> {
    return this.industryService.getItem(this.company.industryId).toPromise()
      .then((data: Industry) => {
        this.industry = data;
      });
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
      });
  }
}
