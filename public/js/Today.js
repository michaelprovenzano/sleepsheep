class Today {
  constructor() {
    this.curTime = Date.now();
    this.date = new Date(Date.now());
    this.sleepStartDate = this.formatDate(this.curTime - 8 * 1000 * 60 * 60);
    this.sleepEndDate = this.formatDate(this.curTime);
    this.sleepStartTime = this.formatTime(this.curTime - 8 * 1000 * 60 * 60);
    this.sleepEndTime = this.formatTime(this.curTime);
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  formatTime(date) {
    var d = new Date(date);

    let hours = d.getHours();
    while (hours.toString().length < 2) {
      hours = '0' + hours;
    }

    let minutes = d.getMinutes();
    while (minutes.toString().length < 2) {
      minutes = '0' + minutes;
    }

    return `${hours}:${minutes}`;
  }
}

export default Today;
