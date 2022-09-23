/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
 function onMessage(event) {
    var token = null;
    var url = null;
    var friendlierMails = null;
    var botName = null;
    var prodStage = null;
    var employeesWithProdRights = null;
    try {
      // Get the value for the user property 'DISPLAY_UNITS'.
      const scriptProperties = PropertiesService.getScriptProperties();
      token = scriptProperties.getProperty('AUTH_TOKEN');
      url = scriptProperties.getProperty('DEPLOY_URL');
      friendlierMails = scriptProperties.getProperty('FRIENDLIER_MAILS');
      botName = scriptProperties.getProperty('BOT_NAME');
      prodStage = scriptProperties.getProperty('PROD_STAGE');
      employeesWithProdRights = scriptProperties.getProperty('PROD_RIGHTS');
    } catch (err) {
      Logger.log('Failed with error %s', err.message);
      return { "text": "Cannot read value of script properties!" };
    }
  
    var message = event.message.text;
    if(event?.space?.name){
      // @MegaRelease deploy mega-backend develop develop
      message = message.replace(botName, '').trim();
    }
  
    if(friendlierMails.includes(event?.user?.email) && !message.includes('bitte')){
      return { "text": "Hallo " + event.user.displayName.split(" ")[0] + ". Bitte etwas freundlicher :)" };
    }
  
    console.log("Message");
    console.log(message);
  
    // deploy mega-backend develop main
    var params = message.split(" ");
  
    if(!params || !params.includes('deploy')){
      Logger.log(params);
      return { "text": "Deploy-Nachricht muss im Format: 'deploy mega-backend develop main' sein." };
    }
  
    var project = params[1];
    var source = params[2];
    var target = params[3];
    
    Logger.log("project: " + project);
    Logger.log("source: " + source);
    Logger.log("target: " + target);
  
    if(target === prodStage && !employeesWithProdRights.includes(event?.user?.email)){
      Logger.log('User %s tried to deploy on prod!', event?.user?.email);
      return { "text": "Keine Rechte für Prod-Deployment!" };
    }
  
    var payload = {
      "project": project,
      "source": source,
      "target": target,
    }
  
    var options =
      {
        "method": "POST",
        "followRedirects": true,
        "payload": payload,
        "headers": {
              'Authorization': 'Bearer ' + token,
        },
        "muteHttpExceptions": true
      };
  
    Logger.log(payload);
    var result = UrlFetchApp.fetch(url, options);
  
    Logger.log("Deploy with command %s exited with status %s and message: %s", message, result.getResponseCode(), result.getContentText());
    if(result.getResponseCode() === 200){
      return { "text": "MEGA erfolgreich deployt mit Parametern: project *" + project + "*, source *" + source + "* and target *" + target + "*." };
    } else {
      return { "text": "Fehler beim Deployen von MEGA mit Parametern: project *" + project + "*, source *" + source + "* and target *" + target + "*. \n Status: *" + result.getResponseCode() + "*; Message: *" + result.getContentText() + "*." };
    }
  }
  
  /**
   * Responds to an ADDED_TO_SPACE event in Google Chat.
   *
   * @param {Object} event the event object from Google Chat
   */
  function onAddToSpace(event) {
    console.log(String.fromCharCode("&#9889;"));
    var message = "Hallo ich bin der MEGA Release-Bot." + String.fromCharCode("&#9889;") + " \nDu kannst MEGA mit folgender Nachricht deployen: \n```deploy <project> <source> <target>``` \nBeispiel: deploy mega-backend develop develop";
  
    return { "text": message };
  }
  
  /**
   * Responds to a REMOVED_FROM_SPACE event in Google Chat.
   *
   * @param {Object} event the event object from Google Chat
   */
  function onRemoveFromSpace(event) {
    return { "text": "Auf Wiedersehen! :wave: :wave:" };
  }
  
  