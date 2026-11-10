import React from 'react';
import ProfileCard from './ProfileCard';
import { profile } from '../data';
import './ProfileCardView.css';

export default function ProfileCardView() {
  return <div className="profile-card-view">
    <h2 id="dialog-title" className="about-accessible-title">赵飞宇的个人卡片</h2>
    <ProfileCard
      name="赵飞宇 ZhaoFeiYu" title="视觉传达" handle="Ryao" status="在线的"
      avatarUrl="/assets/about/zhao-feiyu-cutout.png"
      contactText={profile.email} contactHref={`mailto:${profile.email}`}
      backdropColor="#9278ad" theme="dark"
      holo={0.5} glare={0.3} tiltStrength={8} parallax={5}
      enableMobileTilt={false}
    />
  </div>;
}
