import React, { useEffect, useMemo, useState } from 'react';
import styles from './iframeScenrio.module.css';
import calendarIcon from '../public/calendar.svg';
import clockIcon from '../public/clock.png';
import { diffToParts, formatDateTime, formatParts, getFirstNonEmpty, getNowString, parseLocalDateTime } from './utils';

interface ResultData {
	blNr?: string;
	dispBlNr?: string;
	shpGameCd?: string;
	vslCd?: string;
	vslVoyNr?: string;
	scnCd?: string;
	polCd?: string;
	polNodeNm?: string;
	polNm?: string;
	podCd?: string;
	podNodeNm?: string;
	custEtaDt?: string;
	currRtbDt?: string;
	currEddDt?: string;
	uastEtaDt?: string;
	actlArrvDt?: string;
	actlBrthDt?: string;
	actlDeptDt?: string;
	contNr?: string;
	[key: string]: any;
}

interface ApiResponse {
	result: ResultData;
}

// parameter base64 decode
async function decodeBase64Data(encodedStr: string) {
	try {
		const decodedStr = atob(encodedStr);
		const data = JSON.parse(decodedStr);
		return data;
	} catch (e) {
		console.error("오류가 발생했습니다:", e);
		return null;
	}
}

// select box data 가져오기
function extractContainers(result: ResultData): string[] {
  let containers: string[] = [];

  // 배열로 존재
  if (Array.isArray(result.containers)) {
    containers = (result.containers as string[]).filter(Boolean);
  }
  // contNr가 콤마로 연결된 문자열일 수 있음
  else if (typeof result.contNr === 'string' && result.contNr.trim() !== '') {
    if (result.contNr.includes(',')) {
      containers = result.contNr.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      containers = [result.contNr];
    }
  }

  // 기본 옵션 추가: label "Container No.", value ""
  return ['', ...containers];
}

type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';
function getProgressStatus(
  pct: number,
  startMs?: number | null,
  endMs?: number | null,
  nowMs?: number
): ProgressStatus {
  const now = nowMs ?? Date.now();
  if (pct <= 0) return 'not-started';
  if (pct >= 100) {
    // 정책에 따라 'overdue'를 별도 처리하려면 here에서 now > endMs 체크
    return 'completed';
  }
  if (endMs != null && now > endMs) return 'overdue';
  return 'in-progress';
}

// start/end (date+time) → 진행률(0~100). nowMs로 기준 시각 주입 가능.
function computeProgressDT(
  startDate?: string, startTime?: string,
  endDate?: string,   endTime?: string,
  opts?: { nowMs?: number }
): { pct: number; startMs: number | null; endMs: number | null } {
  const startMs = parseLocalDateTime(startDate, startTime);
  const endMs   = parseLocalDateTime(endDate, endTime);
  const now = opts?.nowMs ?? Date.now();

  if (startMs == null || endMs == null || endMs <= startMs) {
    return { pct: 0, startMs, endMs };
  }
  const pct = Math.max(0, Math.min(100, ((now - startMs) / (endMs - startMs)) * 100));
  return { pct, startMs, endMs };
}

/**
 * data.result와 진행상태로 라벨을 구성
 * - not-started: now -> start까지 남은 시간
 * - in-progress: now -> end까지 남은 시간
 * - completed:   "Completed" (원하면 완료 후 경과시간도 표시 가능)
 * - overdue:     end -> now 경과 시간 (Overdue XDays ...)
 */
function buildProgressLabel(
  status: ProgressStatus,
  startMs?: number | null,
  endMs?: number | null,
  opts?: { nowMs?: number; showCompletedElapsed?: boolean }
): { status: ProgressStatus; text: string } {
  const now = opts?.nowMs ?? Date.now();

  if (status === 'not-started' && startMs != null) {
    const p = diffToParts(now, startMs);
    return { status, text: `Starts in ${formatParts(p)}` };
  }
  if (status === 'in-progress' && endMs != null) {
    const p = diffToParts(now, endMs);
    return { status, text: `Remaining ${formatParts(p)}` };
  }
  if (status === 'overdue' && endMs != null) {
    const p = diffToParts(endMs, now);
    return { status, text: `Overdue ${formatParts(p)}` };
  }
  if (status === 'completed') {
    if (opts?.showCompletedElapsed && endMs != null) {
      const p = diffToParts(endMs, now);
      return { status, text: `Completed (${formatParts(p)} ago)` };
    }
    return { status, text: 'Completed' };
  }
  return { status, text: '-' };
}

const IframeScenrio: React.FC = () => {
	const [data, setData] = useState<ApiResponse>({
		result: {
			blNr: "",
		}
	});
	const [paramDate, setParamDate] = useState("");
	
  // 컨테이너 옵션 추출
  const containerOptions = useMemo(() => extractContainers(data.result), [data.result]);

  // 선택된 컨테이너
  const [selectedCont, setSelectedCont] = useState<string>('');

	// 컴포넌트 내부
	const [progressPct, setProgressPct] = useState(0);
	const [progressStatus, setProgressStatus] = useState<ProgressStatus>('not-started');
	const [progressText, setProgressText] = useState<string>('-');

	useEffect(() => {
		// 데이터 필드 우선순위(프로젝트 스키마에 맞춰 추가/수정 가능)
		const startDate = formatDateTime(
			getFirstNonEmpty(data.result, [
				'actlBrthDt' // 'actlDeptDt', 'actlBrthDt', 'currRtbDt'
			]) 
			?? '', 'date', ''
		);
		const startTime = formatDateTime(
			getFirstNonEmpty(data.result, [
				'actlBrthDt' // 'actlDeptDt', 'actlBrthDt', 'currRtbDt'
			]) 
			?? '', 'time', ''
		);

		const endDate = formatDateTime(
			getFirstNonEmpty(data.result, [
				'actlDeptDt' // 'custEtaDt', 'uastEtaDt', 'currEddDt', 'actlArrvDt'
			]) 
			?? '', 'date', ''
		);
		const endTime = formatDateTime(
			getFirstNonEmpty(data.result, [
				'actlDeptDt' // 'custEtaDt', 'uastEtaDt', 'currEddDt', 'actlArrvDt'
			]) 
			?? '', 'time', ''
		);

		// 시작일+시작시간 - 종료일+종료시간 진행률 계산
		let customNow = parseLocalDateTime("2018/05/15 22:30:00")!;
		customNow = parseLocalDateTime(paramDate) ?? 0;

		const { pct, startMs, endMs } = computeProgressDT(
			startDate, // startDate
			startTime,              // startTime
			endDate,  // endDate
			endTime,              // endTime
			{ nowMs: customNow }    // 기준 시각 주입
		);
		// console.log("========> ", startDate, startTime, endDate, endTime);
		// console.log("========> ", data.result.actlBrthDt, data.result.actlDeptDt, customNow, pct, startMs, endMs);

		const status = getProgressStatus(pct, startMs, endMs, customNow);
		const label = buildProgressLabel(status, startMs, endMs, {
			nowMs: customNow,              // 기준 시각 주입
			showCompletedElapsed: false,
		});

		setProgressPct(pct);
		setProgressStatus(status);
		setProgressText(label.text);
	}, [data]);

	useEffect(() => {
		(async () => {
			try {
				const params = new URLSearchParams(window.location.search);
				const isEncoding = params.get('isEncoding');
				const reqData = params.get('reqData');
				setParamDate(params.get('reqDate') ?? getNowString());
				// console.log("======================>", (typeof reqData), reqData);
				if (reqData) {
					if (isEncoding === "true") {
						const sampleData: ApiResponse = await decodeBase64Data(reqData);
						// console.log(JSON.stringify(sampleData, null, 2));
						setData(sampleData);
					} else if (isEncoding === "false") {
						const sampleData: ApiResponse = JSON.parse(reqData);
						// console.log(JSON.stringify(sampleData, null, 2));
						setData(sampleData);
					} else {
						// alert("isEncoding 데이터가 없습니다.");
					}
				} else {
					// alert("reqData 데이터가 없습니다.");
				}
			} catch (e) {
			}
		})();
	}, []);

	return (
		<div className={styles.frameParent}>
			<div className={styles.frameGroup}>
				<div className={styles.frameContainer}>
					<div className={styles.bookingNoParent}>
						<div className={styles.bookingNo}>Booking No.</div>
						<div className={styles.div}>|</div>
						<b className={styles.bookingNo}>
							{/* 선박번호 */}
							{data.result.blNr}
						</b>
					</div>
					
					<div className={styles.tableLayoutCell}>
            <div className={styles.textFieldXsmall}>
              <div className={styles.textField}>
                {/*
								<div className={styles.span}>
                  <div className={styles.inputArea}>
                    <div className={styles.inputText}>
                      <label className={styles.input}>Container No.</label>
                    </div>
                  </div>
                </div>
								*/}
								
								{/* ====================== select box start ======================== */}
                <div className={styles.inputArea} style={{ width: '100%', overflowY: 'hidden' }}>
                  <select
                    className={styles.select} // 기존 인풋 스타일 재활용 (모듈 CSS에 맞춰 필요시 별도 클래스 생성)
                    value={selectedCont}
                    onChange={(e) => setSelectedCont(e.target.value)}
                    aria-label="Select Container No."
                  >
                    {containerOptions.length === 0 ? (
                      <option value="" disabled>컨테이너 없음</option>
                    ) : (
                      containerOptions.map(cn => (
                        <option key={cn} value={cn}>
      										{cn === '' ? 'Container No.' : cn}
												</option>
                      ))
                    )}
                  </select>
                </div>
								
                {/* 
								<div className={styles.trailingButtonDiv}>
                  <div className={styles.iconButton} title="선택된 컨테이너 복사">
                    <div className={styles.container} onClick={() => navigator.clipboard?.writeText(selectedCont || '')}>
                      <div className={styles.stateLayer}>
                        <div className={styles.icon}>
                          <img className={styles.vectorIcon} alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
								*/}
                {/* ====================== select box end ======================== */}
              </div>
            </div>
          </div>
				</div>
				
				<div
					className={styles.routeLine}
					style={{ ['--pct' as any]: `${progressPct}%` }}
				>
					<div className={styles.routePoint}>
						<span className={styles.pointLabel}>POL</span>
					</div>

					<div className={styles.routeBar}>
						{/* 점선 트랙 */}
						<div className={styles.routeTrack} />
						{/* 진행(실선) */}
						<div className={styles.routeProgress} />
						{/* 진행 점 */}
						<div className={styles.routeDot} />
					</div>

					<div className={styles.routePoint}>
						<span className={styles.pointLabel}>POD</span>
					</div>
				</div>

				<div className={styles.bookingNoParent}>
					<div className={styles.labelChip3}>
						<div className={styles.text}>{progressStatus}</div>
					</div>
					<div className={styles.div2}>
						{/* 고객 기준 예상 도착일 */}
						{formatDateTime(data.result.custEtaDt ?? "", "date", "YYYY-MM-DD")}
					</div>
					<div className={styles.div3}>|</div>
					<b className={styles.progressLabel}>
						{/* 진행상태 */}
						{progressText}
					</b>
				</div>
			</div>
			<div className={styles.frameDiv}>
				<div className={styles.labelChipContainer}>
					<div className={styles.labelChip}>
						<div className={styles.text}>POL</div>
					</div>
					<div className={styles.frameParent2}>
						<div className={styles.krpus01Parent}>
							<b className={styles.krpus01}>
								{/* 출발항구코드 */}
								KRPUS01
							</b>
							<div className={styles.pusanNewportInternational}>
								{/* 출발항구명 */}
								Pusan Newport International Terminal
							</div>
						</div>
						<div className={styles.frameParent3}>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ATB(Berthing)</div>
									<div className={styles.vectorGroup}>
										<img src={calendarIcon} alt="" />
										<div className={styles.div4}>
											{/* 예상접안일 */}
											{formatDateTime(data.result.currEtbDt ?? data.result.actlBrthDt, "date", "YYYY-MM-DD")}
										</div>
									</div>
								</div>
								<div className={styles.div3}>|</div>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>Actual</div>
									<div className={styles.frameParent5}>
										<div className={styles.bookingNoParent}>
											<img src={calendarIcon} alt="" />
											<div className={styles.div4}>
												{/* 실제접안일 */}
												{formatDateTime(data.result.actlBrthDt ?? "", "date", "YYYY-MM-DD")}
											</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>
												{/* 실제접안시간 */}
												{formatDateTime(data.result.actlBrthDt ?? "", "time", "HH:mm:ss")}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ATD(Departure)</div>
									<div className={styles.vectorGroup}>
										<img src={calendarIcon} alt="" />
										<div className={styles.div4}>
											{/* 실제출발일 */}
											{formatDateTime(data.result.actlDeptDt ?? "", "date", "YYYY-MM-DD")}
										</div>
									</div>
								</div>
								<div className={styles.div3}>|</div>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>Actual</div>
									<div className={styles.frameParent5}>
										<div className={styles.bookingNoParent}>
											<img src={calendarIcon} alt="" />
											<div className={styles.div4}>
												{/* 실제출발일 */}
												{formatDateTime(data.result.actlDeptDt ?? "", "date", "YYYY-MM-DD")}
											</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>
												{/* 실제출발일 */}
												{formatDateTime(data.result.actlDeptDt ?? "", "time", "HH:mm:ss")}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<img className={styles.frameInner} alt="" />
				<div className={styles.labelChipContainer}>
					<div className={styles.labelChip}>
						<div className={styles.text}>POD</div>
					</div>
					<div className={styles.frameParent8}>
						<div className={styles.krpus01Parent}>
							<b className={styles.krpus01}>CNSHAQ1</b>
							<div className={styles.sipgZhenhuaTerminal}>SIPG Zhenhua Terminal</div>
						</div>
						<div className={styles.frameParent3}>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ETA(Arrival)</div>
									<div className={styles.vectorGroup}>
										<img src={calendarIcon} alt="" />
										<div className={styles.div4}>2025-10-10</div>
									</div>
								</div>
								<div className={styles.div3}>|</div>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>Actual</div>
									<div className={styles.frameParent5}>
										<div className={styles.bookingNoParent}>
											<img src={calendarIcon} alt="" />
											<div className={styles.div4}>-</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>-</div>
										</div>
									</div>
								</div>
							</div>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ETB(Berthing)</div>
									<div className={styles.vectorGroup}>
										<img src={calendarIcon} alt="" />
										<div className={styles.div4}>2025-10-10</div>
									</div>
								</div>
								<div className={styles.div3}>|</div>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>Actual</div>
									<div className={styles.frameParent5}>
										<div className={styles.bookingNoParent}>
											<img src={calendarIcon} alt="" />
											<div className={styles.div4}>-</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>-</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IframeScenrio;
