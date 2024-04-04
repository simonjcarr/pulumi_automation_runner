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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var hcloud = require("@pulumi/hcloud");
var automation_1 = require("@pulumi/pulumi/automation");
var mongoose_1 = require("mongoose");
dotenv.config();
var testMongoose = function () { return __awaiter(void 0, void 0, void 0, function () {
    var MyModel;
    return __generator(this, function (_a) {
        mongoose_1.default.connect('mongodb://localhost:27017/infrastructure', { authSource: "admin", user: "root", pass: "Passw0rd" });
        MyModel = mongoose_1.default.model('Test', new Schema({ name: String }));
        return [2 /*return*/];
    });
}); };
var Schema = mongoose_1.default.Schema;
var UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
});
var memberSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member'
    }
});
var projectSchema = new Schema({
    name: String,
    description: String,
    cores: Number,
    memory: Number,
    disk: Number,
    members: [memberSchema]
});
var vmSchema = new Schema({
    image: String,
    name: String,
    privNetworkIP: String,
    serverType: String
});
testMongoose();
var UserModel = mongoose_1.default.model('User', UserSchema);
var projectModel = mongoose_1.default.model('Project', projectSchema);
var vmModel = mongoose_1.default.model('VM', vmSchema);
//find project by name
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var project;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, projectModel.findOne({ name: "project1" })];
            case 1:
                project = _a.sent();
                console.log(project);
                return [2 /*return*/];
        }
    });
}); })();
// const vmList:any = [
//     {
//         id: "6696ba32-8168-4124-9d82-9ed390a7fdbf",
//         image: "ubuntu-22.04",
//         name: "vm1",
//         privNetworkIP: "10.0.1.16",
//         serverType: "cx11"
//     },
//     {
//         id: "55fbb38d-10a9-4551-a74c-a8538b3fb819",
//         image: "ubuntu-22.04",
//         name: "vm2",
//         privNetworkIP: "10.0.1.15",
//         serverType: "cx11"
//     },
// ]
var destroyList = [];
var vmList = [];
var pulumiProgram = function () { return __awaiter(void 0, void 0, void 0, function () {
    var privNet_1, privNet_subnet, vmOutputs;
    return __generator(this, function (_a) {
        try {
            privNet_1 = new hcloud.Network("privNet", { ipRange: "10.0.0.0/16" });
            privNet_subnet = new hcloud.NetworkSubnet("default", {
                type: "cloud",
                networkId: privNet_1.id.apply(function (id) { return id; }),
                networkZone: "eu-central",
                ipRange: "10.0.1.0/24"
            });
            vmOutputs = vmList.map(function (vm) {
                var server = new hcloud.Server(vm.id, {
                    image: vm.image,
                    name: vm.name,
                    publicNets: [
                        {
                            ipv4Enabled: true,
                            ipv6Enabled: true
                        }
                    ],
                    serverType: vm.serverType,
                    networks: [
                        {
                            networkId: privNet_1.id.apply(function (id) { return id; }),
                            ip: vm.privNetworkIP
                        }
                    ]
                });
                return {
                    id: vm.id,
                    urn: server.urn
                };
            });
            return [2 /*return*/, {
                    vms: vmOutputs
                }];
        }
        catch (error) {
            console.log("Error in pulumi program", error);
        }
        return [2 /*return*/];
    });
}); };
var args = {
    stackName: "dev",
    projectName: "inlineNode",
    program: pulumiProgram,
};
var stackUpdate = function () { return __awaiter(void 0, void 0, void 0, function () {
    var stackDown, stack, hcloudToken, upRes, vmOutputs, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                stackDown = true;
                return [4 /*yield*/, automation_1.LocalWorkspace.createOrSelectStack(args)];
            case 1:
                stack = _a.sent();
                stack;
                hcloudToken = process.env.HCLOUD_TOKEN;
                console.log("***********************************************", hcloudToken);
                if (!hcloudToken) {
                    throw new Error('HCLOUD_TOKEN is not set in the environment variables');
                }
                return [4 /*yield*/, stack.setConfig("hcloud:token", { value: hcloudToken })];
            case 2:
                _a.sent();
                if (!(destroyList.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, stack.destroy({ onOutput: console.info, target: destroyList })];
            case 3:
                _a.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, stack.up({ onOutput: console.info })];
            case 5:
                upRes = _a.sent();
                vmOutputs = upRes.outputs.vms.value;
                // vmOutputs is an array of objects with `id` and `urn`
                console.log(vmOutputs);
                // Here you can iterate over vmOutputs to update your database
                vmOutputs.forEach(function (vm) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log("output", vm);
                        return [2 /*return*/];
                    });
                }); });
                _a.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.log("Error updating stack.", error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var updating = false;
//Poll for VM changes every 5 seconds
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var vmData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (updating) {
                    return [2 /*return*/];
                }
                updating = true;
                return [4 /*yield*/, vmModel.find()
                    //set vmList to the new data but convert ObjectId to string
                ];
            case 1:
                vmData = _a.sent();
                //set vmList to the new data but convert ObjectId to string
                vmList = vmData.map(function (vm) {
                    return {
                        id: vm._id.toString(),
                        image: vm.image,
                        name: vm.name,
                        privNetworkIP: vm.privNetworkIP,
                        serverType: vm.serverType
                    };
                });
                console.log(vmList);
                stackUpdate().then(function () {
                    updating = false;
                }).catch(function (error) {
                    console.log("Error updating stack.", error);
                    updating = false;
                });
                return [2 /*return*/];
        }
    });
}); }, 10000);
