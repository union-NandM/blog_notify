/**
 * ブログのURL
 */
const url = "";

/**
 * LINE notify の通知を発行する関数
 */
function sendLINE(token) {
  const message = `${url}`;
  const options = {
    method: "post",
    headers: { Authorization: "Bearer " + token },
    payload: { message: message },
  };
  const response = UrlFetchApp.fetch(
    "https://notify-api.line.me/api/notify",
    options
  );
}

/**
 * 持ってるトークン各々で通知を投げる関数
 * （投げる部屋を増やすときはここにトークンを追加する）
 */
function throwNotify() {
  // LINE notifyのトークンの配列
  const tokens = [];

  for (const token of tokens) {
    sendLINE(token);
  }
}

/**
 * 実行関数
 */
function checkUpdate() {
  // アクセス先の情報
  const userid = "";
  const password = "";

  // POSTメソッドのオプション
  const options = {
    method: "GET",
    headers: {
      Authorization:
        " Basic " + Utilities.base64Encode(userid + ":" + password),
    },
    muteHttpExceptions: true,
  };

  try {
    // POSTメソッドのリクエスト
    const response = UrlFetchApp.fetch(url, options);
    const content = response.getContentText("EUC-JP");

    // 正規表現
    const DATE_TEMPLATE = /\d{4}\.\d{2}\.\d{2}/g;
    const TIME_TEMPLATE = /\d{2}:\d{2}/g;
    // 区切り文字
    const DATE_SEPARATER = ".";
    const TIME_SEPARATER = ":";
    // チェックするタイミング
    const CHECK_TIME = 6;

    // html中のタイムスタンプがある箇所を抽出
    const rawDateList = Parser.data(content)
      .from('<ul class="entry_state_top">')
      .to("</ul>")
      .iterate();

    // 抽出したタイムスタンプを日付オブジェクトに変換
    const dateList = rawDateList.map((item) => {
      // 年月日の配列
      const date = item
        // 日付の抽出
        .match(DATE_TEMPLATE)[0]
        // 区切り文字で分割
        .split(DATE_SEPARATER)
        // 型変換
        .map((val) => Number(val));

      // 月を0始まりにする
      --date[1];

      // 時分の配列
      const time = item
        // 時刻の抽出
        .match(TIME_TEMPLATE)[0]
        // 区切り文字で分割-*
        .split(TIME_SEPARATER)
        // 型変換
        .map((val) => Number(val));

      // 日付オブジェクトにして返却
      return new Date(...date, ...time);
    });

    // 現在の日時を取得
    const now = new Date();

    // 今日の6時を経過ミリ秒で取得
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      CHECK_TIME
    ).getTime();

    // 昨日の6時を経過ミリ秒で取得
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      CHECK_TIME
    ).setDate(now.getDate() - 1);

    // 更新があったら通知を発行
    for (const date of dateList) {
      const updated_at = date.getTime();
      if (updated_at < today && updated_at >= yesterday) {
        throwNotify();
        break;
      }
    }
  } catch (e) {
    Logger.log(e.message);
  }
}
