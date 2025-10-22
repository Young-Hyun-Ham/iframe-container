import React, { useEffect, useState } from 'react';
import styles from './iframeScenrio.module.css';
import calendarIcon from '../public/calendar.svg';
import clockIcon from '../public/clock.png';

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

const IframeScenrio: React.FC = () => {
	const [data, setData] = useState<ApiResponse>({
		result: {
			blNr: "",
		}
	});

	useEffect(() => {
		(async () => {
			try {
				const params = new URLSearchParams(window.location.search);
				const isEncoding = params.get('isEncoding');
				const reqData = params.get('reqData');
				console.log("======================>", (typeof reqData), reqData);
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

	// vectorIcon2 -> 달력 아이콘
	// clockIcon -> 시계 아이콘
	return (
		<div className={styles.frameParent}>
			<div className={styles.frameGroup}>
				<div className={styles.frameContainer}>
					<div className={styles.bookingNoParent}>
						<div className={styles.bookingNo}>Booking No.</div>
						<div className={styles.div}>|</div>
						<b className={styles.bookingNo}>{data.result.blNr}</b>
					</div>
					<div className={styles.tableLayoutCell}>
						<div className={styles.textFieldXsmall}>
							<div className={styles.textField}>
								<div className={styles.span}>
									<div className={styles.inputArea}>
										<div className={styles.inputText}>
											<div className={styles.input}>Container No.</div>
										</div>
									</div>
								</div>
								<div className={styles.trailingButtonDiv}>
									<div className={styles.iconButton}>
										<div className={styles.container}>
											<div className={styles.stateLayer}>
												<div className={styles.icon}>
													<img className={styles.vectorIcon} alt="" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.labelChipParent}>
					<div className={styles.labelChip}>
						<div className={styles.text}>POL</div>
					</div>
					<div className={styles.vectorParent}>
						<img className={styles.frameChild} alt="" />
						<div className={styles.frameItem} />
					</div>
					<div className={styles.labelChip}>
						<div className={styles.text}>POD</div>
					</div>
				</div>
				<div className={styles.bookingNoParent}>
					<div className={styles.labelChip3}>
						<div className={styles.text}>ETA</div>
					</div>
					<div className={styles.div2}>2025-12-30</div>
					<div className={styles.div3}>|</div>
					<b className={styles.remaining2days}>Remaining 2Days</b>
				</div>
			</div>
			<div className={styles.frameDiv}>
				<div className={styles.labelChipContainer}>
					<div className={styles.labelChip}>
						<div className={styles.text}>POL</div>
					</div>
					<div className={styles.frameParent2}>
						<div className={styles.krpus01Parent}>
							<b className={styles.krpus01}>KRPUS01</b>
							<div className={styles.pusanNewportInternational}>Pusan Newport International Terminal</div>
						</div>
						<div className={styles.frameParent3}>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ATB(Berthing)</div>
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
											<div className={styles.div4}>2025-10-10</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>00:00:00</div>
										</div>
									</div>
								</div>
							</div>
							<div className={styles.frameParent4}>
								<div className={styles.atbberthingParent}>
									<div className={styles.atbberthing}>ATD(Departure)</div>
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
											<div className={styles.div4}>2025-10-10</div>
										</div>
										<div className={styles.bookingNoParent}>
											<img src={clockIcon} alt="" width={14} height={13} />
											<div className={styles.div4}>00:00:00</div>
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
