HTML Drag and Drop Simulator
============================
[![Circle CI](https://circleci.com/gh/Kuniwak/html-dnd.svg?style=shield)](https://circleci.com/gh/Kuniwak/html-dnd)
[![npm version](https://badge.fury.io/js/html-dnd.svg)](http://badge.fury.io/js/html-dnd)

[HTML Drag and Drop](https://html.spec.whatwg.org/multipage/interaction.html#dnd) Simulator for E2E testing.

Now, [WebDriver](http://www.w3.org/TR/webdriver/) cannot handle HTML Drag and Drop.
This module can simulate the HTML Drag and Drop by using the [Execute Script command](http://www.w3.org/TR/webdriver/#execute-script).

This module is like [rcorreia/drag_and_drop_helper.js](https://gist.github.com/rcorreia/2362544), but it does not require jQuery.

This fork of [html-dnd](https://github.com/Kuniwak/html-dnd) simply adds a dragover event in front of the drop event to allow the [angular-drag-and-drop-lists](https://github.com/marceljuenemann/angular-drag-and-drop-lists) to work properly.
This is due to angular-drag-and-drop-lists set index values via the drag over event, if the event is not run then correctly calculate the index of the drop point.
Added optional arguments offsetX and offsetY as angular-drag-and-drop-lists tries to calculate which side of an element to do the drop based on the offsets. 
By using a small value for each, the drop goes ahead of the element being dropped upon, using large values it goes after the dropped upon element.

Install
-------
```shell
npm install --save-dev html-dnd
```


Compatibility
-------------
[![Sauce Test Status](https://saucelabs.com/browser-matrix/html-dnd.svg)](https://saucelabs.com/u/html-dnd)


Usage
-----
### For selenium-webdriver

```javascript
var dragAndDrop = require('html-dnd').code;
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

var driver = new webdriver.Builder()
  .forBrowser('firefox')
  .build();

driver.get('http://example.com');

var draggable = driver.findElement(By.id('draggable'));
var droppable = driver.findElement(By.id('droppable'));

// drop before droppable
var offsetX = 1;
var offsetY = 1;

// drop after droppable
//var offsetX = 100;
//var offsetY = 1000;
//driver.executeScript(dragAndDrop, draggable, droppable);
driver.executeScript(dragAndDrop, draggable, droppable, offsetX, offsetY);

driver.quit();
```


### For Nightwatch.js

```javascript
var dragAndDrop = require('html-dnd').codeForSelectors;

module.exports = {
  'drag and drop': function(browser) {
    browser
      .url('http://example.com')
      .execute(dragAndDrop, ['#draggable', '#droppable'])
      .end();
  }
};
```


### For WebdriverIO

```javascript
var dragAndDrop = require('html-dnd').codeForSelectors;
var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'chrome' } };
var client = webdriverio.remote(options);

client
  .init()
  .url('http://example.com')
  .execute(dragAndDrop, '#draggable', '#droppable');
  .end();
```


See also
--------

- [Issue 3604: HTML5 Drag and Drop with Selenium Webdriver](https://code.google.com/p/selenium/issues/detail?id=3604)


License
-------

MIT (c) 2015 Kuniwak
