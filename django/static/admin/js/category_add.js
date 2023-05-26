// // 'copyToClipboard' という名前の関数を定義します。const を使用することで、この関数は再代入できません。
// // 'text' という引数を受け取り、このテキストをクリップボードにコピーします。
// const copyToClipboard = async text => {
//  try {
//   // 'navigator.clipboard.writeText' 関数は、与えられたテキストをクリップボードに書き込むための非同期関数です。
//   // 'await' キーワードを使用して、この非同期操作が完了するのを待ちます。
//   await navigator.clipboard.writeText(text);

//   // クリップボードへのコピーが成功したら、アラートを表示してユーザーに通知します。
//   alert("Copied color code: " + text);
//  } catch (err) {
//   // もし何らかの理由でクリップボードへのコピーが失敗した場合（例えば、ブラウザが対応していない場合など）は、
//   // エラーメッセージをコンソールに出力します。これは開発者が問題をデバッグするのに役立ちます。
//   console.error("Failed to copy text: ", err);
//  }
// };

function copyToClipboard(colorCode) {
    // カラーコードをクリップボードにコピーする処理
    // navigator.clipboard.writeText(colorCode);
    // カラーコードを入力フィールドに自動入力する処理
    document.getElementById("id_color_code").value = colorCode;
    document.getElementById("color-circle").style.backgroundColor = colorCode;
}


// ボタンのクリックを処理する関数
function handleButtonClick(event) {
    // すべてのボタンからボーダーを削除
    let buttons = document.querySelectorAll('.color-button');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.border = '';
    }
  
    // クリックしたボタンにボーダーを追加
    event.target.style.border = '5px solid white';
  }

  // 色をもう一度押すと白枠が消える　要らなさそうなのでコメントアウトして一応残します。5/25

  // function handleButtonClick(event) {
  //   // すべてのボタンからボーダーを削除
  //   let buttons = document.querySelectorAll('.color-button');
  //   // 既にボーダーがあるかを判定する
  //   let isBorder = false;
  //   if (event.target.style.border) {
  //     isBorder = true;
  //   }
  //   for (let i = 0; i < buttons.length; i++) {
  //     buttons[i].style.border = '';
  //   }
       // ボーダーがあれば解除、なければ指定
  //   if (isBorder) {
  //     event.target.style.border = '';
  //   } else {
  //     // クリックしたボタンにボーダーを追加
  //     event.target.style.border = '5px solid white';
  //   }
  // }
