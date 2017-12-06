import { BaseModel, Attribute, JsonApiModelConfig, BelongsTo, HasMany } from '../base.model';
import { Address } from './address';
import { Picture } from './picture';
import { Phone } from './phone';
import { Document } from './document';
import { SocialLinks } from './social-links';
import { Industry } from './industry';
import { AuthToken } from './auth-token';
import { Faq } from './faq';
import { Invoice } from './invoice';

@JsonApiModelConfig({
  type: 'companies'
})
export class Company extends BaseModel {

  @Attribute() name: string;
  @Attribute() about: string;
  @Attribute() industryId: string;
  @Attribute() officialName: string;
  @Attribute() completion: number;
  @Attribute() creationYear: number;
  @Attribute() numberOfEmployees: number;
  @Attribute() revenues: number;
  @Attribute() vat: string;

  @BelongsTo() socialLink: SocialLinks;
  @BelongsTo() phone: Phone;
  @BelongsTo() picture: Picture;
  @BelongsTo() address: Address;
  @BelongsTo() industry: Industry;
  @BelongsTo() authToken: AuthToken;
  @HasMany() documents: Document[];
  @HasMany() faqs: Faq[];
  @HasMany() invoices: Invoice[];
}
