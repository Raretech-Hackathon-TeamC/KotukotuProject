// 'copyToClipboard' という名前の関数を定義します。const を使用することで、この関数は再代入できません。
// 'text' という引数を受け取り、このテキストをクリップボードにコピーします。
const copyToClipboard = async text => {
 try {
  // 'navigator.clipboard.writeText' 関数は、与えられたテキストをクリップボードに書き込むための非同期関数です。
  // 'await' キーワードを使用して、この非同期操作が完了するのを待ちます。
  await navigator.clipboard.writeText(text);

  // クリップボードへのコピーが成功したら、アラートを表示してユーザーに通知します。
  alert("Copied color code: " + text);
 } catch (err) {
  // もし何らかの理由でクリップボードへのコピーが失敗した場合（例えば、ブラウザが対応していない場合など）は、
  // エラーメッセージをコンソールに出力します。これは開発者が問題をデバッグするのに役立ちます。
  console.error("Failed to copy text: ", err);
 }
};
