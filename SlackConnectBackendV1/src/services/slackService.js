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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var axios_1 = require("axios");
var SlackService = /** @class */ (function () {
    function SlackService() {
        this.clientId = process.env.SLACK_CLIENT_ID;
        this.clientSecret = process.env.SLACK_CLIENT_SECRET;
        this.redirectUri = process.env.SLACK_REDIRECT_URI;
        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            throw new Error('Missing required Slack environment variables');
        }
    }
    SlackService.prototype.getAuthUrl = function () {
        var scopes = [
            'channels:read',
            'chat:write',
            'users:read',
            'team:read',
            'chat:write.public',
            'groups:read',
            'mpim:read',
            'im:read'
        ].join(',');
        var params = new URLSearchParams({
            client_id: this.clientId,
            scope: scopes,
            redirect_uri: this.redirectUri,
        });
        console.log('Generated Slack OAuth URL');
        return "https://slack.com/oauth/v2/authorize?".concat(params.toString());
    };
    SlackService.prototype.exchangeCodeForToken = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('Exchanging OAuth code for tokens');
                        return [4 /*yield*/, axios_1.default.post('https://slack.com/api/oauth.v2.access', {
                                client_id: this.clientId,
                                client_secret: this.clientSecret,
                                code: code,
                                redirect_uri: this.redirectUri,
                            }, {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        console.log('OAuth token exchange response status:', response.status);
                        if (!response.data.ok) {
                            console.error('OAuth token exchange failed:', response.data);
                            throw new Error(response.data.error || 'Failed to exchange code for token');
                        }
                        console.log('OAuth token exchange successful');
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _c.sent();
                        console.error('Error exchanging code for token:', error_1);
                        if (axios_1.default.isAxiosError(error_1)) {
                            console.error('Response data:', (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data);
                            console.error('Response status:', (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.status);
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.sendMessage = function (accessToken, channel, text) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('Sending message to Slack channel:', channel);
                        return [4 /*yield*/, axios_1.default.post('https://slack.com/api/chat.postMessage', {
                                channel: channel,
                                text: text,
                            }, {
                                headers: {
                                    Authorization: "Bearer ".concat(accessToken),
                                    'Content-Type': 'application/json',
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        console.log('Message send response status:', response.status);
                        if (!response.data.ok) {
                            console.error('Failed to send message:', response.data);
                            throw new Error(response.data.error);
                        }
                        console.log('Message sent successfully');
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _c.sent();
                        console.error('Error sending message:', error_2);
                        if (axios_1.default.isAxiosError(error_2)) {
                            console.error('Response data:', (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data);
                            console.error('Response status:', (_b = error_2.response) === null || _b === void 0 ? void 0 : _b.status);
                        }
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.testToken = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var authResponse, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Testing token validity...');
                        return [4 /*yield*/, axios_1.default.get('https://slack.com/api/auth.test', {
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        authResponse = _a.sent();
                        return [2 /*return*/, authResponse.data.ok];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error testing token:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var authResponse, userId, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('Getting user info...');
                        return [4 /*yield*/, axios_1.default.get('https://slack.com/api/auth.test', {
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken),
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        authResponse = _a.sent();
                        if (!authResponse.data.ok) {
                            throw new Error(authResponse.data.error);
                        }
                        userId = authResponse.data.user_id;
                        return [4 /*yield*/, axios_1.default.get('https://slack.com/api/users.info', {
                                headers: {
                                    Authorization: "Bearer ".concat(accessToken),
                                },
                                params: {
                                    user: userId,
                                },
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.data.ok) {
                            console.error('Failed to get user info:', response.data);
                            throw new Error(response.data.error);
                        }
                        console.log('User info retrieved successfully');
                        return [2 /*return*/, response.data.user];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error getting user info:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.getChannels = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, channels, filteredChannels, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting channels...');
                        return [4 /*yield*/, axios_1.default.get('https://slack.com/api/conversations.list', {
                                headers: {
                                    Authorization: "Bearer ".concat(accessToken),
                                },
                                params: {
                                    exclude_archived: true,
                                    limit: 1000,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.data.ok) {
                            console.error('Failed to get channels:', response.data);
                            return [2 /*return*/, this.getFallbackChannels()];
                        }
                        channels = response.data.channels || [];
                        filteredChannels = channels.filter(function (channel) {
                            return channel.is_channel && !channel.is_archived;
                        });
                        return [2 /*return*/, filteredChannels.length > 0 ? filteredChannels : this.getFallbackChannels()];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error getting channels:', error_5);
                        return [2 /*return*/, this.getFallbackChannels()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.getChannelsWithBotToken = function (botToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, channels, filteredChannels, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Getting channels with bot token...');
                        return [4 /*yield*/, axios_1.default.get('https://slack.com/api/conversations.list', {
                                headers: {
                                    Authorization: "Bearer ".concat(botToken),
                                },
                                params: {
                                    types: 'public_channel,private_channel',
                                    exclude_archived: true,
                                    limit: 1000,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.data.ok) {
                            console.error('Failed to get channels with bot token:', response.data);
                            return [2 /*return*/, this.getFallbackChannels()];
                        }
                        channels = response.data.channels || [];
                        filteredChannels = channels.filter(function (channel) {
                            return channel.is_channel && !channel.is_archived;
                        });
                        return [2 /*return*/, filteredChannels.length > 0 ? filteredChannels : this.getFallbackChannels()];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error getting channels with bot token:', error_6);
                        return [2 /*return*/, this.getFallbackChannels()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SlackService.prototype.getFallbackChannels = function () {
        return [
            {
                id: 'general',
                name: 'general',
                is_channel: true,
                is_archived: false,
                is_general: true,
                is_member: true,
                is_private: false,
                is_mpim: false,
                is_group: false,
                is_im: false,
                is_shared: false
            }
        ];
    };
    SlackService.prototype.sendWebhookMessage = function (webhookUrl, message) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.post(webhookUrl, message, {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            })];
                    case 1:
                        _a.sent();
                        console.log('Webhook message sent successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error sending webhook message:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SlackService;
}());
exports.default = SlackService;
