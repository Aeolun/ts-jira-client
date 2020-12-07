"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var request_promise_1 = __importDefault(require("request-promise"));
var url = __importStar(require("url"));
/**
 * @name JiraApi
 * @class
 * Wrapper for the JIRA Rest Api
 * https://docs.atlassian.com/jira/REST/6.4.8/
 */
var JiraApi = /** @class */ (function () {
    /**
     * @constructor
     * @function
     * @param {JiraApiOptions} options
     */
    function JiraApi(options) {
        this.protocol = options.protocol || 'http';
        this.host = options.host;
        this.port = options.port || null;
        this.apiVersion = options.apiVersion || '2';
        this.base = options.base || '';
        this.intermediatePath = options.intermediatePath;
        this.strictSSL = options.hasOwnProperty('strictSSL')
            ? options.strictSSL
            : true;
        // This is so we can fake during unit tests
        this.request = options.request || request_promise_1["default"];
        this.webhookVersion = options.webHookVersion || '1.0';
        this.greenhopperVersion = options.greenhopperVersion || '1.0';
        this.baseOptions = {};
        if (options.ca) {
            this.baseOptions.ca = options.ca;
        }
        if (options.oauth &&
            options.oauth.consumer_key &&
            options.oauth.access_token) {
            this.baseOptions.oauth = {
                consumer_key: options.oauth.consumer_key,
                consumer_secret: options.oauth.consumer_secret,
                token: options.oauth.access_token,
                token_secret: options.oauth.access_token_secret,
                signature_method: options.oauth.signature_method || 'RSA-SHA1'
            };
        }
        else if (options.bearer) {
            this.baseOptions.auth = {
                user: '',
                pass: '',
                sendImmediately: true,
                bearer: options.bearer
            };
        }
        else if (options.username && options.password) {
            this.baseOptions.auth = {
                user: options.username,
                pass: options.password
            };
        }
        if (options.timeout) {
            this.baseOptions.timeout = options.timeout;
        }
    }
    /**
     * @typedef JiraApiOptions
     * @type {object}
     * @property {string} [protocol=http] - What protocol to use to connect to
     * jira? Ex: http|https
     * @property {string} host - What host is this tool connecting to for the jira
     * instance? Ex: jira.somehost.com
     * @property {string} [port] - What port is this tool connecting to jira with? Only needed for
     * none standard ports. Ex: 8080, 3000, etc
     * @property {string} [username] - Specify a username for this tool to authenticate all
     * requests with.
     * @property {string} [password] - Specify a password for this tool to authenticate all
     * requests with. Cloud users need to generate an [API token](https://confluence.atlassian.com/cloud/api-tokens-938839638.html) for this value.
     * @property {string} [apiVersion=2] - What version of the jira rest api is the instance the
     * tool is connecting to?
     * @property {string} [base] - What other url parts exist, if any, before the rest/api/
     * section?
     * @property {string} [intermediatePath] - If specified, overwrites the default rest/api/version
     * section of the uri
     * @property {boolean} [strictSSL=true] - Does this tool require each request to be
     * authenticated?  Defaults to true.
     * @property {function} [request] - What method does this tool use to make its requests?
     * Defaults to request from request-promise
     * @property {number} [timeout] - Integer containing the number of milliseconds to wait for a
     * server to send response headers (and start the response body) before aborting the request. Note
     * that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout
     * will overrule the timeout option ([the default in Linux can be anywhere from 20-120 *
     * seconds](http://www.sekuda.com/overriding_the_default_linux_kernel_20_second_tcp_socket_connect_timeout)).
     * @property {string} [webhookVersion=1.0] - What webhook version does this api wrapper need to
     * hit?
     * @property {string} [greenhopperVersion=1.0] - What webhook version does this api wrapper need
     * to hit?
     * @property {string} [ca] - Specify a CA certificate
     * @property {OAuth} [oauth] - Specify an OAuth object for this tool to authenticate all requests
     * using OAuth.
     * @property {string} [bearer] - Specify an OAuth bearer token to authenticate all requests with.
     */
    /**
     * @typedef OAuth
     * @type {object}
     * @property {string} consumer_key - The consumer entered in Jira Preferences.
     * @property {string} consumer_secret - The private RSA file.
     * @property {string} access_token - The generated access token.
     * @property {string} access_token_secret - The generated access toke secret.
     * @property {string} signature_method [signature_method=RSA-SHA1] - OAuth signurate methode
     * Possible values RSA-SHA1, HMAC-SHA1, PLAINTEXT. Jira Cloud supports only RSA-SHA1.
     */
    /**
     *  @typedef {object} UriOptions
     *  @property {string} pathname - The url after the specific functions path
     *  @property {object} [query] - An object of all query parameters
     *  @property {string} [intermediatePath] - Overwrites with specified path
     */
    /**
     * @name makeRequestHeader
     * @function
     * Creates a requestOptions object based on the default template for one
     * @param {string} uri
     * @param {object} [options] - an object containing fields and formatting how the
     */
    JiraApi.prototype.makeRequestHeader = function (uri, options) {
        if (options === void 0) { options = {}; }
        return __assign({ rejectUnauthorized: this.strictSSL, method: options.method || 'GET', uri: uri, json: true }, options);
    };
    /**
     * @typedef makeRequestHeaderOptions
     * @type {object}
     * @property {string} [method] - HTTP Request Method. ie GET, POST, PUT, DELETE
     */
    /**
     * @name makeUri
     * @function
     * Creates a URI object for a given pathname
     * @param {object} [options] - an object containing path information
     */
    JiraApi.prototype.makeUri = function (_a) {
        var pathname = _a.pathname, query = _a.query, intermediatePath = _a.intermediatePath, _b = _a.encode, encode = _b === void 0 ? false : _b;
        var intermediateToUse = this.intermediatePath || intermediatePath;
        var tempPath = intermediateToUse || "/rest/api/" + this.apiVersion;
        var uri = url.format({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            pathname: "" + this.base + tempPath + pathname,
            query: query
        });
        return encode ? encodeURI(uri) : decodeURIComponent(uri);
    };
    /**
     * @typedef makeUriOptions
     * @type {object}
     * @property {string} pathname - The url after the /rest/api/version
     * @property {object} query - a query object
     * @property {string} intermediatePath - If specified will overwrite the /rest/api/version section
     */
    /**
     * @name makeWebhookUri
     * @function
     * Creates a URI object for a given pathName
     * @param {object} [options] - An options object specifying uri information
     */
    JiraApi.prototype.makeWebhookUri = function (_a) {
        var pathname = _a.pathname, intermediatePath = _a.intermediatePath;
        var intermediateToUse = this.intermediatePath || intermediatePath;
        var tempPath = intermediateToUse || "/rest/webhooks/" + this.webhookVersion;
        var uri = url.format({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            pathname: "" + this.base + tempPath + pathname
        });
        return decodeURIComponent(uri);
    };
    /**
     * @typedef makeWebhookUriOptions
     * @type {object}
     * @property {string} pathname - The url after the /rest/webhooks
     * @property {string} intermediatePath - If specified will overwrite the /rest/webhooks section
     */
    /**
     * @name makeSprintQueryUri
     * @function
     * Creates a URI object for a given pathName
     * @param {object} [options] - The url after the /rest/
     */
    JiraApi.prototype.makeSprintQueryUri = function (_a) {
        var pathname = _a.pathname, query = _a.query, intermediatePath = _a.intermediatePath;
        var intermediateToUse = this.intermediatePath || intermediatePath;
        var tempPath = intermediateToUse || "/rest/greenhopper/" + this.greenhopperVersion;
        var uri = url.format({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            pathname: "" + this.base + tempPath + pathname,
            query: query
        });
        return decodeURIComponent(uri);
    };
    /**
     * @typedef makeSprintQueryUriOptions
     * @type {object}
     * @property {string} pathname - The url after the /rest/api/version
     * @property {object} query - a query object
     * @property {string} intermediatePath - will overwrite the /rest/greenhopper/version section
     */
    /**
     * @typedef makeDevStatusUri
     * @function
     * Creates a URI object for a given pathname
     * @arg {pathname, query, intermediatePath} obj1
     * @param {string} pathname obj1.pathname - The url after the /rest/api/version
     * @param {object} query obj1.query - a query object
     * @param {string} intermediatePath obj1.intermediatePath - If specified will overwrite the
     * /rest/dev-status/latest/issue/detail section
     */
    JiraApi.prototype.makeDevStatusUri = function (_a) {
        var pathname = _a.pathname, query = _a.query, intermediatePath = _a.intermediatePath;
        var intermediateToUse = this.intermediatePath || intermediatePath;
        var tempPath = intermediateToUse || '/rest/dev-status/latest/issue';
        var uri = url.format({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            pathname: "" + this.base + tempPath + pathname,
            query: query
        });
        return decodeURIComponent(uri);
    };
    /**
     * @name makeAgile1Uri
     * @function
     * Creates a URI object for a given pathname
     * @param {UriOptions} object
     */
    JiraApi.prototype.makeAgileUri = function (object) {
        var intermediateToUse = this.intermediatePath || object.intermediatePath;
        var tempPath = intermediateToUse || '/rest/agile/1.0';
        var uri = url.format({
            protocol: this.protocol,
            hostname: this.host,
            port: this.port,
            pathname: "" + this.base + tempPath + object.pathname,
            query: object.query
        });
        return decodeURIComponent(uri);
    };
    /**
     * @name doRequest
     * @function
     * Does a request based on the requestOptions object
     * @param {object} requestOptions - fields on this object get posted as a request header for
     * requests to jira
     */
    JiraApi.prototype.doRequest = function (requestOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var options, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = __assign(__assign({}, this.baseOptions), requestOptions);
                        return [4 /*yield*/, this.request(options)];
                    case 1:
                        response = _a.sent();
                        if (response) {
                            if (Array.isArray(response.errorMessages) &&
                                response.errorMessages.length > 0) {
                                throw new Error(response.errorMessages.join(', '));
                            }
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * @name findIssue
     * @function
     * Find an issue in jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290709)
     * @param {string} issueNumber - The issue number to search for including the project key
     * @param {string} expand - The resource expansion to return additional fields in the response
     * @param {string} fields - Comma separated list of field ids or keys to retrieve
     * @param {string} properties - Comma separated list of properties to retrieve
     * @param {boolean} fieldsByKeys - False by default, used to retrieve fields by key instead of id
     */
    JiraApi.prototype.findIssue = function (issueNumber, expand, fields, properties, fieldsByKeys) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber,
            query: {
                expand: expand || '',
                fields: fields || '*all',
                properties: properties || '*all',
                fieldsByKeys: fieldsByKeys || false
            }
        })));
    };
    /**
     * @name downloadAttachment
     * @function
     * Download an attachment
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288524)
     * @param {object} attachment - the attachment
     */
    JiraApi.prototype.downloadAttachment = function (attachment) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/attachment/" + attachment.id + "/" + attachment.filename,
            intermediatePath: '/secure',
            encode: true
        }), { json: false, encoding: null }));
    };
    /**
     * @name getUnresolvedIssueCount
     * @function
     * Get the unresolved issue count
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288524)
     * @param {string} version - the version of your product you want to find the unresolved
     * issues of.
     */
    JiraApi.prototype.getUnresolvedIssueCount = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var requestHeaders, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestHeaders = this.makeRequestHeader(this.makeUri({
                            pathname: "/version/" + version + "/unresolvedIssueCount"
                        }));
                        return [4 /*yield*/, this.doRequest(requestHeaders)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.issuesUnresolvedCount];
                }
            });
        });
    };
    /**
     * @name getProject
     * @function
     * Get the Project by project key
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289232)
     * @param {string} project - key for the project
     */
    JiraApi.prototype.getProject = function (project) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/project/" + project
        })));
    };
    /**
     * @name createProject
     * @function
     * Create a new Project
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/project-createProject)
     * @param {object} project - with specs
     */
    JiraApi.prototype.createProject = function (project) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/project/'
        }), {
            method: 'POST',
            body: project
        }));
    };
    /** Find the Rapid View for a specified project
     * @name findRapidView
     * @function
     * @param {string} projectName - name for the project
     */
    JiraApi.prototype.findRapidView = function (projectName) {
        return __awaiter(this, void 0, void 0, function () {
            var response, rapidViewResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
                            pathname: '/rapidviews/list'
                        })))];
                    case 1:
                        response = _a.sent();
                        if (typeof projectName === 'undefined' || projectName === null)
                            return [2 /*return*/, response.views];
                        rapidViewResult = response.views.find(function (x) { return x.name.toLowerCase() === projectName.toLowerCase(); });
                        return [2 /*return*/, rapidViewResult];
                }
            });
        });
    };
    /** Get the most recent sprint for a given rapidViewId
     * @name getLastSprintForRapidView
     * @function
     * @param {string} rapidViewId - the id for the rapid view
     */
    JiraApi.prototype.getLastSprintForRapidView = function (rapidViewId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
                            pathname: "/sprintquery/" + rapidViewId
                        })))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.sprints.pop()];
                }
            });
        });
    };
    /** Get the issues for a rapidView / sprint
     * @name getSprintIssues
     * @function
     * @param {string} rapidViewId - the id for the rapid view
     * @param {string} sprintId - the id for the sprint
     */
    JiraApi.prototype.getSprintIssues = function (rapidViewId, sprintId) {
        return this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
            pathname: '/rapid/charts/sprintreport',
            query: {
                rapidViewId: rapidViewId,
                sprintId: sprintId
            }
        })));
    };
    /** Get a list of Sprints belonging to a Rapid View
     * @name listSprints
     * @function
     * @param {string} rapidViewId - the id for the rapid view
     */
    JiraApi.prototype.listSprints = function (rapidViewId) {
        return this.doRequest(this.makeRequestHeader(this.makeSprintQueryUri({
            pathname: "/sprintquery/" + rapidViewId
        })));
    };
    /** Add an issue to the project's current sprint
     * @name addIssueToSprint
     * @function
     * @param {string} issueId - the id of the existing issue
     * @param {string} sprintId - the id of the sprint to add it to
     */
    JiraApi.prototype.addIssueToSprint = function (issueId, sprintId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/sprint/" + sprintId + "/issues/add"
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: {
                issueKeys: [issueId]
            }
        }));
    };
    /** Create an issue link between two issues
     * @name issueLink
     * @function
     * @param {object} link - a link object formatted how the Jira API specifies
     */
    JiraApi.prototype.issueLink = function (link) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/issueLink'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: link
        }));
    };
    /** List all issue link types jira knows about
     * [Jira Doc](https://docs.atlassian.com/software/jira/docs/api/REST/8.5.0/#api/2/issueLinkType-getIssueLinkTypes)
     * @name listIssueLinkTypes
     * @function
     */
    JiraApi.prototype.listIssueLinkTypes = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/issueLinkType'
        })));
    };
    /** Retrieves the remote links associated with the given issue.
     * @name getRemoteLinks
     * @function
     * @param {string} issueNumber - the issue number to find remote links for.
     */
    JiraApi.prototype.getRemoteLinks = function (issueNumber) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber + "/remotelink"
        })));
    };
    /**
     * @name createRemoteLink
     * @function
     * Creates a remote link associated with the given issue.
     * @param {string} issueNumber - The issue number to create the remotelink under
     * @param {object} remoteLink - the remotelink object as specified by the Jira API
     */
    JiraApi.prototype.createRemoteLink = function (issueNumber, remoteLink) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber + "/remotelink"
        }), {
            method: 'POST',
            body: remoteLink
        }));
    };
    /** Get Versions for a project
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289653)
     * @name getVersions
     * @function
     * @param {string} project - A project key to get versions for
     */
    JiraApi.prototype.getVersions = function (project) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/project/" + project + "/versions"
        })));
    };
    /** Get details of single Version in project
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/version-getVersion)
     * @name getVersion
     * @function
     * @param {string} version - The id of this version
     */
    JiraApi.prototype.getVersion = function (version) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/version/" + version
        })));
    };
    /** Create a version
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288232)
     * @name createVersion
     * @function
     * @param {object} version - an object of the new version
     */
    JiraApi.prototype.createVersion = function (version) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/version'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: version
        }));
    };
    /** Update a version
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e510)
     * @name updateVersion
     * @function
     * @param {object} version - an new object of the version to update
     */
    JiraApi.prototype.updateVersion = function (version) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/version/" + version.id
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: version
        }));
    };
    /** Delete a version
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/version-delete)
     * @name deleteVersion
     * @function
     * @param {string} versionId - the ID of the version to delete
     * @param {string} moveFixIssuesToId - when provided, existing fixVersions will be moved
     *                 to this ID. Otherwise, the deleted version will be removed from all
     *                 issue fixVersions.
     * @param {string} moveAffectedIssuesToId - when provided, existing affectedVersions will
     *                 be moved to this ID. Otherwise, the deleted version will be removed
     *                 from all issue affectedVersions.
     */
    JiraApi.prototype.deleteVersion = function (versionId, moveFixIssuesToId, moveAffectedIssuesToId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/version/" + versionId
        }), {
            method: 'DELETE',
            followAllRedirects: true,
            qs: {
                moveFixIssuesTo: moveFixIssuesToId,
                moveAffectedIssuesTo: moveAffectedIssuesToId
            }
        }));
    };
    /** Move version
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/version-moveVersion)
     * @name moveVersion
     * @function
     * @param {string} versionId - the ID of the version to delete
     * @param {string} position - an object of the new position
     */
    JiraApi.prototype.moveVersion = function (versionId, position) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/version/" + versionId + "/move"
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: position
        }));
    };
    /** Pass a search query to Jira
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e4424)
     * @name searchJira
     * @function
     * @param {string} searchString - jira query string in JQL
     * @param {object} optional - object containing any of the following properties
     * @param {integer} [optional.startAt=0]: optional starting index number
     * @param {integer} [optional.maxResults=50]: optional The maximum number of items to
     *                  return per page. To manage page size, Jira may return fewer items per
     *                  page where a large number of fields are requested.
     * @param {array} [optional.fields]: optional array of string names of desired fields
     * @param {array} [optional.expand]: optional array of string names of desired expand nodes
     */
    JiraApi.prototype.searchJira = function (searchString, optional) {
        if (optional === void 0) { optional = {}; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/search'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: __assign({ jql: searchString }, optional)
        }));
    };
    /** Create a Jira user
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/user-createUser)
     * @name createUser
     * @function
     * @param {object} user - Properly Formatted User object
     */
    JiraApi.prototype.createUser = function (user) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/user'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: user
        }));
    };
    /** Search user on Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#d2e3756)
     * @name searchUsers
     * @function
     * @param {SearchUserOptions} options
     */
    JiraApi.prototype.searchUsers = function (_a) {
        var username = _a.username, query = _a.query, startAt = _a.startAt, maxResults = _a.maxResults, includeActive = _a.includeActive, includeInactive = _a.includeInactive;
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/user/search',
            query: {
                username: username,
                query: query,
                startAt: startAt || 0,
                maxResults: maxResults || 50,
                includeActive: includeActive || true,
                includeInactive: includeInactive || false
            }
        }), {
            followAllRedirects: true
        }));
    };
    /**
     * @typedef SearchUserOptions
     * @type {object}
     * @property {string} username - (DEPRECATED) A query string used to search username, name or
     * e-mail address
     * @property {string} query - A query string that is matched against user attributes
     * (displayName, and emailAddress) to find relevant users. The string can match the prefix of
     * the attribute's value. For example, query=john matches a user with a displayName of John
     * Smith and a user with an emailAddress of johnson@example.com. Required, unless accountId
     * or property is specified.
     * @property {integer} [startAt=0] - The index of the first user to return (0-based)
     * @property {integer} [maxResults=50] - The maximum number of users to return
     * @property {boolean} [includeActive=true] - If true, then active users are included
     * in the results
     * @property {boolean} [includeInactive=false] - If true, then inactive users
     * are included in the results
     */
    /** Get all users in group on Jira
     * @name getUsersInGroup
     * @function
     * @param {string} groupname - A query string used to search users in group
     * @param {integer} [startAt=0] - The index of the first user to return (0-based)
     * @param {integer} [maxResults=50] - The maximum number of users to return (defaults to 50).
     */
    JiraApi.prototype.getUsersInGroup = function (groupname, startAt, maxResults) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/group',
            query: {
                groupname: groupname,
                expand: "users[" + startAt + ":" + maxResults + "]"
            }
        }), {
            followAllRedirects: true
        }));
    };
    /** Get issues related to a user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id296043)
     * @name getUsersIssues
     * @function
     * @param {string} username - username of user to search for
     * @param {boolean} open - determines if only open issues should be returned
     */
    JiraApi.prototype.getUsersIssues = function (username, open) {
        var openJql = open ? " AND status in (Open, 'In Progress', Reopened)" : '';
        return this.searchJira("assignee = " + username.replace('@', '\\u0040') + openJql, {});
    };
    /** Returns a user.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-user-get)
     * @name getUser
     * @function
     * @param {string} accountId - The accountId of user to search for
     * @param {string} expand - The expand for additional info (groups,applicationRoles)
     */
    JiraApi.prototype.getUser = function (accountId, expand) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/user',
            query: {
                accountId: accountId,
                expand: expand
            }
        })));
    };
    /** Returns a list of all (active and inactive) users.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-users-search-get)
     * @name getUsers
     * @function
     * @param {integer} [startAt=0] - The index of the first user to return (0-based)
     * @param {integer} [maxResults=50] - The maximum number of users to return (defaults to 50).
     */
    JiraApi.prototype.getUsers = function (startAt, maxResults) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 100; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/users',
            query: {
                startAt: startAt,
                maxResults: maxResults
            }
        })));
    };
    /** Add issue to Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
     * @name addNewIssue
     * @function
     * @param {object} issue - Properly Formatted Issue object
     */
    JiraApi.prototype.addNewIssue = function (issue) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/issue'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: issue
        }));
    };
    /** Add a user as a watcher on an issue
     * @name addWatcher
     * @function
     * @param {string} issueKey - the key of the existing issue
     * @param {string} username - the jira username to add as a watcher to the issue
     */
    JiraApi.prototype.addWatcher = function (issueKey, username) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueKey + "/watchers"
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: username
        }));
    };
    /** Change an assignee on an issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-assign)
     * @name assignee
     * @function
     * @param {string} issueKey - the key of the existing issue
     * @param {string} assigneeName - the jira username to add as a new assignee to the issue
     */
    JiraApi.prototype.updateAssignee = function (issueKey, assigneeName) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueKey + "/assignee"
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: { name: assigneeName }
        }));
    };
    /** Change an assignee on an issue
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issue-issueIdOrKey-assignee-put)
     * @name updateAssigneeWithId
     * @function
     * @param {string} issueKey - the key of the existing issue
     * @param {string} userId - the jira username to add as a new assignee to the issue
     */
    JiraApi.prototype.updateAssigneeWithId = function (issueKey, userId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueKey + "/assignee"
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: { accountId: userId }
        }));
    };
    /** Delete issue from Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290791)
     * @name deleteIssue
     * @function
     * @param {string} issueId - the Id of the issue to delete
     */
    JiraApi.prototype.deleteIssue = function (issueId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId
        }), {
            method: 'DELETE',
            followAllRedirects: true
        }));
    };
    /** Update issue in Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290878)
     * @name updateIssue
     * @function
     * @param {string} issueId - the Id of the issue to update
     * @param {object} issueUpdate - update Object as specified by the rest api
     * @param {object} query - adds parameters to the query string
     */
    JiraApi.prototype.updateIssue = function (issueId, issueUpdate, query) {
        if (query === void 0) { query = {}; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId,
            query: query
        }), {
            body: issueUpdate,
            method: 'PUT',
            followAllRedirects: true
        }));
    };
    /** Get issue edit metadata
     * [Jira Doc](https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/issue-getEditIssueMeta)
     * @name issueEditMeta
     * @function
     * @param {string} issueId - the Id of the issue to retrieve edit metadata for
     */
    JiraApi.prototype.issueEditMeta = function (issueId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/editmeta"
        }), {
            followAllRedirects: true
        }));
    };
    /** List Components
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listComponents
     * @function
     * @param {string} project - key for the project
     */
    JiraApi.prototype.listComponents = function (project) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/project/" + project + "/components"
        })));
    };
    /** Add component to Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
     * @name addNewComponent
     * @function
     * @param {object} component - Properly Formatted Component
     */
    JiraApi.prototype.addNewComponent = function (component) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/component'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: component
        }));
    };
    /** Update Jira component
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/component-updateComponent)
     * @name updateComponent
     * @function
     * @param {string} componentId - the Id of the component to update
     * @param {object} component - Properly Formatted Component
     */
    JiraApi.prototype.updateComponent = function (componentId, component) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/component/" + componentId
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: component
        }));
    };
    /** Delete component from Jira
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-component-id-delete)
     * @name deleteComponent
     * @function
     * @param {string} id - The ID of the component.
     * @param {string} moveIssuesTo - The ID of the component to replace the deleted component.
     *                                If this value is null no replacement is made.
     */
    JiraApi.prototype.deleteComponent = function (id, moveIssuesTo) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/component/" + id
        }), {
            method: 'DELETE',
            followAllRedirects: true,
            qs: moveIssuesTo ? { moveIssuesTo: moveIssuesTo } : null
        }));
    };
    /** Get count of issues assigned to the component.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-component-id-relatedIssueCounts-get)
     * @name relatedIssueCounts
     * @function
     * @param {string} id - Component Id.
     */
    JiraApi.prototype.relatedIssueCounts = function (id) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/component/" + id + "/relatedIssueCounts"
        })));
    };
    /** Create custom Jira field
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field-createCustomField)
     * @name createCustomField
     * @function
     * @param {object} field - Properly formatted Field object
     */
    JiraApi.prototype.createCustomField = function (field) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/field'
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: field
        }));
    };
    /** List all fields custom and not that jira knows about.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listFields
     * @function
     */
    JiraApi.prototype.listFields = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/field'
        })));
    };
    /** Add an option for a select list issue field.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-createOption)
     * @name createFieldOption
     * @function
     * @param {string} fieldKey - the key of the select list field
     * @param {object} option - properly formatted Option object
     */
    JiraApi.prototype.createFieldOption = function (fieldKey, option) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/field/" + fieldKey + "/option"
        }), {
            method: 'POST',
            followAllRedirects: true,
            body: option
        }));
    };
    /** Returns all options defined for a select list issue field.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-getAllOptions)
     * @name listFieldOptions
     * @function
     * @param {string} fieldKey - the key of the select list field
     */
    JiraApi.prototype.listFieldOptions = function (fieldKey) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/field/" + fieldKey + "/option"
        })));
    };
    /** Creates or updates an option for a select list issue field.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-putOption)
     * @name upsertFieldOption
     * @function
     * @param {string} fieldKey - the key of the select list field
     * @param {string} optionId - the id of the modified option
     * @param {object} option - properly formatted Option object
     */
    JiraApi.prototype.upsertFieldOption = function (fieldKey, optionId, option) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/field/" + fieldKey + "/option/" + optionId
        }), {
            method: 'PUT',
            followAllRedirects: true,
            body: option
        }));
    };
    /** Returns an option for a select list issue field.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-getOption)
     * @name getFieldOption
     * @function
     * @param {string} fieldKey - the key of the select list field
     * @param {string} optionId - the id of the option
     */
    JiraApi.prototype.getFieldOption = function (fieldKey, optionId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/field/" + fieldKey + "/option/" + optionId
        })));
    };
    /** Deletes an option from a select list issue field.
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-delete)
     * @name deleteFieldOption
     * @function
     * @param {string} fieldKey - the key of the select list field
     * @param {string} optionId - the id of the deleted option
     */
    JiraApi.prototype.deleteFieldOption = function (fieldKey, optionId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/field/" + fieldKey + "/option/" + optionId
        }), {
            method: 'DELETE',
            followAllRedirects: true
        }));
    };
    /**
     * @name getIssueProperty
     * @function
     * Get Property of Issue by Issue and Property Id
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue/{issueIdOrKey}/properties-getProperty)
     * @param {string} issueNumber - The issue number to search for including the project key
     * @param {string} property - The property key to search for
     */
    JiraApi.prototype.getIssueProperty = function (issueNumber, property) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber + "/properties/" + property
        })));
    };
    /**
     * @name getIssueChangelog
     * @function
     * List all changes for an issue, sorted by date, starting from the latest
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue/{issueIdOrKey}/changelog)
     * @param {string} issueNumber - The issue number to search for including the project key
     * @param {integer} [startAt=0] - optional starting index number
     * @param {integer} [maxResults=50] - optional ending index number
     */
    JiraApi.prototype.getIssueChangelog = function (issueNumber, startAt, maxResults) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber + "/changelog",
            query: {
                startAt: startAt,
                maxResults: maxResults
            }
        })));
    };
    /**
     * @name getIssueWatchers
     * @function
     * List all watchers for an issue
     * [Jira Doc](http://docs.atlassian.com/jira/REST/cloud/#api/2/issue-getIssueWatchers)
     * @param {string} issueNumber - The issue number to search for including the project key
     */
    JiraApi.prototype.getIssueWatchers = function (issueNumber) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueNumber + "/watchers"
        })));
    };
    /** List all priorities jira knows about
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listPriorities
     * @function
     */
    JiraApi.prototype.listPriorities = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/priority'
        })));
    };
    /** List Transitions for a specific issue that are available to the current user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name listTransitions
     * @function
     * @param {string} issueId - get transitions available for the issue
     */
    JiraApi.prototype.listTransitions = function (issueId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/transitions",
            query: {
                expand: 'transitions.fields'
            }
        })));
    };
    /** Transition issue in Jira
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
     * @name transitionsIssue
     * @function
     * @param {string} issueId - the Id of the issue to delete
     * @param {object} issueTransition - transition object from the jira rest API
     */
    JiraApi.prototype.transitionIssue = function (issueId, issueTransition) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/transitions"
        }), {
            body: issueTransition,
            method: 'POST',
            followAllRedirects: true
        }));
    };
    /** List all Viewable Projects
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289193)
     * @name listProjects
     * @function
     */
    JiraApi.prototype.listProjects = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/project'
        })));
    };
    /** Add a comment to an issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#id108798)
     * @name addComment
     * @function
     * @param {string} issueId - Issue to add a comment to
     * @param {string} comment - string containing comment
     */
    JiraApi.prototype.addComment = function (issueId, comment) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment"
        }), {
            body: {
                body: comment
            },
            method: 'POST',
            followAllRedirects: true
        }));
    };
    /** Add a comment to an issue, supports full comment object
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#id108798)
     * @name addCommentAdvanced
     * @function
     * @param {string} issueId - Issue to add a comment to
     * @param {object} comment - The object containing your comment data
     */
    JiraApi.prototype.addCommentAdvanced = function (issueId, comment) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment"
        }), {
            body: comment,
            method: 'POST',
            followAllRedirects: true
        }));
    };
    /** Update comment for an issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-updateComment)
     * @name updateComment
     * @function
     * @param {string} issueId - Issue with the comment
     * @param {string} commentId - Comment that is updated
     * @param {string} comment - string containing new comment
     * @param {object} [options={}] - extra options
     */
    JiraApi.prototype.updateComment = function (issueId, commentId, comment, options) {
        if (options === void 0) { options = {}; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment/" + commentId
        }), {
            body: __assign({ body: comment }, options),
            method: 'PUT',
            followAllRedirects: true
        }));
    };
    /**
     * @name getComments
     * @function
     * Get Comments by IssueId.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
     * @param {string} issueId - this issue this comment is on
     */
    JiraApi.prototype.getComments = function (issueId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment"
        })));
    };
    /**
     * @name getComment
     * @function
     * Get Comment by Id.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
     * @param {string} issueId - this issue this comment is on
     * @param {number} commentId - the id of the comment
     */
    JiraApi.prototype.getComment = function (issueId, commentId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment/" + commentId
        })));
    };
    /**
     * @name deleteComment
     * @function
     * Delete Comments by Id.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
     * @param {string} issueId - this issue this comment is on
     * @param {number} commentId - the id of the comment
     */
    JiraApi.prototype.deleteComment = function (issueId, commentId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/comment/" + commentId
        }), {
            method: 'DELETE',
            followAllRedirects: true
        }));
    };
    /** Add a worklog to a project
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id291617)
     * @name addWorklog
     * @function
     * @param {string} issueId - Issue to add a worklog to
     * @param {object} worklog - worklog object from the rest API
     * @param {object} newEstimate - the new value for the remaining estimate field
     * @param {object} [options={}] - extra options
     */
    JiraApi.prototype.addWorklog = function (issueId, worklog, newEstimate, options) {
        if (newEstimate === void 0) { newEstimate = null; }
        if (options === void 0) { options = {}; }
        var query = __assign(__assign({ adjustEstimate: newEstimate ? 'new' : 'auto' }, (newEstimate ? { newEstimate: newEstimate } : {})), options);
        var header = {
            uri: this.makeUri({
                pathname: "/issue/" + issueId + "/worklog",
                query: query
            }),
            body: worklog,
            method: 'POST',
            'Content-Type': 'application/json',
            json: true
        };
        return this.doRequest(header);
    };
    /** Get ids of worklogs modified since
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/worklog-getWorklogsForIds)
     * @name updatedWorklogs
     * @function
     * @param {number} since - a date time in unix timestamp format since when updated worklogs
     * will be returned.
     * @param {string} expand - ptional comma separated list of parameters to expand: properties
     * (provides worklog properties).
     */
    JiraApi.prototype.updatedWorklogs = function (since, expand) {
        var header = {
            uri: this.makeUri({
                pathname: '/worklog/updated',
                query: { since: since, expand: expand }
            }),
            method: 'GET',
            'Content-Type': 'application/json',
            json: true
        };
        return this.doRequest(header);
    };
    /** Delete worklog from issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e1673)
     * @name deleteWorklog
     * @function
     * @param {string} issueId - the Id of the issue to delete
     * @param {string} worklogId - the Id of the worklog in issue to delete
     */
    JiraApi.prototype.deleteWorklog = function (issueId, worklogId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/worklog/" + worklogId
        }), {
            method: 'DELETE',
            followAllRedirects: true
        }));
    };
    /** Deletes an issue link.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-issueLink-linkId-delete)
     * @name deleteIssueLink
     * @function
     * @param {string} linkId - the Id of the issue link to delete
     */
    JiraApi.prototype.deleteIssueLink = function (linkId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issueLink/" + linkId
        }), {
            method: 'DELETE',
            followAllRedirects: true
        }));
    };
    /** Returns worklog details for a list of worklog IDs.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-worklog-list-post)
     * @name getWorklogs
     * @function
     * @param {array} worklogsIDs - a list of worklog IDs.
     * @param {string} expand - expand to include additional information about worklogs
     *
     */
    JiraApi.prototype.getWorklogs = function (worklogsIDs, expand) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/worklog/list',
            query: {
                expand: expand
            }
        }), {
            method: 'POST',
            body: {
                ids: worklogsIDs
            }
        }));
    };
    /** Get worklogs list from a given issue
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-api-3-issue-issueIdOrKey-worklog-get)
     * @name getIssueWorklogs
     * @function
     * @param {string} issueId - the Id of the issue to find worklogs for
     * @param {integer} [startAt=0] - optional starting index number
     * @param {integer} [maxResults=1000] - optional ending index number
     */
    JiraApi.prototype.getIssueWorklogs = function (issueId, startAt, maxResults) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 1000; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/worklog",
            query: {
                startAt: startAt,
                maxResults: maxResults
            }
        })));
    };
    /** List all Issue Types jira knows about
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id295946)
     * @name listIssueTypes
     * @function
     */
    JiraApi.prototype.listIssueTypes = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/issuetype'
        })));
    };
    /** Register a webhook
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name registerWebhook
     * @function
     * @param {object} webhook - properly formatted webhook
     */
    JiraApi.prototype.registerWebhook = function (webhook) {
        return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
            pathname: '/webhook'
        }), {
            method: 'POST',
            body: webhook
        }));
    };
    /** List all registered webhooks
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name listWebhooks
     * @function
     */
    JiraApi.prototype.listWebhooks = function () {
        return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
            pathname: '/webhook'
        })));
    };
    /** Get a webhook by its ID
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name getWebhook
     * @function
     * @param {string} webhookID - id of webhook to get
     */
    JiraApi.prototype.getWebhook = function (webhookID) {
        return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
            pathname: "/webhook/" + webhookID
        })));
    };
    /** Delete a registered webhook
     * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
     * @name issueLink
     * @function
     * @param {string} webhookID - id of the webhook to delete
     */
    JiraApi.prototype.deleteWebhook = function (webhookID) {
        return this.doRequest(this.makeRequestHeader(this.makeWebhookUri({
            pathname: "/webhook/" + webhookID
        }), {
            method: 'DELETE'
        }));
    };
    /** Describe the currently authenticated user
     * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id2e865)
     * @name getCurrentUser
     * @function
     */
    JiraApi.prototype.getCurrentUser = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/myself'
        })));
    };
    /** Retrieve the backlog of a certain Rapid View
     * @name getBacklogForRapidView
     * @function
     * @param {string} rapidViewId - rapid view id
     */
    JiraApi.prototype.getBacklogForRapidView = function (rapidViewId) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/xboard/plan/backlog/data',
            query: {
                rapidViewId: rapidViewId
            }
        })));
    };
    /** Add attachment to a Issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/issue/{issueIdOrKey}/attachments-addAttachment)
     * @name addAttachmentOnIssue
     * @function
     * @param {string} issueId - issue id
     * @param {object} readStream - readStream object from fs
     */
    JiraApi.prototype.addAttachmentOnIssue = function (issueId, readStream) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/attachments"
        }), {
            method: 'POST',
            headers: {
                'X-Atlassian-Token': 'nocheck'
            },
            formData: {
                file: readStream
            }
        }));
    };
    /** Notify people related to issue
     * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-notify)
     * @name issueNotify
     * @function
     * @param {string} issueId - issue id
     * @param {object} notificationBody - properly formatted body
     */
    JiraApi.prototype.issueNotify = function (issueId, notificationBody) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/issue/" + issueId + "/notify"
        }), {
            method: 'POST',
            body: notificationBody
        }));
    };
    /** Get list of possible statuses
     * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/status-getStatuses)
     * @name listStatus
     * @function
     */
    JiraApi.prototype.listStatus = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/status'
        })));
    };
    /** Get a Dev-Status summary by issue ID
     * @name getDevStatusSummary
     * @function
     * @param {string} issueId - id of issue to get
     */
    JiraApi.prototype.getDevStatusSummary = function (issueId) {
        return this.doRequest(this.makeRequestHeader(this.makeDevStatusUri({
            pathname: '/summary',
            query: {
                issueId: issueId
            }
        })));
    };
    /** Get a Dev-Status detail by issue ID
     * @name getDevStatusDetail
     * @function
     * @param {string} issueId - id of issue to get
     * @param {string} applicationType - type of application (stash, bitbucket)
     * @param {string} dataType - info to return (repository, pullrequest)
     */
    JiraApi.prototype.getDevStatusDetail = function (issueId, applicationType, dataType) {
        return this.doRequest(this.makeRequestHeader(this.makeDevStatusUri({
            pathname: '/detail',
            query: {
                issueId: issueId,
                applicationType: applicationType,
                dataType: dataType
            }
        })));
    };
    /** Get issue
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-getIssue)
     * @name getIssue
     * @function
     * @param {string} issueIdOrKey - Id of issue
     * @param {string} [fields] - The list of fields to return for each issue.
     * @param {string} [expand] - A comma-separated list of the parameters to expand.
     */
    JiraApi.prototype.getIssue = function (issueIdOrKey, fields, expand) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/issue/" + issueIdOrKey,
            query: {
                fields: fields,
                expand: expand
            }
        })));
    };
    /** Move issues to backlog
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/backlog-moveIssuesToBacklog)
     * @name moveToBacklog
     * @function
     * @param {array} issues - id or key of issues to get
     */
    JiraApi.prototype.moveToBacklog = function (issues) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: '/backlog/issue'
        }), {
            method: 'POST',
            body: {
                issues: issues
            }
        }));
    };
    /** Get all boards
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getAllBoards)
     * @name getAllBoards
     * @function
     * @param {number} [startAt=0] - The starting index of the returned boards.
     * @param {number} [maxResults=50] - The maximum number of boards to return per page.
     * @param {string} [type] - Filters results to boards of the specified type.
     * @param {string} [name] - Filters results to boards that match the specified name.
     * @param {string} [projectKeyOrId] - Filters results to boards that are relevant to a project.
     */
    JiraApi.prototype.getAllBoards = function (startAt, maxResults, type, name, projectKeyOrId) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: '/board',
            query: __assign({ startAt: startAt,
                maxResults: maxResults,
                type: type,
                name: name }, (projectKeyOrId && { projectKeyOrId: projectKeyOrId }))
        })));
    };
    /** Create Board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-createBoard)
     * @name createBoard
     * @function
     * @param {object} boardBody - Board name, type and filter Id is required.
     * @param {string} boardBody.type - Valid values: scrum, kanban
     * @param {string} boardBody.name - Must be less than 255 characters.
     * @param {string} boardBody.filterId - Id of a filter that the user has permissions to view.
     */
    JiraApi.prototype.createBoard = function (boardBody) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: '/board'
        }), {
            method: 'POST',
            body: boardBody
        }));
    };
    /** Get Board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getBoard)
     * @name getBoard
     * @function
     * @param {string} boardId - Id of board to retrieve
     */
    JiraApi.prototype.getBoard = function (boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId
        })));
    };
    /** Delete Board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-deleteBoard)
     * @name deleteBoard
     * @function
     * @param {string} boardId - Id of board to retrieve
     */
    JiraApi.prototype.deleteBoard = function (boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId
        }), {
            method: 'DELETE'
        }));
    };
    /** Get issues for backlog
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getIssuesForBacklog)
     * @name getIssuesForBacklog
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned issues. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of issues to return per page. Default: 50.
     * @param {string} [jql] - Filters results using a JQL query.
     * @param {boolean} [validateQuery] - Specifies whether to validate the JQL query or not.
     * Default: true.
     * @param {string} [fields] - The list of fields to return for each issue.
     */
    JiraApi.prototype.getIssuesForBacklog = function (boardId, startAt, maxResults, jql, validateQuery, fields) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        if (validateQuery === void 0) { validateQuery = true; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/backlog",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                jql: jql,
                validateQuery: validateQuery,
                fields: fields
            }
        })));
    };
    /** Get Configuration
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getConfiguration)
     * @name getConfiguration
     * @function
     * @param {string} boardId - Id of board to retrieve
     */
    JiraApi.prototype.getConfiguration = function (boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/configuration"
        })));
    };
    /** Get issues for board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getIssuesForBoard)
     * @name getIssuesForBoard
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned issues. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of issues to return per page. Default: 50.
     * @param {string} [jql] - Filters results using a JQL query.
     * @param {boolean} [validateQuery] - Specifies whether to validate the JQL query or not.
     * Default: true.
     * @param {string} [fields] - The list of fields to return for each issue.
     */
    JiraApi.prototype.getIssuesForBoard = function (boardId, startAt, maxResults, jql, validateQuery, fields) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        if (validateQuery === void 0) { validateQuery = true; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/issue",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                jql: jql,
                validateQuery: validateQuery,
                fields: fields
            }
        })));
    };
    /** Get issue estimation for board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-getIssueEstimationForBoard)
     * @name getIssueEstimationForBoard
     * @function
     * @param {string} issueIdOrKey - Id of issue
     * @param {number} boardId - The id of the board required to determine which field
     * is used for estimation.
     */
    JiraApi.prototype.getIssueEstimationForBoard = function (issueIdOrKey, boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/issue/" + issueIdOrKey + "/estimation",
            query: {
                boardId: boardId
            }
        })));
    };
    /** Get Epics
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getEpics)
     * @name getEpics
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned epics. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of epics to return per page. Default: 50.
     * @param {string} [done] - Filters results to epics that are either done or not done.
     * Valid values: true, false.
     */
    JiraApi.prototype.getEpics = function (boardId, startAt, maxResults, done) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/epic",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                done: done
            }
        })));
    };
    /** Get board issues for epic
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getIssuesForEpic)
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getIssuesWithoutEpic)
     * @name getBoardIssuesForEpic
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {string} epicId - Id of epic to retrieve, specify 'none' to get issues without an epic.
     * @param {number} [startAt=0] - The starting index of the returned issues. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of issues to return per page. Default: 50.
     * @param {string} [jql] - Filters results using a JQL query.
     * @param {boolean} [validateQuery] - Specifies whether to validate the JQL query or not.
     * Default: true.
     * @param {string} [fields] - The list of fields to return for each issue.
     */
    JiraApi.prototype.getBoardIssuesForEpic = function (boardId, epicId, startAt, maxResults, jql, validateQuery, fields) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        if (validateQuery === void 0) { validateQuery = true; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/epic/" + epicId + "/issue",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                jql: jql,
                validateQuery: validateQuery,
                fields: fields
            }
        })));
    };
    /** Estimate issue for board
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-estimateIssueForBoard)
     * @name estimateIssueForBoard
     * @function
     * @param {string} issueIdOrKey - Id of issue
     * @param {number} boardId - The id of the board required to determine which field
     * is used for estimation.
     * @param {string} body - value to set
     */
    JiraApi.prototype.estimateIssueForBoard = function (issueIdOrKey, boardId, body) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/issue/" + issueIdOrKey + "/estimation",
            query: {
                boardId: boardId
            }
        }), {
            method: 'PUT',
            body: body
        }));
    };
    /** Rank Issues
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-rankIssues)
     * @name rankIssues
     * @function
     * @param {string} body - value to set
     */
    JiraApi.prototype.rankIssues = function (body) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: '/issue/rank'
        }), {
            method: 'PUT',
            body: body
        }));
    };
    /** Get Projects
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/project-getProjects)
     * @name getProjects
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned projects. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of projects to return per page.
     * Default: 50.
     */
    JiraApi.prototype.getProjects = function (boardId, startAt, maxResults) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/project",
            query: {
                startAt: startAt,
                maxResults: maxResults
            }
        })));
    };
    /** Get Projects Full
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/project-getProjectsFull)
     * @name getProjectsFull
     * @function
     * @param {string} boardId - Id of board to retrieve
     */
    JiraApi.prototype.getProjectsFull = function (boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/project/full"
        })));
    };
    /** Get Board Properties Keys
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-getPropertiesKeys)
     * @name getBoardPropertiesKeys
     * @function
     * @param {string} boardId - Id of board to retrieve
     */
    JiraApi.prototype.getBoardPropertiesKeys = function (boardId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/properties"
        })));
    };
    /** Delete Board Property
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-deleteProperty)
     * @name deleteBoardProperty
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {string} propertyKey - Id of property to delete
     */
    JiraApi.prototype.deleteBoardProperty = function (boardId, propertyKey) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/properties/" + propertyKey
        }), {
            method: 'DELETE'
        }));
    };
    /** Set Board Property
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-setProperty)
     * @name setBoardProperty
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {string} propertyKey - Id of property to delete
     * @param {string} body - value to set, for objects make sure to stringify first
     */
    JiraApi.prototype.setBoardProperty = function (boardId, propertyKey, body) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/properties/" + propertyKey
        }), {
            method: 'PUT',
            body: body
        }));
    };
    /** Get Board Property
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-getProperty)
     * @name getBoardProperty
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {string} propertyKey - Id of property to retrieve
     */
    JiraApi.prototype.getBoardProperty = function (boardId, propertyKey) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/properties/" + propertyKey
        })));
    };
    /** Get All Sprints
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/sprint-getAllSprints)
     * @name getAllSprints
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned sprints. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of sprints to return per page.
     * Default: 50.
     * @param {string} [state] - Filters results to sprints in specified states.
     * Valid values: future, active, closed.
     */
    JiraApi.prototype.getAllSprints = function (boardId, startAt, maxResults, state) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/sprint",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                state: state
            }
        })));
    };
    /** Get Board issues for sprint
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/sprint-getIssuesForSprint)
     * @name getBoardIssuesForSprint
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {string} sprintId - Id of sprint to retrieve
     * @param {number} [startAt=0] - The starting index of the returned issues. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of issues to return per page. Default: 50.
     * @param {string} [jql] - Filters results using a JQL query.
     * @param {boolean} [validateQuery] - Specifies whether to validate the JQL query or not.
     * Default: true.
     * @param {string} [fields] - The list of fields to return for each issue.
     */
    JiraApi.prototype.getBoardIssuesForSprint = function (boardId, sprintId, startAt, maxResults, jql, validateQuery, fields) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        if (validateQuery === void 0) { validateQuery = true; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/sprint/" + sprintId + "/issue",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                jql: jql,
                validateQuery: validateQuery,
                fields: fields
            }
        })));
    };
    /** Get All Versions
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/version-getAllVersions)
     * @name getAllVersions
     * @function
     * @param {string} boardId - Id of board to retrieve
     * @param {number} [startAt=0] - The starting index of the returned versions. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of versions to return per page.
     * Default: 50.
     * @param {string} [released] - Filters results to versions that are either released or
     * unreleased.Valid values: true, false.
     */
    JiraApi.prototype.getAllVersions = function (boardId, startAt, maxResults, released) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/board/" + boardId + "/version",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                released: released
            }
        })));
    };
    /** Get Filter
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/filter)
     * @name getFilter
     * @function
     * @param {string} filterId - Id of filter to retrieve
     */
    JiraApi.prototype.getFilter = function (filterId) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/filter/" + filterId
        })));
    };
    /** Get Epic
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getEpic)
     * @name getEpic
     * @function
     * @param {string} epicIdOrKey - Id of epic to retrieve
     */
    JiraApi.prototype.getEpic = function (epicIdOrKey) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/epic/" + epicIdOrKey
        })));
    };
    /** Partially update epic
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-partiallyUpdateEpic)
     * @name partiallyUpdateEpic
     * @function
     * @param {string} epicIdOrKey - Id of epic to retrieve
     * @param {string} body - value to set, for objects make sure to stringify first
     */
    JiraApi.prototype.partiallyUpdateEpic = function (epicIdOrKey, body) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/epic/" + epicIdOrKey
        }), {
            method: 'POST',
            body: body
        }));
    };
    /** Get issues for epic
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getIssuesForEpic)
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getIssuesWithoutEpic)
     * @name getIssuesForEpic
     * @function
     * @param {string} epicId - Id of epic to retrieve, specify 'none' to get issues without an epic.
     * @param {number} [startAt=0] - The starting index of the returned issues. Base index: 0.
     * @param {number} [maxResults=50] - The maximum number of issues to return per page. Default: 50.
     * @param {string} [jql] - Filters results using a JQL query.
     * @param {boolean} [validateQuery] - Specifies whether to validate the JQL query or not.
     * Default: true.
     * @param {string} [fields] - The list of fields to return for each issue.
     */
    JiraApi.prototype.getIssuesForEpic = function (epicId, startAt, maxResults, jql, validateQuery, fields) {
        if (startAt === void 0) { startAt = 0; }
        if (maxResults === void 0) { maxResults = 50; }
        if (validateQuery === void 0) { validateQuery = true; }
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/epic/" + epicId + "/issue",
            query: {
                startAt: startAt,
                maxResults: maxResults,
                jql: jql,
                validateQuery: validateQuery,
                fields: fields
            }
        })));
    };
    /** Move Issues to Epic
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-moveIssuesToEpic)
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-removeIssuesFromEpic)
     * @name moveIssuesToEpic
     * @function
     * @param {string} epicIdOrKey - Id of epic to move issue to, or 'none' to remove from epic
     * @param {array} issues - array of issues to move
     */
    JiraApi.prototype.moveIssuesToEpic = function (epicIdOrKey, issues) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/epic/" + epicIdOrKey + "/issue"
        }), {
            method: 'POST',
            body: {
                issues: issues
            }
        }));
    };
    /** Rank Epics
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-rankEpics)
     * @name rankEpics
     * @function
     * @param {string} epicIdOrKey - Id of epic
     * @param {string} body - value to set
     */
    JiraApi.prototype.rankEpics = function (epicIdOrKey, body) {
        return this.doRequest(this.makeRequestHeader(this.makeAgileUri({
            pathname: "/epic/" + epicIdOrKey + "/rank"
        }), {
            method: 'PUT',
            body: body
        }));
    };
    /**
     * @name getServerInfo
     * @function
     * Get server info
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-serverInfo-get)
     */
    JiraApi.prototype.getServerInfo = function () {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/serverInfo'
        })));
    };
    /**
     * @name getIssueCreateMetadata
     * @param {object} optional - object containing any of the following properties
     * @param {array} [optional.projectIds]: optional Array of project ids to return metadata for
     * @param {array} [optional.projectKeys]: optional Array of project keys to return metadata for
     * @param {array} [optional.issuetypeIds]: optional Array of issuetype ids to return metadata for
     * @param {array} [optional.issuetypeNames]: optional Array of issuetype names to return metadata
     * for
     * @param {string} [optional.expand]: optional Include additional information about issue
     * metadata. Valid value is 'projects.issuetypes.fields'
     * Get metadata for creating an issue.
     * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get)
     */
    JiraApi.prototype.getIssueCreateMetadata = function (optional) {
        if (optional === void 0) { optional = {}; }
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: '/issue/createmeta',
            query: optional
        })));
    };
    /** Generic Get Request
     * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/2/)
     * @name genericGet
     * @function
     * @param {string} endpoint - Rest API endpoint
     */
    JiraApi.prototype.genericGet = function (endpoint) {
        return this.doRequest(this.makeRequestHeader(this.makeUri({
            pathname: "/" + endpoint
        })));
    };
    return JiraApi;
}());
exports["default"] = JiraApi;
