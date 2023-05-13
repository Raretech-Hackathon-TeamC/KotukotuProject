const copyToClipboard = async text => {
 try {
  // 'navigator.clipboard'が存在し、利用可能であることを確認します。
  if (!navigator.clipboard) {
   // この場合、クリップボードへの書き込みは不可能なので、エラーメッセージを出力します。
   throw new Error("Clipboard API not available");
  }

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
