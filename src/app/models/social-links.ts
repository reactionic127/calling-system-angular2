import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'socialLinks'
})
export class  SocialLinks extends BaseModel {
  @Attribute() website: string;
  @Attribute() locality: string;
  @Attribute() postal_code: number;
  @Attribute() region: string;
  @Attribute() twitter: string;
  @Attribute() facebook: string;
  @Attribute() linkedin: string;
  @Attribute() pinterest: string;
  @Attribute() youtube: string;
  @Attribute() country: string;

  contactId?: string;
  companyId?: string;
}
