// Ajax を使って views.py の get_total_days 関数を呼び出す
$.ajax({
 url: '{% url "get_total_days" %}',
 type: "GET",
 dataType: "json",
 success: function (response) {
  // 成功時、id="totalDays" の要素に累計日数を設定
  document.getElementById("totalDays").textContent = response.total_days;
 },
 error: function (xhr, status, error) {
  console.error("Error: " + error);
 }
});
