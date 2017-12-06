import { Injectable } from '@angular/core';
import { CampaignService } from '../campaign/campaign.service';
import { AuthService } from '../auth/auth.service';
import { SendbirdService } from './sendbird.service';
import { Observable } from 'rxjs/Observable';
import { TwilioService } from './twilio.service';


import { Logger } from 'angular2-logger/core';
import { Campaign } from '../../models/campaign';

@Injectable()
export class CommunicationCenterService {

  constructor(private _campaignService: CampaignService,
              private _authService: AuthService,
              private _sendbirdservice: SendbirdService,
              private logger: Logger,
              private _twilioService: TwilioService) {
  }

  getUserCampaignAndDirectMessageTextChannels(): Promise<any> {
    // get campaigns of current user
    let campaignsPromise = this._campaignService.getList().toPromise()
      .then((items: Array<any>): Array<any> => {
        return items.sort((a, b) => b.startDate - a.startDate);
      })
      .catch((error: any): void => {
        this.logger.info('Error when getting campaigns for Campaign Group Channels', error);
      });

    // get sendbird group channels to which user belongs
    let sendbirdChannelsPromise = this._sendbirdservice.getUserGroupChannels();

    // wait for the data to arrive
    let resultPromise = Promise.all([campaignsPromise, sendbirdChannelsPromise]).then((results) => {
      this.logger.info('results', results);

      let campaigns: Array<Campaign> = results[0] as Array<Campaign>;
      let channels: Array<any> = results[1] as Array<any>;

      // filter the channels to get the ones for campaigns and the ones for direct messages
      let campaignTextChannels = [] as Array<any>;
      let directMessageTextChannels = [] as Array<any>;
      channels.forEach((channel) => {
        let campaignIdFromChannel = channel.data.replace('channel_for_campaign_', '');
        let campaignForChannel = campaigns.find((campaign) => {
          return campaignIdFromChannel && (campaign.id === campaignIdFromChannel);
        });
        channel.campaign = campaignForChannel;
        if (campaignIdFromChannel && campaignForChannel) {
        // if (campaignIdFromChannel) {
          campaignTextChannels.push(channel);
        } else if (!campaignIdFromChannel) {
          directMessageTextChannels.push(channel);
        }
      });

      this.logger.info('campaignTextChannels', campaignTextChannels);
      this.logger.info('directMessageTextChannels', directMessageTextChannels);

      return {
        campaignTextChannels: campaignTextChannels,
        directMessageTextChannels: directMessageTextChannels
      };
    });

    return resultPromise;
  }

  getTextMessagesFromChannel(channelData: any): Promise<any> {
    return this._sendbirdservice.listMessagesOfChannel(channelData);
  }

  composeCampaignChannelMeta(campaignId: string): string {
    return 'channel_for_campaign_' + campaignId;
  }

  sendTextMessage(messageToSend: string, currentChannel: any): Promise<any> {
    return this._sendbirdservice.sendMessageToChannel(messageToSend, currentChannel);
  }

  createDirectMessageTextChannel(sendbirdUserIdsForNewTextChannel: Array<string>): Promise<any> {
    return this._sendbirdservice.createDirectMessageChannel(sendbirdUserIdsForNewTextChannel);
  }

  registerReceiveTextMessageHandler(receiveTextMessageHandler: Function, uniqueHandlerId: String): void {
    this._sendbirdservice.registerReceiveMessageHandler(receiveTextMessageHandler, uniqueHandlerId);
  }

  registerUserLeftTextChannelHandler(userLeftTextChannelHandler: Function, uniqueHandlerId: String): void {
    return this._sendbirdservice.registerUserLeftChannelHandler(userLeftTextChannelHandler, uniqueHandlerId);
  }

  registerUserJoinedTextChannelHandler(userJoinedTextChannelHandler: Function, uniqueHandlerId: String): void {
    return this._sendbirdservice.registerUserJoinedChannelHandler(userJoinedTextChannelHandler, uniqueHandlerId);
  }

  leaveTextChannel(directMessageTextChannel: any): Promise<any> {
    return this._sendbirdservice.leaveChannel(directMessageTextChannel);
  }

  /**
   * @var native browser file, fileData;
   * Example: to obtain the fileData:
   * $('#chat_file_input').change(function() {
   *   if ($('#chat_file_input').val().trim().length == 0) return;
   *   var file = $('#chat_file_input')[0].files[0];
   *   $('.chat-input-file').addClass('file-upload');
   *
   *   currChannelInfo.sendFileMessage(file, SendMessageHandler);
   * });
   */
  sendTextFileMessage(textServiceChannel: any, fileData: any): Promise<any> {
    return this._sendbirdservice.sendFileMessage(textServiceChannel, fileData);
  }


  userHasPermission(onWhat: string, action: string, who?: any): Promise<boolean> {
    let permissions: any = {
      campaigner: {
        'main-angular-app': ['view'],
        'comm-center-conf-call': ['create'],
        'comm-center-direct-message-channel': ['create']
      },
      caller: {
        'main-angular-app': [],
        'comm-center-conf-call': [],
        'comm-center-direct-message-channel': []
      }
    };

    let promiseData: Promise<any>;
    if (who) {
      promiseData = Promise.resolve(who);
    } else {
      promiseData = this._authService.waitForCurrentUserData().then((currentUpcallUserData) => {
        return Promise.resolve(currentUpcallUserData);
      });
    }

    return promiseData.then((currentUpcallUserData) => {
      if (permissions[currentUpcallUserData.role] &&
        permissions[currentUpcallUserData.role][onWhat] &&
        permissions[currentUpcallUserData.role][onWhat].indexOf(action) !== -1
      ) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    });
  }

  getTwilioAuthenticationToken(): Observable<any> {
    return this._twilioService.getUserToken();
  }

  isTheMessageJoinConferenceRequest(message: any): boolean {
    try {
      JSON.parse(message);
    } catch (e) {
      return false;
    }
    return true;
  }
}
