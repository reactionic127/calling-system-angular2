import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { CommunicationCenterService, AuthService } from '../../../../services';
import {
  ITextChannelMessageForView, ITextChannelMessagesListOverlayForView
} from '../text-channel-messages-list-for-view.interface';
import { FileInputForFileMessageComponent } from '../file-input-for-file-message/file-input-for-file-message.component';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Logger } from 'angular2-logger/core';
import { Router } from '@angular/router';

@Component({
  selector   : 'communication-center-overlay',
  // styleUrls: ['./communication-center-overlay.css'],
  templateUrl: './communication-center-overlay.template.html',
  providers  : [],
})
export class CommunicationCenterOverlayComponent {

  public campaignTextChannels: Array<any>;
  public currentChannel: any;
  public currentChannelMembersLimitedForOverlayTop: Array<any>;
  public currentChannelMessages: Array<any>;
  public currentChannelMessagesForView: ITextChannelMessagesListOverlayForView;

  public directMessageTextChannels: Array<any> = [] as Array<any>;

  public channelMembersShowMoreLimit: number            = 9;
  public channelUnreadMessageCountShowMoreLimit: number = 9;
  public channelNameFromMembersLenLimit: number         = 50;
  public channelShortDescriptionMaxLen: number          = 45;
  public overlayTopChannelMembersMaxCount: number       = 4;

  @ViewChild(FileInputForFileMessageComponent)
  private fileInputForFileMessage: FileInputForFileMessageComponent;

  private messageToSendCurrentlyEdited: string;

  private currentUpcallUserData: any;


  private chatOverlayIsVisible: boolean                  = false;
  private communicationCenterOverlayIsAvailable: boolean = true;

  private triggerScrollMessages: Number = null;

  private totalUnreadMessagesCount: Number = 0;
  private intervalHandleTotalUnreadMessages: any = null;
  private intervalHandleRefreshCampaignChannels: any = null;

  constructor(private communicationCenterService: CommunicationCenterService,
              private _authService: AuthService,
              private toastr: ToastsManager,
              private logger: Logger,
              private router: Router) {
  }

  ngOnInit(): void {

    // (START) display the communication center overlay only when NOT on Communication Center page
    this.router.events.subscribe(
      (routeEvent: any) => {
        this.logger.info('routeEvent received in communication overlay', routeEvent);
        if (routeEvent && routeEvent.urlAfterRedirects &&
          routeEvent.urlAfterRedirects.indexOf('/communication-center') === 0) {
          this.communicationCenterOverlayIsAvailable = false;
        } else {
          this.communicationCenterOverlayIsAvailable = true;
        }
      },
      (error) => {
        this.logger.info('routeEvent received error in communication overlay', error);
      },
      () => {
        // subs.unsubscribe();
      }
    );
    // (END) display the communication center overlay only when NOT on Communication Center page

    this._authService.waitForCurrentUserData().then((currentUpcallUserData) => {
      this.currentUpcallUserData = currentUpcallUserData;
      this.loadAllChannels();
    });

    this.logger.info('this.fileInputForFileMessage', this.fileInputForFileMessage);
  }

  ngAfterViewInit(): void {
    this.intervalHandleTotalUnreadMessages = setInterval(
      () => {
        this.updateTotalNumberUnreadMessages();
      },
      5000
    );
    this.intervalHandleRefreshCampaignChannels = setInterval(
      () => {
        this.refreshCampaignChannels();
      },
      30000
    );
  }
  ngOnDestroy(): void {
    if (this.intervalHandleTotalUnreadMessages) {
      window.clearInterval(this.intervalHandleTotalUnreadMessages);
    }
    if (this.intervalHandleRefreshCampaignChannels) {
      window.clearInterval(this.intervalHandleRefreshCampaignChannels);
    }
  }

  loadAllChannels(): void {
    this.communicationCenterService.getUserCampaignAndDirectMessageTextChannels()
      .then((campaignAndDirectMessageTextChannels) => {
        this.campaignTextChannels      = campaignAndDirectMessageTextChannels.campaignTextChannels;
        this.directMessageTextChannels = campaignAndDirectMessageTextChannels.directMessageTextChannels;

        this.updateTotalNumberUnreadMessages();

        // register handler for receiving LIVE messages
        this.communicationCenterService.registerReceiveTextMessageHandler(
          (channel, userMessage) => {
            this.logger.info('Received Message: ', channel, userMessage);

            this.updateTotalNumberUnreadMessages();

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
                });

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

  updateTotalNumberUnreadMessages(): void {
    let totalUnreadMessagesCount = 0;
    if (!this.campaignTextChannels) {
      return;
    }
    this.campaignTextChannels.forEach((campaignChannel: any) => {
      // console.log('campaignChannel.name, campaignChannel.unreadMessageCount', campaignChannel.name, campaignChannel.unreadMessageCount);
      totalUnreadMessagesCount += campaignChannel.unreadMessageCount;
    });
    this.totalUnreadMessagesCount = totalUnreadMessagesCount;
  }

  refreshCampaignChannels(): void {
    if (!this.campaignTextChannels) {
      return;
    }
    this.campaignTextChannels.forEach((campaignChannel: any) => {
      campaignChannel.refresh();
    });
  }

  selectChannel(channelData: any): void {
    this.currentChannel = channelData;
    this.logger.info('this.currentChannel: ', this.currentChannel);

    this.currentChannelMembersLimitedForOverlayTop = this.currentChannel.members.slice(
      0,
      this.overlayTopChannelMembersMaxCount
    );

    this.communicationCenterService.getTextMessagesFromChannel(this.currentChannel).then((channelMessages) => {
      this.currentChannelMessages = channelMessages as Array<any>;

      // this.currentChannelMessages = this.debugAddDaysToMessagesDates(this.currentChannelMessages);

      this.currentChannelMessagesForView = this.formatMessagesForView(this.currentChannelMessages, null);
      this.currentChannel.markAsRead();
      this.currentChannel.refresh();
      this.triggerScrollMessages = new Date().getTime();

      // it takes a while for the number of unread messages the channel to get updated
      setTimeout(
        () => {
          this.updateTotalNumberUnreadMessages();
        },
        3000
      );
    });
  }

  /**
   */
  formatMessagesForView(userMessages: Array<any>,
                        formattedMessages: ITextChannelMessagesListOverlayForView): ITextChannelMessagesListOverlayForView {
    if (!formattedMessages) {
      formattedMessages          = {} as ITextChannelMessagesListOverlayForView;
      formattedMessages.messages = [] as Array<ITextChannelMessageForView>;
    }

    userMessages.forEach((userMessage) => {
      let mMessageDate: any = moment(userMessage.createdAt);
      // this.logger.info('mMessageDate', mMessageDate.toISOString());

      // create formatted messages
      let formattedMessage: ITextChannelMessageForView = {} as ITextChannelMessageForView;
      formattedMessage.message                         = userMessage.message;
      formattedMessage.formattedTime                   = mMessageDate.format('hh:mm A');
      formattedMessage.timestamp                       = userMessage.createdAt;
      formattedMessage.senderChatNickname              = userMessage.sender && userMessage.sender.nickname || 'user';
      formattedMessage.senderChatUserId                = userMessage.sender.userId;
      formattedMessage.senderProfileUrl                = userMessage.sender.profileUrl;
      formattedMessage.messageType                     = userMessage.messageType;

      if (this.communicationCenterService.isTheMessageJoinConferenceRequest(userMessage.message)) {
        formattedMessage.isJoinConferenceRequest = JSON.parse(userMessage.message).isJoinConferenceRequest;
        formattedMessage.conferenceNumber = JSON.parse(userMessage.message).conferenceNumber || '';
        formattedMessage.isInProgressConference = JSON.parse(userMessage.message).isInProgressConference || false;

        this.currentChannel.hasInProgressConference = formattedMessage.isInProgressConference;
      }

      if (userMessage.messageType === 'file') {
        formattedMessage.fileType = userMessage.type.match(/^image\/.+$/) ? 'image' : 'other';
        formattedMessage.fileUrl  = userMessage.url;
        formattedMessage.fileName = userMessage.name;
        formattedMessage.fileSize = userMessage.size;
      }

      // add the message to the list of formatted messages
      formattedMessages.messages.push(formattedMessage);

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

  toggleChatOverlay(): void {
    this.chatOverlayIsVisible = !this.chatOverlayIsVisible;
  }

  goToChannelsList(): void {
    this.resetCurrentChannel();
  }

  navigateToCommunicationCenter(): Promise<boolean> {
    let communicationCenterUrl = '/communication-center';
    let matrixParams           = {} as any;
    if (this.currentChannel) {
      matrixParams.channelId = this.currentChannel.url;
    }
    return this.router.navigate([communicationCenterUrl, matrixParams]);
  }

  private resetCurrentChannel(): void {
    this.currentChannel                = null;
    this.currentChannelMessages        = null;
    this.currentChannelMessagesForView = null;
    this.messageToSendCurrentlyEdited  = null;
    this.directMessageTextChannels     = null;
  }

  // private debugAddDaysToMessagesDates(channelMessages: Array<any>): Array<any> {
  //   let dayMiliseconds: number    = 1 * 24 * 60 * 60 * 1000;
  //   let minuteMiliseconds: number = 1 * 60 * 1000;
  //   let daysToAdd: Array<number>  = [
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
  //   daysToAdd                     = daysToAdd.reverse();
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
}
