// 受け取るデータの形がJSON形式でないため動かない。htmlの260行目で指定するエンドポイントでのデータをJSON形式にしないといけないかも。

// JavaScriptで静的ファイルへのパスを通すための関数。djangoのやつを使わない（使えない）
function static(path) {
 const staticRoot = "/static/"; // DjangoのSTATIC_URLに相当する部分
 return staticRoot + path;
}

// チャットアイテムをロードする非同期関数
async function loadChatItems() {
 // チャットアイテムを表示するコンテナ要素を取得
 const container = document.getElementById("chat-container");

 // fetchActivityRecords関数を実行し、アクティビティレコードを取得
 const records = await fetchActivityRecords();

 // レコードが空の場合、"リストがありません"と表示
 if (records.length === 0) {
  const emptyMessage = document.createElement("p");
  emptyMessage.textContent = "リストがありません";
  container.appendChild(emptyMessage);
 } else {
  // 各レコードに対して、チャットアイテムを作成し、コンテナに追加する
  records.forEach(record => {
   const chatItem = createChatItem(record);
   container.appendChild(chatItem);
  });
 }
}

// アクティビティレコードをもとにチャットアイテムを作成する関数
function createChatItem(record) {
 // div要素を作成し、chat-bubbleクラスを追加
 const chatItem = document.createElement("div");
 chatItem.classList.add("chat-bubble");

 // チャットのテキストを作成し、アイテムに追加
 const chatText = document.createTextNode(`${record.day}は${record.time}時間頑張ったよ`);
 chatItem.appendChild(chatText);

 // img要素を作成し、属性とchat-imageクラスを追加
 const chatImage = document.createElement("img");
 const kotukotuThumbnailPath = static("admin/img/kotukotu_thumbnail.png");
 chatImage.src = kotukotuThumbnailPath;
 chatImage.alt = "サムネイルのカメの画像";
 chatImage.classList.add("chat-image");

 // 画像要素をチャットアイテムに追加
 chatItem.appendChild(chatImage);

 // ゴミ箱ボタン要素を作成し、属性とクラスを追加
 const trashButton = document.createElement("button");
 trashButton.type = "button";
 trashButton.classList.add("trash-button");

 // ゴミ箱アイコン要素を作成し、属性とクラスを追加
 const trashIcon = document.createElement("img");
 const trashIconPath = static("admin/img/trash_icon.png");
 trashIcon.src = trashIconPath;
 trashIcon.alt = "ゴミ箱アイコン";
 trashIcon.classList.add("trash-icon");

 // ゴミ箱アイコン要素をゴミ箱ボタンに追加
 trashButton.appendChild(trashIcon);

 // ゴミ箱ボタン要素をチャットアイテムに追加
 chatItem.appendChild(trashButton);

 // ゴミ箱ボタンにイベントリスナーを追加
 trashButton.addEventListener("click", function () {
  showModal();
 });

 // 完成したチャットアイテムを返す
 return chatItem;
}

// アクティビティレコードを取得する非同期関数
async function fetchActivityRecords() {
 // APIからデータを取得
 const response = await fetch(apiUrl);
 const data = await response.json();

 // データを返す
 return data;
}
