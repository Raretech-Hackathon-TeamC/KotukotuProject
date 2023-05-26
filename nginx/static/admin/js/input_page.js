// サンプルデータベースからのカテゴリー取得（実際にはAPIを使用することが一般的）
const categories = [
 { id: 1, name: "プログラミング" },
 { id: 2, name: "英語" },
 { id: 3, name: "タイピング" }
];

// カテゴリーセレクトボックスの取得
const categorySelect = document.getElementById("category");

// カテゴリーオプションを追加
categories.forEach(category => {
 const option = document.createElement("option");
 option.value = category.id;
 option.text = category.name;
 categorySelect.add(option);
});

// 入力完了ボタンを取得し、クリックイベントリスナーを追加
document.querySelector("button[type='button']").addEventListener("click", submitData);

// データ送信処理を行う非同期関数
async function submitData() {
 // 各フォームの値を取得
 const category = document.getElementById("category").value;
 const date = document.getElementById("date").value;
 const time = document.getElementById("time").value;
 const memo = document.querySelector("textarea").value; // メモの内容を取得

 // カテゴリー、日付、時間のいずれかが入力されていない場合
 if (!category || !date || !time) {
  // エラーメッセージを表示
  alert("カテゴリー、日付、時間を正しく入力してください");
  return; // 以降の処理を実行しない
 }

 // データベースに送信するデータをオブジェクトにまとめます
 const data = {
  category: category,
  date: date,
  time: time,
  memo: memo // メモの内容を追加
 };

 try {
  // ここでデータベースへの送信処理を行います
  // 以下は、データをバックエンドのAPIに送信する一般的な例です
  const response = await fetch("/api/submit-data", {
   method: "POST", // POSTメソッドを指定
   headers: {
    "Content-Type": "application/json" // 送信データのタイプを指定
   },
   body: JSON.stringify(data) // 送信するデータをJSON形式に変換
  });

  // レスポンスのステータスコードが成功を示す場合（200番台）
  if (response.ok) {
   // 送信成功のアラートを表示
   alert("データが正常に送信されました");
  } else {
   // エラーが発生した場合、エラーオブジェクトを生成してスロー
   throw new Error("データの送信に失敗しました");
  }
 } catch (error) {
  //console.error("エラー:", error);
 }

 // すべての入力が正常であれば、モーダルを表示
 showModal();
}

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
