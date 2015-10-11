var allActionTiles = null;

function getActionTiles(cb){
  if( allActionTiles === null ){
    Meteor.call("getActionTiles",function(err, result){
      if(err) throw new Error("Error getting actionTiles: "+ err);
      allActionTiles = result;
      cb(allActionTiles);
    });
  }else{
    cb(allActionTiles);
  }
}

function getRandomTiles(amount){
  amount = amount || 1;
  new Array(amount).fill().map(function(c,i,a){
    return allActionTiles[i]; // not random yet!
  });
}

/*
 * Get a random assignment using all the available tiles that are on peoples screen
 */
function getRandomAssignment(){
  var gameTiles = getCurrentGameAllTiles();
  var randomTile = gameTiles[ Math.floor( Math.random()*gameTiles.length ) ];
  var randomOption = randomTile.options[ Math.floor( Math.random()*randomTile.options.length ) ];
  return {
    text : randomTile.instruction.replace("[label]", randomOption.label)
  };
}

Template.gameView.created = function( event ) {
  var player = getCurrentPlayer();
  var self = this;
  this.actionTiles = new ReactiveVar([]);
  this.assignedAction = new ReactiveVar({ text : "waiting..." });

  getActionTiles(function(actionTiles){

    // get first set of action tiles
    self.actionTiles.set( getRandomTiles(4) );
    // report that to db
    player.actionTiles = self.actionTiles.get();

    // get first assignment
    self.assignedAction.set( getRandomAssignment() );

  });

};

Template.gameView.rendered = function( event ) {
  var timeRemaining = getTimeRemaining();

  Meteor.setTimeout(function () {
    Session.set('currentView', 'gameOver');
  }, timeRemaining + 100 );
};

Meteor.setInterval(function () {
  Session.set('time', new Date());
}, 1000);


Template.gameView.events({
  'click .btn-back': function () {
    resetUserState();
    Session.set("currentView", "startMenu");
    return false;
  }
});

Template.gameView.helpers({
  timeRemaining: function () {
    var timeRemaining = getTimeRemaining();

    return moment(timeRemaining).format('mm:ss');
  },
  gameFinished: function () {
    var timeRemaining = getTimeRemaining();

    return timeRemaining === 0;
  },
  actionTiles: function() {
    return Template.instance().actionTiles.get();
  },
  assignment: function() {
    return Template.instance().assignedAction.get();
  },
  deadlineBar: function () {
    var deadlineBarValue = new ReactiveVar(0);
    var currentTime = getGameTimer();
    console.log('timer',currentTime);
    var totalTime = getTotalTime();
    console.log('totaltime',totalTime);
    var progress = Math.floor((currentTime / totalTime) * 100);
    console.log('percent progressed',progress);
    deadlineBarValue.set(progress);
    return deadlineBarValue.get();
  }
});
