// JavaScriptへ静的ファイルへのパスを通すための関数。
function static(path) {
  const staticRoot = "/static/"; // DjangoのSTATIC_URLに相当する部分
  return staticRoot + path;
 }
 
 // アクティビティレコードを取得する非同期関数
 async function fetchBadgeData() {
  try {
   // '/badges/ajax_get_data/'というURLからデータを非同期で取得する。urls.pyを参照している。
   const response = await fetch("/badges/ajax_get_data/");
 
   // 取得したデータをJSON形式にする。
   const data = await response.json();
 
   const badgeList = document.getElementById("badgeList");
 
   // データが存在しない場合のメッセージを表示
   if (data.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "バッジがありません";
    badgeList.appendChild(emptyMessage);
  } else {
    // データが存在する場合、それぞれのデータに対してチャットアイテムを作成し、追加する
    data.forEach(badge => {
     const chatItem = createChatItem(badge);
     badgeList.appendChild(chatItem);
    });
   }
  } catch (error) {
   console.error("Error:", error);
   return null;
  }
 }
 
 // アクティビティレコードをもとにチャットアイテムを作成する関数
 function createChatItem(badge) {
  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-bubble");
  chatItem.style.backgroundColor = badge.color_code; // チャットの色を設定
 
  const chatText = document.createTextNode(`${badge.date_unlocked}に${badge.badge_name}を獲得しました！`);
  chatItem.appendChild(chatText);
 
  // メモのテキストを作成し、アイテムに追加
  // const memoText = document.createElement("p");
  // memoText.textContent = record.memo;
  // chatItem.appendChild(memoText);
 
  //  亀の画像
  const chatImage = document.createElement("img");
  const kotukotuThumbnailPath = static("admin/img/kotukotu_thumbnail.png");
  chatImage.src = kotukotuThumbnailPath;
  chatImage.alt = "サムネイルのカメの画像";
  chatImage.classList.add("chat-image");
  chatItem.appendChild(chatImage);
 
  // ゴミ箱ボタン。押したらモーダルを動かす。
  // const trashButton = document.createElement("button");
  // trashButton.type = "button";
  // trashButton.classList.add("trash-button");
 
  // const trashIcon = document.createElement("img");
  // const trashIconPath = static("admin/img/trash_icon.png");
  // trashIcon.src = trashIconPath;
  // trashIcon.alt = "ゴミ箱アイコン";
  // trashIcon.classList.add("trash-icon");
 
  // trashButton.appendChild(trashIcon);
  // chatItem.appendChild(trashButton);
 
  //  htmlのモーダルから要素を取得
  // const deleteModal = document.getElementById("deleteModal");
  // const deleteForm = document.getElementById("deleteForm");
  // const cancelButton = document.getElementById("cancelButton");
 
  //  jsで作成したtrashボタンに対してモーダル表示機能を追加。
  // trashButton.addEventListener("click", function (event) {
  //  event.preventDefault();
   // ここで削除するアクティビティのIDをフォームのアクションにセット
  //  deleteForm.action = `/activity/delete/${record.id}/`;
  //  deleteModal.style.display = "block";
  // });
 
  //  htmlから取得したキャンセルボタンに対してモーダル非表示機能を追加。
  // cancelButton.addEventListener("click", function () {
  //  deleteModal.style.display = "none";
  // });
 
  return chatItem;
 }
 
 // 非同期関数を呼び出す
 fetchBadgeData();
