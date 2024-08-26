testcontainers-mattermost-nodejs
================================

Mattermost module for [Testcontainers for NodeJS](https://node.testcontainers.org/)

## Usage

```bash
npm install @mattermost/testcontainers-mattermost-nodejs --save-dev
```

```js
import MattermostContainer from "testcontainers-mattermost-nodejs";

const container = await new MattermostContainer().start();
const { output, exitCode } = await container.exec([
  "curl",
  cointainer.URL(),
]);
console.log(output);

await container.stop();
```
