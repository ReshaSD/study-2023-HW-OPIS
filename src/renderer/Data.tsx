import Delta, { IDelta } from './Delta';
import Radii, { IRadii } from './Radii';

export interface IData {
  data: IDelta &
    IRadii & {
      classesValues: number[][][];
      resultUrl: string;
    };
}

export default function Data({
  data: { optimalDeltaData, delta, radii, radiiData, resultUrl },
}: IData) {
  return (
    <>
      {!!resultUrl && (
        <img
          src={resultUrl}
          alt="result"
          width={800}
          height={800}
          style={{ marginTop: '1rem' }}
        />
      )}
      {!!optimalDeltaData?.length && (
        <Delta optimalDeltaData={optimalDeltaData} delta={delta} />
      )}
      {!!radiiData?.length && <Radii radii={radii} radiiData={radiiData} />}
    </>
  );
}
