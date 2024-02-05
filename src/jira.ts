import axios, { Axios, AxiosInstance, AxiosRequestConfig } from "axios";
import { Agent } from "https";
import { components, operations as cloudOperations } from "./generated/openapi-cloud";
import { operations } from "./generated/openapi-software";

export interface MakeUrlParams {
  pathname?: string;
  query?: Record<string, string | number | boolean>;
  intermediatePath?: string;
  encode?: boolean;
}
export type WithStrictSSL = {
  strictSSL?: boolean;
  ca?: string;
  axios?: undefined;
};

export type WithAxios = {
  axios?: AxiosInstance;
  strictSSL?: undefined;
  ca?: undefined;
};

export type AxiosOrStrict = WithStrictSSL | WithAxios;

export type JiraApiOptions = {
  protocol?: "http" | "https";
  host: string;
  port?: number;
  apiVersion?: 1 | 2 | 3;
  base?: string;
  intermediatePath?: string;
  webHookVersion?: string;
  baseOptions?: AxiosRequestConfig;
  bearer?: string;
  timeout?: number;
  username?: string;
  password?: string;
} & AxiosOrStrict;

export type PaginationParams = {
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
};

/**
 * Wrapper for the JIRA Rest Api
 * https://docs.atlassian.com/jira/REST/6.4.8/
 */
export class JiraApi {
  protocol: string;
  host: string;
  port: number;
  apiVersion: number;
  base: string;
  intermediatePath: string;
  axios: AxiosInstance;
  httpsAgent?: Agent;
  webhookVersion: string;
  baseOptions: AxiosRequestConfig;

  /**
   * Construct a new JiraApi
   * @constructor
   * @param {JiraApiOptions} options
   */
  constructor(options: JiraApiOptions) {
    this.protocol = options.protocol || "https";
    this.host = options.host;
    this.port = options.port || null;
    this.apiVersion = options.apiVersion || 2;
    this.base = options.base || "";
    this.intermediatePath = options.intermediatePath;

    // This is so we can fake during unit tests
    if ("axios" in options) {
      this.axios = options.axios;
    } else if ("strictSSL" in options || "ca" in options) {
      this.httpsAgent = new Agent({ rejectUnauthorized: !options.strictSSL, ca: options.ca });
      this.axios = axios.create({
        httpsAgent: this.httpsAgent,
      });
    } else {
      this.axios = axios.create();
    }
    this.webhookVersion = options.webHookVersion || "1.0";
    this.baseOptions = { ...options.baseOptions };

    if (!this.baseOptions.headers) this.baseOptions.headers = {};

    if (options.bearer) {
      this.baseOptions.headers.Authorization = `Bearer ${options.bearer}`;
    } else if (options.username && options.password) {
      this.baseOptions.auth = {
        username: options.username,
        password: options.password,
      };
    }

    if (options.timeout) {
      this.baseOptions.timeout = options.timeout;
    }
    this.baseOptions.headers["X-Atlassian-Token"] = "no-check";
  }

  /**
   * Creates a requestOptions object based on the default template for one
   * @param url
   * @param options an object containing fields and formatting how the
   */
  makeRequestHeader(url: string, options: AxiosRequestConfig = {}): AxiosRequestConfig {
    return {
      method: options.method || "GET",
      url,
      ...options,
    };
  }

  /**
   * Creates a URI object for a given pathname
   * @param [options] - an object containing path information
   */
  makeUri({ pathname, query, intermediatePath }: MakeUrlParams) {
    const intermediateToUse = this.intermediatePath || intermediatePath;
    const tempPath = intermediateToUse || `/rest/api/${this.apiVersion}`;
    const uri = new URL("http://localhost");
    uri.protocol = this.protocol;
    uri.hostname = this.host;
    uri.port = this.port?.toString();
    uri.pathname = `${this.base}${tempPath}${pathname}`;

    for (const key in query) {
      uri.searchParams.append(key, query[key].toString());
    }
    return uri.toString();
  }

  /**
   * Creates a URI object for a given pathName
   * @param [options] - An options object specifying uri information
   */
  makeWebhookUri({
    pathname,
  }: {
    pathname?: string;
  }) {
    return this.makeUri({
      pathname,
      intermediatePath: `/rest/webhooks/${this.webhookVersion}`,
    });
  }

  /**
   * Creates a URI object for a given pathname
   * /rest/dev-status/latest/issue/detail section
   */
  makeDevStatusUri({
    pathname,
    query,
  }: {
    pathname?: string;
    query?: Record<string, string>;
  }) {
    return this.makeUri({
      pathname,
      query,
      intermediatePath: "/rest/dev-status/latest/issue",
    });
  }

  /**
   * Creates a URI object for a given pathname
   * @param object
   */
  makeAgileUri(object: MakeUrlParams) {
    return this.makeUri({
      ...object,
      intermediatePath: object.intermediatePath ?? "/rest/agile/1.0",
    });
  }

  async doRequest<T>(requestOptions: AxiosRequestConfig) {
    return this.doRawRequest<T>(requestOptions).then((response) => response.data);
  }

  async doRawRequest<T>(requestOptions: AxiosRequestConfig) {
    const options = {
      ...this.baseOptions,
      ...requestOptions,
    };

    return this.axios.request<T>(options);
  }

  /**
   * Find an issue in jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290709)
   * @param issueNumber - The issue number to search for including the project key
   * @param expand - The resource expansion to return additional fields in the response
   * @param fields - Comma separated list of field ids or keys to retrieve
   * @param properties - Comma separated list of properties to retrieve
   * @param fieldsByKeys - False by default, used to retrieve fields by key instead of id
   */
  findIssue(
    issueNumber: string,
    expand?: string,
    fields?: string,
    properties?: string,
    fieldsByKeys?: boolean,
  ): Promise<unknown> {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}`,
          query: {
            expand: expand || "",
            fields: fields || "*all",
            properties: properties || "*all",
            fieldsByKeys: fieldsByKeys || false,
          },
        }),
      ),
    );
  }

  /**
   * Download an avatar
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290709)
   * @param ownerId
   * @param avatarId - The avatar to download
   */
  async downloadUserAvatar(
    ownerId: string,
    avatarId: number,
  ): Promise<{
    mimeType: string;
    content: Buffer;
  }> {
    const response = await this.doRawRequest<Buffer>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/useravatar",
          intermediatePath: "/secure",
          query: {
            ownerId: ownerId,
            avatarId: avatarId,
          },
        }),
        { responseType: "arraybuffer" },
      ),
    );
    return {
      mimeType: response.headers["content-type"],
      content: response.data,
    };
  }

  /**
   * Download an avatar
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290709)
   * @param avatarType
   * @param avatarId - The avatar to download
   */
  async downloadAvatar(
    avatarType: string,
    avatarId: number,
  ): Promise<{
    mimeType: string;
    content: Buffer;
  }> {
    const response = await this.doRawRequest<Buffer>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/viewavatar",
          intermediatePath: "/secure",
          query: {
            avatarType: avatarType,
            avatarId: avatarId,
          },
        }),
        { responseType: "arraybuffer" },
      ),
    );
    return {
      mimeType: response.headers["content-type"],
      content: response.data,
    };
  }

  /**
   * Download an attachment
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288524)
   * @param attachment - the attachment
   */
  async downloadAttachment(attachment: { id: string; filename: string }): Promise<Buffer> {
    const result = await this.doRawRequest<Buffer>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/attachment/${attachment.id}/${attachment.filename}`,
          intermediatePath: "/secure",
          encode: true,
        }),
        { responseType: "arraybuffer" },
      ),
    );
    return result.data;
  }

  /**
   * Remove the attachment
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-attachments/#api-rest-api-3-attachment-id-delete)
   * @param attachmentId - the attachment id
   */
  deleteAttachment(attachmentId: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/attachment/${attachmentId}`,
        }),
        { method: "DELETE" },
      ),
    );
  }

  /**
   * Get the unresolved issue count
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288524)
   * @param version - the version of your product you want to find the unresolved
   * issues of.
   */
  async getUnresolvedIssueCount(version: string) {
    const requestHeaders = this.makeRequestHeader(
      this.makeUri({
        pathname: `/version/${version}/unresolvedIssueCount`,
      }),
    );
    const response = await this.doRawRequest<components["schemas"]["VersionUnresolvedIssuesCount"]>(requestHeaders);
    return response.data.issuesUnresolvedCount;
  }

  /**
   * Get the Project by project key
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289232)
   * @param project - key for the project
   */
  getProject(project: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/project/${project}`,
        }),
      ),
    );
  }

  /**
   * Create a new Project
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/project-createproject: string)
   * @param project - with specs
   */
  createProject(project: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/project/",
        }),
        {
          method: "POST",
          data: project,
        },
      ),
    );
  }

  /** Get the issues for a board / sprint
   * @param boardId
   * @param sprintId - the id for the sprint
   */
  getSprintIssues(boardId: string, sprintId: string) {
    return this.doRequest<components["schemas"]["SearchResults"]>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `board/${boardId}/sprint/${sprintId}/issue`,
        }),
      ),
    );
  }

  /** Get a list of Sprints belonging to a Rapid View
   * @param boardId - the id for the rapid view
   */
  listSprints(boardId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/sprint`,
        }),
      ),
    );
  }

  /** Get details about a Sprint
   * @param sprintId - the id for the sprint view
   */
  getSprint(sprintId: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/sprint/${sprintId}`,
        }),
      ),
    );
  }

  /** Add an issue to the project's current sprint
   * @param issueId - the id of the existing issue
   * @param sprintId - the id of the sprint to add it to
   */
  addIssueToSprint(issueId: string, sprintId: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/sprint/${sprintId}/issue`,
        }),
        {
          method: "POST",
          data: {
            issues: [issueId],
          },
        },
      ),
    );
  }

  /** Create an issue link between two issues
   * @param link - a link object formatted how the Jira API specifies
   */
  issueLink(link: components["schemas"]["RemoteIssueLinkRequest"]): Promise<components["schemas"]["RemoteIssueLinkIdentifies"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/issueLink",
        }),
        {
          method: "POST",
          data: link,
        },
      ),
    );
  }

  /**
   * List all issue link types jira knows about
   *
   * [Jira Doc](https://docs.atlassian.com/software/jira/docs/api/REST/8.5.0/#api/2/issueLinkType-getIssueLinkTypes)
   */
  listIssueLinkTypes(): Promise<components["schemas"]["IssueLinkTypes"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/issueLinkType",
        }),
      ),
    );
  }

  /**
   * Retrieves the remote links associated with the given issue.
   *
   * @param issueNumber - the issue number to find remote links for.
   */
  getRemoteLinks(issueNumber: string): Promise<components["schemas"]["RemoteIssueLink"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/remotelink`,
        }),
      ),
    );
  }

  /**
   * Creates a remote link associated with the given issue.
   * @param issueNumber - The issue number to create the remotelink under
   * @param remoteLink - the remotelink object as specified by the Jira API
   */
  createRemoteLink(issueNumber: string, remoteLink: components["schemas"]["RemoteIssueLinkRequest"]): Promise<components["schemas"]["RemoteIssueLinkIdentifies"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/remotelink`,
        }),
        {
          method: "POST",
          data: remoteLink,
        },
      ),
    );
  }

  /**
   * Delete a remote link with given issueNumber and id
   * @param issueNumber - The issue number to delete the remotelink under
   * @param id the remotelink id
   */
  deleteRemoteLink(issueNumber: string, id: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/remotelink/${id}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Get Versions for a project
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289653)
   * @param project - A project key to get versions for
   * @param query - An object containing the query params
   */
  getVersions(project: string, query: Pick<PaginationParams, "expand">) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/project/${project}/versions`,
          query: {
            expand: query.expand?.join(","),
          },
        }),
      ),
    );
  }

  /** Get details of single Version in project
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/version-getVersion)
   * @param version - The id of this version
   */
  getVersion(version: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/version/${version}`,
        }),
      ),
    );
  }

  /** Create a version
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id288232)
   * @param version - an object of the new version
   */
  createVersion(version: components["schemas"]["Version"]): Promise<components["schemas"]["Version"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/version",
        }),
        {
          method: "POST",
          data: version,
        },
      ),
    );
  }

  /** Update a version
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e510)
   * @param version - a new object of the version to update
   */
  updateVersion(version: components["schemas"]["Version"]): Promise<components["schemas"]["Version"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/version/${version.id}`,
        }),
        {
          method: "PUT",
          data: version,
        },
      ),
    );
  }

  /** Delete a version
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/version-delete)
   * @param versionId - the ID of the version to delete
   * @param moveFixIssuesToId - when provided, existing fixVersions will be moved
   *                 to this ID. Otherwise, the deleted version will be removed from all
   *                 issue fixVersions.
   * @param moveAffectedIssuesToId - when provided, existing affectedVersions will
   *                 be moved to this ID. Otherwise, the deleted version will be removed
   *                 from all issue affectedVersions.
   */
  deleteVersion(versionId: string, moveFixIssuesToId: string, moveAffectedIssuesToId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/version/${versionId}`,
        }),
        {
          method: "DELETE",
          data: {
            moveFixIssuesTo: moveFixIssuesToId,
            moveAffectedIssuesTo: moveAffectedIssuesToId,
          },
        },
      ),
    );
  }

  /** Move version
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/version-moveVersion)
   * @param versionId - the ID of the version to delete
   * @param position - an object of the new position
   */

  moveVersion(versionId: string, position: components["schemas"]["VersionMoveBean"]): Promise<components["schemas"]["Version"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/version/${versionId}/move`,
        }),
        {
          method: "POST",
          data: position,
        },
      ),
    );
  }

  /** Pass a search query to Jira
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e4424)
   * @param searchString - jira query string in JQL
   * @param optional - object containing any of the pagination properties
   */
  searchJira(searchString: string, optional: PaginationParams) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/search",
        }),
        {
          method: "POST",
          data: {
            jql: searchString,
            ...optional,
          },
        },
      ),
    );
  }

  /** Create a Jira user
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/user-createUser)
   * @param user - Properly Formatted User object
   */
  createUser(user: components["schemas"]["NewUserDetails"]): Promise<components["schemas"]["UserDetails"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/user",
        }),
        {
          method: "POST",
          data: user,
        },
      ),
    );
  }

  /**
   * Search user on Jira
   *
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#d2e3756)
   */
  searchUsers({ username, query, startAt, maxResults }: cloudOperations["findUsers"]["parameters"]["query"]): Promise<(components["schemas"]["User"][])> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/user/search",
          query: {
            username,
            query,
            startAt: startAt || 0,
            maxResults: maxResults || 50,
          },
        }),
      ),
    );
  }

  /** Get all users in group on Jira
   * @param groupname - A query string used to search users in group
   * @param [startAt=0] - The index of the first user to return (0-based)
   * @param [maxResults=50] - The maximum number of users to return (defaults to 50).
   * @deprecated
   */
  getUsersInGroup(groupname: string, startAt = 0, maxResults = 50) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/group",
          query: {
            groupname,
            expand: `users[${startAt}:${maxResults}]`,
          },
        }),
      ),
    );
  }

  /** Get all members of group on Jira
   * @param groupname - A query string used to search users in group
   * @param [startAt=0] - The index of the first user to return (0-based)
   * @param [maxResults=50] - The maximum number of users to return (defaults to 50).
   * @param [includeInactiveUsers=false] - Fetch inactive users too (defaults to false).
   */
  getMembersOfGroup(groupname: string, startAt = 0, maxResults = 50, includeInactiveUsers = false) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/group/member",
          query: {
            groupname,
            expand: `users[${startAt}:${maxResults}]`,
            includeInactiveUsers,
          },
        }),
      ),
    );
  }

  /** Get issues related to a user
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id296043)
   * @param username - username of user to search for
   * @param open - determines if only open issues should be returned
   */
  getUsersIssues(username: string, open: boolean) {
    const openJql = open ? " AND status in (Open, 'In Progress', Reopened)" : "";
    return this.searchJira(`assignee = ${username.replace("@", "\\u0040")}${openJql}`, {});
  }

  /** Returns a user.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-user-get)
   * @param accountId - The accountId of user to search for
   * @param expand - The expand for additional info (groups,applicationRoles)
   */
  getUser(accountId: string, expand?: string[]) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/user",
          query: {
            accountId,
            expand: expand?.join(","),
          },
        }),
      ),
    );
  }

  /** Returns a list of all (active and inactive) users.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-users-search-get)
   * @param [startAt=0] - The index of the first user to return (0-based)
   * @param [maxResults=50] - The maximum number of users to return (defaults to 50).
   */
  getUsers(startAt = 0, maxResults = 100) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/users",
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  /** Add issue to Jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
   */
  addNewIssue(issue: components["schemas"]["IssueUpdateDetails"]): Promise<components["schemas"]["CreatedIssue"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/issue",
        }),
        {
          method: "POST",
          data: issue,
        },
      ),
    );
  }

  /** Add a user as a watcher on an issue
   * @param issueKey - the key of the existing issue
   * @param username - the jira username to add as a watcher to the issue
   */
  addWatcher(issueKey: string, username: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueKey}/watchers`,
        }),
        {
          method: "POST",

          data: username,
        },
      ),
    );
  }

  /** Change an assignee on an issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-assign)
   * @param issueKey - the key of the existing issue
   * @param assigneeName - the jira username to add as a new assignee to the issue
   */
  updateAssignee(issueKey: string, assigneeName: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueKey}/assignee`,
        }),
        {
          method: "PUT",

          data: { name: assigneeName },
        },
      ),
    );
  }

  /** Change an assignee on an issue
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-issue-issueIdOrKey-assignee-put)
   * @param issueKey - the key of the existing issue
   * @param userId - the jira username to add as a new assignee to the issue
   */
  updateAssigneeWithId(issueKey: string, userId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueKey}/assignee`,
        }),
        {
          method: "PUT",

          data: { accountId: userId },
        },
      ),
    );
  }

  /** Delete issue from Jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290791)
   * @param issueId - the Id of the issue to delete
   */
  deleteIssue(issueId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Update issue in Jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290878)
   * @param issueId - the Id of the issue to update
   * @param issueUpdate - update Object as specified by the rest api
   * @param query - adds parameters to the query string
   */
  updateIssue(
    issueId: string,
    issueUpdate: components["schemas"]["IssueUpdateDetails"],
    query?: cloudOperations["editIssue"]["parameters"]["query"],
  ) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}`,
        }),
        {
          data: issueUpdate,
          method: "PUT",
          params: query,
        },
      ),
    );
  }

  /** Get issue edit metadata
   * [Jira Doc](https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/#api/2/issue-getEditIssueMeta)
   * @param issueId - the Id of the issue to retrieve edit metadata for
   */
  issueEditMeta(issueId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/editmeta`,
        }),
        {},
      ),
    );
  }

  /** List Components
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
   * @param project - key for the project
   */
  listComponents(project: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/project/${project}/components`,
        }),
      ),
    );
  }

  /** Add component to Jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290028)
   * @param component - Properly Formatted Component
   */
  addNewComponent(component: components["schemas"]["ProjectComponent"]): Promise<components["schemas"]["ProjectComponent"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/component",
        }),
        {
          method: "POST",

          data: component,
        },
      ),
    );
  }

  /** Update Jira component
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/component-updatecomponent: string)
   * @param componentId - the Id of the component to update
   * @param component - Properly Formatted Component
   */
  updateComponent(componentId: string, component: components["schemas"]["ProjectComponent"]): Promise<components["schemas"]["ProjectComponent"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/component/${componentId}`,
        }),
        {
          method: "PUT",

          data: component,
        },
      ),
    );
  }

  /** Delete component from Jira
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-component-id-delete)
   * @param id - The ID of the component.
   * @param moveIssuesTo - The ID of the component to replace the deleted component.
   *                                If this value is null no replacement is made.
   */
  deleteComponent(id: string, moveIssuesTo: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/component/${id}`,
          query: moveIssuesTo ? { moveIssuesTo } : null,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Get count of issues assigned to the component.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-rest-api-2-component-id-relatedIssueCounts-get)
   * @param id - Component Id.
   */
  relatedIssueCounts(id: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/component/${id}/relatedIssueCounts`,
        }),
      ),
    );
  }

  /** Create custom Jira field
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field-createCustomField)
   * @param field - Properly formatted Field object
   */
  createCustomField(field: components["schemas"]["CustomFieldDefinitionJsonBean"]): Promise<components["schemas"]["FieldDetails"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/field",
        }),
        {
          method: "POST",

          data: field,
        },
      ),
    );
  }

  /** List all fields custom and not that jira knows about.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
   */
  listFields() {
    return this.doRequest<components["schemas"]["FieldDetails"][]>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/field",
        }),
      ),
    );
  }

  /** Add an option for a select list issue field.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-createOption)
   * @param fieldKey - the key of the select list field
   * @param option - properly formatted Option object
   */
  createFieldOption(fieldKey: string, option: components["schemas"]["IssueFieldOptionCreateBean"]): Promise<components["schemas"]["IssueFieldOption"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/field/${fieldKey}/option`,
        }),
        {
          method: "POST",

          data: option,
        },
      ),
    );
  }

  /** Returns all options defined for a select list issue field.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-getAllOptions)
   * @param fieldKey - the key of the select list field
   */
  listFieldOptions(fieldKey: string): Promise<components["schemas"]["PageBeanIssueFieldOption"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/field/${fieldKey}/option`,
        }),
      ),
    );
  }

  /** Creates or updates an option for a select list issue field.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-putOption)
   * @param fieldKey - the key of the select list field
   * @param optionId - the id of the modified option
   * @param option - properly formatted Option object
   */
  upsertFieldOption(fieldKey: string, optionId: string, option: components["schemas"]["IssueFieldOption"]): Promise<components["schemas"]["IssueFieldOption"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/field/${fieldKey}/option/${optionId}`,
        }),
        {
          method: "PUT",

          data: option,
        },
      ),
    );
  }

  /** Returns an option for a select list issue field.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-getOption)
   * @param fieldKey - the key of the select list field
   * @param optionId - the id of the option
   */
  getFieldOption(fieldKey: string, optionId: string): Promise<components["schemas"]["IssueFieldOption"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/field/${fieldKey}/option/${optionId}`,
        }),
      ),
    );
  }

  /** Deletes an option from a select list issue field.
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#api/2/field/{fieldKey}/option-delete)
   * @param fieldKey - the key of the select list field
   * @param optionId - the id of the deleted option
   */
  deleteFieldOption(fieldKey: string, optionId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/field/${fieldKey}/option/${optionId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /**
   * Get Property of Issue by Issue and Property Id
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue/{issueIdOrKey}/properties-getProperty)
   * @param issueNumber - The issue number to search for including the project key
   * @param property - The property key to search for
   */
  getIssueProperty(issueNumber: string, property: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/properties/${property}`,
        }),
      ),
    );
  }

  /**
   * List all changes for an issue, sorted by date, starting from the latest
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue/{issueIdOrKey}/changelog)
   * @param issueNumber - The issue number to search for including the project key
   * @param [startAt=0] - optional starting index number
   * @param [maxResults=50] - optional ending index number
   */
  getIssueChangelog(issueNumber: string, startAt = 0, maxResults = 50) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/changelog`,
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  /**
   * List all watchers for an issue
   * [Jira Doc](http://docs.atlassian.com/jira/REST/cloud/#api/2/issue-getIssueWatchers)
   * @param issueNumber - The issue number to search for including the project key
   */
  getIssueWatchers(issueNumber: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueNumber}/watchers`,
        }),
      ),
    );
  }

  /** List all priorities jira knows about
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
   */
  listPriorities() {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/priority",
        }),
      ),
    );
  }

  /** List Transitions for a specific issue that are available to the current user
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
   * @param issueId - get transitions available for the issue
   */
  listTransitions(issueId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/transitions`,
          query: {
            expand: "transitions.fields",
          },
        }),
      ),
    );
  }

  /** Transition issue in Jira
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id290489)
   * @param issueId - the Id of the issue to delete
   * @param issueTransition - transition object from the jira rest API
   */
  transitionIssue(issueId: string, issueTransition: components["schemas"]["IssueUpdateDetails"]) {
    return this.doRequest<never>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/transitions`,
        }),
        {
          data: issueTransition,
          method: "POST",
        },
      ),
    );
  }

  /** List all Viewable Projects
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id289193)
   */
  listProjects(): Promise<components["schemas"]["Project"][]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/project",
        }),
      ),
    );
  }

  /** Add a comment to an issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#id108798)
   * @param issueId - Issue to add a comment to
   * @param comment - string containing comment
   */
  addComment(issueId: string, comment: components["schemas"]["Comment"]) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/comment`,
        }),
        {
          data: comment,
          method: "POST",
        },
      ),
    );
  }

  /** Update comment for an issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-updateComment)
   * @param issueId - Issue with the comment
   * @param commentId - Comment that is updated
   * @param comment - string containing new comment
   * @param [options={}] - extra options
   */
  updateComment(
    issueId: string,
    commentId: string,
    comment: components["schemas"]["Comment"],
    options: cloudOperations["updateComment"]["parameters"]["query"] = {},
  ) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/comment/${commentId}`,
        }),
        {
          data: {
            data: comment,
          },
          params: {
            ...options,
          },
          method: "PUT",
        },
      ),
    );
  }

  /**
   * Get Comments by IssueId.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
   * @param issueId - this issue this comment is on
   */
  getComments(issueId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/comment`,
        }),
      ),
    );
  }

  /**
   * Get Comment by Id.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
   * @param issueId - this issue this comment is on
   * @param commentId - the id of the comment
   */
  getComment(issueId: string, commentId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/comment/${commentId}`,
        }),
      ),
    );
  }

  /**
   * Delete Comments by Id.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-comment-list-post)
   * @param issueId - this issue this comment is on
   * @param commentId - the id of the comment
   */
  deleteComment(issueId: string, commentId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/comment/${commentId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Add a worklog to a project
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id291617)
   * @param issueId - Issue to add a worklog to
   * @param worklog - worklog object from the rest API
   * @param newEstimate - the new value for the remaining estimate field
   * @param [options={}] - extra options
   */
  addWorklog(
    issueId: string,
    worklog: components["schemas"]["Worklog"],
    newEstimate = null,
    options: cloudOperations["addWorklog"]["parameters"]["query"] = {},
  ) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/worklog`,
        }),
        {
          data: worklog,
          params: {
            adjustEstimate: newEstimate ? "new" : "auto",
            ...(newEstimate ? { newEstimate } : {}),
            ...options,
          },
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
  }

  /** Get ids of worklogs modified since
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/worklog-getWorklogsForIds)
   * @param since - a date time in unix timestamp format since when updated worklogs
   * will be returned.
   * @param expand - ptional comma separated list of parameters to expand: properties
   * (provides worklog properties).
   */
  updatedWorklogs(since: string, expand: string[]) {
    const config: AxiosRequestConfig = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/worklog/updated",
          query: { since, expand: expand?.join(",") },
        }),
        config,
      ),
    );
  }

  /** Delete worklog from issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#d2e1673)
   * @param issueId - the Id of the issue to delete
   * @param worklogId - the Id of the worklog in issue to delete
   */
  deleteWorklog(issueId: string, worklogId: number) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/worklog/${worklogId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Update worklog from issue
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-issue-worklogs/#api-rest-api-2-issue-issueidorkey-worklog-id-put)
   * @param issueId - the Id of the issue to update
   * @param worklogId - the Id of the worklog in issue to update
   * @param body - value to set
   */
  updateWorklog(
    issueId: string,
    worklogId: number,
    body: components["schemas"]["Worklog"],
    options: cloudOperations["updateWorklog"]["parameters"]["query"] = {},
  ) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/worklog/${worklogId}`,
        }),
        {
          method: "PUT",
          data: body,
          params: options,
        },
      ),
    );
  }

  /** Deletes an issue link.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-issueLink-linkId-delete)
   * @param linkId - the Id of the issue link to delete
   */
  deleteIssueLink(linkId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issueLink/${linkId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Returns worklog details for a list of worklog IDs.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-worklog-list-post)
   * @param {array} worklogsIDs - a list of worklog IDs.
   * @param expand - expand to include additional information about worklogs
   *
   */
  getWorklogs(worklogsIDs: number[], expand: string[]) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/worklog/list",
          query: {
            expand: expand?.join(","),
          },
        }),
        {
          method: "POST",
          data: {
            ids: worklogsIDs,
          },
        },
      ),
    );
  }

  /** Get worklogs list from a given issue
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-api-3-issue-issueIdOrKey-worklog-get)
   * @param issueId - the Id of the issue to find worklogs for
   * @param [startAt=0] - optional starting index number
   * @param [maxResults=1000] - optional ending index number
   */
  getIssueWorklogs(issueId: string, startAt = 0, maxResults = 1000) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/worklog`,
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  /** List all Issue Types jira knows about
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id295946)
   */
  listIssueTypes() {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/issuetype",
        }),
      ),
    );
  }

  /** Register a webhook
   * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
   * @param webhook - properly formatted webhook
   */
  registerWebhook(webhook: components["schemas"]["WebhookRegistrationDetails"]): Promise<components["schemas"]["ContainerForRegisteredWebhooks"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeWebhookUri({
          pathname: "/webhook",
        }),
        {
          method: "POST",
          data: webhook,
        },
      ),
    );
  }

  /** List all registered webhooks
   * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
   */
  listWebhooks(): Promise<components["schemas"]["PageBeanWebhook"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeWebhookUri({
          pathname: "/webhook",
        }),
      ),
    );
  }

  /** Get a webhook by its ID
   * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
   * @param webhookID - id of webhook to get
   */
  getWebhook(webhookID: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeWebhookUri({
          pathname: `/webhook/${webhookID}`,
        }),
      ),
    );
  }

  /** Delete a registered webhook
   * [Jira Doc](https://developer.atlassian.com/display/JIRADEV/JIRA+Webhooks+Overview)
   * @param webhookID - id of the webhook to delete
   */
  deleteWebhook(webhookID: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeWebhookUri({
          pathname: `/webhook/${webhookID}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Describe the currently authenticated user
   * [Jira Doc](http://docs.atlassian.com/jira/REST/latest/#id2e865)
   */
  getCurrentUser(): Promise<components["schemas"]["User"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/myself",
        }),
      ),
    );
  }

  /** Retrieve the backlog of a certain Board
   * @param boardId - rapid view id
   */
  getBacklogForBoard(boardId: string): Promise<components["schemas"]["SearchResults"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `board/${boardId}/backlog`,
        }),
      ),
    );
  }

  /** Add attachment to a Issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/issue/{issueIdOrKey}/attachments-addAttachment)
   * @param issueId - issue id
   * @param readStream - readStream object from fs
   */
  addAttachmentOnIssue(issueId: string, readStream: Buffer) {
    const formData = new FormData();
    formData.append("file", new Blob([readStream], { type: "application/octet-stream" }));
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/attachments`,
        }),
        {
          method: "POST",
          headers: {
            "X-Atlassian-Token": "nocheck",
          },
          data: formData,
        },
      ),
    );
  }

  /** Notify people related to issue
   * [Jira Doc](https://docs.atlassian.com/jira/REST/cloud/#api/2/issue-notify)
   * @param issueId - issue id
   * @param notificationBody - properly formatted body
   */
  issueNotify(issueId: string, notificationBody: components["schemas"]["Notification"]) {
    return this.doRequest<never>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/${issueId}/notify`,
        }),
        {
          method: "POST",
          data: notificationBody,
        },
      ),
    );
  }

  /** Get list of possible statuses
   * [Jira Doc](https://docs.atlassian.com/jira/REST/latest/#api/2/status-getStatuses)
   */
  listStatus(): Promise<components["schemas"]["StatusDetails"][]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/status",
        }),
      ),
    );
  }

  /** Get a Dev-Status summary by issue ID
   * @param issueId - id of issue to get
   */
  getDevStatusSummary(issueId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeDevStatusUri({
          pathname: "/summary",
          query: {
            issueId,
          },
        }),
      ),
    );
  }

  /** Get a Dev-Status detail by issue ID
   * @param issueId - id of issue to get
   * @param applicationType - type of application (stash, bitbucket)
   * @param dataType - info to return (repository, pullrequest)
   */
  getDevStatusDetail(issueId: string, applicationType: string, dataType: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeDevStatusUri({
          pathname: "/detail",
          query: {
            issueId,
            applicationType,
            dataType,
          },
        }),
      ),
    );
  }

  /** Get issue
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-getIssue)
   * @param issueIdOrKey - Id of issue
   * @param [fields] - The list of fields to return for each issue.
   * @param [expand] - A comma-separated list of the parameters to expand.
   */
  getIssue(issueIdOrKey: string, fields: string[], expand: string[]) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/issue/${issueIdOrKey}`,
          query: {
            fields: fields?.join(","),
            expand: expand?.join(","),
          },
        }),
      ),
    );
  }

  /** Move issues to backlog
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/backlog-moveIssuesToBacklog)
   * @param {array} issues - id or key of issues to get
   */
  moveToBacklog(issues: string[]) {
    return this.doRequest<never>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: "/backlog/issue",
        }),
        {
          method: "POST",
          data: {
            issues,
          },
        },
      ),
    );
  }

  /** Get all boards
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getAllBoards)
   * @param [type] - Filters results to boards of the specified type.
   * @param [name] - Filters results to boards that match the specified name.
   * @param [projectKeyOrId] - Filters results to boards that are relevant to a project.
   * @param [startAt=0] - The starting index of the returned boards.
   * @param [maxResults=50] - The maximum number of boards to return per page.
   */
  getAllBoards(type: string, name: string, projectKeyOrId: string, startAt = 0, maxResults = 50): Promise<operations["getAllBoards"]["responses"][200]["content"]["application/json"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: "/board",
          query: {
            startAt,
            maxResults,
            type,
            name,
            ...(projectKeyOrId && { projectKeyOrId }),
          },
        }),
      ),
    );
  }

  /** Create Board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-createBoard)
   */
  createBoard(boardBody: operations["createBoard"]["requestBody"]["content"]["application/json"]): Promise<operations["createBoard"]["responses"][201]["content"]["application/json"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: "/board",
        }),
        {
          method: "POST",
          data: boardBody,
        },
      ),
    );
  }

  /** Get Board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getBoard)
   * @param boardId - Id of board to retrieve
   */
  getBoard(boardId: string): Promise<operations["getBoard"]["responses"][200]["content"]["application/json"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}`,
        }),
      ),
    );
  }

  /** Delete Board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-deleteBoard)
   * @param boardId - Id of board to retrieve
   */
  deleteBoard(boardId: string) {
    return this.doRequest<never>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Get issues for backlog
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getIssuesForBacklog)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned issues. Base index: 0.
   * @param [maxResults=50] - The maximum number of issues to return per page. Default: 50.
   * @param [jql] - Filters results using a JQL query.
   * @param [validateQuery] - Specifies whether to validate the JQL query or not.
   * Default: true.
   * @param [fields] - The list of fields to return for each issue.
   */
  getIssuesForBacklog(
    boardId: string,
    jql: string,
    fields: string[],
    startAt = 0,
    maxResults = 50,
    validateQuery = true,
  ): Promise<components["schemas"]["SearchResults"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/backlog`,
          query: {
            startAt,
            maxResults,
            jql,
            validateQuery,
            fields: fields.join(","),
          },
        }),
      ),
    );
  }

  /** Get Configuration
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getConfiguration)
   * @param boardId - Id of board to retrieve
   */
  getConfiguration(boardId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/configuration`,
        }),
      ),
    );
  }

  /** Get issues for board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board-getIssuesForBoard)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned issues. Base index: 0.
   * @param [maxResults=50] - The maximum number of issues to return per page. Default: 50.
   * @param [jql] - Filters results using a JQL query.
   * @param [validateQuery] - Specifies whether to validate the JQL query or not.
   * Default: true.
   * @param [fields] - The list of fields to return for each issue.
   */
  getIssuesForBoard(
    boardId: string,
    jql: string | undefined = undefined,
    fields = undefined,
    startAt = 0,
    maxResults = 50,
    validateQuery = true,
  ): Promise<components["schemas"]["SearchResults"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/issue`,
          query: {
            startAt,
            maxResults,
            jql,
            validateQuery,
            fields,
          },
        }),
      ),
    );
  }

  /** Get issue estimation for board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-getIssueEstimationForBoard)
   * @param issueIdOrKey - Id of issue
   * @param boardId - The id of the board required to determine which field
   * is used for estimation.
   */
  getIssueEstimationForBoard(issueIdOrKey: string, boardId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/issue/${issueIdOrKey}/estimation`,
          query: {
            boardId,
          },
        }),
      ),
    );
  }

  /** Get Epics
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getEpics)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned epics. Base index: 0.
   * @param [maxResults=50] - The maximum number of epics to return per page. Default: 50.
   * @param [done] - Filters results to epics that are either done or not done.
   * Valid values: true, false.
   */
  getEpics(boardId: string, startAt = 0, maxResults = 50, done = undefined) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/epic`,
          query: {
            startAt,
            maxResults,
            done,
          },
        }),
      ),
    );
  }

  /** Get board issues for epic
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getIssuesForEpic)
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/epic-getIssuesWithoutEpic)
   * @param boardId - Id of board to retrieve
   * @param epicId - Id of epic to retrieve, specify 'none' to get issues without an epic.
   * @param [startAt=0] - The starting index of the returned issues. Base index: 0.
   * @param [maxResults=50] - The maximum number of issues to return per page. Default: 50.
   * @param [jql] - Filters results using a JQL query.
   * @param [validateQuery] - Specifies whether to validate the JQL query or not.
   * Default: true.
   * @param [fields] - The list of fields to return for each issue.
   */
  getBoardIssuesForEpic(
    boardId: string,
    epicId: string,
    startAt = 0,
    maxResults = 50,
    jql = undefined,
    validateQuery = true,
    fields = undefined,
  ) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/epic/${epicId}/issue`,
          query: {
            startAt,
            maxResults,
            jql,
            validateQuery,
            fields,
          },
        }),
      ),
    );
  }

  /** Estimate issue for board
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-estimateIssueForBoard)
   * @param issueIdOrKey - Id of issue
   * @param boardId - The id of the board required to determine which field
   * is used for estimation.
   * @param data - value to set
   */
  estimateIssueForBoard(
    issueIdOrKey: string,
    boardId: string,
    data: operations["estimateIssueForBoard"]["requestBody"]["content"]["application/json"],
  ) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/issue/${issueIdOrKey}/estimation`,
          query: {
            boardId,
          },
        }),
        {
          method: "PUT",
          data,
        },
      ),
    );
  }

  /** Rank Issues
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/issue-rankIssues)
   * @param data - value to set
   */
  rankIssues(data: operations["rankIssues"]["requestBody"]["content"]["application/json"]) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: "/issue/rank",
        }),
        {
          method: "PUT",
          data,
        },
      ),
    );
  }

  /** Get Projects
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/project-getProjects)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned projects. Base index: 0.
   * @param [maxResults=50] - The maximum number of projects to return per page.
   * Default: 50.
   */
  getProjects(boardId: string, startAt = 0, maxResults = 50) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/project`,
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  /** Get Projects Full
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/project-getProjectsFull)
   * @param boardId - Id of board to retrieve
   */
  getProjectsFull(boardId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/project/full`,
        }),
      ),
    );
  }

  /** Get Board Properties Keys
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-getPropertiesKeys)
   * @param boardId - Id of board to retrieve
   */
  getBoardPropertiesKeys(boardId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/properties`,
        }),
      ),
    );
  }

  /** Delete Board Property
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-deleteProperty)
   * @param boardId - Id of board to retrieve
   * @param propertyKey - Id of property to delete
   */
  deleteBoardProperty(boardId: string, propertyKey: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/properties/${propertyKey}`,
        }),
        {
          method: "DELETE",
        },
      ),
    );
  }

  /** Set Board Property
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-setProperty)
   * @param boardId - Id of board to retrieve
   * @param propertyKey - Id of property to delete
   * @param data - value to set, for objects make sure to stringify first
   */
  setBoardProperty(boardId: string, propertyKey: string, data: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/properties/${propertyKey}`,
        }),
        {
          method: "PUT",
          data,
        },
      ),
    );
  }

  /** Get Board Property
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/properties-getProperty)
   * @param boardId - Id of board to retrieve
   * @param propertyKey - Id of property to retrieve
   */
  getBoardProperty(boardId: string, propertyKey: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/properties/${propertyKey}`,
        }),
      ),
    );
  }

  /** Get All Sprints
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/sprint-getAllSprints)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned sprints. Base index: 0.
   * @param [maxResults=50] - The maximum number of sprints to return per page.
   * Default: 50.
   * @param [state] - Filters results to sprints in specified states.
   * Valid values: future, active, closed.
   */
  getAllSprints(boardId: string, startAt = 0, maxResults = 50, state: string | undefined = undefined) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/sprint`,
          query: {
            startAt,
            maxResults,
            state,
          },
        }),
      ),
    );
  }

  /** Get Board issues for sprint
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/#api-agile-1-0-board-boardid-sprint-sprintid-issue-get)
   * @param boardId - Id of board to retrieve
   * @param sprintId - Id of sprint to retrieve
   * @param [startAt=0] - The starting index of the returned issues. Base index: 0.
   * @param [maxResults=50] - The maximum number of issues to return per page. Default: 50.
   * @param [jql] - Filters results using a JQL query.
   * @param [validateQuery] - Specifies whether to validate the JQL query or not.
   * Default: true.
   * @param [fields] - The list of fields to return for each issue.
   * @param [expand] - A comma-separated list of the parameters to expand.
   */
  getBoardIssuesForSprint(
    boardId: string,
    sprintId: string,
    startAt = 0,
    maxResults = 50,
    jql: string | undefined = undefined,
    validateQuery = true,
    fields: string[] | undefined = undefined,
    expand: string[] | undefined = undefined,
  ): Promise<components["schemas"]["SearchResults"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/sprint/${sprintId}/issue`,
          query: {
            startAt,
            maxResults,
            jql,
            validateQuery,
            fields: fields?.join(","),
            expand: expand?.join(","),
          },
        }),
      ),
    );
  }

  /** Get All Versions
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/board/{boardId}/version-getAllVersions)
   * @param boardId - Id of board to retrieve
   * @param [startAt=0] - The starting index of the returned versions. Base index: 0.
   * @param [maxResults=50] - The maximum number of versions to return per page.
   * Default: 50.
   * @param [released] - Filters results to versions that are either released or
   * unreleased.Valid values: true, false.
   */
  getAllVersions(boardId: string, startAt = 0, maxResults = 50, released: boolean | undefined = undefined) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/board/${boardId}/version`,
          query: {
            startAt,
            maxResults,
            released,
          },
        }),
      ),
    );
  }

  /** Get Filter
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/filter)
   * @param filterId - Id of filter to retrieve
   */

  getFilter(filterId: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/filter/${filterId}`,
        }),
      ),
    );
  }

  /** Get Epic
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getEpic)
   * @param epicIdOrKey - Id of epic to retrieve
   */
  getEpic(epicIdOrKey: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/epic/${epicIdOrKey}`,
        }),
      ),
    );
  }

  /** Partially update epic
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-partiallyUpdateEpic)
   * @param epicIdOrKey - Id of epic to retrieve
   * @param data - data to set
   */
  partiallyUpdateEpic(
    epicIdOrKey: string,
    data: operations["partiallyUpdateEpic"]["requestBody"]["content"]["application/json"],
  ) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/epic/${epicIdOrKey}`,
        }),
        {
          method: "POST",
          data,
        },
      ),
    );
  }

  /** Get issues for epic
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getIssuesForEpic)
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-getIssuesWithoutEpic)
   * @param epicId - Id of epic to retrieve, specify 'none' to get issues without an epic.
   * @param [startAt=0] - The starting index of the returned issues. Base index: 0.
   * @param [maxResults=50] - The maximum number of issues to return per page. Default: 50.
   * @param [jql] - Filters results using a JQL query.
   * @param [validateQuery] - Specifies whether to validate the JQL query or not.
   * Default: true.
   * @param [fields] - The list of fields to return for each issue.
   */
  getIssuesForEpic(
    epicId: string,
    startAt = 0,
    maxResults = 50,
    jql: string | undefined = undefined,
    validateQuery = true,
    fields: string[] | undefined = undefined,
  ): Promise<components["schemas"]["SearchResults"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/epic/${epicId}/issue`,
          query: {
            startAt,
            maxResults,
            jql,
            validateQuery,
            fields: fields?.join(","),
          },
        }),
      ),
    );
  }

  /** Move Issues to Epic
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-moveIssuesToEpic)
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-removeIssuesFromEpic)
   * @param epicIdOrKey - Id of epic to move issue to, or 'none' to remove from epic
   * @param {array} issues - array of issues to move
   */
  moveIssuesToEpic(epicIdOrKey: string, issues: string[]) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/epic/${epicIdOrKey}/issue`,
        }),
        {
          method: "POST",
          data: {
            issues,
          },
        },
      ),
    );
  }

  /** Rank Epics
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/#agile/1.0/epic-rankEpics)
   * @param epicIdOrKey - Id of epic
   * @param data - value to set
   */
  rankEpics(epicIdOrKey: string, data: operations["rankEpics"]["requestBody"]["content"]["application/json"]) {
    return this.doRequest<never>(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/epic/${epicIdOrKey}/rank`,
        }),
        {
          method: "PUT",
          data,
        },
      ),
    );
  }

  /**
   * Get server info
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v2/#api-api-2-serverInfo-get)
   */
  getServerInfo(): Promise<components["schemas"]["ServerInformation"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/serverInfo",
        }),
      ),
    );
  }

  /**
   * Get metadata for creating an issue.
   * [Jira Doc](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get)
   */
  getIssueCreateMetadata(optional: cloudOperations['getCreateIssueMeta']['parameters']['query'] = {}): Promise<components["schemas"]["IssueCreateMetadata"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/issue/createmeta",
          query: {
            issuetypeIds: optional.issuetypeIds?.join(","),
            projectIds: optional.projectIds?.join(","),
            projectKeys: optional.projectKeys?.join(","),
            issuetypeNames: optional.issuetypeNames?.join(","),
            expand: optional.expand,
          },
        }),
      ),
    );
  }

  getIssueCreateMetaProjectIssueTypes(projectIdOrKey: string | number, startAt: number, maxResults: number): Promise<components["schemas"]["ProjectIssueCreateMetadata"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/createmeta/${projectIdOrKey}/issuetypes`,
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  getIssueCreateMetaFields(projectIdOrKey: string | number, issueTypeId: string, startAt: number, maxResults: number): Promise<components["schemas"]["FieldCreateMetadata"]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/issue/createmeta/${projectIdOrKey}/issuetypes/${issueTypeId}`,
          query: {
            startAt,
            maxResults,
          },
        }),
      ),
    );
  }

  getWorkflows(query = {}): Promise<components["schemas"]["DeprecatedWorkflow"][]> {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeUri({
          pathname: "/workflow",
          query: query,
        }),
        {
          method: "GET",
        },
      ),
    );
  }

  getWorkflowScheme(projectKeyOrId: string, query = {}) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/project/${projectKeyOrId}/workflowscheme`,
          query: query,
        }),
        {
          method: "GET",
        },
      ),
    );
  }

  /** Generic Get Request
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/2/)
   * @param endpoint - Rest API endpoint
   */
  genericGet(endpoint: string) {
    return this.doRequest<unknown>(
      this.makeRequestHeader(
        this.makeUri({
          pathname: `/${endpoint}`,
        }),
      ),
    );
  }

  /** Generic Get Request to the Agile API
   * [Jira Doc](https://docs.atlassian.com/jira-software/REST/cloud/2/)
   * @param endpoint - Rest API endpoint
   */
  genericAgileGet(endpoint: string) {
    return this.doRequest(
      this.makeRequestHeader(
        this.makeAgileUri({
          pathname: `/${endpoint}`,
        }),
      ),
    );
  }
}
