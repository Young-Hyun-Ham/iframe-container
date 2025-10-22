import { useEffect, useState } from 'react';
import './App.css'

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

const css = `
.stc-card{ font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans KR', sans-serif; max-width:560px; border:1px solid #e5edf6; border-radius:12px; background:#fff; }
/* HEADER */
.stc-header{ padding:16px 20px 12px; border-bottom:1px solid #eef3f9; }
.stc-toprow{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
.stc-left{ display:flex; align-items:center; gap:8px; min-width:0; }
.stc-icon{ font-size:18px; }
.stc-link{ text-decoration:none; font-weight:700; color:#0a66c2; }
.stc-right{ color:#6b7f94; font-weight:600; }
.stc-rail-row{ margin-top:10px; }
.stc-rail{ display:grid; grid-template-columns:14px 1fr 14px; align-items:center; gap:8px; }
.stc-node{ width:14px; height:14px; border-radius:50%; border:2px solid #94a9bf; background:#fff; }
.stc-node.active{ background:#0a66c2; border-color:#0a66c2; }
.stc-line{ height:2px; background:repeating-linear-gradient(90deg,#94a9bf,#94a9bf 6px,transparent 6px,transparent 11px); }
.stc-rail-labels{ display:flex; justify-content:space-between; font-size:12px; color:#6b7f94; margin-top:6px; }
.stc-eta{ margin-top:8px; font-size:14px; color:#1d3557; }

/* MAIN */
.stc-main{ padding:14px 20px 18px; display:flex; flex-direction:column; gap:18px; }
.stc-row{ display:grid; grid-template-columns: 180px 1fr; column-gap:16px; row-gap:8px; align-items:start; }
.stc-portcol{ display:flex; flex-direction:column; gap:4px; }
.stc-code{ font-weight:800; color:#2b3c4e; }
.stc-yard{ color:#6b7f94; font-size:12.5px; }
.stc-infocol{ display:flex; flex-direction:column; gap:8px; }
.stc-lineA{ display:grid; grid-template-columns: 160px 120px 80px 1fr; gap:8px; align-items:center; font-size:13px; color:#2c3e50; }
.label{ color:#56718b; }
.date{ color:#90a6bd; }
.actual{ font-weight:700; color:#22313f; }
.actual-date{ color:#34495e; }

@media (max-width:560px){
  .stc-row{ grid-template-columns: 1fr; }
  .stc-lineA{ grid-template-columns: 140px 1fr 70px 1fr; }
}
`

function App() {
  /* 샘플 데이터
  const data = {
    "result": {
      "blNr": "SVC1608000030075",
      "dispBlNr": "AL0000184478",
      "shpGameCd": "HBT",
      "vslCd": "UACT",
      "vslVoyNr": "0199",
      "scnCd": "E",
      "polCd": "CNSHA",
      "polNodeNm": "CNSHAMQ",
      "polNm": "SHA/SHANGHAI",
      "podCd": "TWKHH",
      "podNodeNm": "TWKHHIES",
      "custEtaDt": "2018/05/15 15:00:00",
      "currEtbDt": "2018/05/15 20:00:00",
      "currEtdDt": "2018/05/16 00:00:00",
      "uastEtaDt": "2018/05/15 15:00:00",
      "actlArrvDt": "2018/05/15 15:00:00",
      "actlBrthDt": "2018/05/15 20:00:00",
      "actlDeptDt": "2018/05/16 00:00:00",
      "contNr": "'HSKU2233450','HKU1122343','SBLU3302340',"
    }
  }
  */
  // const encodedData = "eyJyZXN1bHQiOnsiYmxOciI6IlNWQzE2MDgwMDAwMzAwNzUiLCJkaXNwQmxOciI6IkFMMDAwMDE4NDQ3OCIsInNocEdhbWVDZCI6IkhCVCIsInZzbENkIjoiVUFDRCIsInZzbFZveU5yIjoiMDE5OSIsInNjbkNkIjoiRSIsInBvbENkIjoiQ05TSEEiLCJwb2xOb2RlTm0iOiJDTlNIQU1RIiwicG9sTm0iOiJTSEEvU0hBTkdIQUkiLCJwb2RDZCI6IlRXS0hIIiwicG9kTm9kZU5tIjoiVFdLSEhJRVMiLCJjdXN0RXRhRHQiOiIyMDE4LzA1LzE1IDE1OjAwOjAwIiwiY3VyclJ0YkR0IjoiMjAxOC8wNS8xNSAyMDowMDowMCIsImN1cnJFZGREdCI6IjIwMTgvMDUvMTYgMDA6MDA6MDAiLCJ1YXN0RXRhRHQiOiIyMDE4LzA1LzE1IDE1OjAwOjAwIiwiYWN0bEFycnZEdCI6IjIwMTgvMDUvMTUgMTU6MDA6MDAiLCJhY3RsQnJ0aER0IjoiMjAxOC8wNS8xNSAyMDowMDowMCIsImFjdGxEZXB0RHQiOiIyMDE4LzA1LzE2IDAwOjAwOjAwIiwiY29udE5yIjoiJ0hTS1UyMjMzNDUwJywnSEtVMTEyMjM0MycsJ1NCTFUzMzAyMzQwJywifX0=";
  const [ data, setData ] = useState<ApiResponse>({
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
            alert("isEncoding 데이터가 없습니다.");
          }
        } else {
          alert("reqData 데이터가 없습니다.");
        }
      } catch (e) {
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24,
     background: '#ffffffff' }}>
      <div className="stc-wrap">
        <style>{css}</style>
        {/* ================= HEADER ================= */}
        <header className="stc-header">
          <div className="stc-toprow">
            <div className="stc-left">
              <span className="stc-icon" aria-hidden>🏗️</span>
              <a className="stc-link" href="#" onClick={(e)=>e.preventDefault()}>{data.result?.blNr}</a>
            </div>
            <div className="stc-right">[{data.result?.bkgNo}]</div>
          </div>

          <div className="stc-rail-row">
            <div className="stc-rail">
              <span className="stc-node active"/>
              <div className="stc-line"/>
              <span className="stc-node"/>
            </div>
            <div className="stc-rail-labels">
              <span>출발지</span>
              <span>도착지</span>
            </div>
          </div>

          <div className="stc-eta stc-left">ETA YYY-MM-DD Remaining 2 days</div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="stc-main">
          {/* Row: Origin */}
          <section className="stc-row">
            <div className="stc-portcol">
              <div className="stc-code">{data.result?.from?.code}KRPUS01</div>
              <div className="stc-yard">{data.result?.from?.yardName || '(Yard full name)'}</div>
            </div>
            <div className="stc-infocol">
              <div className="stc-lineA">
                <span className="label">ATB(Berthing)</span>
                <span className="date">(YYYY-MM-DD)</span>
                <span className="actual">Actual</span>
                <span className="actual-date">(YYYY-MM-DD / 00:00:00)</span>
              </div>
              <div className="stc-lineA">
                <span className="label">ATD(Departure)</span>
                <span className="date">(YYYY-MM-DD)</span>
                <span className="actual"/>
                <span className="actual-date">(YYYY-MM-DD / 00:00:00)</span>
              </div>
            </div>
          </section>

          {/* Row: Destination */}
          <section className="stc-row">
            <div className="stc-portcol">
              <div className="stc-code">{data.result?.to?.code}</div>
              <div className="stc-yard">{data.result?.to?.yardName || 'Yard full name'}</div>
            </div>
            <div className="stc-infocol">
              <div className="stc-lineA">
                <span className="label">ETA(Arrive)</span>
                <span className="date">(YYYY-MM-DD)</span>
                <span className="actual">Actual</span>
                <span className="actual-date"/>
              </div>
              <div className="stc-lineA">
                <span className="label">ETB(Berthing)</span>
                <span className="date">(YYYY-MM-DD)</span>
                <span className="actual"/>
                <span className="actual-date"/>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App;
