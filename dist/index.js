"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => MattermostContainer
});
module.exports = __toCommonJS(src_exports);
var import_testcontainers = require("testcontainers");
var import_postgresql = require("@testcontainers/postgresql");
var import_client = require("@mattermost/client");
var import_pg = require("pg");
var defaultEmail = "admin@example.com";
var defaultUsername = "admin";
var defaultPassword = "admin";
var defaultTeamName = "test";
var defaultTeamDisplayName = "Test";
var defaultMattermostImage = "mattermost/mattermost-enterprise-edition";
var MattermostContainer = class {
  constructor() {
    this.db = () => __async(this, null, function* () {
      var _a, _b;
      const port = (_a = this.pgContainer) == null ? void 0 : _a.getMappedPort(5432);
      const host = (_b = this.pgContainer) == null ? void 0 : _b.getHost();
      const database = "mattermost_test";
      const client = new import_pg.Client({ user: "user", password: "pass", host, port, database });
      yield client.connect();
      return client;
    });
    this.getAdminClient = () => __async(this, null, function* () {
      return this.getClient(this.username, this.password);
    });
    this.getClient = (username, password) => __async(this, null, function* () {
      const url = this.url();
      const client = new import_client.Client4();
      client.setUrl(url);
      yield client.login(username, password);
      return client;
    });
    this.stop = () => __async(this, null, function* () {
      var _a, _b, _c;
      yield (_a = this.pgContainer) == null ? void 0 : _a.stop();
      yield (_b = this.container) == null ? void 0 : _b.stop();
      yield (_c = this.network) == null ? void 0 : _c.stop();
    });
    this.createAdmin = (email, username, password) => __async(this, null, function* () {
      var _a;
      yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "user", "create", "--email", email, "--username", username, "--password", password, "--system-admin", "--email-verified"]);
    });
    this.createUser = (email, username, password) => __async(this, null, function* () {
      var _a;
      yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "user", "create", "--email", email, "--username", username, "--password", password, "--email-verified"]);
    });
    this.createTeam = (name, displayName) => __async(this, null, function* () {
      var _a;
      yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "team", "create", "--name", name, "--display-name", displayName]);
    });
    this.addUserToTeam = (username, teamname) => __async(this, null, function* () {
      var _a;
      yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "team", "users", "add", teamname, username]);
    });
    this.getLogs = (lines) => __async(this, null, function* () {
      var _a;
      const result = yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "logs", "--number", lines.toString()]);
      if (result) {
        return result.output;
      }
      return "";
    });
    this.setSiteURL = () => __async(this, null, function* () {
      var _a, _b, _c;
      const url = this.url();
      yield (_a = this.container) == null ? void 0 : _a.exec(["mmctl", "--local", "config", "set", "ServiceSettings.SiteURL", url]);
      const containerPort = (_b = this.container) == null ? void 0 : _b.getMappedPort(8065);
      yield (_c = this.container) == null ? void 0 : _c.exec(["mmctl", "--local", "config", "set", "ServiceSettings.ListenAddress", `${containerPort}`]);
    });
    this.installPlugin = (pluginPath, pluginID, pluginConfig) => __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      const patch = JSON.stringify({ PluginSettings: { Plugins: { [pluginID]: pluginConfig } } });
      yield (_a = this.container) == null ? void 0 : _a.copyFilesToContainer([{ source: pluginPath, target: `/tmp/plugin.tar.gz` }]);
      yield (_b = this.container) == null ? void 0 : _b.copyContentToContainer([{ content: patch, target: `/tmp/plugin.config.json` }]);
      yield (_c = this.container) == null ? void 0 : _c.exec(["mmctl", "--local", "plugin", "add", "/tmp/plugin.tar.gz"]);
      yield (_d = this.container) == null ? void 0 : _d.exec(["mmctl", "--local", "config", "patch", "/tmp/plugin.config.json"]);
      yield (_e = this.container) == null ? void 0 : _e.exec(["mmctl", "--local", "plugin", "enable", pluginID]);
    });
    this.withEnv = (env, value) => {
      this.envs[env] = value;
      return this;
    };
    this.withAdmin = (email, username, password) => {
      this.email = email;
      this.username = username;
      this.password = password;
      return this;
    };
    this.withTeam = (teamName, teamDisplayName) => {
      this.teamName = teamName;
      this.teamDisplayName = teamDisplayName;
      return this;
    };
    this.withConfigFile = (cfg) => {
      const cfgFile = {
        source: cfg,
        target: "/etc/mattermost.json"
      };
      this.configFile.push(cfgFile);
      this.command.push("-c", "/etc/mattermost.json");
      return this;
    };
    this.withPlugin = (pluginPath, pluginID, pluginConfig) => {
      this.plugins.push({ id: pluginID, path: pluginPath, config: pluginConfig });
      return this;
    };
    this.start = () => __async(this, null, function* () {
      this.network = yield new import_testcontainers.Network().start();
      this.pgContainer = yield new import_postgresql.PostgreSqlContainer("docker.io/postgres:15.2-alpine").withExposedPorts(5432).withDatabase("mattermost_test").withUsername("user").withPassword("pass").withNetworkMode(this.network.getName()).withWaitStrategy(import_testcontainers.Wait.forLogMessage("database system is ready to accept connections")).withNetworkAliases("db").start();
      this.container = yield new import_testcontainers.GenericContainer(defaultMattermostImage).withEnvironment(this.envs).withExposedPorts(8065).withNetwork(this.network).withNetworkAliases("mattermost").withCommand(this.command).withWaitStrategy(import_testcontainers.Wait.forLogMessage("Server is listening on")).withCopyFilesToContainer(this.configFile).withLogConsumer((stream) => {
        stream.on("data", (data) => {
          if (data.includes('"plugin_id":"mattermost-ai"')) {
            console.log(data);
          }
        });
      }).start();
      yield this.setSiteURL();
      yield this.createAdmin(this.email, this.username, this.password);
      yield this.createTeam(this.teamName, this.teamDisplayName);
      yield this.addUserToTeam(this.username, this.teamName);
      for (const plugin of this.plugins) {
        yield this.installPlugin(plugin.path, plugin.id, plugin.config);
      }
      return this;
    });
    this.command = ["mattermost", "server"];
    const dbconn = `postgres://user:pass@db:5432/mattermost_test?sslmode=disable`;
    this.envs = {
      "MM_SQLSETTINGS_DATASOURCE": dbconn,
      "MM_SQLSETTINGS_DRIVERNAME": "postgres",
      "MM_SERVICESETTINGS_ENABLELOCALMODE": "true",
      "MM_PASSWORDSETTINGS_MINIMUMLENGTH": "5",
      "MM_PLUGINSETTINGS_ENABLEUPLOADS": "true",
      "MM_FILESETTINGS_MAXFILESIZE": "256000000",
      "MM_LOGSETTINGS_CONSOLELEVEL": "DEBUG",
      "MM_LOGSETTINGS_FILELEVEL": "DEBUG",
      "MM_SERVICESETTINGS_ENABLEDEVELOPER": "true",
      "MM_SERVICESETTINGS_ENABLETESTING": "true"
    };
    this.email = defaultEmail;
    this.username = defaultUsername;
    this.password = defaultPassword;
    this.teamName = defaultTeamName;
    this.teamDisplayName = defaultTeamDisplayName;
    this.plugins = [];
    this.configFile = [];
  }
  url() {
    var _a, _b;
    const containerPort = (_a = this.container) == null ? void 0 : _a.getMappedPort(8065);
    const host = (_b = this.container) == null ? void 0 : _b.getHost();
    return `http://${host}:${containerPort}`;
  }
};
//# sourceMappingURL=index.js.map