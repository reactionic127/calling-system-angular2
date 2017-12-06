import { Injectable } from '@angular/core';
import { JSONAPIBase } from '../json-api.base';
import { Datastore } from '../json-api.base';
import { SocialLinks } from '../../models/social-links';

@Injectable()
export class ContactSocialLinksService extends JSONAPIBase {
  domainModel: any = SocialLinks;
  getUrl: string = '';
  getItemUrl: string = '';
  getListUrl: string = '';
  patchUrl: string = 'social_links';
  postUrl: string = 'contacts/${contactId}/social_links';
  deleteUrl: string = '';

  constructor(datastore: Datastore) {
    super(datastore);
  }
}
