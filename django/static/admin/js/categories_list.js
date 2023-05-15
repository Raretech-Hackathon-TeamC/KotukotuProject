(async () => {
  try {
    const response = await fetch('/categories/categories_json/');
    const categories = await response.json();

    // HTMLのid属性が"category-list"の要素を取得
    const categoryList = document.getElementById("category-list");
    // 768px以下の画面幅用のcategory-list要素を取得
    const categoryListMobile = document.getElementById("category-list-mobile");

    // データが存在しない場合
    //* カテゴリーが存在しません。とpタグでエラー文をを表示しています。
    //! 変更する必要があれば調整お願いします。
    if (categories.length === 0) {
      const noDataMessage = document.createElement("p");
      noDataMessage.textContent = "カテゴリーが存在しません。";
      categoryList.appendChild(noDataMessage);
      if (categoryListMobile) {
        const noDataMessageMobile = noDataMessage.cloneNode(true);
        categoryListMobile.appendChild(noDataMessageMobile);
      }
    } else {
      // データが存在する場合
      categories.forEach(category => {
        // 新しいdiv要素を作成
        const categoryElement = document.createElement("div");
        // 作成したdiv要素にCSSクラスを設定
        categoryElement.className = `bg-${category.color_code} text-textBlack rounded-lg p-4 w-64 h-12 flex justify-between items-center mb-4`;
        // 作成したdiv要素の背景色を設定
        categoryElement.style.backgroundColor = category.color_code;

        // 新しいspan要素を作成
        const categoryName = document.createElement("span");
        // 作成したspan要素にCSSクラスを設定
        categoryName.className = "category-name";
        // 作成したspan要素にテキストコンテンツを設定
        categoryName.textContent = category.name;
        // div要素にspan要素を追加（カテゴリ名を表示）
        categoryElement.appendChild(categoryName);

        // 新しいspan要素を作成
        const categoryDuration = document.createElement("span");
        // 作成したspan要素にCSSクラスを設定
        categoryDuration.className = "category-duration";
        // 作成したspan要素にテキストコンテンツを設定（累計時間を表示）
        categoryDuration.textContent = `累計時間 ${category.total_duration}`;
        // div要素にspan要素を追加（累計時間を表示）
        categoryElement.appendChild(categoryDuration);

        // categoryList要素に作成したdiv要素を追加
        if (categoryList) {
          categoryList.appendChild(categoryElement);
        }
        // 768px以下の画面幅用に要素を複製
        if (categoryListMobile) {
          const categoryElementMobile = categoryElement.cloneNode(true);
          // 作成したdiv要素にCSSクラスを設定
          categoryElementMobile.className = `bg-${category.color_code} text-textBlack rounded-lg p-2 mx-auto w-full h-12 flex justify-between items-center mb-4 mx-8`;
          // categoryListMobile要素に作成したdiv要素
          categoryListMobile.appendChild(categoryElementMobile);
        }
      });
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
})();
