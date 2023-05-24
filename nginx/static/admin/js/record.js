// チャットアイテムをロードする非同期関数
async function loadChatItems() {
 // チャットアイテムを表示するコンテナ要素を取得
 const container = document.getElementById("chat-container");

 // fetchActivityRecords関数を実行し、アクティビティレコードを取得
 const records = await fetchActivityRecords();

 // 各レコードに対して、チャットアイテムを作成し、コンテナに追加する
 records.forEach(record => {
  const chatItem = createChatItem(record);
  container.appendChild(chatItem);
 });
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
 chatImage.src = "./images/kotukotu_thumbnail.png";
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
 trashIcon.src = "./images/trash_icon.png";
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

// アクティビティレコードを取得する非同期関数（APIからデータを取得する部分を実装する必要があります）
async function fetchActivityRecords() {
 // ここでAPIからデータを取得する
 // 仮のデータを返す
 return [
  { day: "2023-04-20", time: "10:00" },
  { day: "2023-04-21", time: "11:00" },
  { day: "2023-04-22", time: "12:00" },
  { day: "2023-04-23", time: "13:00" },
  { day: "2023-04-24", time: "14:00" },
  { day: "2023-04-25", time: "15:00" },
  { day: "2023-04-26", time: "16:00" },
  { day: "2023-04-27", time: "17:00" },
  { day: "2023-04-28", time: "18:00" },
  { day: "2023-04-29", time: "19:00" },
  { day: "2023-04-30", time: "20:00" },
  { day: "2023-05-01", time: "21:00" },
  { day: "2023-05-02", time: "22:00" },
  { day: "2023-05-03", time: "23:00" },
  { day: "2023-05-04", time: "00:00" },
  { day: "2023-05-05", time: "01:00" },
  { day: "2023-05-06", time: "02:00" },
  { day: "2023-05-07", time: "03:00" },
  { day: "2023-05-08", time: "04:00" },
  { day: "2023-05-09", time: "05:00" },
  { day: "2023-05-10", time: "06:00" }
 ];
}

// 非同期処理を実行し、チャットアイテムをロード
loadChatItems();

// DOMが読み込まれた後に実行されるように設定
document.addEventListener("DOMContentLoaded", function () {
 // ハンバーガーメニューボタン（画像）を取得
 const menuButton = document.querySelector(".hamburger-menu");
 // モバイルメニューを取得
 const mobileMenu = document.getElementById("mobileMenu");
 // 閉じるボタンを取得
 const closeButton = document.getElementById("closeMenuButton");

 // メニューボタンがクリックされた時の処理
 menuButton.addEventListener("click", function () {
  mobileMenu.classList.toggle("hidden");
 });

 // 閉じるボタンがクリックされた時の処理
 closeButton.addEventListener("click", function () {
  mobileMenu.classList.add("hidden");
 });

 //  モバイルメニューの背景部分がクリックされた時の処理を実装したかったがZindexの関係かうまくいかなかった。
 //  mobileMenuBackground.addEventListener("click", function () {
 //   mobileMenu.classList.add("hidden");
 //  });
});

// モーダルの表示を制御する関数
function showModal() {
 const modalBg = document.getElementById("modal-bg");
 modalBg.classList.remove("hidden");
 modalBg.classList.add("flex");
}

// DOMが読み込まれた後に実行されるように設定
document.addEventListener("DOMContentLoaded", function () {
 // 省略: メニューボタン、モバイルメニュー、閉じるボタンの定義とイベントリスナー

 // 閉じるボタンがクリックされた時の処理
 closeButton.addEventListener("click", function () {
  mobileMenu.classList.add("hidden");
 });

 // 閉じるボタンをクリックした際のイベントリスナー
 document.getElementById("close-modal").addEventListener("click", function () {
  const modalBg = document.getElementById("modal-bg");
  modalBg.classList.remove("flex");
  modalBg.classList.add("hidden");
 });
});
