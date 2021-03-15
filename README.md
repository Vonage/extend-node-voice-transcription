# Vonage Voice Transcription for NodeJS
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Apache 2.0 licensed](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE.txt)

<img src="https://developer.nexmo.com/assets/images/Vonage_Nexmo.svg" height="48px" alt="Nexmo is now known as Vonage" />

This is a small wrapper around various Voice Transcription services to make it easier to provide voice transcription from our Voice API.
To use this, you'll need a Vonage account. Sign up [for free at nexmo.com][signup].

**This bundle is currently in development/beta status, so there may be bugs**

 * [Installation](#installation)
 * [Usage](#usage)
 * [Contributing](#contributing) 

## Installation

Open a command console, enter your project directory and execute the
following command to download the latest stable version of this module:

```console
$ npm install @vonage/extend-voice-transcription
```

## Usage

### Configuring Transcription Services

This module relies on external services to provide the actual transcription
services. We currently support:

* Google Cloud Speech
* Azure Cognitive Services

Each service takes a configuration object that is passed to the underlying
service. To enable a service, just pass in the appropriate configuration
object.

#### Google Cloud Speech

```javascript
const { SpeechToText } = require("@vonage/extend-voice-transcription");

const STTConnector = new SpeechToText({
  audioRate: "audio/l16;rate=16000",
  handler: (data) => {
    console.log(`Vonage Transcription: ${data}`);
  },
  gCloudSpeech: {
      keyFilename: './keys.json',
      projectId: 'project-name'
  },
});
```

#### Azure Cognitive Services

```javascript
const { SpeechToText } = require("@vonage/extend-voice-transcription");

const STTConnector = new SpeechToText({
  audioRate: "audio/l16;rate=16000",
  handler: (data) => {
    console.log(`Vonage Transcription: ${data}`);
  },
  azureCognitiveSpeech: {
    key: "azure-key",
    region: "region",
  },
});
```
### Integration with Voice API Web Sockets

This module is designed to work directly with incoming audio frames from the
Vonage Voice API web sockets. Audio can be streamed through the web socket
and directly passed to the transcription service. A handler is defined that
will work with the returned data.

When configuring the `SpeechToText` object, you will need to pass in the
`audioRate` that is being used by the web socket, a `handler` which will
accept a single string parameter (the transcribed text), and the configuration
data for the service you are using.

#### Sample Usage with Express

This sample application sets up a small Express web socket application. The socket
listens on the `/echo` route, and will pass the audio directly to the Azure Cognitive
Speech API. Once the text has been transcribed and returned, it is passed to the `handler`
function we defined that will output the text to the application's console log.

```js
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const port = 3000;
const { SpeechToText } = require("@vonage/extend-voice-transcription");

const STTConnector = new SpeechToText({
  audioRate: "audio/l16;rate=16000",
  handler: (data) => {
    console.log(`Vonage Transcription: ${data}`);
  },
  azureCognitiveSpeech: {
    key: "azure-key",
    region: "region",
  },
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(
    JSON.stringify(
      STTConnector.createNCCO(`${req.protocol}://${req.hostname}/echo`)
    )
  );
});

app.get("/events", (req, res) => {
  console.log(req);
});

app.ws("/echo", async (ws, req) => {
  ws.on("message", async (msg) => {
    if (typeof msg === "string") {
      console.log(msg);
    } else {
      STTConnector.stream(msg);
    }
  });

  ws.on("close", () => {
    STTConnector.destroy();
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
```
## Contributing

This library is actively developed, and we love to hear from you! Please feel free to [create an issue][issues] or [open a pull request][pulls] with your questions, comments, suggestions and feedback.

[signup]: https://dashboard.nexmo.com/sign-up?utm_source=DEV_REL&utm_medium=github&utm_campaign=extend-voice-transcription
[issues]: https://github.com/Vonage/extend-node-voice-transcription/issues
[pulls]: https://github.com/Vonage/extend-node-voice-transcription/pulls