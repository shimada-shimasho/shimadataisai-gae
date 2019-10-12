setTimeout(function () {
    location.reload();
}, 300000);

var map;
var marker = [];
var infoWindow = [];
var markerData = [];
var marker_yatai = [];
var infoWindow_yatai = [];
var markerData_yatai = [];
var yatai = {
  "yataiInfo": [{
    "yataiNo": 1,
    "yataiName": "第一街",
    "image": "img/icon/mikoshi.png"
  }, {
    "yataiNo": 2,
    "yataiName": "第二街",
    "image": "img/icon/mikoshi.png"
  }, {
    "yataiNo": 3,
    "yataiName": "第三街",
    "image": "img/icon/mikoshi.png"
  }, {
    "yataiNo": 4,
    "yataiName": "第四街",
    "image": "img/icon/mikoshi.png"
  }, {
    "yataiNo": 5,
    "yataiName": "第五街",
    "image": "img/icon/mikoshi.png"
  }, {
    "yataiNo": 6,
    "yataiName": "鹿島踊",
    "image": "img/icon/dance.png"
  }, {
    "yataiNo": 7,
    "yataiName": "大名行列（先頭）",
    "image": "img/icon/daimyouF.png"
  }, {
    "yataiNo": 8,
    "yataiName": "大名行列（最後尾）",
    "image": "img/icon/daimyou.png"
  }]
};

function initMap() {
  getPosition();
}

// 現在地取得処理
function getPosition() {
  // 現在地を取得
  var latlng = new google.maps.LatLng(34.832616, 138.177890);

  map = new google.maps.Map(document.getElementById('map'), { // #sampleに地図を埋め込む
    center: latlng, // 地図の中心を指定
    zoom: 18 // 地図のズームを指定
  });
  getCSV();
  getRealtime();

  setTimeout(function() {
    map.panTo(latlng);
  }, 6000);
}

//-------csv load
function getCSV() {
  var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
  req.open("get", "../data/taisai_static_place_data.csv", true); // アクセスするファイルを指定
  req.send(null); // HTTPリクエストの発行

  // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ
  req.onload = function() {
    convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
  }
}

// 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
  var result = []; // 最終的な二次元配列を入れるための配列
  var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

  // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
  for (var i = 0; i < tmp.length; ++i) {
    result[i] = tmp[i].split(',');
  }

  for (var i = 0; i < result.length; i++) {
    markerLatLng = new google.maps.LatLng({
      lat: Number(result[i][16]),
      lng: Number(result[i][17])
    }); // 緯度経度のデータ作成
    marker[i] = new google.maps.Marker({ // マーカーの追加
      position: markerLatLng, // マーカーを立てる位置を指定
      map: map, // マーカーを立てる地図を指定
      // icon:result[i][27]
      icon: {
        url: "../" + result[i][27],
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    infoWindow[i] = new google.maps.InfoWindow({ // 吹き出しの追加
      // content: '<div class="sample">' + result[i][0] + '</div>' // 吹き出しに表示する内容
      content: result[i][0] // 吹き出しに表示する内容
    });

    markerEvent(i); // マーカーにクリックイベントを追加
  };
};
// マーカーにクリックイベントを追加
function markerEvent(i) {
  marker[i].addListener('click', function() { // マーカーをクリックしたとき
    infoWindow[i].open(map, marker[i]); // 吹き出しの表示
  });
};
//--------------------

//-------Realtime load
function getRealtime() {
  var req = new XMLHttpRequest(); // XMLHttpRequest オブジェクトを生成する
  req.onreadystatechange = function() { // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
    if (req.readyState == 4 && req.status == 200) { // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
      var real = JSON.parse(req.response);
      var realTimeData = JSON.parse(real);

      // var base64_req = btoa(realTimeData);
      // console.log(base64_req);
      // Create a root reference
      var storageRef = firebase.storage().ref().child('loc');
      // Raw string is the default if no format is provided
      // storageRef.putString(base64_req).then(function(snapshot) {
      storageRef.putString(req.response).then(function(snapshot) {
        console.log('Uploaded a raw string!');
      });

      for (var i = 0; i < realTimeData.length; i++) {
        markerLatLng = new google.maps.LatLng({
          lat: Number(realTimeData[i][1]["latitude"]),
          lng: Number(realTimeData[i][1]["longitude"])
        }); // 緯度経度のデータ作成
        marker_yatai[i] = new google.maps.Marker({ // マーカーの追加
          position: markerLatLng, // マーカーを立てる位置を指定
          map: map, // マーカーを立てる地図を指定
          icon: {
            url: "/"+yatai["yataiInfo"][i]["image"],
            scaledSize: new google.maps.Size(40, 40)
          }
        });

        infoWindow_yatai[i] = new google.maps.InfoWindow({ // 吹き出しの追加
          content: yatai["yataiInfo"][i]["yataiName"] // 吹き出しに表示する内容
        });
        infoWindow_yatai[i].open(map, marker_yatai[i]);

        // markerEvent_yatai(i); // マーカーにクリックイベントを追加
        // マーカーにクリックイベントを追加

      };
    };
  };

  req.open("GET", location.origin + "/api/pos", true); // HTTPメソッドとアクセスするサーバーの　URL　を指定
  req.send(null); // 実際にサーバーへリクエストを送信
};

function markerEvent_yatai(i) {
  marker_yatai[i].addListener('click', function() { // マーカーをクリックしたとき
    infoWindow_yatai[i].open(map, marker_yatai[i]); // 吹き出しの表示
  });
};
//--------------------
