// 先にフロントで定義した関数。
// モーダルの表示を制御する関数
function showModal() {
  const modalBg = document.getElementById("modal-bg");
  modalBg.classList.remove("hidden");
  modalBg.classList.add("flex");
}

// 閉じるボタンをクリックした際のイベントリスナー
document.getElementById("close-modal").addEventListener("click", function () {
  const modalBg = document.getElementById("modal-bg");
  modalBg.classList.remove("flex");
  modalBg.classList.add("hidden");
});

// フォームの送信後、エラーもしくは、データを取得してからモーダル出力する流れ。（バックエンドで記載していたもの）

async function submitForm() {
  // #65 5/22 サブミットボタン複数回押下を止める処理を追加します。
  // const submitButton = document.getElementById("recordSubmit");
  // console.log(submitButton);
  // submitButton.disabled = true;

  // クリック可能な状態かどうかをチェック
  const submitButton = document.getElementById("recordSubmit");
  if (submitButton.disabled) {
    return; // クリック不可の場合は処理を中断
  }

  // クリック不可に設定
  submitButton.disabled = true;
  // フォームデータを取得
  const formData = new FormData(document.querySelector("#activityRecordForm"));

  // 時間要素から入力された時間を取得し、分単位に変換
  const timeInput = document.querySelector('input[type="time"]');
  const [hours, minutes] = timeInput.value.split(":").map(Number);
  const durationInMinutes = hours * 60 + minutes;

  // 分単位のデータをフォームデータに追加
  formData.set("duration", durationInMinutes);

  // フォームデータを送信
  const csrf_token = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const response = await fetch("/activity/add/", {
    method: "POST",
    body: formData,
    headers: {
      "X-CSRFToken": csrf_token,
    },
  });

  // Jsonデータを取得
  const data = await response.json();

  // 送信が成功した場合『ここからモーダルの要素、合わせる部分』
  if (data.success) {
    // 累計日数を取得
    const totalDaysResponse = await fetch("/activity/get_total_days/");
    const totalDaysData = await totalDaysResponse.json();

    // 累計日数取得に成功した場合
    if (totalDaysResponse.ok) {
      // 累計日数を表示
      document.getElementById("totalDays").textContent =
        totalDaysData.total_days;

      // モーダルを表示
      showModal();

      // クリック可能に戻す
      submitButton.disabled = false;
    } else {
      // エラーメッセージを表示またはログに記録
      console.error(totalDaysData.error);
    }
  } else {
    // フォーム送信のエラーメッセージを表示
    displayErrors(data.errors);
    // クリック可能に戻す（エラーの場合もクリック可能にする）
    submitButton.disabled = false;
  }
  /// ×ボタンをクリックした際のリダイレクト処理
  document.getElementById("close-modal").addEventListener("click", function () {
    // activity_add画面にリダイレクト
    window.location.href = "/activity/add/";
  });
}

// エラーメッセージを表示する関数
function displayErrors(errors) {
  // エラーメッセージを表示する要素を取得
  const dateErrors = document.getElementById("dateErrors");
  const durationErrors = document.getElementById("durationErrors");

  // エラーメッセージをクリア
  dateErrors.innerHTML = "";
  durationErrors.innerHTML = "";

  // エラーメッセージを表示
  for (const key in errors) {
    if (Object.prototype.hasOwnProperty.call(errors, key)) {
      const p = document.createElement("p");
      const errorMsg = document.createTextNode(errors[key]);
      p.style.marginTop = "0.8em"; // 上部のマージンを調整

      p.appendChild(errorMsg);

      if (key === "date") {
        dateErrors.appendChild(p);
        dateErrors.style.display = "block";
      } else if (key === "duration") {
        durationErrors.appendChild(p);
        durationErrors.style.display = "block";
      }
    }
  }
}

// ホームボタンのイベントリスナー
document.getElementById("homeButton").addEventListener("click", function () {
  // ホーム画面への遷移
  location.href = "/activity/";
});

// レコードボタンのイベントリスナー
document.getElementById("recordButton").addEventListener("click", function () {
  // レコード画面への遷移
  location.href = "/activity/list/";
});

// DOMContentLoadedイベントを待ってから、処理を実行する
document.addEventListener("DOMContentLoaded", function () {
  // /quotes/random/ へのGETリクエストを送信する
  fetch("/quotes/random/")
    // レスポンスをJSON形式で解析する
    .then((response) => response.json())
    // JSONデータから引用を抽出し、HTML要素にセットする
    .then((data) => {
      var quote = data.quote;
      document.querySelector("#quote").textContent = quote;
    })
    // エラーが発生した場合には、コンソールにエラーメッセージを表示する
    .catch((error) => console.error(error));
});

// カレンダーの表示を今日に設定
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedDate = `${year}-${month}-${day}`;
document.getElementById("date").value = formattedDate;

// 挙動まとめ
// このコードは、フォームのデータを送信し、サーバーからの応答を待ってから、モーダルウィンドウを表示することを目的としています。
// フォームの送信は、submitForm() 関数で行われており、フォームデータを取得してサーバーに送信します。応答として受け取った JSON データは、送信が成功した場合、累計日数を取得して、その値を totalDays の要素に表示します。
// そして、showModal() 関数を呼び出してモーダルウィンドウを表示します。
// もし送信が失敗した場合、エラーメッセージを表示する displayErrors() 関数が呼び出されます。
// モーダルウィンドウの表示/非表示は、showModal() および close-modal クリックイベントリスナーによって制御されています。
// モーダルウィンドウの背景は、modal-bg の要素で、デフォルトでは hidden クラスが適用され、表示されません。showModal() 関数が呼び出されると、hidden クラスが削除され、flex クラスが追加されて表示されるようになります。
// 逆に、閉じるボタンがクリックされたときには、flex クラスが削除され、hidden クラスが追加されて非表示になります。

//以下にMattermost関連機能追加します。

const post = document.getElementById("post");

post.addEventListener('click', function() {
  let selectElement = document.querySelector("select[name='category']");
  let category = selectElement.options[selectElement.selectedIndex].text;
  if (category == 'カテゴリーを選択してください') {
    category = '';
  } else {
    category += 'を';
  }

  let date = document.getElementById("date").value;

  let timeInput = document.querySelector("input[name='duration']").value;
  let hours = parseInt(timeInput.split(':')[0]).toString();
  let minutes = parseInt(timeInput.split(':')[1]).toString();

  if (hours == 0) {
    hours = '';
  } else {
    hours += '時間';
  }

  if (minutes == 0) {
    minutes = '';
  } else {
    minutes += '分';
  }

  let memo = document.querySelector("textarea[name='memo']").value;

  // console.log(category, date, hours, memo)
  let chat = `${date}は${category}${hours}${minutes}頑張ったよ`
  // console.log(chat);
  postMattermost(chat, memo);
});




// 投稿機能の関数です postMattermost()を呼び出すときに使います。

function postMattermost(chat, memo) {
const mattermostUrl = "http://3.113.16.186:8065";
// メッセージを投稿したいチャンネルのID
const channelId = "xgmabqyru7n38r8roqqb4iuaua";
// ユーザートークンをlocalStorageから取得 もし登録前であれば登録モーダルを表示し、returnします。
const userToken = localStorage.getItem('userToken');
if (userToken == '' || userToken == null) {
    const tokenModal = document.getElementById("tokenModal");
    const modalBg = document.getElementById("modal-bg");
    modalBg.classList.remove("flex");
    modalBg.classList.add("hidden");
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
            showModal();
        }
    });
    cancelButton.addEventListener('click', function(){
        tokenModal.style.display = "none";
        showModal();
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

// ここまでが投稿関数です。