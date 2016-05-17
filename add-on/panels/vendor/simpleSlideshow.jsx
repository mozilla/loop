// This is derived from PIOTR F's code,
// currently available at https://github.com/piotrf/simple-react-slideshow

// Simple React Slideshow Example
//
// Original Author: PIOTR F.
// License: MIT
//
// Copyright (c) 2015 Piotr
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//

var loop = loop || {};
loop.SimpleSlideshow = (function() {
  "use strict";

// App state
  var state = {
    currentSlide: 0,
    data: []
  };

// State transitions
  var actions = {
    toggleNext: function() {
      var current = state.currentSlide;
      var next = current + 1;
      if (next < state.data.length) {
        state.currentSlide = next;
      }
      render();
    },
    togglePrev: function() {
      var current = state.currentSlide;
      var prev = current - 1;
      if (prev >= 0) {
        state.currentSlide = prev;
      }
      render();
    },
    toggleSlide: function(id) {
      var index = state.data.map(function(el) {
        return (
          el.id
        );
      });
      var currentIndex = index.indexOf(id);
      state.currentSlide = currentIndex;
      render();
    }
  };

  var Slideshow = React.createClass({
    propTypes: {
      data: React.PropTypes.array.isRequired
    },
    render: function() {
      return (
        <div className="slideshow">
          <Slides data={this.props.data} />
          <div className="control-panel">
            <Controls />
          </div>
        </div>
      );
    }
  });

  var Slides = React.createClass({
    propTypes: {
      data: React.PropTypes.array.isRequired
    },
    render: function() {
      var slidesNodes = this.props.data.map(function(slideNode, index) {
        var isActive = state.currentSlide === index;
        return (
          <Slide active={isActive}
                 imageClass={slideNode.imageClass}
                 indexClass={slideNode.id}
                 text={slideNode.text}
                 title={slideNode.title} />
        );
      });
      return (
        <div className="slides">
          {slidesNodes}
        </div>
      );
    }
  });

  var Slide = React.createClass({
    propTypes: {
      active: React.PropTypes.bool.isRequired,
      imageClass: React.PropTypes.string.isRequired,
      indexClass: React.PropTypes.string.isRequired,
      text: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired
    },
    render: function() {
      var classes = classNames({
        "slide": true,
        "slide--active": this.props.active
      });
      return (

        <div className={classes}>
          <div className={this.props.indexClass}>
            <div className="slide-layout">
              <img className={this.props.imageClass} />
              <h2>{this.props.title}</h2>
              <div className="slide-text">{this.props.text}</div>
            </div>
          </div>
        </div>
      );
    }
  });

  var Controls = React.createClass({
    togglePrev: function() {
      actions.togglePrev();
    },
    toggleNext: function() {
      actions.toggleNext();
    },
    render: function() {
      var showPrev, showNext;
      var current = state.currentSlide;
      var last = state.data.length;
      if (current > 0) {
        showPrev = <div className="toggle toggle-prev" onClick={this.togglePrev}></div>;
      }
      if (current < last - 1) {
        showNext = <div className="toggle toggle-next" onClick={this.toggleNext}></div>;
      }
      return (
        <div className="controls">
          {showPrev}
          {showNext}
        </div>
      );
    }
  });

  var EmptyMessage = React.createClass({
    render: function() {
      return (
        <div className="empty-message">No Data</div>
      );
    }
  });

  function render(renderTo) {
    var hasData = state.data.length > 0;
    var component;
    if (hasData) {
      component = <Slideshow data={state.data} />;
    }
    else {
      component = <EmptyMessage />;
    }
    ReactDOM.render(
      component,
      document.querySelector(renderTo ? renderTo : "#main")
    );
  }

  function init(renderTo, data) {
    state.data = data;
    render(renderTo);
  }

  return {
    init: init
  };
})();
