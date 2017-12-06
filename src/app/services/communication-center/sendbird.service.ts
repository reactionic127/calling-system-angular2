import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../../environment';
import { AuthService } from '../auth/auth.service';
import { Logger } from 'angular2-logger/core';

// import * as SendBird from 'sendbird';

// used require, not import, because import produces the following typescrypt validation error
// File '/var/www/upcall.anais.me/node_modules/sendbird/SendBird.d.ts' is not a module.
let SendBird = require('../../../../node_modules/sendbird/SendBird.min.js');

@Injectable()
export class SendbirdService {
  private _sendbirdInstance: any = null;
  private _promiseConnectUserToSendbird: Promise<any> = null;
  private _currentUpcallUserData: any = null;

  constructor(private _authService: AuthService, private logger: Logger) {
    this._authService.waitForCurrentUserData().then((currentUpcallUserData) => {
      this._currentUpcallUserData = currentUpcallUserData;
    });

    this._sendbirdInstance = new SendBird({
      appId: APP_CONFIG.sendbird.AppId
    });

    this._connectUserToSendbird();
  }

  getUserGroupChannels(): Promise<any> {
    return this._promiseConnectUserToSendbird.then((userConnected) => {
      this.logger.info('USER CONNECTED TO SENDBIRD: ', userConnected);

      let channelListQuery = this._sendbirdInstance.GroupChannel.createMyGroupChannelListQuery();
      channelListQuery.includeEmpty = true;
      channelListQuery.limit = 100; // pagination limit could be set up to 100

      return new Promise((resolve, reject) => {
        if (channelListQuery.hasNext) {
          channelListQuery.next((channelList, error) => {
            if (error) {
              this.logger.info(
                'Error when getting Sendbird UserGroupChannels for user ' + this._currentUpcallUserData.id, error
              );
              reject(error);
            } else {
              this.logger.info('Got Sendbird channels: ', channelList);
              resolve(channelList);
            }
          });
        } else {
          resolve([]);
        }
      });

    });

  }

  listMessagesOfChannel(channel: any): Promise<any> {

    return this._promiseConnectUserToSendbird.then((userConnected) => {

      let messageListQuery = channel.createPreviousMessageListQuery();

      return new Promise((resolve, reject) => {
        messageListQuery.load(100, false, (messageList, error) => {
          if (error) {
            this.logger.info(
              'Error when getting Sendbird messages for channel ' + channel.name +
              '(' + channel.data + '-' + channel.url + ')',
              error
            );
            reject(error);
          } else {
            this.logger.info('Got Sendbird messages for channel ' + channel.name +
              '(' + channel.data + '-' + channel.url + ')',
              messageList
            );
            resolve(messageList);
          }
        });
      });

    });
  }

  sendMessageToChannel(messageToSend: string, channel: any): Promise<any> {
    if (!channel) {
      return Promise.reject('Channel argument is empty');
    }

    return new Promise((resolve, reject) => {
      channel.sendUserMessage(messageToSend, 'some_data', 'some_custom_type', (message, error) => {
        if (error) {
          this.logger.info(
            'Error when sending message to Sendbird channel; error: ' + error + ' channel: ',
            channel,
            ' message: ',
            messageToSend
          );
          reject('Error when sending message to Sendbird channel; error: ' + JSON.stringify(error));
          return;
        }
        this.logger.info(message);
        resolve(message);
      });

    });

  }

  createDirectMessageChannelDuplicates(sendbirdUserIdsForNewChannel: Array<string>): any {
    if (!sendbirdUserIdsForNewChannel || !sendbirdUserIdsForNewChannel.length) {
      return Promise.reject('No users to create the channel');
    }

    return this._promiseConnectUserToSendbird.then(() => {
      let isDistinct = false; // must be false, to never reuse previous channels, but alowys create a new one
                              // otherwise might create a lot of confusion (as requested by Michael)
      let channelName = sendbirdUserIdsForNewChannel
          .reduce(
            (tempChannelName, crtUserId) => {
              if (tempChannelName) {
                tempChannelName += ', ';
              }
              return tempChannelName + crtUserId;
            },
            ''
          )
          .substr(0, 70)
        + '...';

      let coverUrl = 'direct_chat_url';
      let data = '';
      return new Promise((resolve, reject) => {
        this._sendbirdInstance.GroupChannel.createChannelWithUserIds(
          sendbirdUserIdsForNewChannel,
          isDistinct,
          channelName,
          coverUrl,
          data,
          (channel, error) => {
            if (error) {
              console.error('Error when creating new direct message channel: ', error);
              reject('Error when creating new direct message channel');
              return;
            }

            this.logger.info('New direct message channel created: ', channel);
            resolve(channel);
          });
      });

    });


  }

  /**
   * Create OR reuse existing Direct Communication channel
   */
  createDirectMessageChannel(sendbirdUserIdsForNewChannel: Array<string>): any {
    if (!sendbirdUserIdsForNewChannel || !sendbirdUserIdsForNewChannel.length) {
      return Promise.reject('No users to create the channel');
    }

    return this._promiseConnectUserToSendbird.then(() => {
      let isDistinct = true; // must be false, to never reuse previous channels, but always create a new one
                             // otherwise might create a lot of confusion (as requested by Michael);
                             // after tests decided to set  isDistinct=false for campaign channels
                             // and isDistinct=true for direct message channels
      let channelName = sendbirdUserIdsForNewChannel
          .reduce(
            (tempChannelName, crtUserId) => {
              if (tempChannelName) {
                tempChannelName += ', ';
              }
              return tempChannelName + crtUserId;
            },
            ''
          )
          .substr(0, 70)
        + '...';

      let coverUrl = 'direct_chat_url';
      let data = '';
      return new Promise((resolve, reject) => {
        this._sendbirdInstance.GroupChannel.createChannelWithUserIds(
          sendbirdUserIdsForNewChannel,
          isDistinct,
          channelName,
          coverUrl,
          data,
          (channel, error) => {
            if (error) {
              console.error('Error when creating new direct message channel: ', error);
              reject('Error when creating new direct message channel');
              return;
            }

            // if by some sendbird ERROR, we try to reuse a campaign channel as a direct message channel
            if (this.channelIsForCampaign(channel)) {
              isDistinct = false;   // DO NOT reuse, as a last resort
              this._sendbirdInstance.GroupChannel.createChannelWithUserIds(
                sendbirdUserIdsForNewChannel,
                isDistinct,
                channelName,
                coverUrl,
                data,
                (newChannel, createNewChannelError) => {
                  if (createNewChannelError) {
                    console.error('Error when creating new direct message channel: ', createNewChannelError);
                    reject('Error when creating new direct message channel');
                    return;
                  }

                  this.logger.info('New direct message channel created: ', newChannel);
                  resolve(newChannel);
                });
            } else {
              this.logger.info('New direct message channel created: ', channel);
              resolve(channel);
            }
          });
      });

    });


  }

  channelIsForCampaign(channel: any): boolean {
    if (channel && channel.data && (channel.data.indexOf('channel_for_campaign_') === 0)) {
      return true;
    }
    return false;
  }

  registerReceiveMessageHandler(receiveTextMessageHandler: Function, uniqueHandlerId: String): void {
    let channelHandler = new this._sendbirdInstance.ChannelHandler();

    channelHandler.onMessageReceived = receiveTextMessageHandler;

    this._sendbirdInstance.addChannelHandler(uniqueHandlerId, channelHandler);
  }

  registerUserLeftChannelHandler(userLeftTextChannelHandler: Function, uniqueHandlerId: String): void {
    let channelHandler = new this._sendbirdInstance.ChannelHandler();

    channelHandler.onUserLeft = userLeftTextChannelHandler;

    this._sendbirdInstance.addChannelHandler(uniqueHandlerId, channelHandler);
  }

  registerUserJoinedChannelHandler(userjoinedTextChannelHandler: Function, uniqueHandlerId: String): void {
    let channelHandler = new this._sendbirdInstance.ChannelHandler();

    channelHandler.onUserJoined = userjoinedTextChannelHandler;

    this._sendbirdInstance.addChannelHandler(uniqueHandlerId, channelHandler);
  }


  leaveChannel(channel: any): Promise<any> {
    return new Promise((resolve, reject) => {
      channel.leave((response, error) => {
        this.logger.info('leave chanell', response);
        if (error) {
          console.error('Error when leaving channel', error);
          reject('Error when leaving channel');
          return;
        }
        resolve(response);
      });
    });
  }

  /**
   * @var native browser file, fileData;
   * Example: to obtain the fileData:
   * $('#chat_file_input').change(function() {
   *       if ($('#chat_file_input').val().trim().length == 0) return;
   *       var file = $('#chat_file_input')[0].files[0];
   *       $('.chat-input-file').addClass('file-upload');
   *
   *       currChannelInfo.sendFileMessage(file, SendMessageHandler);
   * });
   * @var Sendbird Channel Object sendbirdChannel,
   */
  sendFileMessage(sendbirdChannel: any, fileData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      sendbirdChannel.sendFileMessage(fileData, (message, error) => {
        if (error) {
          this.logger.info('Error when uploading file: ', error);
          reject('error when uploading file');
          return;
        }

        resolve(message);
      });
    });
  }

  private _connectUserToSendbird(): Promise<any> {
    let funcResolve: any;
    let funcReject: any;
    this._promiseConnectUserToSendbird = new Promise((resolve, reject) => {
      funcResolve = resolve;
      funcReject = reject;
    });

    this._authService.waitForCurrentUserData().then((currentUserData) => {
      this.logger.info('currentUserData for sendbird connect', currentUserData);
      this._sendbirdInstance.connect(currentUserData.id, currentUserData.sendbirdToken, (user, error) => {
        if (error) {
          funcReject('error connecting user to sendbird', error);
        } else {
          funcResolve(user);
        }
      });

    });

    return this._promiseConnectUserToSendbird;
  }

}
