/**
 * dependencies
 */

var matches = require('matches-selector')
  , emitter = require('emitter')
  , classes = require('classes')
  , events = require('events')
  , indexof = require('indexof')
  , each = require('each');

/**
 * export `Sortable`
 */

module.exports = Sortable;

/**
 * Initialize `Sortable` with `el`.
 *
 * @param {Element} el
 */

function Sortable(el){
  if (!(this instanceof Sortable)) return new Sortable(el);
  if (!el) throw new TypeError('sortable(): expects an element');
  this.events = events(el, this);
  this.el = el;
}

/**
 * Mixins.
 */

emitter(Sortable.prototype);

/**
 * Ignore items that don't match `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.ignore = function(selector){
  this.ignored = selector;
  return this;
}

/**
 * Set handle to `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.handle = function(selector){
  this._handle = selector;
  return this;
}

Sortable.prototype.bind = function (selector){
  this.selector = selector || '';
  this.events.bind('mousedown');
  this.events.bind('mouseup');
}

Sortable.prototype.onmousedown = function(e) {
  if (this._handle) {
    this.match = matches(e.target, this._handle);
  }
  this.reset();
  this.draggable = up(e.target, this.selector, this.el);
  if (!this.draggable) return;
  this.draggable.draggable = true;
  this.events.bind('dragstart');
  this.events.bind('dragover');
  this.events.bind('dragenter');
  this.events.bind('dragend');
  this.events.bind('drop');
  this.clone = this.draggable.cloneNode(false);
  classes(this.clone).add('sortable-placeholder');
  return this;
}

Sortable.prototype.onmouseup = function(e) {
  this.reset();
}

Sortable.prototype.remove = function() {
  this.events.unbind();
}


/**
 * on-dragstart
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragstart = function(e){
  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();
  if (this._handle && !this.match) return e.preventDefault();
  var target = this.draggable;
  this.display = window.getComputedStyle(target).display;
  this.i = indexof(target);
  e.dataTransfer.setData('text', ' ');
  e.dataTransfer.effectAllowed = 'move';
  classes(target).add('dragging');
  this.emit('start', e);
}

/**
 * on-dragover
 * on-dragenter
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragenter =
Sortable.prototype.ondragover = function(e){
  var el = e.target
    , next
    , ci
    , i;

  e.preventDefault();
  if (!this.draggable || el == this.el) return;
  e.dataTransfer.dropEffect = 'move';
  this.draggable.style.display = 'none';

  // parent
  while (el.parentElement != this.el) el = el.parentElement;
  next = el;
  ci = indexof(this.clone);
  i = indexof(el);
  if (ci < i) next = el.nextElementSibling;
  if (this.ignored && matches(el, this.ignored)) return;
  this.el.insertBefore(this.clone, next);
}


/**
 * on-dragend
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondragend = function(e){
  if (!this.draggable) return;
  if (this.clone) remove(this.clone);
  this.draggable.style.display = this.display;
  classes(this.draggable).remove('dragging');
  if (this.i == indexof(this.draggable)) return;
  this.emit('update');
}

/**
 * on-drop
 *
 * @param {Event} e
 * @api private
 */

Sortable.prototype.ondrop = function(e){
  e.stopPropagation();
  this.el.insertBefore(this.draggable, this.clone);
  this.ondragend(e);
  this.emit('drop', e);
  this.reset();
}

/**
 * Reset sortable.
 *
 * @api private
 * @return {Sortable}
 * @api private
 */

Sortable.prototype.reset = function(){
  if (this.draggable) {
    this.draggable.draggable = false;
    this.draggable = null;
  }
  this.display = null;
  this.i = null;

  this.events.unbind('dragstart');
  this.events.unbind('dragover');
  this.events.unbind('dragenter');
  this.events.unbind('dragend');
  this.events.unbind('drop');
}

/**
 * Remove the given `el`.
 *
 * @param {Element} el
 * @return {Element}
 * @api private
 */

function remove (el) {
  if (!el.parentNode) return;
  el.parentNode.removeChild(el);
}

function up (node, selector, container) {
  do {
    if (matches(node, selector)) {
      return node;
    }
    node = node.parentNode;
  } while (node !== container);
}
