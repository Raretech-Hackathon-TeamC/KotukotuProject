// テスト用のカテゴリデータの配列を定義
const categories = [
 {
  categoryColor: "#DABEB7",
  categoryName: "プログラミング",
  categoryDuration: "00:30"
 },
 {
  categoryColor: "#B7C1DA",
  categoryName: "タイピング",
  categoryDuration: "01:15"
 },
 {
  categoryColor: "#DAD4B7",
  categoryName: "英語",
  categoryDuration: "00:45"
 }
];

// HTMLのid属性が"category-list"の要素を取得
const categoryList = document.getElementById("category-list");
// 768px以下の画面幅用のcategory-list要素を取得
const categoryListMobile = document.getElementById("category-list-mobile");

// categories配列内の各要素に対して処理を実行
categories.forEach(category => {
 // 新しいdiv要素を作成
 const categoryElement = document.createElement("div");
 // 作成したdiv要素にCSSクラスを設定
 categoryElement.className =
  "bg-[COLOR] text-textBlack rounded-lg p-4 w-64 h-12 flex justify-between items-center mb-4";
 // 作成したdiv要素の背景色を設定
 categoryElement.style.backgroundColor = category.categoryColor;

 // 新しいspan要素を作成
 const categoryName = document.createElement("span");
 // 作成したspan要素にCSSクラスを設定
 categoryName.className = "category-name";
 // 作成したspan要素にテキストコンテンツを設定
 categoryName.textContent = category.categoryName;
 // div要素にspan要素を追加（カテゴリ名を表示）
 categoryElement.appendChild(categoryName);

 // 新しいspan要素を作成
 const categoryDuration = document.createElement("span");
 // 作成したspan要素にCSSクラスを設定
 categoryDuration.className = "category-duration";
 // 作成したspan要素にテキストコンテンツを設定（累計時間を表示）
 categoryDuration.textContent = `累計時間 ${category.categoryDuration}`;
 // div要素にspan要素を追加（累計時間を表示）
 categoryElement.appendChild(categoryDuration);

 // categoryList要素に作成したdiv要素を追加
 categoryList.appendChild(categoryElement);

 // 768px以下の画面幅用に要素を複製
 const categoryElementMobile = categoryElement.cloneNode(true);
 // 作成したdiv要素にCSSクラスを設定
 categoryElementMobile.className =
  "bg-[COLOR] text-textBlack rounded-lg p-2 mx-auto w-full h-12 flex justify-between items-center mb-4 mx-8";
 // categoryListMobile要素に作成したdiv要素
 categoryListMobile.appendChild(categoryElementMobile);
});
