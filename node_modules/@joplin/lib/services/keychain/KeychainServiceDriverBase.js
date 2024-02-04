"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeychainServiceDriverBase {
    constructor(appId, clientId) {
        this.appId_ = appId;
        this.clientId_ = clientId;
    }
    get appId() {
        return this.appId_;
    }
    get clientId() {
        return this.clientId_;
    }
}
exports.default = KeychainServiceDriverBase;
//# sourceMappingURL=KeychainServiceDriverBase.js.map