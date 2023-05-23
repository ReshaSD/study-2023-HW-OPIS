import { useState } from 'react';
import './Data.css';
import getData from './utils/main';

interface IProps {
  mainImageURL: string;
  imageURLs: string[];
}
interface IData {
  classesValues: number[][][];
  optimalDeltaData: {
    criterionValue: number;
    criterionValueInWorkingArea: number;
    delta: number;
  }[];
  delta: number;
  radii: number[];
  radiiData: {
    criterionValue: number;
    isWorkingArea: boolean;
    radius: number;
  }[];
  resultUrl: string;
}

export default function Data({ mainImageURL, imageURLs }: IProps) {
  const [data, setData] = useState<IData>({} as IData);
  const [disabled, setDisabled] = useState(false);

  const handleAnalysis = async () => {
    setDisabled(true);
    try {
      setData(await getData(mainImageURL, imageURLs));
    } finally {
      setDisabled(false);
    }
  };

  const {
    classesValues,
    optimalDeltaData,
    delta,
    radii,
    radiiData,
    resultUrl,
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button disabled={disabled} type="button" onClick={handleAnalysis}>
        Launch analysis
      </button>
      <img
        src={resultUrl}
        alt="result"
        width={800}
        height={800}
        style={{ marginTop: '1rem' }}
      />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          <div>Optimal delta: {delta}</div>
          <table>
            <thead>
              <tr>
                <th>Delta</th>
                <th>Criterion value</th>
                <th>
                  Criterion value
                  <br />
                  in working area
                </th>
              </tr>
            </thead>
            <tbody>
              {!!optimalDeltaData &&
                optimalDeltaData.map((r) => {
                  return (
                    <tr>
                      <td>{r.delta}</td>
                      <td>{r.criterionValue}</td>
                      <td>{r.criterionValueInWorkingArea}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div style={{ marginLeft: '1rem' }}>
          <div>Optimal radii: {JSON.stringify(radii)}</div>
          <table>
            <thead>
              <tr>
                <th>Is working area</th>
                <th>Radius</th>
                <th>Criterion value</th>
              </tr>
            </thead>
            <tbody>
              {!!radiiData &&
                radiiData.map((r, ind) => {
                  return (
                    <>
                      {r.radius === 0 && (
                        <tr>
                          <td colSpan={3}>{`Class number: ${Math.trunc(
                            ind / 60
                          )}`}</td>
                        </tr>
                      )}
                      <tr>
                        <td>{r.isWorkingArea ? 'true' : 'false'}</td>
                        <td>{r.radius}</td>
                        <td>{r.criterionValue}</td>
                      </tr>
                    </>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
