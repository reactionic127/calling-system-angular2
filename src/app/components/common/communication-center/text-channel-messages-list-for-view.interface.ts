export interface ITextChannelMessagesListForView {
  days: Array<ITextChannelMessagesListDayForView>;
}

export interface ITextChannelMessagesListDayForView {
  dayKey: String;
  timestamp: number;
  formattedDate: String;
  messages: Array<ITextChannelMessageForView>;
}

export interface ITextChannelMessageForView {
  message: String;
  timestamp: number;
  formattedTime: String;
  senderChatNickname: String;
  senderChatUserId: String;
  senderProfileUrl: String;
  messageType: String;

  // for conference requests and conference statuses
  isJoinConferenceRequest: Boolean;
  conferenceNumber: String;
  isInProgressConference: Boolean;

  // for file messages
  fileType: String;
  fileUrl: String;
  fileName: String;
  fileSize: String;
}


// for communication overlay
export interface ITextChannelMessagesListOverlayForView {
  messages: Array<ITextChannelMessageForView>;
}
