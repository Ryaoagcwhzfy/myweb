import React from 'react';
import './CampusView.css';

const campusPhotos = [
  { file: 'ximen.jpg', label: '西门', width: 1980, height: 878 },
  { file: 'dongqu.jpg', label: '东区鸟瞰', width: 1940, height: 1293 },
  { file: 'shijiguangchang.jpg', label: '世纪广场', width: 3380, height: 1024 },
];

export default function CampusView() {
  return <article className="campus-view">
    <h2 id="dialog-title">嘉应学院</h2>
    <p className="campus-introduction">嘉应学院是一所有百年办学历史的广东省属全日制公办普通高校，坐落于国家历史文化名城、叶剑英元帅故乡、著名革命老区、全域属原中央苏区的广东省梅州市，是硕士学位授予单位、广东省创建国家教师教育创新实验区建设高校。</p>
    <div className="campus-gallery">
      {campusPhotos.map(({ file, label, width, height }) => <figure key={file}>
        <img src={'/assets/campus/' + file} alt={label} width={width} height={height} loading="lazy" decoding="async" />
        <figcaption>{label}</figcaption>
      </figure>)}
    </div>
  </article>;
}
