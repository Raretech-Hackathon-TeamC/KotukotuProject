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

// フォームを送信する非同期関数
async function submitForm() {
 // フォームデータを取得
 const formData = new FormData(document.querySelector(".activityRecordForm"));
 // フォームデータを送信
 const response = await fetch('{% url "activity:activity_add_ajax_submit" %}', {
  method: "POST",
  body: formData,
  headers: {
   "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
  }
 });

 // Jsonデータを取得
 const data = await response.json();

 // 送信が成功した場合『ここからモーダルの要素、合わせる部分』
 if (data.success) {
  // 累計日数を取得
  const totalDaysResponse = await fetch('{% url "activity:get_total_days" %}');
  const totalDaysData = await totalDaysResponse.json();

  // 累計日数取得に成功した場合
  if (totalDaysResponse.ok) {
   // 累計日数を表示
   document.getElementById("totalDays").textContent = "活動累計日数: " + totalDaysData.total_days;

   // モーダルを表示
   showModal();
   //    // 成功モーダルウィンドウの表示
   //    document.getElementById("successModal").style.display = "block";
   // フロントの書いた表示方法とする（ほそまつ）
  } else {
   // エラーメッセージを表示またはログに記録
   console.error(data.error);
  }
 } else {
  // フォーム送信のエラーメッセージを表示
  displayErrors(data.errors);
 }
}

// エラーメッセージを表示する関数
function displayErrors(errors) {
 // エラーメッセージリストの要素を取得
 const errorMessageList = document.getElementById("errorMessageList");
 errorMessageList.innerHTML = "";

 // エラーメッセージをリストに追加
 for (const key in errors) {
  if (Object.prototype.hasOwnProperty.call(errors, key)) {
   const li = document.createElement("li");
   li.textContent = errors[key];
   errorMessageList.appendChild(li);
  }
 }

 // エラーメッセージを表示
 document.getElementById("errorMessages").style.display = "block";
}

// ホームボタンのイベントリスナー
document.getElementById("homeButton").addEventListener("click", function () {
 // ホーム画面への遷移
 location.href = '{% url "activity:home" %}';
});

// レコードボタンのイベントリスナー
document.getElementById("recordButton").addEventListener("click", function () {
 // レコード画面への遷移
 location.href = '{% url "activity:activity_list" %}';
});

// 挙動まとめ
// このコードは、フォームのデータを送信し、サーバーからの応答を待ってから、モーダルウィンドウを表示することを目的としています。
// フォームの送信は、submitForm() 関数で行われており、フォームデータを取得してサーバーに送信します。応答として受け取った JSON データは、送信が成功した場合、累計日数を取得して、その値を totalDays の要素に表示します。
// そして、showModal() 関数を呼び出してモーダルウィンドウを表示します。
// もし送信が失敗した場合、エラーメッセージを表示する displayErrors() 関数が呼び出されます。
// モーダルウィンドウの表示/非表示は、showModal() および close-modal クリックイベントリスナーによって制御されています。
// モーダルウィンドウの背景は、modal-bg の要素で、デフォルトでは hidden クラスが適用され、表示されません。showModal() 関数が呼び出されると、hidden クラスが削除され、flex クラスが追加されて表示されるようになります。
// 逆に、閉じるボタンがクリックされたときには、flex クラスが削除され、hidden クラスが追加されて非表示になります。
