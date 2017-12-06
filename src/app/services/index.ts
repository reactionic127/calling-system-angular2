/*
*   This barrel file loads all the services
*/

// Auth services
export * from './auth/auth.service';
export * from './auth-token/auth-token.service';
export * from './auth/auth.http';

// Caller-profile services
export * from './caller-profile/account.service';
export * from './caller-profile/callers.service';
export * from './caller-profile/payments.service';
export * from './caller-profile/ratings.service';

// Campaign (campaigner) services
export * from './campaign/campaign.service';
export * from './campaign/campaign.settings.service';
export * from './campaign/campaign.contact.service';
export * from './campaign/campaign.call.service';
export * from './campaign/campaign.query.service';
export * from './campaign/call.review.service';
export * from './campaign/follow-up-actions.service';
export * from './campaign/campaign-callers.service';
export * from './campaign/caller-review.service';
export * from './campaign/campaign.budget.service';
export * from './campaign/campaign-status.service';
export * from './campaign/campaign.payment.service';
export * from './campaign/follow-up-respones.service';
export * from './campaign/campaign.time.service';
export * from './campaign/campaign-stats.service';
export * from './campaign/campaign-revenue-stats.service';

// Campaign (upcaller) services
export * from './campaign-caller/join-campaign.service';

// Campaigner services
export * from './campaigner/credit-cards.service';
export * from './campaigner/invoices.service';

// Communication-center services
export * from './communication-center/communication-center.service';
export * from './communication-center/sendbird.service';
export * from './communication-center/twilio.service';

// Company services
export * from './company/company.service';
export * from './company/caller-id.service';
export * from './company/company-picture.service';
export * from './company/company-social-link.service';
export * from './company/company-faq.service';
export * from './company/company-document.service';
export * from './company/company-address.service';

// contact services
export * from './contact/contact-address.service';
export * from './contact/contact-follow-up.service';
export * from './contact/contact-social-links.service';
export * from './contact/contact-key-values.service';
export * from './contact/contact-call.service';

// Dashboard caller services
export * from './dashboard-caller/call-ratings.service';
export * from './dashboard-caller/caller-earnings.service';
export * from './dashboard-caller/caller-performance.service';
export * from './dashboard-caller/caller-stats.service';
export * from './dashboard-caller/client-satisfaction.service';
export * from './dashboard-caller/common-dashboard.service';
export * from './dashboard-caller/leaders.service';

// Questions services
export * from './question/question.service';
export * from './question/question.fields.service';
export * from './question/question-response.service';
export * from './question/question-answers.service';
export * from './question/question-answer-details.service';

// Translate services
export * from './translate/translate.service';

// Users services
export * from './user/permission.service';
export * from './user/user.service';

// Other services
export * from './phone.service';
export * from './utils.service';
export * from './call.service';
export * from './call-can-deactivate.service';
export * from './follow-up-responses.service';
export * from './industry.service';
export * from './twilio-capability-token.service';
export * from './update-user.service';
