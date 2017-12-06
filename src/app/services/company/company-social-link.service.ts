import { Injectable } from '@angular/core';
import { JSONAPIBase, Datastore } from '../json-api.base';
import { SocialLinks } from '../../models/social-links';

@Injectable()
export class CompanySocialLinkService extends JSONAPIBase {
  domainModel: any = SocialLinks;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'social_links';
  postUrl: string = 'companies/${companyId}/social_link';
  deleteUrl: string = 'social_links';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
