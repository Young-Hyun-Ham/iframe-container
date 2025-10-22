
// data.result에서 우선순위대로 첫 값 찾기
function getFirstNonEmpty(obj: any, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return undefined;
}

// "YYYY-MM-DD" 또는 "YYYY/MM/DD" (+ " HH:mm[:ss]") 지원 → Date(로컬) ms
function parseLocalDateTime(dateStr?: string, timeStr?: string): number | null {
  if (!dateStr) return null;

  // 슬래시→하이픈 정규화
  let s = dateStr.replace(/\//g, "-").trim();
  let t = timeStr?.trim();

  // dateStr에 시간이 같이 들어있을 때 (공백/혹은 T)
  if (!t) {
    const m = s.match(
      /^(\d{4}-\d{1,2}-\d{1,2})(?:[ T](\d{1,2}:\d{2}(?::\d{2})?))?$/
    );
    if (m) {
      s = m[1];                 // YYYY-MM-DD
      t = m[2];                 // HH:mm[:ss] | undefined
    }
  }

  const [y, m2, d] = s.split("-").map(Number);
  if (!y || !m2 || !d) return null;

  let hh = 0, mm = 0, ss = 0;
  if (t) {
    const tm = t.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (tm) {
      hh = Number(tm[1]); mm = Number(tm[2]); ss = Number(tm[3] ?? 0);
    }
  }

  return new Date(y, m2 - 1, d, hh, mm, ss).getTime(); // 로컬 타임존
}

/**
 * 문자열에서 날짜 또는 시간 부분을 추출하여 지정한 형식으로 반환
 * @param datetimeStr 예: "2018/05/15 15:00:00"
 * @param type "date" | "time"
 * @param format 예: "YYYY-MM-DD" | "HH:mm" 등
 * @returns 형식에 맞게 변환된 문자열
 */
function formatDateTime(
  datetimeStr: string,
  type: "date" | "time",
  format: string
): string {
  if (!datetimeStr) return "";

  // 1) 공백 기준으로 날짜와 시간 분리
  const [datePart, _timePart] = datetimeStr.trim().split(" ");
  if (!datePart) return "";

  // 2) 날짜 파싱
  const date = new Date(datetimeStr.replace(/\//g, "-"));
  if (isNaN(date.getTime())) return "";

  // 3) helper: 두 자리수 패딩
  const pad = (n: number) => n.toString().padStart(2, "0");

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const MM = pad(date.getMinutes());
  const SS = pad(date.getSeconds());

  // 4) 변환 처리
  if (type === "date") {
    switch (format) {
      case "YYYY-MM-DD": return `${yyyy}-${mm}-${dd}`;
      case "YYYY/MM/DD": return `${yyyy}/${mm}/${dd}`;
      case "YY-MM-DD":   return `${String(yyyy).slice(-2)}-${mm}-${dd}`;
      default: return `${yyyy}-${mm}-${dd}`; // 기본
    }
  } else if (type === "time") {
    switch (format) {
      case "HH:mm": return `${HH}:${MM}`;
      case "HH:mm:ss": return `${HH}:${MM}:${SS}`;
      case "hh:mm A": {
        const h = date.getHours() % 12 || 12;
        const ampm = date.getHours() < 12 ? "AM" : "PM";
        return `${pad(h)}:${MM} ${ampm}`;
      }
      default: return `${HH}:${MM}:${SS}`;
    }
  }

  return "";
}

function diffToParts(fromMs: number, toMs: number) {
  const delta = toMs - fromMs;
  const abs = Math.abs(delta);
  const DAY = 86400000, HOUR = 3600000, MIN = 60000;
  const days = Math.floor(abs / DAY);
  const hours = Math.floor((abs % DAY) / HOUR);
  const minutes = Math.floor((abs % HOUR) / MIN);
  return { days, hours, minutes, ms: delta };
}

function formatParts(
  parts: {days: number; hours: number; minutes: number},
  maxUnits: number = 2
) {
  const segs: string[] = [];
  if (parts.days)   segs.push(`${parts.days}Day${parts.days === 1 ? '' : 's'}`);
  if (parts.hours)  segs.push(`${parts.hours}H`);
  if (parts.minutes)segs.push(`${parts.minutes}Min`);
  return (segs.length ? segs : ['0Min']).slice(0, maxUnits).join(' ');
}

/**
 * 현재 시각을 포맷 문자열로 반환
 * 지원 토큰: YYYY, YY, MM, DD, HH, mm, ss
 * @param format 예) "YYYY-MM-DD", "YYYY/MM/DD HH:mm:ss"
 * @param tz "local" | "utc" (기본: local)
 * @returns 포맷된 문자열
 */
function getNowString(format = "YYYY-MM-DD HH:mm:ss", tz: "local" | "utc" = "local"): string {
  const d = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");

  const year  = tz === "utc" ? d.getUTCFullYear() : d.getFullYear();
  const month = tz === "utc" ? d.getUTCMonth() + 1 : d.getMonth() + 1;
  const day   = tz === "utc" ? d.getUTCDate() : d.getDate();
  const hour  = tz === "utc" ? d.getUTCHours() : d.getHours();
  const min   = tz === "utc" ? d.getUTCMinutes() : d.getMinutes();
  const sec   = tz === "utc" ? d.getUTCSeconds() : d.getSeconds();

  // 간단 토큰 치환
  return format
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MM/g, pad(month))
    .replace(/DD/g, pad(day))
    .replace(/HH/g, pad(hour))
    .replace(/mm/g, pad(min))
    .replace(/ss/g, pad(sec));
}

const getNowISO = (tz: "local" | "utc" = "local") =>
  tz === "utc" ? new Date().toISOString()
               : new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000)
                   .toISOString().replace('T', ' ').replace('Z','');

export {
  getFirstNonEmpty,
  parseLocalDateTime,
  formatDateTime,
  diffToParts,
  formatParts,
  getNowString,
  getNowISO,
}

