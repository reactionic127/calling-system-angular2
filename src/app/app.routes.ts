import { Routes } from '@angular/router';

import * as Resolvers from './resolvers';
import * as Cmp from './components';
import { PermissionGuard, AuthResolver } from './services/auth/auth.service';
import { PERM_TYPE, USER_ROLE } from './models/permission';

export const ROUTES: Routes = [
  {
    path    : '',
    resolve : {
      translations: Resolvers.TranslationsResolver,
      user        : AuthResolver
    },
    children: [
      {
        path       : '',
        redirectTo: '/campaigns',
        pathMatch  : 'full'
      },
      {
        path    : 'campaigner',
        data    : {
          pageName     : 'campaigner-account',
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner]
        },
        children: [
          {
            path     : 'account',
            component: Cmp.CampaignerAccountEditComponent
          },
          {
            path    : 'invoices',
            children: [
              {
                path     : '',
                component: Cmp.CampaignerInvoiceHistoryComponent
              }
            ]
          },
          {
            path    : 'payment-method',
            children: [
              {
                path     : '',
                component: Cmp.CampaignerPaymentMethodComponent
              }
            ]
          },
          {
            path    : 'integration-list',
            children: [
              {
                path     : '',
                component: Cmp.IntegrationListComponent,
                data     : {
                  isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner]
                }
              },
              {
                path     : 'details',
                component: Cmp.IntegrationDetailComponent,
                data     : {
                  isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner]
                }
              }
            ]
          }
        ]
      },
      {
        path       : 'campaigns',
        data       : {
          pageName           : 'campaigns',
          isAllowedPermission: ['Campaign', PERM_TYPE.manage],
          isAllowedRole      : [USER_ROLE.admin, USER_ROLE.campaigner]
        },
        children   : [
          {
            path     : '',
            component: Cmp.MyCampaignsPage
          },
          {
            path     : 'create',
            component: Cmp.CampaignCreateComponent,
            data     : {
              pageName: 'campaign-create'
            },
          },
          {
            path     : ':id',
            component: Cmp.CampaignComponent,
            data     : {
              pageName: 'campaign-detail'
            },
            resolve  : {
              campaign: Resolvers.CampaignResolver
            },
            children : [
              {
                path    : 'express',
                data    : {
                  pageName: 'campaign-edit-express'
                },
                children: [
                  {
                    path     : '',
                    component: Cmp.CampaignExpressComponent
                  },
                  {
                    path     : 'scripts',
                    component: Cmp.ScriptsEditComponent,
                    data     : {
                      pageName: 'edit-scripts'
                    }
                  },
                  {
                    path     : 'contact-list',
                    component: Cmp.ContactListComponent,
                    data     : {
                      pageName: 'contacts-list'
                    }
                  },
                  {
                    path     : 'budget',
                    component: Cmp.BudgetComponent
                  },
                  {
                    path    : 'contacts',
                    children: [
                      {
                        path     : 'import',
                        component: Cmp.ContactsImportComponent,
                        data     : {
                          pageName: 'contact-import'
                        }
                      },
                      {
                        path     : 'from-crm',
                        component: Cmp.ContactsFromCrmComponent
                      },
                      {
                        path     : 'database',
                        component: Cmp.ContactsDatabaseComponent
                      }
                    ]
                  },
                  {
                    path     : 'caller-id',
                    component: Cmp.CallerIdComponent,
                    children : [
                      {
                        path: '',
                        data: {
                          pageName: 'caller-id'
                        }
                      },
                      {
                        path: 'rent-id'
                      }
                    ]
                  }
                ]
              },
              {
                path    : 'settings',
                children: [
                  {
                    path     : '',
                    component: Cmp.CampaignSettingsComponent
                  },
                  {
                    path     : 'scripts',
                    component: Cmp.ScriptsEditComponent,
                    data     : {
                      pageName: 'edit-scripts'
                    }
                  },
                  {
                    path     : 'contact-list',
                    component: Cmp.ContactListComponent
                  },
                  {
                    path    : 'contacts',
                    children: [
                      {
                        path     : 'import',
                        component: Cmp.ContactsImportComponent,
                        data     : {
                          pageName: 'contacts-import'
                        }
                      },
                      {
                        path     : 'from-crm',
                        component: Cmp.ContactsFromCrmComponent
                      },
                      {
                        path     : 'database',
                        component: Cmp.ContactsDatabaseComponent
                      }
                    ]
                  },
                  {
                    path     : 'budget',
                    component: Cmp.BudgetComponent
                  },
                  {
                    path     : 'outcome',
                    component: Cmp.OutcomeComponent
                  },
                  {
                    path     : 'caller-id',
                    component: Cmp.CallerIdComponent,
                    children : [
                      {
                        path: '',
                        data: {
                          pageName: 'caller-id'
                        }
                      },
                      {
                        path: 'rent-id'
                      }
                    ]
                  },
                  {
                    path     : 'time',
                    component: Cmp.TimeComponent
                  },
                  {
                    path     : 'manage-callers',
                    component: Cmp.ManageCampaignCallersComponent,
                    data     : {
                      pageName: 'manage-callers'
                    }
                  }
                ]
              },
              {
                path    : 'callers',
                children: [
                  {
                    path     : '',
                    component: Cmp.CampaignCallersComponent,
                    data     : {
                      pageName: 'callers'
                    }
                  },
                  {
                    path     : ':id',
                    component: Cmp.CampaignCallerComponent,
                    data     : {
                      pageName: 'caller-detail'
                    },
                    resolve  : {
                      campaignCaller: Resolvers.CampaignCallerResolver
                    }
                  }
                ]
              },
              {
                path    : 'contact-list',
                children: [
                  {
                    path     : '',
                    component: Cmp.ContactListComponent,
                    data     : {
                      pageName: 'contacts-list'
                    }
                  }
                ]
              },
              {
                path     : 'results',
                component: Cmp.CampaignResultsComponent
              },
              {
                path     : '',
                component: Cmp.CampaignOverviewComponent
              }
            ]
          },
          {
            path     : ':id/pay',
            data     : {
              pageName: 'campaign-payment'
            },
            resolve  : {
              campaign: Resolvers.CampaignResolver
            },
            component: Cmp.CampaignPaymentComponent
          }
        ],
        canActivate: [PermissionGuard]
      },
      {
        path       : 'callers',
        canActivate: [PermissionGuard],
        data       : {
          // isAllowedPermission: ['Campaign', PERM_TYPE.manage],
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner]
        },
        children   : [
          {
            path     : ':id',
            component: Cmp.CallerComponent,
            resolve  : {
              campaignCaller: Resolvers.CampaignCallerResolver
            }
          }
        ],
      },
      {
        path       : 'communication-center',
        canActivate: [PermissionGuard],
        component  : Cmp.CommunicationCenterComponent,
        data       : {
          // isAllowedPermission: ['Campaign', PERM_TYPE.manage],
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner, USER_ROLE.caller],
          pageName     : 'communication-center'
        }
      },
      {
        path     : 'company',
        component: Cmp.MyCompanyShowComponent,
        data     : {
          pageName     : 'my-company',
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner, USER_ROLE.caller],
        },

      },
      {
        path     : 'company/edit',
        component: Cmp.MyCompanyEditComponent,
        data     : {
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner],
        }
      },
      {
        path       : 'caller/path',
        component  : Cmp.MyCampaignsPage,
        canActivate: [PermissionGuard],
        data       : {
          isAllowedRole: [USER_ROLE.admin, USER_ROLE.campaigner]
        }
      },
      {path: '404', component: Cmp.NoContent},
    ]
  },

  {path: '**', component: Cmp.NoContent}
];
