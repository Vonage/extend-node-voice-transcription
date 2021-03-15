import {
  GoogleCloudConfig,
  GoogleCloudSpeechDriver,
} from "./google-cloud-speech";
import { CognitiveSpeechConfig, AzureDriver } from "./azure";
import { SpeechToTextDriver } from "./speech-to-text-driver";
import { config } from "process";

interface TranscribeCallbackFunction {
  (text: string): void;
}

interface Config {
  audioRate: string;
  handler: TranscribeCallbackFunction;
  driver: SpeechToTextDriver;
  gCloudSpeech: GoogleCloudConfig;
  azureCognitiveSpeech: CognitiveSpeechConfig;
}

class SpeechToText {
  config: Config;
  driver: SpeechToTextDriver;

  constructor(config: Config) {
    this.config = config;
    let driver: SpeechToTextDriver | undefined = undefined;

    if (!this.config.hasOwnProperty("audioRate")) {
      this.config.audioRate = "audio/l16;rate=16000";
    }

    if (this.config.driver) {
      driver = this.config.driver;
    } else {
      if (config.gCloudSpeech !== undefined) {
        driver = new GoogleCloudSpeechDriver(this.config);
      }

      if (config.azureCognitiveSpeech !== undefined) {
        driver = new AzureDriver(this.config);
      }
    }

    if (driver === undefined) {
      throw new Error(
        "You need to pass valid configuration for a supported driver"
      );
    }

    this.driver = driver;
  }

  createNCCO(callbackUrl: string): object {
    return [
      {
        action: "connect",
        endpoint: [
          {
            type: "websocket",
            uri: callbackUrl,
            "content-type": this.config.audioRate,
          },
        ],
      },
    ];
  }

  destroy(): void {
    this.driver.destroy();
  }

  getDriver(): SpeechToTextDriver {
    return this.driver;
  }

  stream(msg: string): void {
    this.driver.stream(msg);
  }
}

module.exports = {
  Config: config,
  SpeechToText: SpeechToText,
};
