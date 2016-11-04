var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dnd;
(function (dnd) {
    "use strict";
    function simulate(draggable, droppable) {
        var store = new DragDataStore();
        // For the dragstart event. New data can be added to the drag data store.
        store.mode = "readwrite";
        var dataTransfer = new DataTransfer(store);
        var dragstartEvent = createEventWithDataTransfer("dragstart", dataTransfer);
        draggable.dispatchEvent(dragstartEvent);
        // For the drop event. The list of items representing dragged data can be
        // read, including the data. No new data can be added.
        store.mode = "readonly";
        var dragOverEvent = createEventWithDataTransfer("dragover", dataTransfer);
        droppable.dispatchEvent(dragOverEvent);
        var dropEvent = createEventWithDataTransfer("drop", dataTransfer);
        droppable.dispatchEvent(dropEvent);
        // For all other events. The formats and kinds in the drag data store list
        // of items representing dragged data can be enumerated, but the data itself
        // is unavailable and no new data can be added.
        store.mode = "protected";
        var dragendEvent = createEventWithDataTransfer("dragend", dataTransfer);
        draggable.dispatchEvent(dragendEvent);
    }
    dnd.simulate = simulate;
    /**
     * Creates an event instance with a DataTransfer.
     */
    function createEventWithDataTransfer(type, dataTransfer) {
        var event = document.createEvent("CustomEvent");
        event.initCustomEvent(type, true, true, null);
        event.dataTransfer = dataTransfer;
        return event;
    }
    /**
     * DataTransfer objects are used to expose the drag data store that underlies
     * a drag-and-drop operation.
     *
     * @see https://html.spec.whatwg.org/multipage/interaction.html#datatransferitem
     */
    var DataTransfer = (function () {
        function DataTransfer(store) {
            this.store = store;
            /**
             * @see DataTransfer#setData
             */
            this.typeTable = {};
            /**
             * Returns the kinds of operations that are to be allowed.
             *
             * Can be set (during the dragstart event), to change the allowed
             * operations.
             *
             * The possible values are "none", "copy", "copyLink", "copyMove", "link",
             * "linkMove", "move", "all", and "uninitialized",
             */
            this.effectAllowed = "uninitialized";
            /**
             * Returns an array listing the formats that were set in the dragstart
             * event. In addition, if any files are being dragged, then one of the types
             * will be the string "Files".
             */
            this.types = [];
            /**
             * Returns a FileList of the files being dragged, if any.
             */
            this.files = new FileList();
        }
        /**
         * Uses the given element to update the drag feedback, replacing any
         * previously specified feedback.
         */
        DataTransfer.prototype.setDragImage = function (element, x, y) {
            // Do nothing.
        };
        /**
         * Returns the specified data. If there is no such data, returns the empty
         * string.
         */
        DataTransfer.prototype.getData = function (format) {
            // If the DataTransfer object is no longer associated with a drag data
            // store, return the empty string and abort these steps.
            // If the drag data store's mode is in the protected mode, return the empty
            // string and abort these steps.
            if (this.store.mode === "protected") {
                return "";
            }
            // Let format be the first argument, converted to ASCII lowercase.
            format = format.toLowerCase();
            // Let convert-to-URL be false.
            var convertToUrl = false;
            if (format === "text") {
                // If format equals "text", change it to "text/plain".
                format = "text/plain";
            }
            else if (format === "url") {
                // If format equals "url", change it to "text/uri-list" and set
                // convert-to-URL to true.
                format = "text/uri-list";
                convertToUrl = true;
            }
            // If there is no item in the drag data store item list whose kind is Plain
            // Unicode string and whose type string is equal to format, return the empty
            // string and abort these steps.
            if (!(format in this.typeTable)) {
                return "";
            }
            // Let result be the data of the item in the drag data store item list whose
            // kind is Plain Unicode string and whose type string is equal to format.
            var result = this.typeTable[format];
            // If convert-to-URL is true, then parse result as appropriate for
            // text/uri-list data, and then set result to the first URL from the list,
            // if any, or the empty string otherwise. [RFC2483]
            if (convertToUrl) {
                result = parseTextUriList(result)[0] || "";
            }
            // Return result.
            return result;
        };
        /**
         * Adds the specified data.
         */
        DataTransfer.prototype.setData = function (format, data) {
            // If the DataTransfer object is no longer associated with a drag data
            // store, abort these steps. Nothing happens.
            if (!this.store) {
                return;
            }
            // If the drag data store's mode is not the read/write mode, abort these
            // steps. Nothing happens.
            if (this.store.mode !== "readwrite") {
                return;
            }
            // Let format be the first argument, converted to ASCII lowercase.
            format = format.toLowerCase();
            // If format equals "text", change it to "text/plain".
            // If format equals "url", change it to "text/uri-list".
            if (format === "text") {
                format = "text/plain";
            }
            else if (format === "url") {
                format = "text/uri-list";
            }
            // Remove the item in the drag data store item list whose kind is Plain
            // Unicode string and whose type string is equal to format, if there is
            // one. Add an item to the drag data store item list whose kind is Plain
            // Unicode string, whose type string is equal to format, and whose data
            // is the string given by the method's second argument.
            this.typeTable[format] = data;
            this.types = Object.keys(this.typeTable);
        };
        /**
         * Removes the data of the specified formats. Removes all data if the
         * argument is omitted.
         */
        DataTransfer.prototype.clearData = function (format) {
            var _this = this;
            // If the DataTransfer object is no longer associated with a drag data
            // store, abort these steps. Nothing happens.
            if (!this.store) {
                return;
            }
            // If the drag data store's mode is not the read/write mode, abort these
            // steps. Nothing happens.
            if (this.store.mode !== "readwrite") {
                return;
            }
            // If the method was called with no arguments, remove each item in the
            // drag data store item list whose kind is Plain Unicode string, and abort
            // these steps.
            if (typeof format === "undefined") {
                // Note: The clearData() method does not affect whether any files were
                // included in the drag, so the types attribute's list might still not
                // be empty after calling clearData() (it would still contain the
                // "Files" string if any files were included in the drag).
                this.types.filter(function (type) { return type !== "Files"; })
                    .forEach(function (type) { return _this.clearData(type); });
                return;
            }
            // Let format be the first argument, converted to ASCII lowercase.
            format = format.toLowerCase();
            // If format equals "text", change it to "text/plain".
            // If format equals "url", change it to "text/uri-list".
            if (format === "text") {
                format = "text/plain";
            }
            else if (format === "url") {
                format = "text/uri-list";
            }
            // Remove the item in the drag data store item list whose kind is Plain
            // Unicode string and whose type string is equal to format, if there is
            // one.
            delete this.typeTable[format];
            this.types = Object.keys(this.typeTable);
        };
        return DataTransfer;
    }());
    dnd.DataTransfer = DataTransfer;
    /**
     * @see https://w3c.github.io/FileAPI/#filelist-section
     */
    var FileList = (function () {
        function FileList() {
            this.length = 0;
        }
        // NOTE: This implementation can represent only empty FileList.
        FileList.prototype.item = function (index) {
            return null;
        };
        return FileList;
    }());
    dnd.FileList = FileList;
    /**
     * The data that underlies a drag-and-drop operation, known as the drag data
     * store, consists of the following information:
     *
     */
    var DragDataStore = (function () {
        function DragDataStore() {
        }
        return DragDataStore;
    }());
    /**
     * Each DataTransfer object is associated with a DataTransferItemList object.
     * @see https://html.spec.whatwg.org/multipage/interaction.html#datatransferitemlist
     */
    var DataTransferItemList = (function () {
        function DataTransferItemList(store) {
            this.store = store;
            /**
             * Each DataTransfer object is associated with a DataTransferItemList
             * object.
             */
            this.items = [];
            /**
             * @see DataTransferItemList#add
             */
            this.typeTable = {};
            /**
             * Returns the number of items in the drag data store.
             */
            this.length = 0;
        }
        /**
         * Removes the indexth entry in the drag data store.
         */
        DataTransferItemList.prototype.remove = function (idx) {
            // If the DataTransferItemList object is not in the read/write mode, throw
            // an InvalidStateError exception and abort these steps.
            if (this.store.mode !== "readwrite") {
                throw InvalidStateError.createByDefaultMessage();
            }
            // Remove the ith item from the drag data store.
            var removed = this.items.splice(idx, 1)[0];
            this.syncInternal();
            if (removed) {
                delete this.typeTable[removed.type];
            }
        };
        /**
         * Removes all the entries in the drag data store.
         */
        DataTransferItemList.prototype.clear = function () {
            // If the DataTransferItemList object is not in the read/write mode, throw
            // an InvalidStateError exception and abort these steps.
            if (this.store.mode !== "readwrite") {
                throw InvalidStateError.createByDefaultMessage();
            }
            // Remove the ith item from the drag data store.
            this.items = [];
            this.syncInternal();
        };
        DataTransferItemList.prototype.add = function (data, type) {
            // If the DataTransferItemList object is not in the read/write mode,
            // return null and abort these steps.
            if (this.store.mode !== "readwrite") {
                return null;
            }
            // Jump to the appropriate set of steps from the following list:
            //   A: If the first argument to the method is a string
            //   B: If the first argument to the method is a File
            if (typeof data === "string") {
                // If there is already an item in the drag data store item list whose
                // kind is Plain Unicode string and whose type string is equal to the
                // value of the method's second argument, converted to ASCII lowercase,
                // then throw a NotSupportedError exception and abort these steps.
                var typeLowerCase = type.toLowerCase();
                if (this.typeTable[typeLowerCase]) {
                    throw NotSupportedError.createByDefaultMessage();
                }
                // Otherwise, add an item to the drag data store item list whose kind is
                // Plain Unicode string, whose type string is equal to the value of the
                // method's second argument, converted to ASCII lowercase, and whose
                // data is the string given by the method's first argument.
                var stringItem = DataTransferItem.createForString(data, typeLowerCase, this.store);
                this.items.push(stringItem);
                this.typeTable[typeLowerCase] = true;
            }
            else {
                // Add an item to the drag data store item list whose kind is File,
                // whose type string is the type of the File, converted to ASCII
                // lowercase, and whose data is the same as the File's data.
                var fileItem = DataTransferItem.createForFile(data, this.store);
                this.items.push(fileItem);
            }
            this.syncInternal();
        };
        DataTransferItemList.prototype.syncInternal = function () {
            var _this = this;
            for (var i = 0; i < this.length; i++) {
                delete this[i];
            }
            this.items.forEach(function (item, j) {
                _this[j] = item;
            });
            this.length = this.items.length;
        };
        return DataTransferItemList;
    }());
    dnd.DataTransferItemList = DataTransferItemList;
    /**
     * While the DataTransferItem object's DataTransfer object is associated with
     * a drag data store and that drag data store's drag data store item list
     * still contains the item that the DataTransferItem object represents, the
     * DataTransferItem object's mode is the same as the drag data store mode.
     * When the DataTransferItem object's DataTransfer object is not associated
     * with a drag data store, or if the item that the DataTransferItem object
     * represents has been removed from the relevant drag data store item list,
     * the DataTransferItem object's mode is the disabled mode. The drag data
     * store referenced in this section (which is used only when the
     * DataTransferItem object is not in the disabled mode) is the drag data store
     * with which the DataTransferItem object's DataTransfer object is associated.
     *
     * @see https://html.spec.whatwg.org/multipage/interaction.html#datatransferitem
     */
    var DataTransferItem = (function () {
        function DataTransferItem(data, kind, typeLowerCase, store) {
            this.data = data;
            this.store = store;
            this.type = typeLowerCase;
            this.kind = kind;
        }
        DataTransferItem.prototype.getAsString = function (callback) {
            var _this = this;
            // If the callback is null, abort these steps.
            if (callback) {
                return;
            }
            // If the DataTransferItem object is not in the read/write mode or the
            // read-only mode, abort these steps. The callback is never invoked.
            if (this.store.mode !== "readwrite") {
                return;
            }
            // If the drag data item kind is not Plain Unicode string, abort these
            // steps. The callback is never invoked.
            if (this.kind !== "string") {
                return;
            }
            // Otherwise, queue a task to invoke callback, passing the actual data of
            // the item represented by the DataTransferItem object as the argument.
            setTimeout(function () {
                callback(_this.data);
            }, 0);
        };
        DataTransferItem.prototype.getAsFile = function () {
            // If the DataTransferItem object is not in the read/write mode or the
            // read-only mode, return null and abort these steps.
            if (this.store.mode !== "readwrite") {
                return null;
            }
            // If the drag data item kind is not File, then return null and abort
            // these steps.
            if (this.kind !== "string") {
                return null;
            }
            // Return a new File object representing the actual data of the item
            // represented by the DataTransferItem object.
            return this.data;
        };
        DataTransferItem.createForString = function (data, type, store) {
            return new DataTransferItem(data, "string", type, store);
        };
        DataTransferItem.createForFile = function (data, store) {
            return new DataTransferItem(data, "file", null, store);
        };
        return DataTransferItem;
    }());
    /**
     * @see https://heycam.github.io/webidl/#invalidstateerror
     */
    var InvalidStateError = (function (_super) {
        __extends(InvalidStateError, _super);
        function InvalidStateError(message) {
            _super.call(this, message);
            this.message = message;
            this.name = "InvalidStateError";
        }
        InvalidStateError.createByDefaultMessage = function () {
            return new InvalidStateError("The object is in an invalid state");
        };
        return InvalidStateError;
    }(Error));
    /**
     * @see https://heycam.github.io/webidl/#notsupportederror
     */
    var NotSupportedError = (function (_super) {
        __extends(NotSupportedError, _super);
        function NotSupportedError(message) {
            _super.call(this, message);
            this.message = message;
            this.name = "NotSupportedError";
        }
        NotSupportedError.createByDefaultMessage = function () {
            return new InvalidStateError("The operation is not supported");
        };
        return NotSupportedError;
    }(Error));
    /**
     * Return an array of URL strings.
     * @see http://tools.ietf.org/html/rfc2483
     */
    function parseTextUriList(textUriList) {
        // As for all text/(*) formats, lines are terminated with a CRLF pair.
        textUriList = textUriList.replace(/\r\n$/, "");
        if (textUriList === "") {
            return [];
        }
        return textUriList.split(/\r\n/).filter(function (line) {
            // Any lines beginning with the '#' character are comment lines
            // and are ignored during processing.
            // The remaining non-comment lines shall be URIs (URNs or URLs),
            // encoded according to the URL or URN specifications (RFC2141,
            // RFC1738 and RFC2396). Each URI shall appear on one and only one
            // line. Very long URIs are not broken in the text/uri-list format.
            // Content-transfer-encodings may be used to enforce line length
            // limitations.
            return line[0] !== "#";
        });
    }
    dnd.parseTextUriList = parseTextUriList;
    ;
})(dnd || (dnd = {}));
