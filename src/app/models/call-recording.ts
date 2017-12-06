import { BaseModel, Attribute, JsonApiModelConfig } from '../base.model';

@JsonApiModelConfig({
  type: 'callRecordings'
})
export class CallRecording extends BaseModel {
  @Attribute()
  callId: number;

  @Attribute()
  recordingUrl: string;
}
