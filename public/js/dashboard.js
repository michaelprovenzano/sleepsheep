import axios from 'axios';
// import Chart from 'chart.js';

window.addEventListener('beforeprint', beforePrintHandler);

const beforePrintHandler = () => {
  for (var id in Chart.instances) {
    Chart.instances[id].onResize();
    Chart.instances[id].options.legend.display = false;
  }
};

const expandTrackableBtns = [
  ...document.querySelectorAll('.trackable__summary'),
];
if (expandTrackableBtns) {
  expandTrackableBtns.forEach((el) =>
    el.addEventListener('click', (event) => {
      el.nextSibling.classList.toggle('stats__hidden');
      const arrow = el.getElementsByClassName('arrow')[0];
      arrow.classList.toggle('arrow-up');
      arrow.classList.toggle('arrow-down');
    })
  );
}

const sleeplogChart = (labels, data, trackables) => {
  // Project Colors
  const darkblue = '#0a0768';
  const purple = '#6f0273';
  const white = '#f3f3f3';
  const textColorDark = '#303030';
  const primaryColor_1 = purple;
  const secondaryColor_1 = darkblue;

  const myChart = document.getElementById('my-chart');

  const allData = [
    {
      label: 'Sleep Quality',
      data: data,
      backgroundColor: primaryColor_1,
      borderColor: primaryColor_1,
      fill: false,
      lineTension: 0,
    },
  ];
  for (let thisData in trackables) {
    allData.push({
      id: thisData,
      label: trackables[thisData].label,
      data: trackables[thisData].data,
      backgroundColor: secondaryColor_1,
      borderColor: secondaryColor_1,
      fill: false,
      lineTension: 0,
    });
  }

  // Dashboard
  if (myChart) {
    myChart.getContext('2d');

    // Set defaults for all
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 16;
    Chart.defaults.global.defaultFontColor = secondaryColor_1;

    const chartOptions = {
      type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data: {
        labels: labels,
        datasets: allData,
      },
      options: {
        title: {
          display: false,
          text: 'Sleeplogs',
          fontColor: secondaryColor_1,
          fontSize: 20,
        },
        legend: {
          display: false,
          position: 'right',
          labels: {
            fontColor: secondaryColor_1,
          },
        },
        layout: {
          padding: {}, // top left right bottom
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        tooltips: {
          enabled: true,
        },
      },
    };

    let chart = new Chart(myChart, chartOptions);
  }
};

const trackableChart = (labels, sleepQuality, insomnia, trackables) => {
  // Project Colors
  const darkblue = '#0a0768';
  const purple = '#6f0273';
  const white = '#f3f3f3';
  const textColorDark = '#303030';
  const primaryColor_1 = purple;
  const primaryColor_2 = '#a821ad';
  const secondaryColor_1 = darkblue;
  const secondaryColor_2 = '#1f1b8f';

  // Dashboard
  for (let thisData in trackables) {
    const limitedLabels = [];
    const limitedData = {
      data: {
        sleepQuality: [],
        insomnia: [],
      },
    };
    const sleepQualityArr = [];
    const insomniaArr = [];

    labels.forEach((el, i) => {
      if (trackables[thisData].data.sleepQuality[i] !== '') {
        limitedLabels.push(el);
        limitedData.data.sleepQuality.push(
          trackables[thisData].data.sleepQuality[i]
        );
        limitedData.data.insomnia.push(trackables[thisData].data.insomnia[i]);
      }
    });

    // Add arrays for dotted lines
    labels.forEach((el) => sleepQualityArr.push(sleepQuality));
    labels.forEach((el) => insomniaArr.push(insomnia));

    const allData = [
      {
        label: 'Sleep Quality Average',
        data: sleepQualityArr,
        backgroundColor: primaryColor_2,
        borderColor: primaryColor_2,
        borderDash: [5, 5],
        fill: false,
        lineTension: 0,
        type: 'line',
        pointRadius: 0,
      },
      {
        label: 'Insomnia Average',
        data: insomniaArr,
        backgroundColor: secondaryColor_2,
        borderColor: secondaryColor_2,
        borderDash: [5, 5],
        fill: false,
        lineTension: 0,
        type: 'line',
        pointRadius: 0,
      },
    ];
    allData.push({
      label: `${trackables[thisData].label} | Sleep Quality`,
      data: limitedData.data.sleepQuality,
      backgroundColor: primaryColor_1,
      borderColor: primaryColor_1,
      fill: false,
      lineTension: 0,
    });

    allData.push({
      label: `${trackables[thisData].label} | Insomnia`,
      data: limitedData.data.insomnia,
      backgroundColor: secondaryColor_1,
      borderColor: secondaryColor_1,
      fill: false,
      lineTension: 0,
    });
    const myChart = document.getElementById(`trackable-${thisData}`);
    if (myChart) {
      myChart.getContext('2d');

      // Set defaults for all
      Chart.defaults.global.defaultFontFamily = 'Lato';
      Chart.defaults.global.defaultFontSize = 16;
      Chart.defaults.global.defaultFontColor = secondaryColor_1;

      const chartOptions = {
        type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
        data: {
          labels: limitedLabels,
          datasets: allData,
        },
        options: {
          title: {
            display: false,
            text: trackables[thisData].label,
            fontColor: secondaryColor_1,
            fontSize: 20,
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              fontColor: secondaryColor_1,
            },
          },
          layout: {
            padding: {
              top: 40,
              bottom: 0,
            }, // top left right bottom
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
          tooltips: {
            enabled: true,
          },
        },
      };

      let chart = new Chart(myChart, chartOptions);
    }
  }
};

export const loadChart = async () => {
  try {
    let user;
    await axios({
      method: 'GET',
      url: '/api/v1/users/me',
    }).then((res) => {
      user = res.data.data.user;
    });

    await axios({
      method: 'GET',
      url: '/api/v1/sleepLogs?sort=-sleepStart',
    }).then((res) => {
      const sleeplogs = [...res.data.data.doc];
      let sleeplogDates = [];
      let sleeplogQuality = [];
      let sleeplogInsomnia = [];
      const trackables = {};
      const allTrackables = [];

      // Create an object for each trackable
      sleeplogs.forEach((el, i) => {
        if (i < 30) {
          el.trackables.forEach((trk) => {
            if (!allTrackables.includes(trk.trackable._id)) {
              allTrackables.push(trk.trackable._id);
              trackables[trk.trackable._id] = {};
              trackables[trk.trackable._id].data = {
                insomnia: [],
                sleepQuality: [],
              };
              trackables[trk.trackable._id].label = trk.trackable.name;
            }
          });
        }
      });

      // Assemble data for the last 30 logs
      sleeplogs.forEach((el, i) => {
        if (i < 30) {
          // Assemble date data
          let thisDate = new Date(el.sleepStart);
          thisDate = thisDate.toLocaleString('en-US', {
            month: '2-digit',
            day: 'numeric',
          });
          sleeplogDates.push(thisDate);

          // Assemble sleepQuality data
          sleeplogQuality.push(el.sleepQuality);

          // Assemble sleeplogInsomnia
          sleeplogInsomnia.push(el.timeToFallAsleep);

          // Assemble trackables data
          allTrackables.forEach((trk) => {
            let insomniaData = '';
            let sleepQualityData = '';
            const thisId = trk;

            for (let thisTrk of el.trackables) {
              if (`${thisTrk.trackable._id}` === `${trk}`) {
                insomniaData = el.timeToFallAsleep;
                sleepQualityData = el.sleepQuality;
              }
            }
            trackables[thisId].data.insomnia.push(insomniaData);
            trackables[thisId].data.sleepQuality.push(sleepQualityData);
          });
        }
      });

      allTrackables.forEach((trk) => {
        const trackableData = trackables[trk].data.sleepQuality.filter(
          (el) => el !== ''
        );
        const trackableAvgQuality =
          trackableData.reduce((total, el) => total + el) /
          trackableData.length;
        trackables[trk].averageQuality = trackableAvgQuality;
      });

      sleeplogChart(sleeplogDates, sleeplogQuality, trackables);

      trackableChart(
        sleeplogDates,
        user.sleepData.avgSleepQuality,
        user.sleepData.avgTimeToFallAsleep,
        trackables
      );
    });
  } catch (err) {
    console.log(err);
  }
};
