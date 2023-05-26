// DOMが読み込まれた後に実行されるように設定
document.addEventListener("DOMContentLoaded", function () {
 // ハンバーガーメニューボタン（画像）を取得
 const menuButton = document.querySelector(".hamburger-menu");
 // モバイルメニューを取得
 const mobileMenu = document.getElementById("mobileMenu");
 // 閉じるボタンを取得
 const closeButton = document.getElementById("closeMenuButton");

 // メニューボタンがクリックされた時の処理
 menuButton.addEventListener("click", function () {
  mobileMenu.classList.toggle("hidden");
 });

 // 閉じるボタンがクリックされた時の処理
 closeButton.addEventListener("click", function () {
  mobileMenu.classList.add("hidden");
 });

 //  モバイルメニューの背景部分がクリックされた時の処理を実装したかったがZindexの関係かうまくいかなかった。
 //  mobileMenuBackground.addEventListener("click", function () {
 //   mobileMenu.classList.add("hidden");
 //  });


 // Mattermost機能作成します。
 //  5/20 ここからMattermost投稿機能作成します。 ほそまつさんLT会がんばってください〜
    // const userToken = 'tgnkp1866tgdpqdzthpabmchfe'
    // localStorage.setItem('userToken', userToken);
    // const test = localStorage.getItem('userToken');
    // console.log(test);

    // const setToken = document.getElementById("setToken");
    const mattermost = document.getElementById("mattermost");
    
    mattermost.addEventListener('click', function() {
        const tokenModal = document.getElementById("tokenModal");
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
            }
        });
        cancelButton.addEventListener('click', function(){
            tokenModal.style.display = "none";
        })
    })


});
