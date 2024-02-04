"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncActionQueue_1 = require("../AsyncActionQueue");
const EventEmitter = require('events');
class UndoQueue {
    constructor() {
        this.inner_ = [];
        this.size_ = 20;
    }
    pop() {
        return this.inner_.pop();
    }
    push(e) {
        this.inner_.push(e);
        while (this.length > this.size_) {
            this.inner_.splice(0, 1);
        }
    }
    get length() {
        return this.inner_.length;
    }
    at(index) {
        return this.inner_[index];
    }
}
class UndoRedoService {
    constructor() {
        this.pushAsyncQueue = new AsyncActionQueue_1.default(700);
        this.undoStates = new UndoQueue();
        this.redoStates = new UndoQueue();
        this.eventEmitter = new EventEmitter();
        this.isUndoing = false;
        this.push = this.push.bind(this);
    }
    on(eventName, callback) {
        return this.eventEmitter.on(eventName, callback);
    }
    off(eventName, callback) {
        return this.eventEmitter.removeListener(eventName, callback);
    }
    push(state) {
        this.undoStates.push(state);
        this.redoStates = new UndoQueue();
        this.eventEmitter.emit('stackChange');
    }
    schedulePush(state) {
        this.pushAsyncQueue.push(() => __awaiter(this, void 0, void 0, function* () {
            this.push(state);
        }));
    }
    undo(redoState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUndoing)
                return;
            if (!this.canUndo)
                throw new Error('Nothing to undo');
            this.isUndoing = true;
            yield this.pushAsyncQueue.processAllNow();
            const state = this.undoStates.pop();
            this.redoStates.push(redoState);
            this.eventEmitter.emit('stackChange');
            this.isUndoing = false;
            return state;
        });
    }
    redo(undoState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUndoing)
                return;
            if (!this.canRedo)
                throw new Error('Nothing to redo');
            this.isUndoing = true;
            yield this.pushAsyncQueue.processAllNow();
            const state = this.redoStates.pop();
            this.undoStates.push(undoState);
            this.eventEmitter.emit('stackChange');
            this.isUndoing = false;
            return state;
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            this.undoStates = new UndoQueue();
            this.redoStates = new UndoQueue();
            this.isUndoing = false;
            const output = this.pushAsyncQueue.reset();
            this.eventEmitter.emit('stackChange');
            return output;
        });
    }
    get canUndo() {
        return !!this.undoStates.length;
    }
    get canRedo() {
        return !!this.redoStates.length;
    }
}
exports.default = UndoRedoService;
//# sourceMappingURL=UndoRedoService.js.map