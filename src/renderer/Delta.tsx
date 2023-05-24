import { useMemo } from 'react';
import { AxisOptions, Chart, Series, UserSerie } from 'react-charts';
import ResizableBox from './ResizableBox';

export interface IDelta {
  optimalDeltaData: {
    criterionValue: number;
    criterionValueInWorkingArea: number;
    delta: number;
  }[];
  delta: number;
}

type TChartData = { x: number; y: number };

export default function Delta({
  delta: optimalDelta,
  optimalDeltaData,
}: IDelta) {
  const data = useMemo<UserSerie<TChartData>[]>(() => {
    return [
      {
        label: 'Значення критерію',
        data: optimalDeltaData.map(({ delta, criterionValue }) => ({
          x: delta,
          y: criterionValue,
        })),
        color: '#ff0000',
      },
      {
        label: 'Робоча область',
        data: optimalDeltaData.map(
          ({ delta, criterionValueInWorkingArea }) => ({
            x: delta,
            y: Math.max(criterionValueInWorkingArea, 0),
          })
        ),
        color: 'red',
        secondaryAxisId: 'area',
      },
      {
        label: 'Оптимальна δ',
        data: optimalDeltaData.map(
          ({ delta, criterionValueInWorkingArea }) => ({
            x: delta,
            y: delta === optimalDelta ? criterionValueInWorkingArea : 0,
          })
        ),
        secondaryAxisId: 'bubble',
      },
    ];
  }, [optimalDelta, optimalDeltaData]);

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
      <h2>Оптимізація дельти</h2>
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
          <div>Optimal delta: {optimalDelta}</div>
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
      </details>
    </div>
  );
}
