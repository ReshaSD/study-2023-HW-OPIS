import { useState } from 'react';
import './Analysis.css';
import getData from './utils/main';
import Data, { IData } from './Data';

interface IProps {
  mainImageURL: string;
  imageURLs: string[];
}
export default function Analysis({ mainImageURL, imageURLs }: IProps) {
  const [data, setData] = useState<IData['data']>({} as IData['data']);
  const [disabled, setDisabled] = useState(false);

  const handleAnalysis = () => {
    setDisabled(true);
    setData({} as IData['data']);
    setTimeout(async () => {
      try {
        setData(await getData(mainImageURL, imageURLs));
      } finally {
        setDisabled(false);
      }
    }, 1);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '1rem',
        marginRight: '1rem',
      }}
    >
      <button
        disabled={disabled}
        type="button"
        onClick={handleAnalysis}
        style={{
          marginLeft: '1rem',
          marginRight: '1rem',
        }}
      >
        Launch analysis
      </button>
      {!disabled && <Data data={data} />}
    </div>
  );
}
