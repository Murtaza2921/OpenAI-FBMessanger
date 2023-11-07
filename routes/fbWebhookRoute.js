const express = require('express');
const router = express.Router();
require('dotenv').config();

const { chatCompletion } = require('../helper/openaiApi');
const { sendMessage, setTypingOff, setTypingOn } = require('../helper/messengerApi');

router.get('/', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

router.post('/', async (req, res) => {
  try {
    console.log("hello")
    let body = req.body;
    let senderId = body.entry[0].messaging[0].sender.id;
    let query = body.entry[0].messaging[0].message.text;
    await setTypingOn(senderId);
    let result = await chatCompletion(query);
    await sendMessage(senderId, result.response);
    console.log(query);
    await setTypingOff(senderId);
    console.log(senderId);
    console.log(result.response);
  } catch (error) {
    console.log(error);
  }
  res.status(200).send('OK');
});


router.post('/facebook', (req, res) => {
  console.log("hello3434")
  const data = req.body;
  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.sender && event.sender.id) {
          const senderID = event.sender.id;
          if (approvedSenderIDs.includes(senderID)) {
            // Process the message from an approved sender
            // Your logic for handling the message goes here
            receivedMessage(event);
          } else {
            // Handle unauthorized sender - maybe log or respond with an error
            console.log(`Unauthorized sender: ${senderID}`);
          }
        }
      });
    });
    res.sendStatus(200);
  }
});

module.exports = {
  router
};