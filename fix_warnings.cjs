const fs = require('fs');

// Fix warning blocks in both files
const inviteBtn = `<a\n                                                            className="ihale-email-invite-btn"\n                                                            href={buildInviteMailto(emailInput.trim())}\n                                                        >\n                                                            <span className="material-symbols-outlined">send</span>\n                                                            Davet E-postas\u0131 G\u00f6nder\n                                                        </a>`;

// ── Ihaleler.jsx ──
let file1 = fs.readFileSync('src/Ihaleler.jsx', 'utf8');
const old1 = `                                                    <span>\n                                                        <strong>{emailInput.trim()}</strong> adresine sahip bir kullan\u0131c\u0131 sistemimizde bulunamad\u0131.\n                                                        \u0130hale bildirimi alabilmesi i\u00e7in bu ki\u015fiyi <a href="/register" target="_blank" rel="noopener noreferrer">Tedport\u2019a \u00fccretsiz kay\u0131t</a> olmaya davet edebilirsiniz.\n                                                    </span>`;
const new1 = `                                                    <div className="ihale-email-warning__content">\n                                                        <span>\n                                                            <strong>{emailInput.trim()}</strong> adresine sahip bir kullan\u0131c\u0131 sistemimizde bulunamad\u0131.\n                                                            A\u015fa\u011f\u0131daki butona t\u0131klayarak haz\u0131r bir davet e-postas\u0131 g\u00f6nderebilirsiniz.\n                                                        </span>\n                                                        ${inviteBtn}\n                                                    </div>`;
if (file1.includes(old1)) {
    file1 = file1.replace(old1, new1);
    fs.writeFileSync('src/Ihaleler.jsx', file1, 'utf8');
    console.log('Ihaleler.jsx: replaced OK');
} else {
    console.log('Ihaleler.jsx: NOT FOUND');
}

// ── TenderOffersManagement.jsx (48-space indent for span, 52 for children) ──
let file2 = fs.readFileSync('src/TenderOffersManagement.jsx', 'utf8');
const sp48 = ' '.repeat(48);
const sp52 = ' '.repeat(52);
const sp56 = ' '.repeat(56);

// TOM uses plain ASCII apostrophe (U+0027)
const old2 = `${sp48}<span>\n${sp52}<strong>{createEmailInput.trim()}</strong> adresine sahip bir kullan\u0131c\u0131 sistemimizde bulunamad\u0131.\n${sp52}\u0130hale bildirimi alabilmesi i\u00e7in bu ki\u015fiyi <a href="/register" target="_blank" rel="noopener noreferrer">Tedport'a \u00fccretsiz kay\u0131t</a> olmaya davet edebilirsiniz.\n${sp48}</span>`;

const new2 = `${sp48}<div className="ihale-email-warning__content">\n${sp52}<span>\n${sp56}<strong>{createEmailInput.trim()}</strong> adresine sahip bir kullan\u0131c\u0131 sistemimizde bulunamad\u0131.\n${sp56}A\u015fa\u011f\u0131daki butona t\u0131klayarak haz\u0131r bir davet e-postas\u0131 g\u00f6nderebilirsiniz.\n${sp52}</span>\n${sp52}<a\n${sp56}className="ihale-email-invite-btn"\n${sp56}href={buildInviteMailto(createEmailInput.trim())}\n${sp52}>\n${sp56}<span className="material-symbols-outlined">send</span>\n${sp56}Davet E-postas\u0131 G\u00f6nder\n${sp52}</a>\n${sp48}</div>`;

if (file2.includes(old2)) {
    file2 = file2.replace(old2, new2);
    fs.writeFileSync('src/TenderOffersManagement.jsx', file2, 'utf8');
    console.log('TenderOffersManagement.jsx: replaced OK');
} else {
    const marker2 = 'createEmailInput.trim()}</strong> adresine';
    const idx2 = file2.indexOf(marker2);
    console.log('TenderOffersManagement.jsx: NOT FOUND, marker at', idx2);
    if (idx2 !== -1) console.log('Context:', JSON.stringify(file2.substring(idx2 - 60, idx2 + 200)));
}
