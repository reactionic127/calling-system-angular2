var httpsTool = require('https');
const urlTool = require('url');
const querystringTool = require('querystring');
const fs = require('fs');

var settings = require('./sendbird_config');

var usersNewlyCreated = [];

var functionsHandleSendbirdUsers = [];

// for development only
// functionsHandleSendbirdUsers.push(function () {
//   return deleteAllGroupChannels();
// });

settings.users.forEach(function (configUserData) {


  functionHandle1SendbirdUser = function () {

    // get user by id
    return getSendbirdUserById(configUserData.user_id)

    // check user
      .then(function (responseBody) {
        var responseJsonExistingUser = JSON.parse(responseBody);

        // if user not found
        if (responseJsonExistingUser.code && responseJsonExistingUser.code == '400201') {
          console.log('user not found, trying to create it');

          var promiseCreateNewUser = new Promise(
            (resolve, reject) => {
              createSendbirdUser(configUserData).then(function (responseBody) {
                var responseJsonNewUser = JSON.parse(responseBody);
                if (responseJsonNewUser.user_id) {
                  resolve(responseJsonNewUser);
                } else {
                  reject('Could not create new user');
                }
              });

            }
          );

          return promiseCreateNewUser;
        }

        return Promise.resolve(responseJsonExistingUser);
      })
      .then(function (userResponseBody) {
        if (!userResponseBody.user_id) {
          return Promise.reject('User not found')
        }

        // activate and update user
        return updateSendbirdUser(userResponseBody.user_id, true, configUserData).then(function (responseText) {
          var userData = JSON.parse(responseText);
          usersNewlyCreated.push(userData);
        });
      })
      .then(function () {
        // create campaign group channels from temporary setup configuration file, if they do not exist

        // get all group channels of user
        return getSendbirdGroupChannels([], '').then(function (allGroupChannels) {
          // build the functions to create missing channels
          var functionsToCreateChannels = [];
          var functionsToAddUsersChannels = [];

          console.log('+++ Got all ' + allGroupChannels.length + ' group channels +++', allGroupChannels);
          // console.log('+++ DEBUG allGroupChannels[0].members: ', allGroupChannels[0].members);

          configUserData.campaigns.forEach(function (configCampaignData) {
            var campaignChannelMeta = composeCampaignChannelMeta(configCampaignData.id);
            console.log('campaignChannelMeta: ', campaignChannelMeta);

            var existingCampaignChannel = allGroupChannels.find(function (channelData) {
              if (channelData.channel.data.includes(campaignChannelMeta)) {
                return true;
              }
            });

            if (!existingCampaignChannel) {
              functionsToCreateChannels.push(function () {
                console.log('Campaign chanel not found, so trying to create it:', configCampaignData);

                // return Promise.resolve();

                return new Promise(function (resolve, reject) {
                  createSendbirdCampaignGroupChannel(configUserData.user_id, configCampaignData).then(function (responseBody) {
                    var responseNewCampaignChannel = JSON.parse(responseBody);
                    if (!responseNewCampaignChannel) {
                      console.log('Could not create new Campaign Group Channel');
                      reject('Could not create new Campaign Group Channel');
                    } else {
                      resolve(responseNewCampaignChannel);
                    }
                  });
                });

              });

            } else {
              // check if user is added to this campaign channel
              if (existingCampaignChannel.members && existingCampaignChannel.members.length) {
                var existingChannelMember = existingCampaignChannel.members.find(function (channelMember) {
                  return (channelMember.user_id == configUserData.user_id);
                });
                if (!existingChannelMember) {

                  functionsToAddUsersChannels.push(function () {
                    console.log('User ' + configUserData.user_id + ' not added to campaign group channel '
                      + existingCampaignChannel.channel.name + '(' + existingCampaignChannel.channel.channel_url
                      + '), so trying add him'
                    );

                    // return Promise.resolve();

                    return addSendbirdUserToGroupChannel(configUserData.user_id, existingCampaignChannel);

                  });

                }
              }

            }

          });

          // execute, one after the other, the functions to create channels
          let chainPrommise = Promise.resolve();
          if (functionsToCreateChannels.length) {
            for (const func of functionsToCreateChannels) {
              chainPrommise = chainPrommise.then(func);
            }
          }

          // execute, one after the other, the functions to create users
          if (functionsToAddUsersChannels.length) {
            for (const func of functionsToAddUsersChannels) {
              chainPrommise = chainPrommise.then(func);
            }
          }

          return chainPrommise;

        })
      })

  };

  functionsHandleSendbirdUsers.push(functionHandle1SendbirdUser);

});

// execute, one after the other the functions to create users and channels
let createChannelAndDataPrommise = Promise.resolve();
if (functionsHandleSendbirdUsers.length) {
  for (const func of functionsHandleSendbirdUsers) {
    createChannelAndDataPrommise = createChannelAndDataPrommise.then(func);
  }
}

// save newly created users on disk (to know the access token generated by Sendbird)
createChannelAndDataPrommise.then(function () {
  saveNewlyCreatedUsersDataToFile(usersNewlyCreated);
});

function saveNewlyCreatedUsersDataToFile(usersNewlyCreated) {
  var stringData = JSON.stringify(usersNewlyCreated, null, '  ');
  console.log('Writing file with newly created users to disk');
  return fs.writeFile(__dirname+"/output_newly_created_data.json", stringData, {mode:0o777}, function (err) {
    if (err) {
      return console.log('Error when writing file with newly created users to disk', err);
    }

    console.log("The file was saved!");

    return Promise.resolve();
  });
}

function addSendbirdUserToGroupChannel(userId, channelData) {
  console.log('+++ Adding user ' + userId + ' to Channel Group ' + channelData.channel.name + '(' + channelData.channel.channel_url + ') +++');

  var postData = {
    "user_ids": [userId]
  };

  return httpsPostOrPut(
    'https://api.sendbird.com/v3/group_channels/' + channelData.channel.channel_url + '/invite',
    JSON.stringify(postData),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    },
    'POST'
  );
}

function deleteAllGroupChannels() {
  console.log('+++ DELETING group channels');

  return getSendbirdGroupChannels([], '')
    .then(function (allGroupChannels) {

      var functionsToDeleteChannels = [];
      allGroupChannels.forEach(function (channelData) {
        var functionToDelete1Channel = function () {
          console.log('+++ Deleting 1 channel ' + '-' + channelData.channel.data + ' - ' + channelData.channel.name + '-' + channelData.channel.channel_url + ')');
          return httpsDelete(
            'https://api.sendbird.com/v3/group_channels/' + channelData.channel.channel_url,
            {
              'Content-Type': 'application/json, charset=utf8',
              'Api-Token': settings.sendbirdApiToken
            }
          );
        };

        functionsToDeleteChannels.push(functionToDelete1Channel);
      });

      if (functionsToDeleteChannels.length) {
        var promiseDeleteChannel = Promise.resolve();
        functionsToDeleteChannels.forEach(function (functionToDelete1Channel) {
          promiseDeleteChannel = promiseDeleteChannel.then(function () {
            return functionToDelete1Channel();
          });
        });

      } else {
        return Promise.resolve();
      }

      return promiseDeleteChannel;
    });
}

function createSendbirdCampaignGroupChannel(userId, configCampaignData) {
  console.log('+++ Creating Campaign Channel Group +++');

  var campaignChannelMeta = composeCampaignChannelMeta(configCampaignData.id);

  var postData = {
    "name": configCampaignData.name,
    "cover_url": configCampaignData.cover_url,
    "data": campaignChannelMeta,
    "user_ids": userId,
    "is_distinct": false
  };

  var promiseCreateChannel = httpsPostOrPut(
    'https://api.sendbird.com/v3/group_channels',
    JSON.stringify(postData),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    },
    'POST'
  );

  if (!configCampaignData.messages || !configCampaignData.messages.length) {
    return promiseCreateChannel;
  }

  var functionsToCreateMessages = [];
  var channelCreateResponse = null;
  return promiseCreateChannel.then(function (response) {
    channelCreateResponse = response;

    var channelData = JSON.parse(channelCreateResponse);
    // create messages for this channel
    configCampaignData.messages.forEach(function (messageFromConfig) {
      functionsToCreateMessages.push(function () {
        return sendSendbirdMessageToGroupChannel(userId, messageFromConfig, channelData);
      });

    });

    // run functions to create messages
    var promiseCreateMessage = Promise.resolve();
    if (functionsToCreateMessages.length) {
      functionsToCreateMessages.forEach(function (functionToCreate1Message) {
        promiseCreateMessage = promiseCreateMessage.then(function () {
          return functionToCreate1Message();
        });
      });
    }

    return promiseCreateMessage.then(function () {
      return Promise.resolve(channelCreateResponse);
    })
  });

}

function sendSendbirdMessageToGroupChannel(userId, messageToSend, channelData) {
  console.log('+++ Sending message to channel +++');
  var postData = {
    "message_type": "MESG",
    "user_id": userId,
    "message": messageToSend,
    "mark_as_read": false
  };

  return httpsPostOrPut(
    'https://api.sendbird.com/v3/group_channels/' + channelData.channel.channel_url + '/messages',
    JSON.stringify(postData),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    },
    'POST'
  );
}

function composeCampaignChannelMeta(campaignId) {
  return 'channel_for_campaign_' + campaignId;
}

function getSendbirdGroupChannels(channels, nextItemsToken) {
  var urlParams = {
    limit: 100,
    // distinct_mode: 'nondistinct',
    member: true,
    token: nextItemsToken
  };

  if (!channels) {
    channels = [];
  }

  return httpsGet(
    'https://api.sendbird.com/v3/group_channels?' + querystringTool.stringify(urlParams),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    }
  )
    .then(function (responseBody) {
      var responseChannelsData = JSON.parse(responseBody);
      channels = channels.concat(responseChannelsData.channels);
      if (responseChannelsData.next) {
        nextItemsToken = responseChannelsData.next;
        return getSendbirdGroupChannels(channels, nextItemsToken);
      } else {
        return Promise.resolve(channels);
      }
    });
}


function updateSendbirdUser(userId, activateFlag, configUserData) {
  console.log('+++ Activating and updating User ' + userId + ' +++');

  var putData = {
    "is_active": activateFlag ? "true" : "false",
    "profile_url": configUserData.profile_url
  };
  return httpsPostOrPut(
    'https://api.sendbird.com/v3/users/' + userId,
    JSON.stringify(putData),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    },
    'PUT'
  );

}

function getSendbirdUserById(userId) {
  console.log('+++ Getting user by id ' + userId + ' +++');
  return httpsGet(
    'https://api.sendbird.com/v3/users/' + userId,
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    }
  );

}

function createSendbirdUser(userData) {
  console.log('+++ Creating User +++');

  var postData = {
    "user_id": userData.user_id,
    "nickname": userData.nickname,
    "profile_url": userData.profile_url,
    "issue_access_token": "true"
  };
  return httpsPostOrPut(
    'https://api.sendbird.com/v3/users',
    JSON.stringify(postData),
    {
      'Content-Type': 'application/json, charset=utf8',
      'Api-Token': settings.sendbirdApiToken
    },
    'POST'
  );
}

/**
 * @string url
 * @object extraHeaders, key value object with extra headers
 */
function httpsDelete(url, extraHeaders) {
  var urlObj = urlTool.parse(url);

  var options = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.path,
    method: 'DELETE'
  };

  if (extraHeaders) {
    options.headers = extraHeaders;
  }

  var responseBody = '';

  var promise = new Promise(
    (resolve, reject) => {
      var req = httpsTool.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          // console.log('No more data in response.');
          resolve(responseBody);
        });
      });

      req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        reject(e);
      });

      req.end();
    }
  );

  return promise;
}


/**
 * @string url
 * @string stringPostOrPutData
 * @object extraHeaders, key value object with extra headers
 * @string  httpMethod, PUT or POST
 */
function httpsPostOrPut(url, stringPostOrPutData, extraHeaders, httpMethod) {
  var urlObj = urlTool.parse(url);

  var options = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.path,
    method: httpMethod
  };

  if (extraHeaders) {
    options.headers = extraHeaders;
  }

  var responseBody = '';

  var promise = new Promise(
    (resolve, reject) => {
      var req = httpsTool.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          // console.log('No more data in response.');
          resolve(responseBody);
        });
      });

      req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        reject(e);
      });

      req.write(stringPostOrPutData);

      req.end();

    }
  );

  return promise;
}

function httpsGet(url, extraHeaders) {
  var urlObj = urlTool.parse(url);

  var options = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.path,
    method: 'GET'
  };

  if (extraHeaders) {
    options.headers = extraHeaders;
  }

  var responseBody = '';

  var promise = new Promise(
    (resolve, reject) => {
      var req = httpsTool.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          // console.log('No more data in response.');
          resolve(responseBody);
        });
      });

      req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        reject(e);
      });

      req.end();

    }
  );

  return promise;
}
