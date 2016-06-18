var PhaseItemSetting = React.createClass({
  propTypes: {
    items: React.PropTypes.array.isRequired,
    onItemsChange: React.PropTypes.func.isRequired
  },

  onItemChange: function(e) {
    var itemIndex = parseInt(e.target.getAttribute('data-index'));
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
    var itemIndex = parseInt(e.target.getAttribute('data-index'));
    var newItems = this.props.items.slice();
    newItems.splice(itemIndex, 1);
    this.props.onItemsChange(newItems);
  },

  render: function() {
    var createItemLine = function(itemText, itemIndex) {
      return (
        <div className="row item-selection-line" key={itemIndex}>
          <div className="col-sm-4 col-sm-offset-4 col-xs-12">
            <input className="item-selection-line-input form-control" data-index={itemIndex} value={itemText} onChange={this.onItemChange} placeholder="Enter new item..." />
            <button className="item-selection-line-remove" data-index={itemIndex} onClick={this.onItemRemove} type="button" className="close" aria-label="Close">
              <span data-index={itemIndex} aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="item-selection">
        <h3 className="item-selection-header">Which items would you like to compare?</h3>

        <form className="form-inline">
          <div className="item-selection-list">{this.props.items.map(createItemLine, this)}</div>
        </form>

        <div className="row">
          <div className="col-sm-2 col-sm-offset-5 col-xs-12">
            <div className="item-selection-add-new">
              <button type="button" className="btn btn-default btn-sm" onClick={this.onItemAdd}>Add new</button>
            </div>
          </div>
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
    var itemIndexWinning = parseInt(e.target.getAttribute('data-index'));
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
        <div className="row">
          <div className="col-xs-12">
            <h3 className="item-comparison-header">Which one do you prefer?</h3>
          </div>
        </div>
        <div className="item-comparison-choices">
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3 col-xs-12">
              <button type="button" className="btn btn-default btn-lg" data-index={nextPair[0]} onClick={this.makeChoice}>{nextItems[0]}</button>
              <div className="separator">or</div>
              <button type="button" className="btn btn-default btn-lg" data-index={nextPair[1]} onClick={this.makeChoice}>{nextItems[1]}</button>
            </div>
          </div>
        </div>
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
      <div className="comparison-results">
        <div className="row">
          <div className="col-xs-12 col-sm-4 col-sm-offset-4">
            <h4>Results</h4>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-4 col-sm-offset-4">
            <ul>{itemsAndWinsSorted.map(createResultLine, this)}</ul>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-sm-4 col-sm-offset-4">
            <h4>Save or share your results</h4>
          </div>
        </div>
        <div>
          <div className="col-xs-12 col-sm-4 col-sm-offset-4">
            <input readOnly className="form-control" value={window.location.href} />
          </div>
        </div>
      </div>
    )
  }
});

var PhaseStatus = React.createClass({
  propTypes: {
    phase: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <div className="row phase-status">
        <div className="col-xs-4 col-sm-2 col-sm-offset-3" data-selected={this.props.phase == 0 ? 'yes' : 'no'}>
          Step 1: Selection
        </div>
        <div className="col-xs-4 col-sm-2" data-selected={this.props.phase == 1 ? 'yes' : 'no'}>
          Step 2: Comparison
        </div>
        <div className="col-xs-4 col-sm-2" data-selected={this.props.phase == 2 ? 'yes' : 'no'}>
          Step 3: Results
        </div>
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
      items: ['Item 1', 'Item 2', 'Item 3'],
      comparisonResults: []
    };
  },

  // Sets the Hash URL depending on the phase. The results phase adds an encoded results JSON, the rest clears it.
  setUrl: function() {
    if (this.state.phase != PrefMatrixApp.PHASE.RESULTS_VIEWING) {
      window.location.hash = '#';
      return;
    }
    var resultState = {
      items: this.state.items,
      comparisonResults: this.state.comparisonResults
    }
    var resultStateString = JSON.stringify(resultState);
    var resultStateEncoded = window.btoa(resultStateString);
    window.location.hash = resultStateEncoded;
    ga_newpageview();
  },

  // Gets the Hash URL and sets the phase and state based on it.
  parseUrl: function() {
    if (window.location.hash.length <= 1) {
      return;
    }
    try {
      var resultStateEncoded = window.location.hash.substring(1);
      var resultStateString = window.atob(resultStateEncoded);
      var resultState = $.parseJSON(resultStateString);
      this.setState({
        phase: PrefMatrixApp.PHASE.RESULTS_VIEWING,
        items: resultState.items,
        comparisonResults: resultState.comparisonResults
      })
    } catch (error) {
    }
  },

  handleItemsChange: function(newItems) {
    this.setState({items: newItems});
  },

  handleComparisonFinish: function(comparisonResults) {
    this.setState({
      phase: PrefMatrixApp.PHASE.RESULTS_VIEWING,
      comparisonResults: comparisonResults
    }, this.setUrl);
  },

  restart: function() {
    var doReset;
    if (this.state.phase == PrefMatrixApp.PHASE.ITEM_COMPARISON) {
      doReset = window.confirm("Are you sure you want to restart? Your current progress will be lost.");
    } else {
      doReset = true;
    }
    if (doReset) {
      this.setState(
        this.getInitialState(),
        this.setUrl);
    }
  },

  startComparison: function() {
    this.setState({
      phase: PrefMatrixApp.PHASE.ITEM_COMPARISON
    },
    this.setUrl);
  },

  componentWillMount: function() {
    this.parseUrl();
  },

  canStartComparison: function() {
    return this.state.items.length > 1;
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
          <PhaseItemSetting items={this.state.items} onItemsChange={this.handleItemsChange} />
          <div className="row">
            <div className="col-sm-4 col-sm-offset-4 col-xs-12">
              <div className="start-comparison">
                <button type="button" disabled={!this.canStartComparison()} className="btn btn-primary btn-md" onClick={this.startComparison}>Start Comparison</button>
              </div>
            </div>
          </div>
          <PhaseStatus phase={0} />
          <div className="row">
            <div className="col-xs-12">
              {buildResetButton.call(this)}
            </div>
          </div>
        </div>
      )
    } else if (this.state.phase == PrefMatrixApp.PHASE.ITEM_COMPARISON) {
      panelComponents = (
        <div className="pref-matrix-app">
          <PhaseItemComparison items={this.state.items} onComparisonFinish={this.handleComparisonFinish} />
          <PhaseStatus phase={1} />
          <div className="row">
            <div className="col-xs-12">
              {buildResetButton.call(this)}
            </div>
          </div>
        </div>
      )
    } else if (this.state.phase == PrefMatrixApp.PHASE.RESULTS_VIEWING) {
      panelComponents = (
        <div className="pref-matrix-app">
          <PhaseResultsViewing items={this.state.items} comparisonResults={this.state.comparisonResults} />
          <PhaseStatus phase={2} />
          <div className="row">
            <div className="col-xs-12">
              {buildResetButton.call(this)}
            </div>
          </div>
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