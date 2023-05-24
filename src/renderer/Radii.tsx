import { useMemo } from 'react';
import RadiiN from './RadiiN';

export interface IRadii {
  radii: number[];
  radiiData: {
    criterionValue: number;
    isWorkingArea: boolean;
    radius: number;
  }[];
}

export default function Radii({ radii, radiiData }: IRadii) {
  const radiiDataArrays = useMemo(() => {
    return radii.map((_, ind) =>
      radiiData.filter(
        (__, indData) => indData >= 61 * ind && indData <= 61 * ind + 61 - 1
      )
    );
  }, [radii, radiiData]);

  return (
    <div>
      {radii.map((radius, ind) => (
        <RadiiN index={ind} radius={radius} radiiData={radiiDataArrays[ind]} />
      ))}
    </div>
  );
}
