// Google App Engine + node.js Sample
//   [Routing] '/tasks/pos_cache/'
//   Copyright 2019 Technosite Corp.
const express = require('express');
const {
  Firestore
} = require('@google-cloud/firestore');
const fs = require('fs');
const firestore = new Firestore();
const router = express.Router();
require('date-utils');

// var storage = firebase.storage();

const posFsColl = 'pos'; // 位置情報Firestoreコレクション
const posDir = '/tmp/pos' // 屋台位置情報キャッシュディレクトリ

router.get('/', (req, res) => {
  console.log('[GET] -- /tasks/pos_cache --');
  console.log(`***GAE_VERSION: ${process.env.GAE_VERSION}`);


  const posMap = new Map();
  //直接データを読みに行く
  console.log('*** firebase');
  firestore.collection(posFsColl).get()
    .then((snapshot) => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        posMap.set(doc.id, doc.data());
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      posMap.set(['Error getting documents', err])
    });
  console.log('firebase ***');


  setTimeout(function() {
    console.log('*** posMap');
    console.log(posMap);
    // res.json(posMap);
    JSON.stringify([...posMap]);
    console.log('posMap ***');

    console.log('bucket ***');
    // bucket.putString(posMap).then(function(snapshot) {
    // bucket.upload(posMap).then(res => {
    //   console.log('Uploaded a raw string!');
    // });

    // storage.bucket('shimada-city-sample').upload('posMap');

    storage.bucket('shimada-city-sample').putString(posMap).then(function(snapshot) {
      console.log('Uploaded a raw string!');
    });
  }, 10000);




  res.end();
});


module.exports = router;
