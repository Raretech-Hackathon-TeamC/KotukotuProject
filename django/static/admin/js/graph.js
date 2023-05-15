// 非同期関数を定義します
let barChart;  // barChartをグローバルスコープで宣言

(async () => {
  try {
    // '/activity/ajax_get_data/'というURLからデータを非同期で取得します
    const response = await fetch('/activity/ajax_get_data/');

    // 取得したデータをJSON形式でパースします
    const data = await response.json();

    // データをコンソールにログとして出力します（デバッグ用）
    console.log(data);

    // HTMLの指定の要素に累計日数と累計時間を表示します
    document.getElementById('totalDays').textContent = data.total_days;
    document.getElementById('totalDuration').textContent = data.total_duration;

    // 各カテゴリーごとにデータセットを作成します
    // 'map'関数を使って各カテゴリーのデータセットを作り、それを'datasets'配列に追加します
    const datasets = Object.keys(data.category_duration_lists).map(category => ({
      label: category,  // カテゴリー名をラベルとして設定します
      data: data.category_duration_lists[category].map(Number),  // 各カテゴリーのデータを数値として設定します
      backgroundColor: data.category_colors[category],  // 各カテゴリーの色を背景色として設定します
      borderColor: data.category_colors[category],  // 各カテゴリーの色をボーダー色として設定します
      borderWidth: 1  // ボーダーの幅を1とします
    }));

    // バーチャートのデータを作成します
    const barChartData = {
      labels: data.date_list,  // データの日付をラベルとして設定します
      datasets: datasets  // 先ほど作成したデータセットを設定します
    };

    // チャートの設定を作成します
    const config = {
      type: "bar",  // チャートのタイプを'bar'（バーチャート）とします
      data: barChartData,  // 先ほど作成したバーチャートのデータを設定します
      options: {
        responsive: true,  // レスポンシブ対応をオンにします
        scales: {
          x: {
            stacked: true,  // X軸（水平軸）を積み上げバーにします
          },
          y: {
            beginAtZero: true,  // Y軸（垂直軸）の始点を0にします
            stacked: true,  // Y軸を積み上げバーにします
            tickes: {
              stepSize: 2,
              max: 8
            }
          }
        }
      }
    };

    // 既存のチャートが存在すれば破棄します
    if (barChart) {
      barChart.destroy();
    }

    // チャートを作成します
    barChart = new Chart(document.getElementById('barChart'), config);

  } catch (error) {
    // エラーが発生した場合はそれをコンソールにログとして出力します
    console.error('Error:', error);
  }
})();  // 定義した非同期関数を実行します
