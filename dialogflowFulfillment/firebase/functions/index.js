// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var syllable = require('syllable');
var fleschKincaid = require('flesch-kincaid');
var counter = 0;
var score = 0;
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  function words(st){
    var spaceCount = (st.split(" ").length - 1);
    return spaceCount;
  }
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    counter = 0;
	score = 0;
    agent.add(`Let's chat! Say something!`);
    agent.add(`Let's talk! Give me one or two sentences.`);
  }

  function test(agent) {
    counter=counter+1;
    let query = JSON.stringify(agent.query);
    if(words(query)==0){
      var x = 0.8;
      score += x;
    }
    else if(words(query)==1){
      var y = 1.2;
      score += y;
    }
    else {
      score += fleschKincaid({sentence: 1, word: words(query), syllable: syllable(query)});
    }
    if(counter==1){
      agent.add(`Hello! What brought you to this app?`);
    }
    else if(counter==2){
      agent.add(`Interesting. Tell me about the best part of your day.`);
    }
    else if(counter==3){
      agent.add(`Glad to hear it. Tell me about something you did today.`);
    }
    else if(counter==4){
      agent.add(`Cool. What's a fun fact about yourself?`);
    }
    else if(counter==5){
      agent.add(`Awesome! Have you learned anything new recently?`);
    }
       
    
  }

  function testFinished(agent) {
    let avgScore = score/counter;
    if (avgScore >= 12) {
      agent.add(`Fascinating. Mind if I get your opinion on a few things?`)
      agent.setContext({ name: 'hardMode', lifespan: 5});
    }
    else if (avgScore >= 6) {
      agent.add(`Your English is not bad. Can I ask you some questions?`)
      agent.setContext({ name: 'normalMode', lifespan: 5});
    }
    else {
      agent.add(`Now I'll ask you. Let's start out simple.`)
      agent.setContext({ name: 'easyMode', lifespan: 5});
    }
    
    counter = 0; 
   
  }
  
  function easyMode(agent) {
    counter = counter + 1
    
    if(counter==1){
      agent.add(`What is your name?`);
    }
    else if(counter==2){
      agent.add(`What is your favorite color?`);
    }
    else if(counter==3){
      agent.add(`Where are you from?`);
    }
    else if(counter==4){
      agent.add(`What is your job?`);
    }
    else if(counter==5){
      agent.add(`Do you play any sports?`);
    }
  }
  
  function normalMode(agent) {
    counter = counter + 1
    
    if(counter==1){
      agent.add(`Have you seen any fun movies lately?`);
    }
    else if(counter==2){
      agent.add(`Have you heard any interesting songs lately?`);
    }
    else if(counter==3){
      agent.add(`Who is your favorite fiction author?`);
    }
    else if(counter==4){
      agent.add(`Do you speak any other languages?`);
    }
    else if(counter==5){
      agent.add(`Think of the best trip you've been on. Where did you go?`);
    }
  }

  function hardMode(agent) {
    counter = counter + 1
    
    if(counter==1){
      agent.add(`What's something people do that gets on your nerves?`);
    }
    else if(counter==2){
      agent.add(`What is your definition of success?`);
    }
    else if(counter==3){
      agent.add(`Do you think social networking makes society better?`);
    }
    else if(counter==4){
      agent.add(`What's something that the 2010's will be known for?`);
    }
    else if(counter==5){
      agent.add(`Do you think that a machine could think?`);
    }
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Currently Testing', test);
  intentMap.set('Currently Testing - fallback', testFinished);
  intentMap.set('Easy Mode', easyMode);
  intentMap.set('Normal Mode', normalMode);
  intentMap.set('Hard Mode', hardMode);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
