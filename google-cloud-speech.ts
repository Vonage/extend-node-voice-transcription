import { SpeechToTextDriver } from "./speech-to-text-driver";
const speech = require("@google-cloud/speech");

export interface GoogleCloudConfig {
  keyFileName: string;
  projectId: string;
}

export class GoogleCloudSpeechDriver implements SpeechToTextDriver {
  config: any;
  client: any;
  request: any;
  recognizeStream: any;

  constructor(config: any = {}) {
    this.config = config;
    this.client = new speech.SpeechClient(this.config.gCloudSpeech);

    if (this.config.audioRate === "audio/l16;rate=16000") {
      this.request = {
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
        interimResults: false,
      };
    }
  }

  /**
   * @inheritdoc
   */
  destroy(): void {
    if (this.recognizeStream !== 'undefined') {
      this.recognizeStream.destroy();
    }
  }

  /**
   * @deprecated Replaced with this.stream
   * @param msg WebSocket message that is really an audio block
   */
  write(msg: string) {
    this.stream(msg);
  }

  /**
   * @inheritdoc
   */
  stream(audio: string): void {
    if (this.recognizeStream === 'undefined') {
      this.recognizeStream = this.client
        .streamingRecognize(this.request)
        .on("error", console.error)
        .on("data", (data: any) => {
          this.config.handler(data.results[0].alternatives[0].transcript);
        });
    }
    this.recognizeStream.write(audio);
  }
}
