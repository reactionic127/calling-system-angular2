import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';
import { JsonApiDatastore } from 'angular2-jsonapi';

@JsonApiModelConfig({
  type: 'callerCallRating'
})
export class CallRatings extends BaseModel {
  constructor(_datastore: JsonApiDatastore, data?: any) {
    super(_datastore, data);
    this.relationships = data.relationships;
  }
  // tslint:disable-next-line:member-ordering
  @Attribute()
  review: string;

  @Attribute()
  rate: number;

  @Attribute()
  createdAt: Date;

  @Attribute()
  title: number;

  relationships: any;
}
