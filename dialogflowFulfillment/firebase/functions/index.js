 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
const mysql = require('mysql');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function connectToDatabase(){
    const connection = mysql.createConnection({
      host     : '176.31.216.189',
      user     : 'alifaexpress',
      password : 'Pakistan92*',
      database : 'alifaexp_testing'
    });
    return new Promise((resolve,reject) => {
       connection.connect();
       resolve(connection);
    });
  }

    function queryDatabase(connection){
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM testing_user', (error, results, fields) => {
        resolve(results);
      });
    });
  }
  
    function handleReadFromMySQL(agent){
    const user_email = agent.parameters.email;
    return connectToDatabase()
    .then(connection => {
      return queryDatabase(connection)
      .then(result => {
        console.log(result);
        result.map(user => {
          if(user_email === user.email){
            agent.add(`First Name: ${user.user_name} and Last Name: ${user.last_name}`);
          }
        });        
        connection.end();
      });
    });
  }
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GetRecord', handleReadFromMySQL);
  agent.handleRequest(intentMap);
});
