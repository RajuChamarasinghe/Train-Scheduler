var firebaseConfig = {
    apiKey: "AIzaSyDKLHpomRlm-fYWxAT60E4Z9OeHIKuo8ps",
    authDomain: "my-train-scheduler-651f9.firebaseapp.com",
    databaseURL: "https://my-train-scheduler-651f9.firebaseio.com",
    projectId: "my-train-scheduler-651f9",
    storageBucket: "my-train-scheduler-651f9.appspot.com",
    messagingSenderId: "1002787444387",
    appId: "1:1002787444387:web:118a69397ccc3d7f"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


$(document).ready(function () {

  ReadFromDatabase();
  setInterval(ReadFromDatabase, 5000);
  
  function submit() {

    var trainName = $("#txtTrainName").val();
    var destination = $("#txtdestination").val();
    var firstTrainTime = $("#txtfirstTrainTime").val();
    var freq = $("#txtfrequency").val();

    if (trainName.length == 0) {
      alert("Please enter train name.. ");
      return false;
    }
    // our code...
    firebase.database().ref('' + trainName).set({
      Destination: destination,
      FirstTrainTime: firstTrainTime,
      Frequency: freq,
      TrainName: trainName
    });

    return false;
  }

  $("#btnSubmit").click(function () {
    submit();
    ReadFromDatabase();
  });

}); // doc ready end.


// read from database.
function ReadFromDatabase() {
  $("#trainsh").empty();
  var ref = firebase.database().ref();

  ref.on("value", function (snapshot) {
    snapshot.forEach((child) => {
      var firstTime = convertToStandard(child.val().FirstTrainTime);
      var nowTime = convertToStandard(moment());
      var frq = child.val().Frequency;
      var minsAway = GetNextTimesInMin(firstTime,nowTime,frq);
      var nextTrainTime = GetNextTrainTime(firstTime,nowTime,frq);

      $("<div class='row'><div class='col-sm-3'>" + child.val().TrainName + "</div><div class='col-sm-3'>" + child.val().Destination + "</div><div class='col-sm-2'>" + child.val().FirstTrainTime + "</div><div class='col-sm-1'>" + child.val().Frequency + "</div><div class='col-sm-2'>"+nextTrainTime+"</div><div class='col-sm-1'>"+minsAway+"</div></div>").appendTo($("#trainsh"));
    });
  }, function (error) {
    console.log("Error: " + error.code);
  });
}

function convertToStandard(input) {
  return moment(input, 'HH:mm:ss').format('h:mm:ss A');
}


function timeobject(t){
  a = t.replace('AM','').replace('PM','').split(':');
  h = parseInt(a[0]);
  m = parseInt(a[1]);
  ampm = (t.indexOf('AM') !== -1 ) ? 'AM' : 'PM';
  return {hour:h,minute:m,ampm:ampm};
}

function GetNextTimesInMin(s,e,frq){
  s = timeobject(s);
  e = timeobject(e);
  e.hour = (e.ampm === 'PM' &&  s.ampm !== 'PM' && e.hour < 12) ? e.hour + 12 : e.hour;
  hourDiff = Math.abs(e.hour-s.hour);
  minuteDiff = e.minute - s.minute;

  if(minuteDiff < 0){
    minuteDiff = Math.abs(60 + minuteDiff);
    hourDiff = hourDiff - 1;
  }

  var mindiff =  (hourDiff * 60) + Math.abs(minuteDiff);
  var nextArrivalInMin = frq - (mindiff % frq);
  return nextArrivalInMin
}


function GetNextTrainTime(s,e,frq){
  s = timeobject(s);
  e = timeobject(e);
  e.hour = (e.ampm === 'PM' &&  s.ampm !== 'PM' && e.hour < 12) ? e.hour + 12 : e.hour;
  hourDiff = Math.abs(e.hour-s.hour);
  minuteDiff = e.minute - s.minute;

  if(minuteDiff < 0){
    minuteDiff = Math.abs(60 + minuteDiff);
    hourDiff = hourDiff - 1;
  }

  var mindiff =  (hourDiff * 60) + Math.abs(minuteDiff);
  var minDiffReminder =  (mindiff % frq);
  var time_now = moment();
  var nextArrivalTime = (moment(time_now).subtract(minDiffReminder, "minutes")).add(frq, 'minutes').format('LT');
   return nextArrivalTime;
  // return minDiffReminder;
}

// this method is not using  - just for ref. 
function timediff(s,e){
  s = timeobject(s);
  e = timeobject(e);
  e.hour = (e.ampm === 'PM' &&  s.ampm !== 'PM' && e.hour < 12) ? e.hour + 12 : e.hour;
  hourDiff = Math.abs(e.hour-s.hour);
  minuteDiff = e.minute - s.minute;

  if(minuteDiff < 0){
    minuteDiff = Math.abs(60 + minuteDiff);
    hourDiff = hourDiff - 1;
  }
 
  return hourDiff+':'+ Math.abs(minuteDiff);
}
