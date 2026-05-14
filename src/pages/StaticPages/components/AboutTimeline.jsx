// Enes Doğanay | 11 Mayıs 2026: Hakkımızda — tarihçe section
import React from 'react';

const TIMELINE = [
    { year: 'Eylül 2025', title: 'Fikrin Doğuşu', desc: 'Tedport fikri; firmaların satınalma, tedarikçi keşfi ve iş geliştirme süreçlerini daha verimli yönetebilmesi hedefiyle ortaya çıktı. 3 kişilik kurucu ekiple yolculuğumuza başladık.', side: 'left' },
    { year: 'Ocak 2026', title: 'Platform Geliştirme', desc: 'Teknik altyapı, kullanıcı deneyimi ve platform mimarisi üzerinde yoğun geliştirme süreci tamamlandı. Beta testleri başlatıldı.', side: 'right' },
    { year: 'Mart 2026', title: 'Platform Lansmanı', desc: 'Tedport.com yayına alındı. Firma keşfi, teklif yönetimi ve satınalma süreçlerini destekleyen temel sistemler kullanıcılarla buluştu.', side: 'left' },
    { year: 'Nisan 2026', title: 'Büyüme Süreci', desc: 'İhale sistemi, kurumsal hesaplar ve gelişmiş filtreleme özellikleri devreye alındı. Türkiye\'nin 81 ilindeki firmalara erişim sağlandı.', side: 'right' },
];

const AboutTimeline = () => (
    <section className="about-section">
        <div className="about-container">
            <div className="about-section-header">
                <h2>Tarihçemiz</h2>
            </div>
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
