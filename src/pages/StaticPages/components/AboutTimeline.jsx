// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — tarihçe section
import React from 'react';

const TIMELINE = [
    { year: 'Eylül 2025', title: 'Fikrin Doğuşu', desc: "Tedport fikri, Türkiye'deki B2B tedarik süreçlerinin dijitalleştirilmesi ihtiyacından doğdu. 3 kişilik kurucu ekip olarak yolculuğumuza başladık.", side: 'left' },
    { year: 'Ocak 2026', title: 'Platform Geliştirme', desc: 'Yoğun geliştirme sürecine girildi. Teknik altyapı kuruldu, tasarım tamamlandı ve beta testleri başlatıldı.', side: 'right' },
    { year: 'Mart 2026', title: 'Platform Lansmanı', desc: 'Tedport.com yayına alındı. Firma kayıtları, arama, filtreleme ve teklif sistemi ile hizmete başlandı.', side: 'left' },
    { year: 'Nisan 2026', title: 'Büyüme Dönemi', desc: 'İhale sistemi, kurumsal hesaplar ve gelişmiş filtreleme özellikleri eklendi. 81 il kapsamında hizmet verilmeye başlandı.', side: 'right' },
];

const AboutTimeline = () => (
    <section className="about-section">
        <div className="about-container">
            <h2 className="about-timeline-title">Tarihçemiz</h2>
            <div className="about-timeline">
                <div className="about-timeline-line"></div>
                {TIMELINE.map((item, idx) => (
                    <div key={idx} className={`about-timeline-item ${item.side}`}>
                        {item.side === 'left' ? (
                            <>
                                <div className={`about-timeline-content text-right`}>
                                    <h3>{item.year}</h3>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                                <div className={`about-timeline-dot${idx > 0 ? ' outline' : ''}`}><div></div></div>
                                <div className="about-timeline-empty"></div>
                            </>
                        ) : (
                            <>
                                <div className="about-timeline-empty"></div>
                                <div className="about-timeline-dot outline"><div></div></div>
                                <div className="about-timeline-content text-left">
                                    <h3>{item.year}</h3>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default AboutTimeline;
