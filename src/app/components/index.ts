/*
*   This barrel file loads all the components
*/

// General components
export * from './app.component';

// Shared components
export * from './shared/no-content/no-content';
export * from './shared/header/header.component';
export * from './shared/footer/footer.component';
export * from './shared/close-component/close-component';
export * from './shared/context-information/context-information-component';
export * from './shared/help-tips/help-tips.component';

// Common components
export * from './common/communication-center/communication-center.component';
export * from './common/communication-center/modals/create-direct-message-channel/create-direct-message-channel-modal.component';
export * from './common/communication-center/file-input-for-file-message/file-input-for-file-message.component';
export * from './common/communication-center/overlay/communication-center-overlay.component';
export * from './common/communication-center/modals/create-twilio-audio-conference/create-twilio-audio-conference-modal.component';

/*
* Caller components
*/

// Caller-profile components
export { CallerProfileHomeComponent } from './caller/caller-profile/caller-profile.component';
export { ProfileComponent } from './caller/caller-profile/profile/profile.component';
export { RatingsComponent } from './caller/caller-profile/ratings/ratings.component';
export { PaymentsComponent } from './caller/caller-profile/payments/payments.component';
export { AccountComponent } from './caller/caller-profile/account/account.component';

// Campaign components
export { MyCampaignsHomeComponent } from './caller/campaign/campaign.component';
export { MyCampaignsMainComponent } from './caller/campaign/main/campaign-main.component';
export { JoinCampaignComponent } from './caller/campaign/join/join-campaign.component';
export { CampaignCallComponent } from './caller/campaign/details/call/campaign-call.component';
export { CampaignInformationComponent } from './caller/campaign/details/information/campaign-information.component';
export { CallingComponent } from './caller/campaign/details/call/calling/calling.component';

//Dashboard components
export { DashboardComponent } from './caller/dashboard/dashboard.component';
export { DashboardContentComponent } from './caller/dashboard/dashboard-content/dashboard-content.component';
export { DashboardEarningsComponent } from './caller/dashboard/earnings/earnings.component';
export { DashboardHomeComponent } from './caller/dashboard/dashboard-home/dashboard-home.component';

/*
* Campaigner components
*/

// Account components
export * from './campaigner/account/account-edit/account-edit.component';
export * from './campaigner/account/header/header.component';
export * from './campaigner/account/invoice-history/invoice-history.component';
export * from './campaigner/account/payment-method/payment-method.component';

// Campaign components
export * from './campaigner/campaign/callers/item/caller.component';
export * from './campaigner/campaign/campaigns/no-campaigns/no-campaigns.component';
export * from './campaigner/campaign/campaigns/my/my-campaigns.component';
export * from './campaigner/campaign/charts/question-answer-chart/question-answer-chart.component';
export * from './campaigner/campaign/create/campaign-create.component';

export * from './campaigner/campaign/edit/budget/campaign-budget.component';
export * from './campaigner/campaign/edit/caller-id/caller-id.component';
export * from './campaigner/campaign/edit/caller-id/my-id/my-id.component';
export * from './campaigner/campaign/edit/caller-id/rend-id/rent-id.component';
export * from './campaigner/campaign/edit/campaign-callers/campaign-callers.component';
export * from './campaigner/campaign/edit/campaign-callers/campaign-caller-information/campaign-caller-information.component';
export * from './campaigner/campaign/edit/campaign-caller/campaign-caller.component';
export * from './campaigner/campaign/edit/campaign-caller/call-history/campaign-caller-call-history.component';
export * from './campaigner/campaign/edit/campaign-caller/profile/campaign-caller-profile.component';
export { ContactListComponent } from './campaigner/campaign/edit/contact-list/contact-list.component';
export * from './campaigner/campaign/edit/contact-list/call-history/contact-call-history.component';
export * from './campaigner/campaign/edit/contact-list/converstation-outcome/contact-conversation-outcome.component';
export * from './campaigner/campaign/edit/contact-list/contact-info-header/contact-info-header.component';
export * from './campaigner/campaign/edit/contact-list/contact-edit/contact-edit.component';
export * from './campaigner/campaign/edit/contact-list/user-information/user-information.component';
export * from './campaigner/campaign/edit/contacts/import/contacts-import.component';
export * from './campaigner/campaign/edit/contacts/contacts-from-crm-component/contacts-from-crm.component';
export * from './campaigner/campaign/edit/contacts/folder/contacts-database.component';
export * from './campaigner/campaign/edit/express/campaign-express.component';
export * from './campaigner/campaign/edit/header/campaign-pending-header.component';
export * from './campaigner/campaign/edit/header/campaign-not-pending-header.component';
export * from './campaigner/campaign/edit/manage-callers/manage-callers.component';
export * from './campaigner/campaign/edit/outcome/campaign-outcome.component';
export * from './campaigner/campaign/edit/scripts/scripts-edit.component';
export * from './campaigner/campaign/edit/settings/campaign-settings.component';
export * from './campaigner/campaign/edit/time/campaign-time.component';

export * from './campaigner/campaign/modals/call-note/call-note.modal';
export * from './campaigner/campaign/modals/contact-import/contact-import.modal';
export * from './campaigner/campaign/modals/caller-reject/caller-reject.modal';
export * from './campaigner/campaign/modals/confirmation/confirmation.modal';
export * from './campaigner/campaign/modals/created-campaign/created-campaign.modal';
export * from './campaigner/campaign/modals/errors/errors.modal';
export * from './campaigner/campaign/payment/campaign-payment.component';
export * from './campaigner/campaign/show/campaign.component';
export * from './campaigner/campaign/show/overview/campaign-overview.component';
export * from './campaigner/campaign/show/results/campaign-results.component';

// Integration components
export * from './campaigner/integration/integration-list.component';
export * from './campaigner/integration/integration-details.component';

// My-company components
export * from './campaigner/my-company/show/show.component';
export * from './campaigner/my-company/edit/edit.component';
