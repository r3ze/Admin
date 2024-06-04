
var options1 = {
  series: [44, 55, 41, 17, 15, 25, 30, 20, 10, 15, 12],
  chart: {
  type: 'donut',
  height: 350 
},
labels: ['Cavinti', 'Pagsanjan', 'Lumban', 'Kalayaan', 'Paete', 'Pakil', 'Pangil', 'Siniloan', 'Mabitac', 'Famy', 'Sta. Maria'],
title: {
  text: 'Number of Complaints per Area', // Your chart title// Alignment of the title (options: 'left', 'center', 'right')
  offsetY: 10, // Offset for the title position
  style: {
    fontSize: '16px', // Title font size
    fontWeight: 'bold', // Title font weight
    color: '#263238' // Title font color
  }
},
responsive: [{
  breakpoint: 480,
  options: {
    chart: {
      width: 200
    },
    
    
    legend: {
      position: 'bottom'
    }
    
  }
}]
};

var chart = new ApexCharts(document.querySelector("#pieChart"), options1);
chart.render();

      
//bar
var options = {
  series: [{
  name: 'Complaints',
  data: [500, 600, 700, 1001, 233, 543, 666, 246, 155, 776, 2354, 100]
}],
  chart: {
  height: 335,
  type: 'bar',
  
},
plotOptions: {
  bar: {
    borderRadius: 10,
    dataLabels: {
      position: 'top', // top, center, bottom
    },
  }
},
dataLabels: {
  enabled: false,

  offsetY: -20,
  style: {
    fontSize: '12px',
    colors: ["#304758"]
  }
},

xaxis: {
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  position: 'top',
  axisBorder: {
    show: false
  },
  axisTicks: {
    show: false
  },
  crosshairs: {
    fill: {
      type: 'gradient',
      gradient: {
        colorFrom: '#D8E3F0',
        colorTo: '#BED1E6',
        stops: [0, 100],
        opacityFrom: 0.4,
        opacityTo: 0.5,
      }
    }
  },
  tooltip: {
    enabled: true,
  }
},
yaxis: {
  axisBorder: {
    show: false
  },
  axisTicks: {
    show: false,
  },
  labels: {
    show: false,

  }

},
title: {
  text: 'Monthly Complaints',
  floating: true,
  offsetY: 315,
  align: 'center',
  style: {
    color: '#444'
  }
}
};

var chart = new ApexCharts(document.querySelector("#barChart"), options);
chart.render();


var options2 = {
  series: [0, 0, 0, 0, 0, 0],
  chart: {
    type: 'donut',
    height: 400
  },
  labels: ['Power outage', 'Defective Meter', 'Detached Meter', 'Loose Connection/Sparkling of Wire', 'Low Voltage', 'No Reading'],
  title: {
    text: '',
    offsetY: 10,
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val, opts) {
      return opts.w.config.series[opts.seriesIndex];
    }
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          fontSize: '15px', // Change the font size here for donut labels
        }
      }
    }
  },
  legend: {
    position: 'bottom',
    floating: false,
    fontSize: '16px', 
    marginBottom: '10px',
    fontWeight: 'bold', 
    labels: {
      colors: ['#263238'],
      useSeriesColors: false
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 100
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
};

var chart = new ApexCharts(document.querySelector("#pieChart1"), options2);
chart.render();