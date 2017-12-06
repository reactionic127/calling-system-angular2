import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { CommunicationCenterService, TranslateService, AuthService } from '../../../services';
import {
  ITextChannelMessagesListForView,
  ITextChannelMessagesListDayForView,
  ITextChannelMessageForView
} from './text-channel-messages-list-for-view.interface';
import {
  CreateDirectMessageChannelModalComponent
}
  from './modals/create-direct-message-channel/create-direct-message-channel-modal.component';
import {
  CreateTwilioAudioConferenceModalComponent
}
  from './modals/create-twilio-audio-conference/create-twilio-audio-conference-modal.component';
import { FileInputForFileMessageComponent } from './file-input-for-file-message/file-input-for-file-message.component';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import * as _ from 'lodash';

declare let Twilio: any;
import '../../../../assets/js/twilio.min.js';

let DetectRTC = require('../../../../../node_modules/detectrtc/DetectRTC.min.js');

@Component({
  // selector: 'communication-center',
  styleUrls: ['./communication-center.css'],
  templateUrl: './communication-center.template.html',
  providers: [],
})
export class CommunicationCenterComponent {

  public campaignTextChannels: Array<any>;
  public currentChannel: any;
  public currentChannelMessages: Array<any>;
  public currentChannelMessagesForView: ITextChannelMessagesListForView;

  public directMessageTextChannels: Array<any> = [] as Array<any>;

  public channelMembersShowMoreLimit: number = 9;
  public channelUnreadMessageCountShowMoreLimit: number = 9;
  public channelNameFromMembersLenLimit: number = 50;

  @ViewChild(CreateDirectMessageChannelModalComponent)
  private createDirectMessageChannelModalComponent: CreateDirectMessageChannelModalComponent;

  @ViewChild(CreateTwilioAudioConferenceModalComponent)
  private createTwilioAudioConferenceModalComponent: CreateTwilioAudioConferenceModalComponent;

  @ViewChild(FileInputForFileMessageComponent)
  private fileInputForFileMessage: FileInputForFileMessageComponent;

  private currentUpcallUserData: any;

  private messageToSendCurrentlyEdited: string;

  private activatedRouteSubscription: Subscription;

  private showCampaignChannelsLoader: boolean = false;
  private showDirrectMessagesChannelsLoader: boolean = false;
  private showChannelsMessagesLoader: boolean = false;

  private hasPermissionToCreateConfCall: boolean = false;
  private hasPermissionToCreateDirectMessageChannel: boolean = false;
  private hasPermissionToViewMainAngularApp: boolean = false;

  private triggerScrollMessages: Number = null;

  private twilioConnectionHasBeenEstablished: Boolean = false;

  constructor(private communicationCenterService: CommunicationCenterService,
              private _authService: AuthService,
              private toastr: ToastsManager,
              private translateService: TranslateService,
              private logger: Logger,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {

    this._authService.waitForCurrentUserData().then((currentUpcallUserData) => {
      this.currentUpcallUserData = currentUpcallUserData;
      this.logger.info('this.currentUpcallUserData: ', this.currentUpcallUserData);

      // for development
      // this.currentUpcallUserData.role = 'caller';

      this.userHasPermission('comm-center-conf-call', 'create').then((flag: boolean) => {
        this.hasPermissionToCreateConfCall = flag;
      });
      this.userHasPermission('comm-center-direct-message-channel', 'create').then((flag: boolean) => {
        this.hasPermissionToCreateDirectMessageChannel = flag;
      });
      this.userHasPermission('main-angular-app', 'view').then((flag: boolean) => {
        this.hasPermissionToViewMainAngularApp = flag;
      });

      this.loadAllChannels().then(() => {
        this.activatedRouteSubscription = this.activatedRoute.params.subscribe((routeParams: any) => {
          this.logger.info('routeParams', routeParams);

          if (routeParams.channelId) {
            // (START) if id(url particle) of channel is provided in route, then select that channel
            let channelRequestedByUrl = this.campaignTextChannels.find((campaignTextChannel) => {
              if (campaignTextChannel.url === routeParams.channelId) {
                return true;
              }
            });
            if (!channelRequestedByUrl) {
              channelRequestedByUrl = this.directMessageTextChannels.find((directMessageTextChannel) => {
                if (directMessageTextChannel.url === routeParams.channelId) {
                  return true;
                }
              });
            }
            if (channelRequestedByUrl) {
              this.selectChannel(channelRequestedByUrl);
            } else {
              this.tryCreateDirectMessageChannel(routeParams.channelId);
            }
            // (END) if id(url particle) of channel is provided in route, then select that channel
          } else {
            // select first channel
            this.navigateToFirstChannel();
          }
        });
      });
    });

    this.logger.info('this.fileInputForFileMessage', this.fileInputForFileMessage);
  }

  ngAfterViewInit(): void {
    setTimeout(
      function (): void {
        // $('body').mCustomScrollbar({
        //   scrollInertia: 0
        // });
      },
      0
    );
  }

  ngOnDestroy(): void {
    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }
  }

  loadAllChannels(): Promise<any> {
    this.showCampaignChannelsLoader = true;
    this.showDirrectMessagesChannelsLoader = true;
    return this.communicationCenterService.getUserCampaignAndDirectMessageTextChannels()
      .then((campaignAndDirectMessageTextChannels) => {
        this.campaignTextChannels = campaignAndDirectMessageTextChannels.campaignTextChannels;
        this.directMessageTextChannels = campaignAndDirectMessageTextChannels.directMessageTextChannels;

        this.showCampaignChannelsLoader = false;
        this.showDirrectMessagesChannelsLoader = false;

        // register handler for receiving LIVE messages
        this.communicationCenterService.registerReceiveTextMessageHandler(
          (channel, userMessage) => {
            this.logger.info('Received Message: ', channel, userMessage);

            if (this.currentChannel && (channel.url === this.currentChannel.url)) {
              this.formatMessagesForView([userMessage], this.currentChannelMessagesForView);
              this.triggerScrollMessages = new Date().getTime();
              this.currentChannel.markAsRead();
            }
          }
          , 'communicationCenterMainChatMessageReceived'
        );

        // register handler to receive envent of leaving a channel (not only this.currentChannel)
        this.communicationCenterService.registerUserLeftTextChannelHandler(
          (channel, user) => {
            this.logger.info('Received event user left a text channel: ', channel, user);

            if (this.currentChannel) {
              this.currentChannel.refresh();
            }
          }
          , 'communicationCenterMainChatUserLeftChannel'
        );

        // register handler to receive envent of joining a channel (not only this.currentChannel)
        this.communicationCenterService.registerUserJoinedTextChannelHandler(
          (channel, user) => {
            this.logger.info('Received event user joined a text channel: ', channel, user);

            if (this.currentChannel) {
              this.currentChannel.refresh();
            }

            // (START) IF current user is among the members of the channel,
            // AND IF the joined channel is not the current list of channels
            let crtUserAmongChannelMembers = channel.members.find((channelUser) => {
              if (channelUser.userId === this.currentUpcallUserData.id) {
                return true;
              }
            });
            if (crtUserAmongChannelMembers) {
              let joinedChannelAmongCampaignChannels = this.campaignTextChannels.find((campaignTextChannel) => {
                if (campaignTextChannel.url === channel.url) {
                  return true;
                }
              });

              let joinedChannelAmongDirectMessageChannels = this.directMessageTextChannels.find(
                (directMessageTextChannel) => {
                  if (directMessageTextChannel.url === channel.url) {
                    return true;
                  }
                }
              );

              if (!joinedChannelAmongCampaignChannels && !joinedChannelAmongDirectMessageChannels) {
                this.loadAllChannels();
              }
            }
            // (END) IF current user is among the members of the channel,
            // AND IF the joined channel is not the current list of channels
          }
          , 'communicationCenterMainChatUserJoinedChannel'
        );
      });
  }

  navigateToFirstChannel(): void {
    if (this.campaignTextChannels && this.campaignTextChannels.length) {
      this.navigateToChannel(this.campaignTextChannels[0]);
    } else if (this.directMessageTextChannels && this.directMessageTextChannels.length) {
      this.navigateToChannel(this.directMessageTextChannels[0]);
    }
  }

  navigateToChannel(channelData: any): Promise<boolean> {
    let communicationCenterUrl = '/communication-center';
    let matrixParams = {} as any;
    if (channelData) {
      matrixParams.channelId = channelData.url;
    }
    return this.router.navigate([communicationCenterUrl, matrixParams]);
  }

  selectChannel(channelData: any): void {
    this.showChannelsMessagesLoader = true;

    this.currentChannel = channelData;
    this.logger.info('this.currentChannel: ', this.currentChannel);

    this.communicationCenterService.getTextMessagesFromChannel(this.currentChannel).then((channelMessages) => {
      this.showChannelsMessagesLoader = false;

      this.currentChannelMessages = channelMessages as Array<any>;

      // this.currentChannelMessages = this.debugAddDaysToMessagesDates(this.currentChannelMessages);

      this.currentChannelMessagesForView = this.formatMessagesForView(this.currentChannelMessages, null);
      this.currentChannel.markAsRead();
      this.currentChannel.refresh();

      this.triggerScrollMessages = new Date().getTime();
    });
  }

  /**
   * Group messages by day
   */
  formatMessagesForView(userMessages: Array<any>,
                        formattedMessages: ITextChannelMessagesListForView): ITextChannelMessagesListForView {
    if (!formattedMessages) {
      formattedMessages = <ITextChannelMessagesListForView>{};
      formattedMessages.days = [] as Array<ITextChannelMessagesListDayForView>;
    }

    userMessages.forEach((userMessage) => {
      let messageIsCallRequest = false;
      let mMessageDate: any = moment(userMessage.createdAt);
      // this.logger.info('mMessageDate', mMessageDate.toISOString());

      // create the day if not existent
      let messageDayKey = mMessageDate.format('YYYY_MM_DD');
      let dayExisting = formattedMessages.days.find((dayData) => {
        return dayData.dayKey === messageDayKey;
      });
      if (!dayExisting) {
        let day: ITextChannelMessagesListDayForView = <ITextChannelMessagesListDayForView>{};
        day.dayKey = messageDayKey;
        day.timestamp = userMessage.createdAt;
        day.formattedDate = mMessageDate.format('MMMM Do, YYYY');
        day.messages = [] as Array<ITextChannelMessageForView>;

        formattedMessages.days.push(day);

        dayExisting = day;
      }

      // create formatted messages
      let formattedMessage: ITextChannelMessageForView = {} as ITextChannelMessageForView;
      formattedMessage.message = userMessage.message;
      formattedMessage.formattedTime = mMessageDate.format('hh:mm A');
      formattedMessage.timestamp = userMessage.createdAt;
      formattedMessage.senderChatNickname = userMessage.sender && userMessage.sender.nickname || 'user';
      formattedMessage.senderChatUserId = userMessage.sender.userId;
      formattedMessage.senderProfileUrl = userMessage.sender.profileUrl;
      formattedMessage.messageType = userMessage.messageType;


      if (userMessage.messageType !== 'file' && userMessage.message.trim().charAt(0) === '{') {
        messageIsCallRequest = this.communicationCenterService.isTheMessageJoinConferenceRequest(userMessage.message);
      }

      if (messageIsCallRequest) {
        let userCallRequestMessage = JSON.parse(userMessage.message);
        formattedMessage.isJoinConferenceRequest = userCallRequestMessage.isJoinConferenceRequest;
        formattedMessage.conferenceNumber = userCallRequestMessage.conferenceNumber || '';
        formattedMessage.isInProgressConference = userCallRequestMessage.isInProgressConference || false;
        this.currentChannel.hasInProgressConference = formattedMessage.isInProgressConference;
        this.createTwilioAudioConferenceModalComponent.hide(!formattedMessage.isInProgressConference);
      }
      if (userMessage.messageType === 'file') {
        formattedMessage.fileType = userMessage.type.match(/^image\/.+$/) ? 'image' : 'other';
        formattedMessage.fileUrl = userMessage.url;
        formattedMessage.fileName = userMessage.name;
        formattedMessage.fileSize = userMessage.size;
      }

      // add the message to the day
      dayExisting.messages.push(formattedMessage);
    });

    this.logger.info('formattedMessages: ', formattedMessages);
    return formattedMessages;
  }

  sendMessage(): void {
    if (!this.messageToSendCurrentlyEdited.trim()) {
      this.messageToSendCurrentlyEdited = '';
      return;
    }

    this.communicationCenterService.sendTextMessage(this.messageToSendCurrentlyEdited, this.currentChannel)
      .then((userMessage) => {
        this.logger.info('Message sent ok: ', userMessage);
        this.formatMessagesForView([userMessage], this.currentChannelMessagesForView);
        this.messageToSendCurrentlyEdited = '';

        this.triggerScrollMessages = new Date().getTime();
      })
      .catch((error) => {

      });
  }

  openCreateDirectMessageChannelModal(): void {
    if (!this.currentChannel || !this.currentChannel.url) {
      return;
    }
    this.createDirectMessageChannelModalComponent.setCurrentCampaignChannel(this.currentChannel);
    this.createDirectMessageChannelModalComponent.show();
  }

  afterModalCreateDirectMessageChannel(directMessageChannelData: any): void {
    this.logger.info('directMessageChannelData: ', directMessageChannelData);
    // if direct message channel created ok
    if (directMessageChannelData && directMessageChannelData.url) {
      let existingDirectMessageTextChannel = this.directMessageTextChannels.find((tmpDirectMessageTextChannel) => {
        if (tmpDirectMessageTextChannel.url === directMessageChannelData.url) {
          return true;
        }
      });
      if (!existingDirectMessageTextChannel) {
        this.directMessageTextChannels.push(directMessageChannelData);
      }
      this.createDirectMessageChannelModalComponent.hide();
      this.navigateToChannel(directMessageChannelData);
    }
  }

  mouseOverDirectMessageChannel(directMessageTextChannel: any): void {
    // this.logger.info('mouseOverDirectMessageChannel: ', directMessageTextChannel);
    directMessageTextChannel.mouseIsOverInLeftSideOfScreen = true;
  }

  mouseNotOverDirectMessageChannel(directMessageTextChannel: any): void {
    // this.logger.info('mouseNotOverDirectMessageChannel: ', directMessageTextChannel);
    directMessageTextChannel.mouseIsOverInLeftSideOfScreen = false;
  }

  leaveDirectMessageTextChannel(directMessageTextChannel: any): void {
    this.communicationCenterService.leaveTextChannel(directMessageTextChannel)
      .then((resultOfLeavingChannel) => {
        this.logger.info('resultOfLeavingChannel', resultOfLeavingChannel);
        this.loadAllChannels();
      })
      .catch((error) => {
      });
  }

  startConference(): void {
    if (DetectRTC.isWebRTCSupported) {
      this.logger.info('Conference start was initiated.');
      let twilioData: any = {};
      let conferenceRequestObject = {};
      this.communicationCenterService.getTwilioAuthenticationToken().subscribe(
        data => {
          let conferenceNumber = this.currentUpcallUserData.id + '_' + Date.now();
          conferenceRequestObject = {
            conferenceNumber: conferenceNumber,
            isInProgressConference: true,
            isJoinConferenceRequest: true
          };
          twilioData = data;
        },
        error => {
          this.logger.error('Twilio service error: ' + error);
        },
        () => {
          Twilio.Device.setup(twilioData.data.attributes.token);
          Twilio.Device.ready((device) => {
            this.logger.info('Twilio.Device Ready!');
            this.twilioConnectionHasBeenEstablished = true;
            this.initiateConference(conferenceRequestObject);
          });
          if (this.twilioConnectionHasBeenEstablished) {
            this.initiateConference(conferenceRequestObject);
          }

          Twilio.Device.disconnect((conn) => {
            this.logger.info('Twilio.Device DISCONECTED!');
          });

          Twilio.Device.incoming((conn) => {
            conn.accept();
          });
          Twilio.Device.error(function (error: any): void {
            Twilio.Device.disconnectAll();

            this.logger.info('Twilio.Device Error: ' + error.message);
          });
        }
      );
    } else {
      this.toastr.error(this.translateService.translate('Web calls are not supported by your browser'));
    }
  }

  joinConference(): void {
    let twilioData: any = {};
    let conferenceNumber = _.last(_.last(this.currentChannelMessagesForView.days).messages).conferenceNumber;
    this.communicationCenterService.getTwilioAuthenticationToken().subscribe(
      data => {
        twilioData = data;
      },
      error => {
        this.logger.error('Twilio service error: ' + error);
      },
      () => {
        Twilio.Device.setup(twilioData.data.attributes.token);
        Twilio.Device.ready((device) => {
          this.logger.info('Twilio.Device Ready!');
          this.twilioConnectionHasBeenEstablished = true;
          Twilio.Device.connect({ To: conferenceNumber });
        });
        if (this.twilioConnectionHasBeenEstablished) {
          Twilio.Device.connect({ To: conferenceNumber });
        }

        Twilio.Device.disconnect((conn) => {
          this.logger.info('Twilio.Device DISCONECTED!');
        });

        Twilio.Device.error(function (error: any): void {
          this.logger.info('Twilio.Device Error: ' + error.message);
        });
        this.initiateConference(null);
      }
    );
  }

  initiateConference(conferenceRequestObject: any): void {
    if (this.hasPermissionToCreateConfCall) {
      this.sendJoinConferenceRequest(JSON.stringify(conferenceRequestObject), conferenceRequestObject.conferenceNumber);
    }
    this.createTwilioAudioConferenceModalComponent.show(this.currentChannel);
  }

  sendEndConferenceNotification(conferenceEndRequest: string): void {
    this.communicationCenterService.sendTextMessage(conferenceEndRequest, this.currentChannel)
      .then((userMessage) => {
        this.logger.info('Message to end conference successfully sent.');
        this.formatMessagesForView([userMessage], this.currentChannelMessagesForView);
        this.currentChannel.hasInProgressConference = false;
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  sendJoinConferenceRequest(conferenceJoinRequest: string, phoneNumber: string): void {
    this.communicationCenterService.sendTextMessage(conferenceJoinRequest, this.currentChannel)
      .then((userMessage) => {
        this.logger.info('Message to join conference successfully sent.');
        this.formatMessagesForView([userMessage], this.currentChannelMessagesForView);
        this.currentChannel.hasInProgressConference = true;
        Twilio.Device.connect({ To: phoneNumber });
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  composeTextChannelNameFromItsMembers(textChannel: any): string {
    let channelName: string = '';
    if (textChannel && textChannel.members.length) {
      textChannel.members.forEach(function (channelMember: any): any {
        if (channelName) {
          channelName += ', ';
        }
        channelName += channelMember.nickname;
      });
    } else if (textChannel) {
      channelName = textChannel.name;
    }
    return channelName;
  }

  startSendFileMessageProcess(): void {
    this.fileInputForFileMessage.openFileInputDialog();
  }

  uploadFileForFileMessage(fileData: any): void {
    this.logger.info('fileData: ', fileData);

    if (!fileData) {
      return;
    }

    if (!this.currentChannel) {
      return;
    }

    this.communicationCenterService.sendTextFileMessage(this.currentChannel, fileData)
      .then((sentFileMessage) => {
        this.logger.info('sentFileMessage: ', sentFileMessage);
        this.formatMessagesForView([sentFileMessage], this.currentChannelMessagesForView);
      })
      .catch((error) => {
        this.toastr.error(error);
      });
  }

  tryCreateDirectMessageChannel(strUsersIds: string): void {
    let userIds: Array<string> = strUsersIds.split(',');
    if (userIds.length) {
      this.communicationCenterService.createDirectMessageTextChannel(userIds)
        .then((newChannelData) => {
          this.selectChannel(newChannelData);
        })
        .catch((error) => {
          this.toastr.error(error);
        });

    }
  }

  userHasPermission(onWhat: string, action: string): Promise<boolean> {
    return this.communicationCenterService.userHasPermission(onWhat, action);
  }

  onCallEnd(callEnded: boolean): void {
    this.logger.info('Call ended: ', callEnded);
    if (this.hasPermissionToCreateConfCall) {
      this.currentChannel.hasInProgressConference = false;
      let conferenceEndRequestObject = {
        isInProgressConference: false,
        isJoinConferenceRequest: true
      };
      this.sendEndConferenceNotification(JSON.stringify(conferenceEndRequestObject));
    }
    Twilio.Device.disconnectAll();
  }
}

  // private debugAddDaysToMessagesDates(channelMessages: Array<any>): Array<any> {
  //   let dayMiliseconds: number = 1 * 24 * 60 * 60 * 1000;
  //   let minuteMiliseconds: number = 1 * 60 * 1000;
  //   let daysToAdd: Array<number> = [
  //     0,
  //     1 * dayMiliseconds + 1 * minuteMiliseconds,
  //     1 * dayMiliseconds + 2 * minuteMiliseconds,
  //     1 * dayMiliseconds + 3 * minuteMiliseconds,
  //     2 * dayMiliseconds + 4 * minuteMiliseconds,
  //     3 * dayMiliseconds + 4 * minuteMiliseconds,
  //     4 * dayMiliseconds + 7 * minuteMiliseconds,
  //     4 * dayMiliseconds + 8 * minuteMiliseconds,
  //     4 * dayMiliseconds + 9 * minuteMiliseconds,
  //     4 * dayMiliseconds + 10 * minuteMiliseconds,
  //     5 * dayMiliseconds + 11 * minuteMiliseconds,
  //     5 * dayMiliseconds + 12 * minuteMiliseconds
  //   ];
  //   daysToAdd = daysToAdd.reverse();
  //
  //   let daysToAddIndex: number = -1;
  //   channelMessages.forEach((userMessage) => {
  //     daysToAddIndex += 1;
  //     if (!daysToAdd[daysToAddIndex]) {
  //       return;
  //     }
  //     userMessage.createdAt = userMessage.createdAt - daysToAdd[daysToAddIndex];
  //   });
  //
  //   return channelMessages;
  // }
