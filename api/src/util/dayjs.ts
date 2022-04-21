import * as dayjs from 'dayjs';

import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// 日本時間に変換する
import 'dayjs/locale/ja';

// プラグイン拡張
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');
dayjs.locale('ja');

export default dayjs;
