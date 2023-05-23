// フォームを送信する非同期関数
async function submitForm(event) {
 event.preventDefault();
 // フォームデータを取得
 const formData = new FormData(document.querySelector("#activityRecordForm"));
 // 時間要素から入力された時間を取得し、分単位に変換
 const timeInput = document.querySelector('input[type="time"]');
 const [hours, minutes] = timeInput.value.split(":").map(Number);
 const durationInMinutes = hours * 60 + minutes;

 // 分単位のデータをフォームデータに追加
 formData.set("duration", durationInMinutes);

 const path = window.location.pathname;
 const activityId = path.split("/")[2]; // /activity/123/edit/ の3つ目の要素がactivityIdとなる

 try {
 // フォームデータを送信
  const response = await fetch(`/activity/${activityId}/edit/`, {
    method: "POST",
    body: formData,
    headers: {
    "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
  },
 });

 // レスポンスが成功した場合、リスト画面へ遷移
 if (response.ok) {
  location.href = '/activity/list';
 } else {
  // エラーメッセージを表示またはログに記録
  console.error("Error submitting form");
 }
} catch (error) {
  console.error("Error submitting form", error);
}
}

// キャンセルボタン
document.addEventListener("DOMContentLoaded", function () {
 document.getElementById("cancel-button").addEventListener("click", function () {
  window.location.href = "/activity/list";
 });

 document.getElementById("activityRecordForm").addEventListener("submit", submitForm);

});
