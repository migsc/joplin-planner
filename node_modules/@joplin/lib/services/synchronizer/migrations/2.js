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
const types_1 = require("../utils/types");
function default_1(api) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            api.put('.sync/version.txt', '2'),
            api.put('.sync/readme.txt', '2020-07-16: In the new sync format, the version number is stored in /info.json. However, for backward compatibility, we need to keep the old version.txt file here, otherwise old clients will automatically recreate it, and assume a sync target version 1. So we keep it here but set its value to "2", so that old clients know that they need to be upgraded. This directory can be removed after a year or so, once we are confident that all clients have been upgraded to recent versions.'),
            api.mkdir(types_1.Dirnames.Locks),
            api.mkdir(types_1.Dirnames.Temp),
        ]);
    });
}
exports.default = default_1;
//# sourceMappingURL=2.js.map