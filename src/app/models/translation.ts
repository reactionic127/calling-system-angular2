import {
  BaseModel,
  Attribute,
  JsonApiModelConfig
} from '../base.model';

@JsonApiModelConfig({
  type: 'i18nBackendActiveRecordTranslations'
})
export class Translation extends BaseModel {
  @Attribute()
  key: string;

  @Attribute()
  text: string;

  @Attribute()
  locale: string;
}
