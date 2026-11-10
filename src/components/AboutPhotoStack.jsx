import React from 'react';

const photos = [
  ['stack-1.jpg', '林间的大象', -6, -9, 3],
  ['stack-2.jpg', '云雾中的山间楼阁', 5, 8, -3],
  ['stack-3.jpg', '通往云山的公路', -4, -6, 5],
  ['stack-4.jpg', '群山与远行的人', 6, 7, 1],
  ['stack-5.jpg', '蓝天下的豹与飞鸟', -3, -4, -4],
  ['stack-6.jpg', '狮子与幼崽', 4, 6, 3],
  ['zhao-feiyu-portrait.png', '赵飞宇的证件照', 0, 0, 0],
];

export default function AboutPhotoStack({ playing, run, complete, loadPhotos, onOpenProfile }) {
  return <button type="button" onClick={onOpenProfile} aria-haspopup="dialog"
    className={'about-photo-stack' + (playing ? ' is-playing' : '') + (complete ? ' is-complete' : '')}
    aria-label="查看赵飞宇的个人卡片">
    {photos.map(([file, alt, rotation, x, y], index) => <span
      className={'about-photo-card' + (index === photos.length - 1 ? ' is-portrait' : '')}
      key={`${run}-${file}`} aria-hidden="true"
      style={{ '--photo-delay': `${index * 270}ms`, '--photo-rotation': `${rotation}deg`, '--photo-x': `${x}px`, '--photo-y': `${y}px`, zIndex: index + 1 }}>
      <img src={loadPhotos ? `/assets/about/${file}` : undefined} alt={alt} decoding="async" draggable="false" />
    </span>)}
  </button>;
}
