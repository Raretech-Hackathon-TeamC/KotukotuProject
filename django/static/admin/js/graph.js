// データ
const receivedData = {
 date_list: ["5/7", "5/8", "5/9", "5/10", "5/11", "5/12", "5/13"],
 category_duration_lists: {
  1: ["1.0", "2.0", "1.5", "0.0", "2.0", "1.5", "2.0"],
  2: ["0.0", "0.5", "1.0", "1.5", "1.0", "1.0", "0.5"],
  3: ["1.0", "1.0", "1.0", "1.0", "1.0", "1.0", "1.0"]
 },
 uncategorized_duration_list: ["2.0", "1.5", "1.0", "2.0", "1.0", "1.5", "2.0"],
 total_days: 7,
 total_duration: "30:0",
 category_colors: {
  1: "#DABEB7",
  2: "#B7C1DA",
  3: "#DAD4B7"
 }
};

// データセットを作成
const datasets = Object.keys(receivedData.category_duration_lists).map(categoryId => ({
 label: `Category ${categoryId}`,
 data: receivedData.category_duration_lists[categoryId].map(Number),
 backgroundColor: receivedData.category_colors[categoryId],
 borderColor: receivedData.category_colors[categoryId],
 borderWidth: 1
}));

// 未分類のデータセットを追加
datasets.push({
 label: "Uncategorized",
 data: receivedData.uncategorized_duration_list.map(Number),
 backgroundColor: "#8AA7A1",
 borderColor: "#8AA7A1",
 borderWidth: 1
});

// バーチャートデータを作成
const barChartData = {
 labels: receivedData.date_list,
 datasets: datasets
};

const config = {
 type: "bar",
 data: barChartData,
 options: {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
   y: {
    beginAtZero: true,
    stacked: true,
    ticks: {
     stepSize: 2,
     max: 8
    }
   },
   x: {
    stacked: true // 縦に積み上げ
   }
  }
 }
};

const barChart = new Chart(document.getElementById("barChart"), config);
