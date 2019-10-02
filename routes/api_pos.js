// Google App Engine + node.js Sample
//   [Routing] '/api/pos/'
//   Copyright 2019 Technosite Corp.

const express = require('express');
const {Firestore} = require('@google-cloud/firestore');
const fs = require('fs');
const firestore = new Firestore();
const router = express.Router();
require('date-utils');

const posFsColl = 'pos';        // 位置情報Firestoreコレクション
const posDir = '/tmp/pos'       // 屋台位置情報キャッシュディレクトリ

//現在時刻の取得(UTC)
var dt=new Date();
//JST(+9h)加算
dt.setHours(dt.getHours() + 9);
// var date = dt.getTime();
var date=dt.toLocaleString();

// [GET] /api/pos/
// 屋台位置情報取得
router.get('/', (req, res) => {
    console.log('[GET]');
    console.log(`***GAE_VERSION: ${process.env.GAE_VERSION}`);
    var posMap=getPosMap();
    setTimeout(function(){
      console.log('*** posMap');
      console.log(posMap);
      // res.json(posMap);
      res.json(JSON.stringify([...posMap]));
      console.log('posMap ***');
    },5000);
});

// [POST] /api/pos/
// 屋台位置情報登録
router.post('/', (req, res) => {
    console.log('[POST]');
    // 現在のデプロイバージョンを屋台Noとする
    const yataiNo = process.env.GAE_VERSION;
    console.log(`***GAE_VERSION: ${yataiNo}`);
    console.log(`No:${yataiNo}, Latitude:${req.body.latitude}, Longtitude:${req.body.longitude}`)
    const pos = putPosToFirestore(yataiNo, req.body.latitude, req.body.longitude,date);
    console.log(pos);
    // res.json(pos);

    console.log('[PAGE_BACK]');
    res.writeHead(302, {
        // 'Location': req.protocol + '://' + req.headers.host + req.url+'pos'
        'Location': 'https://' + req.headers.host + req.url+'pos?'+date
    });
    res.end();
});

// 屋台位置情報を取得する
function getPosMap() {
    const posMap = new Map();
    // if (!fs.existsSync(posDir)) {
    //     // 位置情報キャッシュディレクトリが存在しなければそのままreturn
    //     console.error(`!!! ${posDir} not found. !!!`);
    //     return posMap;
    // }

    // キャッシュディレクトリ内のファイル取得
    // const filenames = fs.readdirSync(posDir);
    // console.log(filenames);
    // filenames.forEach(f => {
    //     // ファイルの内容を読み込み、posMapに格納する
    //     console.log(`filename:${f}`);
    //     const data = fs.readFileSync(`${posDir}/${f}`);
    //     console.log(data.toString());
    //     posMap.set(f, data.toString());
    // });
//-----------------------------------------------------------
//直接データを読みに行く
    console.log('*** firebase');
    firestore.collection(posFsColl).get()
        .then((snapshot) => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                posMap.set(doc.id,doc.data())
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
            posMap.set(['Error getting documents', err])
        });
    console.log('firebase ***');
//-----------------------------------------------------------
    return posMap;
}

// 屋台位置情報をFirestoreに保存する
function putPosToFirestore(no, latitude, longitude,date) {
    const pos = {latitude: parseFloat(latitude), longitude: parseFloat(longitude) , time:date};
    const docRef = firestore.doc(`${posFsColl}/${no}`);
    docRef.set(pos).then(res => {
        console.log('*** success: put firestore');
    });
    return pos;
}

module.exports = router;
