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

function getRandomAssignment(){
  var randomTile = allActionTiles[ Math.floor( Math.random()*allActionTiles.length ) ];
  var randomOption = randomTile.options[ Math.floor( Math.random()*randomTile.options.length ) ];
  return {
    text : randomTile.instruction.replace("[label]", randomOption.label)
  };
}

Template.gameView.created = function( event ) {
  var self = this;
  this.actionTiles = new ReactiveVar([]);
  this.assignedAction = new ReactiveVar({ text : "waiting..." });

  getActionTiles(function(actionTiles){

    // get first set of action tiles
    self.actionTiles.set( getRandomTiles(4) );

    // get first assignment
    self.assignedAction.set( getRandomAssignment() );

  });

};

Template.gameView.rendered = function( event ) {
  var timeRemaining = getTimeRemaining();
};

Meteor.setInterval(function () {
  Session.set('time', new Date());
  var game = getCurrentGame();
  if( game != null ){
    var timeRemaining = getTimeRemaining();

    if( timeRemaining <= 0 && game.startTime != null ){
      gameOver();
    };
    if( game.progress >= game.goal && game.goal != null ){
      Games.update(game._id, { $set: { result: true }});
      Session.set('time', null);
      gameOver();
    };
  }

}, 1000);


Template.gameView.events({
  'click .btn-back': function () {
    resetUserState();
    Session.set("currentView", "startMenu");
    return false;
  },
  'click #btn-progression': function () {
    var game = getCurrentGame();
    console.log('goal',game.goal);
    Games.update(game._id, { $set: { progress: game.progress+1 }});

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
    var totalTime = getTotalTime();
    var progress = Math.floor((currentTime / totalTime) * 100);
    deadlineBarValue.set(progress);
    return deadlineBarValue.get();
  },
  getProgress: function() {
    return getProgress();
  }
});