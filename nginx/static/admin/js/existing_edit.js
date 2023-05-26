// HTMLのフォーム要素に"submit"イベントリスナーを追加します。フォームが送信されるときにこのリスナーが呼び出されます。
document.getElementById("categoryEditForm").addEventListener("submit", function (event) {
 // フォームの自動送信を防ぎます。これにより、非同期通信を行う前にフォームの送信を止めることができます。
 event.preventDefault();

 // フォームからカテゴリ名を取得します。
 let categoryName = document.getElementsByName("name")[0].value;

 // Djangoテンプレート変数から現在のオブジェクトIDを取得します。
 let exclude_id = "{{ object.id }}";

 // フォームデータを取得します。
 let formData = new FormData(event.target);

 // バックエンドサーバに非同期通信を行います。カテゴリ名と現在のオブジェクトIDを送信し、重複チェックを行います。
 fetch("{% url 'categories:check_duplicate_edit' %}", {
  method: "POST",
  body: JSON.stringify({ name: categoryName, exclude_id: exclude_id }),
  headers: {
   "Content-Type": "application/json",
   "X-CSRFToken": "{{ csrf_token }}"
  }
 })
  // サーバからのレスポンスをJSONとして解析します。
  .then(response => response.json())
  .then(data => {
   // サーバからのレスポンスに基づいて処理を行います。
   if (data.duplicate) {
    // 重複するカテゴリ名が存在する場合、警告メッセージを表示します。
    document.getElementById("existingContainer").style.display = "block";
    // 「新規カテゴリを作成」ボタンがクリックされた場合、フォームを送信します。
    document.getElementById("createNewCategoryForExisting").onclick = function () {
     event.target.submit();
    };
    // 「キャンセル」ボタンがクリックされた場合、警告メッセージを非表示にします。
    document.getElementById("cancelNewCategoryForExisting").onclick = function () {
     document.getElementById("existingContainer").style.display = "none";
    };
   } else {
    // 重複するカテゴリ名が存在しない場合、フォームを送信します。
    event.target.submit();
   }
  });
});
