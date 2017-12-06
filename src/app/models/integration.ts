import { Attribute } from '../base.model';

export interface IIntegration {
  name: string;
  description: string;
  logoUrl: string;
  integrationDate: string;
  isIntegrated: boolean;
}

export class Integration implements IIntegration {
  @Attribute() name: string;
  @Attribute() description: string;
  @Attribute() logoUrl: string;
  @Attribute() integrationDate: string;
  @Attribute() isIntegrated: boolean;

}
