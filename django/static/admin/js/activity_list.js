// JavaScriptへ静的ファイルへのパスを通すための関数。
function static(path) {
 const staticRoot = "/static/"; // DjangoのSTATIC_URLに相当する部分
 return staticRoot + path;
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

 const chatText = document.createTextNode(`${record.date}は${record.duration}時間頑張ったよ`);
 chatItem.appendChild(chatText);

 // メモのテキストを作成し、アイテムに追加
 const memoText = document.createElement("p");
 memoText.textContent = record.memo;
 chatItem.appendChild(memoText);

 //  亀の画像
 const chatImage = document.createElement("img");
 const kotukotuThumbnailPath = static("admin/img/kotukotu_thumbnail.png");
 chatImage.src = kotukotuThumbnailPath;
 chatImage.alt = "サムネイルのカメの画像";
 chatImage.classList.add("chat-image");
 chatItem.appendChild(chatImage);

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

 //  htmlのモーダルから要素を取得
 const deleteModal = document.getElementById("deleteModal");
 const deleteForm = document.getElementById("deleteForm");
 const cancelButton = document.getElementById("cancelButton");

 //  jsで作成したtrashボタンに対してモーダル表示機能を追加。
 trashButton.addEventListener("click", function (event) {
  event.preventDefault();
  // ここで削除するアクティビティのIDをフォームのアクションにセット
  deleteForm.action = `/activity/delete/${record.id}/`;
  deleteModal.style.display = "block";
 });

 //  htmlから取得したキャンセルボタンに対してモーダル非表示機能を追加。
 cancelButton.addEventListener("click", function () {
  deleteModal.style.display = "none";
 });

 //  5/20 ここからMattermost投稿機能作成します。 ほそまつさんLT会がんばってください〜
    // const userToken = 'tgnkp1866tgdpqdzthpabmchfe'
    // localStorage.setItem('userToken', userToken);
    // const test = localStorage.getItem('userToken');
    // console.log(test);

    const setToken = document.getElementById("setToken");
    
    setToken.addEventListener('click', function() {
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
    })

    // モーダルで投稿確認を追加しようとするも、リストにあるコンテナ全てのchatとmemoを投稿してしまうのが解決できなさそうなので、一旦window.confirmで確認するような仕様に変更します。

    //  htmlのモーダルから要素を取得
    // const confirmModal = document.getElementById("confirmModal");
    // // const confirmForm = document.getElementById("confirmForm");
    // const postButton = document.getElementById("postBtn");
    // const postCancelButton = document.getElementById("postCancelButton");    
    // // かめさんアイコンをクリックした際のイベントを追加。
    // chatImage.addEventListener('click', function() {
    //     confirmModal.style.display = "block";
    //     // chatTextとmemoTextをpostButtonのカスタム属性に保存
    //     postButton.dataset.chatText = chatText.textContent;
    //     postButton.dataset.memoText = memoText.textContent;
    // });

    //  htmlから取得したキャンセルボタンに対してモーダル非表示機能を追加。
    // postCancelButton.addEventListener("click", function () {
    //     confirmModal.style.display = "none";
    // });
    
    // postButton.addEventListener('click', function(event){
    //     event.preventDefault();

    //     const currentChatText = event.target.dataset.chatText;
    //     const currentMemoText = event.target.dataset.memoText;

    //     postMattermost(currentChatText, currentMemoText);
    //     // console.log('kame' + chatText.textContent + memoText.textContent);        
    //     confirmModal.style.display = "none";
    // })    

    chatImage.addEventListener('click', function() {
        // const postConfirm = window.confirm('Mattermostへ投稿します。よろしい？');

        // if (postConfirm) {
        //     postMattermost(chatText.textContent, memoText.textContent);
        // }
        postMattermost(chatText.textContent, memoText.textContent);
    });

    // 投稿機能の関数です
    function postMattermost(chat, memo) {
        const mattermostUrl = "http://3.113.16.186:8065";
        // メッセージを投稿したいチャンネルのID
        const channelId = "xgmabqyru7n38r8roqqb4iuaua";
        // ユーザートークンをlocalStorageから取得 もし登録前であれば登録モーダルを表示し、returnします。
        const userToken = localStorage.getItem('userToken');
        if (userToken == '' || userToken == null) {
            tokenModal.style.display = "block";
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
