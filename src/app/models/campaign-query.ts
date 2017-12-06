import { HasMany, BelongsTo } from 'angular2-jsonapi';
import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';

@JsonApiModelConfig({
  type: 'campaignQuery'
})

export class CampaignQuery extends BaseModel {
  @Attribute()
  campaignId: number;

  @Attribute()
  databaseName: string;

  @Attribute()
  queryCount: number;

  @Attribute()
  updatedAt: string;

  @Attribute()
  fields: any;

  @Attribute()
  queryPagination: number;

  @Attribute()
  inUse: boolean;
}
