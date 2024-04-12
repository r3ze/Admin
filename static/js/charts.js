 //line  graph
 // Data for the chart (number of complaints each month)
   const complaintsData = {
    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    datasets: [{
        label: 'Number of Complaints',
        data: [20, 15, 30, 25, 40, 35, 45, 50, 55, 60, 40, 30], // Example data, replace with your actual data
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
    }]
};

// Configuration for the chart
const chartConfig = {
    type: 'line',
    data: complaintsData,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
};

// Create the chart
const complaintsChartCanvas = document.getElementById('complaintsChart').getContext('2d');
const myChart = new Chart(complaintsChartCanvas, chartConfig);

//doughnut chart
var xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
var yValues = [55, 49, 44, 24, 15];
var barColors = [
  "#b91d47",
  "#00aba9",
  "#2b5797",
  "#e8c3b9",
  "#1e7145"
];

new Chart("myChart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    title: {
      display: true,
      text: "Areas With Highest Number of Complaints"
    }
  }
});