

var PhaseItemSetting = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onItemsChange: React.PropTypes.func.isRequired
  },

  onItemChange: function(e) {
    var itemIndex = e.target.getAttribute('data-index');
    var newItemValue = e.target.value;
    var newItems = this.props.items.slice();
    newItems[itemIndex] = newItemValue;
    this.props.onItemsChange(newItems);
  },

  onItemAdd: function(e) {
    var newItems = this.props.items.slice();
    newItems.push('');
    this.props.onItemsChange(newItems);
  },

  onItemRemove: function(e) {
    var itemIndex = e.target.getAttribute('data-index');
    var newItems = this.props.items.slice();
    newItems.splice(itemIndex, 1);
    this.props.onItemsChange(newItems);
  },

  render: function() {
    var createItemLine = function(itemText, itemIndex) {
      return (
        <div className="item-selection-line" key={itemIndex}>
          <input className="item-selection-line-input" data-index={itemIndex} value={itemText} onChange={this.onItemChange} placeholder="Enter new item..." />
          <button className="item-selection-line-remove" data-index={itemIndex} onClick={this.onItemRemove} type="button" className="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
      );
    };

    return (
      <div className="item-selection">
        <h3>Which items would you like to compare?</h3>
        <ul className="item-selection-list">{this.props.items.map(createItemLine, this)}</ul>
        <div className="item-selection-add-new">
          <button type="button" className="btn btn-default btn-sm" onClick={this.onItemAdd}>Add new</button>
        </div>
      </div>
    )
  }
});

var PhaseItemComparison = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onComparisonFinish: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    /**
     * Shuffles array in place.
     * @param {Array} a items The array containing the items.
     */
    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i -= 1) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

    var itemNumber = this.props.items.length;
    var pairs = []
    for (var i = 0; i < itemNumber; i++) {
      for (var j = i+1; j < itemNumber; j++) {
        var switchPair = Math.random() > 0.5; 
        var pair = switchPair ? [j, i] : [i, j];
        pairs.push(pair);
      }
    }
    var pairsShuffled = pairs.slice();
    shuffle(pairsShuffled);

    return {
      comparisonsLeft: pairsShuffled,
      comparisonResults: []  // [winner, loser]
    };
  },

  makeChoice: function(e) {
    var comparisonsLeftNumber = this.state.comparisonsLeft.length;
    var currentPair = this.state.comparisonsLeft[comparisonsLeftNumber - 1];
    var itemIndexWinning = e.target.getAttribute('data-index');
    var itemIndexLosing = currentPair[0] == itemIndexWinning ? currentPair[1] : currentPair[0];
    var newComparisonResult = [itemIndexWinning, itemIndexLosing];
    var nextComparisonResults = this.state.comparisonResults.slice();
    nextComparisonResults.push(newComparisonResult);
    var nextComparisonsLeft = this.state.comparisonsLeft.slice();
    nextComparisonsLeft.pop();
    this.setState({
      comparisonsLeft: nextComparisonsLeft,
      comparisonResults: nextComparisonResults
    }, function() {
      if (this.state.comparisonsLeft.length == 0) {
        this.props.onComparisonFinish(this.state.comparisonResults);
      }
    });
  },

  render: function() {
    var comparisonsLeftNumber = this.state.comparisonsLeft.length;
    if (comparisonsLeftNumber == 0) {
      return <span>Done!</span>
    }
    var nextPair = this.state.comparisonsLeft[comparisonsLeftNumber - 1]
    var nextItems = [this.props.items[nextPair[0]], this.props.items[nextPair[1]]]
    return (
      <div className="item-comparison">
        <h3>Which one do you prefer?</h3>
        <p className="item-comparison-choices">
          <button type="button" className="btn btn-default btn-lg" data-index={nextPair[0]} onClick={this.makeChoice}>{nextItems[0]}</button>
          &nbsp;or&nbsp;
          <button type="button" className="btn btn-default btn-lg" data-index={nextPair[1]} onClick={this.makeChoice}>{nextItems[1]}</button>?
        </p>
      </div>
    );
  }
});

var PhaseResultsViewing = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    comparisonResults: React.PropTypes.array.isRequired
  },

  render: function() {
    var itemWinCount = [];
    var itemNumber = this.props.items.length;
    for (var i = 0; i < itemNumber; i++) {
      itemWinCount.push(0);
    }
    this.props.comparisonResults.forEach(function(comparisonResult) {
      var winningIndex = comparisonResult[0];
      itemWinCount[winningIndex]++;
    });
    // for (var i = 0; i < this.props.comparisonResults.length; i++) {
    //   var comparisonResult = this.props.comparisonResults[i]
    // }

    var itemsAndWinsSorted = [];
    itemWinCount.forEach(function(winCount, itemIndex) {
      itemsAndWinsSorted.push({
        itemIndex: itemIndex,
        winCount: winCount
      })
    });
    // Sort by decreasing order
    itemsAndWinsSorted.sort(function(a, b) {
      if (a.winCount > b.winCount) {
        return -1;
      } else if (a.winCount < b.winCount) {
        return 1;
      } else {
        return 0;
      }
    });

    var createResultLine = function(resultObject) {
      var item = this.props.items[resultObject.itemIndex]
      return <li key={resultObject.itemIndex}>{item}: {resultObject.winCount}</li>
    };

    return (
      <div>
        <ul>{itemsAndWinsSorted.map(createResultLine, this)}</ul>
      </div>
    )
  }
});


var PrefMatrixApp = React.createClass({
  statics: {
    PHASE: {
      ITEM_SETTING: 0,
      ITEM_COMPARISON: 1,
      RESULTS_VIEWING: 2
    }
  },

  propTypes: {},

  getInitialState: function() {
    return {
      phase: PrefMatrixApp.PHASE.ITEM_SETTING,
      items: ['a', 'b', 'c'],
      comparisonResults: []
    };
  },

  handleItemsChange: function(newItems) {
    this.setState({items: newItems});
  },

  handleComparisonFinish: function(comparisonResults) {
    this.setState({
      phase: PrefMatrixApp.PHASE.RESULTS_VIEWING,
      comparisonResults: comparisonResults
    });
  },

  restart: function() {
    var doReset;
    if (this.state.phase == PrefMatrixApp.PHASE.ITEM_COMPARISON) {
      doReset = window.confirm("Are you sure you want to restart? Your current progress will be lost.");
    } else {
      doReset = true;
    }
    if (doReset) {
      this.setState(this.getInitialState());
    }
  },

  startComparison: function() {
    this.setState({
      phase: PrefMatrixApp.PHASE.ITEM_COMPARISON
    });
  },

  render: function() {
    var buildResetButton = function() {
      return (
        <div className="header-reset-button">
          <button type="button" className="btn btn-default btn-xs" onClick={this.restart}>
            <span className="glyphicon glyphicon-repeat" aria-hidden="true"></span>&nbsp;Restart
          </button>
        </div>
      )
    }

    var panelComponents
    if (this.state.phase == PrefMatrixApp.PHASE.ITEM_SETTING) {
      panelComponents = (
        <div className="pref-matrix-app">
          <p className="phase-title">Step 1/3: Choose the items you wish to compare</p>
          {buildResetButton.call(this)}
          <PhaseItemSetting items={this.state.items} onItemsChange={this.handleItemsChange} />
          <div className="start-comparison">
            <button type="button" className="btn btn-primary btn-md" onClick={this.startComparison}>Start Comparison</button>
          </div>
        </div>
      )
    } else if (this.state.phase == PrefMatrixApp.PHASE.ITEM_COMPARISON) {
      panelComponents = (
        <div className="pref-matrix-app">
          <p className="phase-title">Step 2/3: Compare the items</p>
          {buildResetButton.call(this)}
          <PhaseItemComparison items={this.state.items} onComparisonFinish={this.handleComparisonFinish} />
        </div>
      )
    } else if (this.state.phase == PrefMatrixApp.PHASE.RESULTS_VIEWING) {
      panelComponents = (
        <div className="pref-matrix-app">
          <p className="phase-title">Step 3/3: Results</p>
          {buildResetButton.call(this)}
          <PhaseResultsViewing items={this.state.items} comparisonResults={this.state.comparisonResults} />
        </div>
      )
    } else {
      panelComponents = (
        <div className="pref-matrix-app">
          {buildResetButton.call(this)}
          "Oops! Not sure how you got here. Please start again!"
        </div>
      )
    }
    return <div>{panelComponents}</div>
  }
});

var appMountNode = $('#appMountNode').get(0);
ReactDOM.render(
  <PrefMatrixApp />
  , appMountNode);