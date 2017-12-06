import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'stripe'
})
export class Stripe extends BaseModel {
  @Attribute() couponId: string;
  @Attribute() planId: string;
  @Attribute() cardToken: string;

  companyId?: string;
}
