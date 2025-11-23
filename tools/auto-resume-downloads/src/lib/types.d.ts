declare const downloadInterface: {
  /**
   * @param strArray 下載項目列表字串
   * - `"-1"`：代表操作套用於所有項目。
   * - `"1"`：代表單一 sid。
   * - `"1|2|3"`：代表多個 sid，會依 `|` 拆分。
   */
  StartAllDownloads(strArray: string): void;
};
