export interface SpeechToTextDriver {
  /**
   * Perform any cleanup when a web socket is disconnected
   */
  destroy(): void;

  /**
   * Stream audio to the transcription service
   * @param audio Websocket message of audio
   */
  stream(audio: string): void;
}
