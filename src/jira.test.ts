import { expect, describe, it } from "vitest";
import { JiraApi, JiraApiOptions } from "./jira";
import axios, { Axios, AxiosError } from "axios";
import MockAdapter from "axios-mock-adapter";

function createTestInstance(actualOptions: Partial<JiraApiOptions> = {}) {
  const finalOptions: JiraApiOptions = {
    protocol: actualOptions.protocol || "http",
    host: actualOptions.host || "jira.somehost.com",
    port: "port" in actualOptions ? actualOptions.port : 8080,
    username: actualOptions.username ?? "someusername",
    password: actualOptions.password ?? "somepassword",
    apiVersion: actualOptions.apiVersion || 2,
    timeout: actualOptions.timeout || undefined,
    base: actualOptions.base || "",
    intermediatePath: actualOptions.intermediatePath,
    bearer: actualOptions.bearer || null,
  };
  if ("axios" in actualOptions) {
    finalOptions.axios = actualOptions.axios;
  } else {
    finalOptions.strictSSL = finalOptions.strictSSL ?? true;
    finalOptions.ca = finalOptions.ca ?? undefined;
  }

  const jira = new JiraApi(finalOptions);
  const mockAdapter = new MockAdapter(jira.axios);

  return {
    jira,
    mockAdapter,
  };
}

describe("Jira API Tests", () => {
  describe("Constructor Tests", () => {
    it("Constructor functions properly", () => {
      const { jira } = createTestInstance();

      expect(jira.protocol).to.eql("http");
      expect(jira.host).to.eql("jira.somehost.com");
      expect(jira.port).to.eql(8080);
      expect(jira.baseOptions.auth.username).to.eql("someusername");
      expect(jira.baseOptions.auth.password).to.eql("somepassword");
      expect(jira.apiVersion).to.eql(2);
    });

    it("Constructor with no auth credentials", () => {
      const { jira } = createTestInstance({
        username: "",
        password: "",
      });

      expect(jira.baseOptions.auth).to.be.undefined;
    });

    it("Constructor with bearer credentials", () => {
      const { jira } = createTestInstance({
        bearer: "testBearer",
      });

      expect(jira.baseOptions.headers.Authorization).to.eql("Bearer testBearer");
    });

    it("Constructor with timeout", () => {
      const { jira } = createTestInstance({
        timeout: 2,
      });

      expect(jira.baseOptions.timeout).to.equal(2);
    });

    it("Constructor with with ssl checking disabled", () => {
      const { jira } = createTestInstance({
        strictSSL: false,
      });

      expect(jira.httpsAgent).toBeDefined();
    });

    it("should allow the user to pass in a certificate authority", () => {
      const { jira } = createTestInstance({
        ca: "fakestring",
      });

      expect(jira.httpsAgent).toBeDefined();
    });

    it("should allow the user to pass in an axios instance", () => {
      const { jira } = createTestInstance({
        axios: axios.create(),
      });

      expect(jira.httpsAgent).toBeUndefined();
    });
  });

  describe("makeRequestHeader Tests", () => {
    it("makeRequestHeader functions properly in the average case", () => {
      const { jira } = createTestInstance();

      expect(
        jira.makeRequestHeader(
          jira.makeUri({
            pathname: "/somePathName",
          }),
        ),
      ).to.eql({
        method: "GET",
        url: "http://jira.somehost.com:8080/rest/api/2/somePathName",
      });
    });

    it("makeRequestHeader functions properly with a different method", () => {
      const { jira } = createTestInstance();

      expect(
        jira.makeRequestHeader(
          jira.makeUri({
            pathname: "/somePathName",
          }),
          { method: "POST" },
        ),
      ).toEqual({
        method: "POST",
        url: "http://jira.somehost.com:8080/rest/api/2/somePathName",
      });
    });
  });

  describe("makeUri", () => {
    it("builds url with pathname and default host, protocol, port, and base api", () => {
      const { jira } = createTestInstance();

      expect(jira.makeUri({ pathname: "/somePathName" })).to.eql(
        "http://jira.somehost.com:8080/rest/api/2/somePathName",
      );
    });

    it("builds url with intermediatePath", () => {
      const { jira } = createTestInstance();

      expect(jira.makeUri({ pathname: "/somePathName", intermediatePath: "intermediatePath" })).to.eql(
        "http://jira.somehost.com:8080/intermediatePath/somePathName",
      );
    });

    it("builds url with globally specified intermediatePath", () => {
      const { jira } = createTestInstance({
        intermediatePath: "intermediatePath",
      });

      expect(jira.makeUri({ pathname: "/somePathName" })).to.eql(
        "http://jira.somehost.com:8080/intermediatePath/somePathName",
      );
    });

    it("builds url with query string parameters", () => {
      const { jira } = createTestInstance();

      const url = jira.makeUri({
        pathname: "/path",
        query: {
          fields: "field1,field2",
          expand: "three",
        },
      });

      expect(url).toBe("http://jira.somehost.com:8080/rest/api/2/path?fields=field1%2Cfield2&expand=three");
    });

    it("makeWebhookUri functions properly in the average case", () => {
      const { jira } = createTestInstance();

      expect(
        jira.makeWebhookUri({
          pathname: "/somePathName",
        }),
      ).to.eql("http://jira.somehost.com:8080/rest/webhooks/1.0/somePathName");
    });

    it("makeUri functions properly no port http", () => {
      const { jira } = createTestInstance({
        port: undefined,
      });

      expect(
        jira.makeUri({
          pathname: "/somePathName",
        }),
      ).to.eql("http://jira.somehost.com/rest/api/2/somePathName");
    });

    it("makeUri functions properly no port https", () => {
      const { jira } = createTestInstance({
        protocol: "https",
        port: undefined,
      });

      expect(
        jira.makeUri({
          pathname: "/somePathName",
        }),
      ).to.eql("https://jira.somehost.com/rest/api/2/somePathName");
    });
  });

  describe("doRequest Tests", () => {
    it("doRequest functions properly in the default case", async () => {
      const { jira, mockAdapter } = createTestInstance();
      mockAdapter.onGet("http://jira.somehost.com:8080/rest/api/2/somePathName").reply(200, "Successful response!");
      mockAdapter.onGet().reply(200, "Nope");

      const response = await jira.doRequest({
        url: jira.makeUri({ pathname: "/somePathName" }),
      });

      expect(response).toEqual("Successful response!");
    });

    it("doRequest authenticates properly when specified", async () => {
      const username = "someusername";
      const password = "somepassword";

      const { jira, mockAdapter } = createTestInstance({
        username,
        password,
      });
      mockAdapter
        .onGet("http://jira.somehost.com:8080/rest/api/2/somePathName", {
          headers: {
            Authorization: "Basic c29tZXVzZXJuYW1lOnNvbWVwYXNzd29yZA==",
          },
        })
        .reply(200, "Successful response!");

      const result = await jira.doRequest({
        url: jira.makeUri({ pathname: "/somePathName" }),
      });
      expect(result).toBe("Successful response!");
    });

    it("doRequest times out with specified option", async () => {
      const { jira, mockAdapter } = createTestInstance({
        timeout: 1,
      });
      mockAdapter.onGet().timeout();

      try {
        const result = await jira.doRequest({});
      } catch (e) {
        expect(e.message).toBe("timeout of 1ms exceeded");
      }
    });

    it("doRequest throws an error properly", async () => {
      const { jira, mockAdapter } = createTestInstance();

      expect(jira.doRequest({})).rejects.toThrowError("Request failed with status code 404");
    });

    it("doRequest throws a list of errors properly", async () => {
      const { jira, mockAdapter } = createTestInstance();
      mockAdapter.onGet().reply(400, { errorMessages: ["some error to throw"] });

      try {
        await jira.doRequest({});
      } catch (error) {
        expect(axios.isAxiosError(error)).toBe(true);
        expect(error.response?.status).toBe(400);
      }
    });

    it("doRequest does not throw an error on empty response", async () => {
      const { jira, mockAdapter } = createTestInstance();
      mockAdapter.onGet().reply(200, undefined);

      const response = await jira.doRequest({});
      expect(response).to.be.undefined;
    });

    it("doRequest throws an error when request failed", async () => {
      const { jira, mockAdapter } = createTestInstance();
      mockAdapter.onGet().reply(404, "This is an error message");

      expect(jira.doRequest({})).rejects.toThrowError("Request failed with status code 404");
    });
  });
});
