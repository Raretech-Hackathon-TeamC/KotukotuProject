// JavaScriptへ静的ファイルへのパスを通すための関数。
function static(path) {
 const staticRoot = "/static/"; // DjangoのSTATIC_URLに相当する部分
 return staticRoot + path;
}

// ウィンドウの幅に応じて改行文字数を変更する関数
function getMaxCharPerLine() {
 const width = window.innerWidth;

 // 幅に応じて改行文字数を変更
 if (width <= 480) {
  return 20; // スマートフォン等、小さな画面
 } else if (width <= 1024) {
  return 30; // タブレットサイズ
 } else {
  return 60; // デスクトップ等、大きな画面
 }
}

// アクティビティレコードを取得する非同期関数
async function fetchActivityRecords() {
 try {
  // '/activity/list/ajax_get_data/'というURLからデータを非同期で取得する。urls.pyを参照している。
  const response = await fetch("/activity/list/ajax_get_data/");

  // 取得したデータをJSON形式にする。
  const data = await response.json();

  const container = document.getElementById("chat-container");

  // データが存在しない場合のメッセージを表示
  if (data.activities.length === 0) {
   const emptyMessage = document.createElement("p");
   emptyMessage.textContent = "リストがありません";
   container.appendChild(emptyMessage);
  } else {
   // データが存在する場合、それぞれのデータに対してチャットアイテムを作成し、追加する
   data.activities.forEach(record => {
    const chatItem = createChatItem(record);
    container.appendChild(chatItem);
   });
  }
 } catch (error) {
  console.error("Error:", error);
  return null;
 }
}

// アクティビティレコードをもとにチャットアイテムを作成する関数
function createChatItem(record) {
 const chatItem = document.createElement("div");
 chatItem.classList.add("chat-bubble");
 chatItem.style.backgroundColor = record.category_color; // チャットの色を設定

 const date = new Date(record.date);
 const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
 let formattedDuration = "";
 const duration = record.duration.split(":").map(value => parseInt(value));
 if (duration[0] > 0) {
  formattedDuration += `${duration[0]}時間`;
 }
 if (duration[1] > 0 || duration[0] === 0) {
  formattedDuration += `${duration[1]}分`;
 }

 //  折り返し表示のために追記
 const textContainer = document.createElement("div");
 textContainer.classList.add("text-container");

 const chatText = document.createTextNode(`${formattedDate}は${formattedDuration}頑張ったよ`);

 // 上の文言とメモを縦に並べるラッパーを作成した。
 const textWrapper = document.createElement("div");
 textWrapper.style.display = "flex";
 textWrapper.style.flexDirection = "column";
 textWrapper.appendChild(chatText);

 // テキストノードの作成
 if (record.memo.length > 0) {
  let lines = Math.ceil(record.memo.length / getMaxCharPerLine());
  for (let i = 0; i < lines; i++) {
   let span = document.createElement("span");
   span.textContent = record.memo.slice(i * getMaxCharPerLine(), (i + 1) * getMaxCharPerLine());
   textWrapper.appendChild(span);
   if (i < lines - 1) {
    let br = document.createElement("br");
    textWrapper.appendChild(br);
   }
  }
 } else {
  const memoNode = document.createTextNode(" ");
  textWrapper.appendChild(memoNode);
 }

 chatItem.appendChild(textWrapper);

 // 亀の画像
 const chatImage = document.createElement("img");
 const kotukotuThumbnailPath = static("admin/img/kotukotu_thumbnail.png");
 chatImage.src = kotukotuThumbnailPath;
 chatImage.alt = "サムネイルのカメの画像";
 chatImage.classList.add("chat-image");
 chatItem.appendChild(chatImage);

 // 編集ボタンの枠
 const chatIcon = document.createElement("div");
 chatIcon.classList.add("chat-icon");

 // 枠の中にiconを挿入
 const iconImage = document.createElement("img");
 iconImage.src = static("admin/img/icon_activity_edit.svg");
 iconImage.alt = "アクティビティ編集アイコン";
 iconImage.classList.add("icon-image");

 chatIcon.appendChild(iconImage);
 chatItem.appendChild(chatIcon);

 // 編集ボタンの遷移先url
 chatIcon.addEventListener("click", function () {
  // 画面遷移の処理を実装する
  const activityId = record.id; // アクティビティのIDを取得する方法に合わせて記述
  const url = `/activity/${activityId}/edit/`;
  window.location.href = url;
 });

 // ゴミ箱ボタン。押したらモーダルを動かす。
 const trashButton = document.createElement("button");
 trashButton.type = "button";
 trashButton.classList.add("trash-button");

 const trashIcon = document.createElement("img");
 const trashIconPath = static("admin/img/trash_icon.png");
 trashIcon.src = trashIconPath;
 trashIcon.alt = "ゴミ箱アイコン";
 trashIcon.classList.add("trash-icon");

 trashButton.appendChild(trashIcon);
 chatItem.appendChild(trashButton);

 // htmlのモーダルから要素を取得
 const deleteModal = document.getElementById("deleteModal");
 const deleteForm = document.getElementById("deleteForm");
 const cancelButton = document.getElementById("cancelButton");

 // jsで作成したtrashボタンに対してモーダル表示機能を追加。
 trashButton.addEventListener("click", function (event) {
  event.preventDefault();
  // ここで削除するアクティビティのIDをフォームのアクションにセット
  deleteForm.action = `/activity/${record.id}/delete/`;
  deleteModal.style.display = "block";
 });

 // htmlから取得したキャンセルボタンに対してモーダル非表示機能を追加。
 cancelButton.addEventListener("click", function () {
  deleteModal.style.display = "none";
 });


 // Mattermost作成します。
 chatImage.addEventListener('click', function() {
  // const postConfirm = window.confirm('Mattermostへ投稿します。よろしい？');

  // if (postConfirm) {
  //     postMattermost(chatText.textContent, memoText.textContent);
  // }
  postMattermost(chatText.textContent, record.memo);
});

// 投稿機能の関数です
function postMattermost(chat, memo) {
  const mattermostUrl = "https://mattermost.kotukotu-rare.com";
  // メッセージを投稿したいチャンネルのID
  const channelId = "xgmabqyru7n38r8roqqb4iuaua";
  // ユーザートークンをlocalStorageから取得 もし登録前であれば登録モーダルを表示し、returnします。
  const userToken = localStorage.getItem('userToken');
  if (userToken == '' || userToken == null) {
    const tokenModal = document.getElementById("tokenModal");
    tokenModal.style.display = "block";
    // HTMLから要素を取得
    const registerButton = document.getElementById("registerButton");
    const tokenInput = document.getElementById("tokenInput");
    const errorText = document.getElementById("errorText");
    const cancelButton = document.getElementById("registerCancelButton");
    // 登録ボタンがクリックされたときのイベントハンドラー
    registerButton.addEventListener("click", function () {
        const tokenValue = tokenInput.value.trim(); // 入力値を取得し、前後の空白を削除
        if (tokenValue === "") { // 入力が空の場合
            errorText.textContent = "トークンを入力してください";
        } else { // 入力がある場合
            errorText.textContent = ""; // エラーメッセージを削除
        // トークンを保存し、モーダルを閉じるなどの処理をここに書く
            localStorage.setItem('userToken', tokenValue);
            tokenModal.style.display = "none";
            // 登録した際のモーションを出す？
        }
    });
    cancelButton.addEventListener('click', function(){
        tokenModal.style.display = "none";
    })
      return;
  }
  // confirmを使って以下の処理を全て「はい」だった時のみ実施するようにしています。
  const postConfirm = window.confirm('Mattermostへ投稿します。よろしい？');
  if (postConfirm) {
      const memoData = memo ? '\n' + 'memo:' + '\n' + memo : '';
      // メッセージデータを作成
      const messageData = {
          channel_id: channelId,
           message: 'ーーーーーーーーーーーーーーーーーーーーーーーーー' + '\n' + '[' + chat + ']' + '\n' + memoData
      };

      // リクエストヘッダを作成
      const requestOptions = {
          method: 'POST',
          headers: {
          'Authorization': 'Bearer ' + userToken,
          'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData)
      };

      // fetch APIを使ってメッセージを投稿
      const successModal = document.getElementById('successModal');
      const failModal = document.getElementById('failModal');
      // fetch APIを使ってメッセージを投稿
      fetch(mattermostUrl + "/api/v4/posts", requestOptions)
      .then(response => {
          if (!response.ok) {
              // HTTPステータスコードが200番台以外（つまりエラー）だった場合
              throw new Error('Network response was not ok');
          }
          // 成功した場合はresponse.json()を返す
          return response.json();
      })
      .then(data => {
          console.log(data);
          // 投稿成功モーダルの表示
          successModal.style.display = "block";
      })
      .catch((error) => {
          console.error('Error:', error);
          // 投稿失敗モーダルの表示
          failModal.style.display = "block";
      });

      //  htmlから閉じるボタンを取得
      const closeSuccessModalButton = document.getElementById("closeSuccessModalButton");
      const closeFailModalButton = document.getElementById("closeFailModalButton");

      // 閉じるボタンに対してモーダル非表示機能を追加
      closeSuccessModalButton.addEventListener("click", function () {
          successModal.style.display = "none";
      });

      closeFailModalButton.addEventListener("click", function () {
          failModal.style.display = "none";
      });
  }

  

}



 return chatItem;
}

// 非同期関数を呼び出す
fetchActivityRecords();

// ウィンドウサイズが変更されたときに、チャットアイテムを再描画する
window.addEventListener("resize", function () {
 // 既存のチャットアイテムをすべて削除
 const container = document.getElementById("chat-container");
 while (container.firstChild) {
  container.removeChild(container.firstChild);
 }

 // チャットアイテムを再描画
 fetchActivityRecords();
});
