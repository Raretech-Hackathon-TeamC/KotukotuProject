// フォームを送信する非同期関数
async function submitForm() {
 // フォームデータを取得
 const formData = new FormData(document.querySelector(".activityRecordForm"));

 // 時間要素から入力された時間を取得し、分単位に変換
 const timeInput = document.querySelector('input[type="time"]');
 const [hours, minutes] = timeInput.value.split(":").map(Number);
 const durationInMinutes = hours * 60 + minutes;

 // 分単位のデータをフォームデータに追加
 formData.set("duration", durationInMinutes);

 // フォームデータを送信
 const response = await fetch(window.location.href, {
  method: "POST",
  body: formData,
  headers: {
   "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
  }
 });

 // レスポンスが成功した場合、リスト画面へ遷移
 if (response.ok) {
  location.href = '{% url "activity:activity_list" %}';
 } else {
  // エラーメッセージを表示またはログに記録
  console.error("Error submitting form");
 }
}

// キャンセルボタン
document.addEventListener("DOMContentLoaded", function () {
 document.getElementById("cancel-button").addEventListener("click", function () {
  window.location.href = "{% url 'activity:activity_list' %}";
 });
});
