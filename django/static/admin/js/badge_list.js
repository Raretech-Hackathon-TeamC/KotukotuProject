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
    emptyMessage.textContent = "実績がありません";
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

  if (badge.is_unlocked) {
    chatItem.style.backgroundColor = badge.color_code; // チャットの色を設定

    const chatText = document.createElement("span");
    chatText.innerHTML = `実績:【${badge.badge_name}】を解除しました！<br>解除条件:${badge.badge_description}<br>解除日:${badge.date_unlocked}`;
    chatItem.appendChild(chatText);
  } else {
    chatItem.style.backgroundColor = "#A6A6A6"; // グレーの背景色

    const chatText = document.createElement("span");
    chatText.innerHTML = `実績:【${badge.badge_name}】は未解除です。<br>解除条件:${badge.badge_description}`;
    chatItem.appendChild(chatText);
  }

  //  亀の画像
  const chatImage = document.createElement("img");
  const kotukotuThumbnailPath = static("admin/img/kotukotu_thumbnail.png");
  chatImage.src = kotukotuThumbnailPath;
  chatImage.alt = "サムネイルのカメの画像";
  chatImage.classList.add("chat-image");
  chatItem.appendChild(chatImage);

  return chatItem;
 }

 // 非同期関数を呼び出す
 fetchBadgeData();
