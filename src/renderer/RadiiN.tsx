import { useMemo } from 'react';
import { AxisOptions, Chart } from 'react-charts';
import ResizableBox from './ResizableBox';

interface IRadiiN {
  index: number;
  radius: number;
  radiiData: {
    criterionValue: number;
    isWorkingArea: boolean;
    radius: number;
  }[];
}

export default function RadiiN({
  index,
  radius: optimalRadius,
  radiiData,
}: IRadiiN) {
  const data = useMemo(() => {
    return [
      {
        label: 'Значення критерію',
        data: radiiData.map(({ radius, criterionValue }) => ({
          x: radius,
          y: criterionValue,
        })),
      },
      {
        label: 'Робоча область',
        data: radiiData.map(({ radius, criterionValue, isWorkingArea }) => ({
          x: radius,
          y: isWorkingArea ? criterionValue : 0,
        })),
        secondaryAxisId: 'area',
      },
      {
        label: 'Оптимальний r',
        data: radiiData.map(({ radius, criterionValue }) => ({
          x: radius,
          y: radius === optimalRadius ? criterionValue : 0,
        })),
        secondaryAxisId: 'bubble',
      },
    ];
  }, [optimalRadius, radiiData]);

  const primaryAxis = useMemo<
    AxisOptions<(typeof data)[number]['data'][number]>
  >(
    () => ({
      getValue: (datum) => datum.x,
    }),
    []
  );

  const secondaryAxes = useMemo<
    AxisOptions<(typeof data)[number]['data'][number]>[]
  >(
    () => [
      {
        getValue: (datum) => datum.y,
        stacked: false,
      },
      {
        getValue: (datum) => datum.y,
        stacked: false,
        elementType: 'area',
        id: 'area',
      },
      {
        getValue: (datum) => datum.y,
        stacked: false,
        elementType: 'bubble',
        id: 'bubble',
      },
    ],
    []
  );

  return (
    <div>
      <h2>Радіус класу {index}</h2>
      <ResizableBox>
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
            defaultColors: ['#7777ff', 'red', 'green'],
            getDatumStyle: (datum) =>
              ({ circle: { r: datum.originalDatum.y * 10 } } as any),
          }}
        />
      </ResizableBox>
      <details>
        <summary>Table</summary>
        <div>
          <div>Optimal radii: {optimalRadius}</div>
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
      </details>
    </div>
  );
}
