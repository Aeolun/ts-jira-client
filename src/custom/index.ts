export interface JiraAvatarUrls {
  "16x16": string;
  "24x24": string;
  "32x32": string;
  "48x48": string;
}

export interface JiraUser {
  active: boolean;
  avatarUrls: JiraAvatarUrls;
  displayName: string;
  emailAddress: string;
  key: string;
  name: string;
  self: string;
  timeZone: string;
  deleted?: boolean;
  locale?: string;
}

export interface JiraIssueType {
  avatarId: number;
  description: string;
  iconUrl: string;
  id: string;
  name: string;
  self: string;
  subtask: boolean;
}

export interface JiraField {
  id: string;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  schema: {
    type: string;
    system: string;
    custom: string;
    custom_id: string;
    items: string;
  };
}

export interface JiraPriority {
  iconUrl: string;
  id: string;
  name: string;
  self: string;
}

export interface JiraComments {
  comments: {
    author: JiraUser;
    updateAuthor?: JiraUser;
    body: string;
    created: string;
    id: string;
    self: string;
    updated: string;
  }[];
  maxResults: number;
  startAt: number;
  total: number;
}

export interface JiraStatus {
  description: string;
  iconUrl: string;
  id: string;
  name: string;
  self: string;
  statusCategory: {
    colorName: string;
    id: number;
    key: string;
    name: string;
    self: string;
  };
}

export interface JiraInwardOutwardIssue {
  fields: {
    issuetype: JiraIssueType;
    priority: JiraPriority;
    status: JiraStatus;
    summary: string;
  };
  id: string;
  key: string;
  self: string;
}

export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
}

export interface JiraIssueLink {
  id: string;
  inwardIssue?: JiraInwardOutwardIssue;
  outwardIssue?: JiraInwardOutwardIssue;
  self: string;
  type: {
    id: string;
    inward: string;
    name: string;
    outward: string;
    self: string;
  };
}

export interface JiraChangeLog {
  histories: {
    author: JiraUser;
    created: string;
    id: string;
    items: {
      field: string;
      fieldtype: string;
      to: string;
      toString: string;
    }[];
  }[];
  maxResults: number;
  startAt: number;
  total: number;
}

export interface JiraAttachment {
  author?: JiraUser;
  content: string;
  created: string;
  filename: string;
  id: string;
  mimeType: string;
  self: string;
  size: number;
  thumbnail?: string;
}

export interface JiraIssue {
  fields: {
    assignee?: JiraUser | null;
    created: string;
    creator?: JiraUser;
    fixVersions: {
      archived: boolean;
      id: string;
      name: string;
      released: boolean;
      self: string;
    }[];
    issuetype: JiraIssueType;
    labels?: string[];
    parent?: JiraIssue;
    priority: JiraPriority;
    reporter: JiraUser;
    resolutiondate: string;
    status: JiraStatus;
    updated: string;
    aggregatetimeestimate?: number;
    components: {
      id: string;
      name: string;
      self: string;
    }[];
    subtasks: unknown[];
    summary: string;
    description: string;
    attachment?: JiraAttachment[];
    comment: JiraComments;
    issuelinks: JiraIssueLink[];
    [key: string]: unknown;
  };
  renderedFields?: {
    comment: JiraComments;
  };
  transitions?: JiraTransition[];
  changelog: JiraChangeLog;
  editMeta?: unknown;
  loading: boolean;
  id: string;
  key: string;
  self: string;
}

export interface JiraProjectCategory {
  self: string;
  id: string;
  name: string;
  description: string;
}

export interface JiraProject {
  id: string;
  key: string;
  self: string;
  name: string;
  avatarUrls?: JiraAvatarUrls;
  projectCategory: JiraProjectCategory;
}
