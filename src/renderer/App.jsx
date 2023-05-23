import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Data from './Data';

function Hello() {
  // const [images, setImages] = useState([]);
  // const [mainImage, setMainImage] = useState();

  const [mainImageURL, setMainImageURL] = useState();
  const [imageURLs, setImageURLs] = useState([]);

  const onImageChange = (e) => {
    const newImages = [...e.target.files];
    if (!newImages.length) return;

    // @ts-ignore
    // setImages((s) => [...s, ...newImages]);
    setImageURLs((s) => [
      ...s,
      ...newImages.map((i) => URL.createObjectURL(i)),
    ]);
  };
  const onMainImageChange = (e) => {
    const newImage = e.target.files[0];
    if (!newImage) return;

    // @ts-ignore
    // setMainImage(newImage);
    setMainImageURL(URL.createObjectURL(newImage));
  };

  return (
    <div
      style={{
        display: 'block',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          borderBottom: '1px solid black',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            padding: 16,
          }}
        >
          <input type="file" accept="image/jpg" onChange={onMainImageChange} />
          {!!mainImageURL && (
            <img height="600" width="600" src={mainImageURL} alt="main" />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            width: 150,
            flexDirection: 'column',
            padding: 16,
          }}
        >
          <input
            type="file"
            multiple
            accept="image/jpg"
            onChange={onImageChange}
          />
          {imageURLs.map((src, ind) => (
            <img src={src} alt={`img: ${ind}`} />
          ))}
        </div>
      </div>
      <Data mainImageURL={mainImageURL} imageURLs={imageURLs} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
