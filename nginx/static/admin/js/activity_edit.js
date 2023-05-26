// フォームを送信する非同期関数
async function submitForm() {
  // エラーメッセージをリセット
  document.getElementById("dateErrors").innerText = "";
  document.getElementById("durationErrors").innerText = "";

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
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value,
      },
    });

    // レスポンスが成功した場合、リスト画面へ遷移
    if (response.ok) {
      const responseData = await response.json();
      if (responseData.success) {
        // 成功した場合はアクティビティ一覧ページにリダイレクト
        location.href = "/activity/list";
      } else {
        if (responseData.errors) {
          if (responseData.errors.date) {
            // 日付のエラーメッセージを表示
            document.getElementById("dateErrors").innerText =
              responseData.errors.date[0];
            document.getElementById("dateErrors").style.display = "block";
            dateErrors.style.marginTop = "0.8em"; // エラー文の位置調整
          }
          if (responseData.errors.duration) {
            // 時間のエラーメッセージを表示
            document.getElementById("durationErrors").innerText =
              responseData.errors.duration[0];
            document.getElementById("durationErrors").style.display = "block";
            durationErrors.style.marginTop = "0.8em"; // エラー文の位置調整
          }
        } else {
          console.error("An error occurred:", responseData.error);
        }
      }
    } else {
      console.error("An error occurred:", response.status);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// キャンセルボタン
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("cancel-button")
    .addEventListener("click", function () {
      window.location.href = "/activity/list";
    });

  document
    .getElementById("activityRecordForm")
    .addEventListener("submit", submitForm);
});
