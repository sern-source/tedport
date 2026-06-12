// Enes Doğanay | 6 Mayıs 2026: İhaleler sayfası — koordinatör, tüm mantığı hook ve alt bileşenlere delege eder
'use client';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import "./components/IhalelerPage.css";
import "../../components/SharedHeader.css";
import SharedHeader from "../../components/SharedHeader";
import SEO from "../../components/SEO";
import { useAuth } from "../../AuthContext";
import useIhaleler from "./hooks/useIhaleler";
import useMyTenders from "./hooks/useMyTenders";
import useIhaleForm from "./hooks/useIhaleForm";
import useTeklifForm from "./hooks/useTeklifForm";
import IhaleToast from "./components/IhaleToast";
import TendersHero from "./components/TendersHero";
import TendersToolbar from "./components/TendersToolbar";
import TendersContent from "./components/TendersContent";
import IhalelerModals from "./components/IhalelerModals";
import AlertSubscriptionPanel from "./components/AlertSubscriptionPanel";
import IhaleAcBanner from "./components/IhaleAcBanner";

const IhalelerPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Enes Doğanay | 22 Mayıs 2026: react-router setSearchParams uyumlu yardımcı
    const setSearchParams = useCallback((paramsOrFn, _opts) => {
        let next;
        if (typeof paramsOrFn === 'function') {
            const current = new URLSearchParams(searchParams.toString());
            next = paramsOrFn(current);
        } else if (paramsOrFn instanceof URLSearchParams) {
            next = paramsOrFn;
        } else {
            next = new URLSearchParams(paramsOrFn);
        }
        router.replace('?' + next.toString(), { scroll: false });
    }, [searchParams, router]);
    const firmaFilter = searchParams.get("firma") || "";
    const ihaleParam = searchParams.get("ihale") || "";
    const teklifParam = searchParams.get("teklif") || "";
    const yeniIhaleParam = searchParams.get("yeniIhale") || "";
    const duzenleParam = searchParams.get("duzenle") || "";
    const { userProfile, managedCompanyId: authManagedCompanyId, managedCompanyName, authChecked } = useAuth() || {};

    // Enes Doğanay | 16 Mayıs 2026: Demo hesap tespiti — demo.* @tedport.com patternı
    const isDemoUser = /^demo\.[^@]+@tedport\.com$/.test(userProfile?.email || '');

    // Enes Doğanay | 14 Mayıs 2026: Davetli ihaleleri yükle — kullanıcı email ve firma bilgisi
    const ihaleler = useIhaleler(firmaFilter, { userEmail: userProfile?.email, userFirmaId: authManagedCompanyId, isDemoUser });
    const myTendersHook = useMyTenders({ fetchPublicTenders: ihaleler.fetchPublicTenders, reloadInvitedTenders: ihaleler.reloadInvitedTenders });
    const ihaleFormHook = useIhaleForm({
        managedFirmaId: myTendersHook.managedFirmaId,
        generateReferansNo: myTendersHook.generateReferansNo,
        fetchMyTenders: myTendersHook.fetchMyTenders,
        fetchPublicTenders: ihaleler.fetchPublicTenders,
        reloadInvitedTenders: ihaleler.reloadInvitedTenders,
        yeniIhaleParam, duzenleParam, searchParams, setSearchParams,
        myTenders: myTendersHook.myTenders,
    });
    const teklifHook = useTeklifForm({ userProfile, authManagedCompanyId, managedCompanyName });

    const [detailTender, setDetailTender] = useState(null);
    const highlightTenderRef = useRef(null);
    const [highlightTenderId, setHighlightTenderId] = useState(null);

    useEffect(() => {
        if (!ihaleParam || ihaleler.loading || ihaleler.tenders.length === 0) return;
        const target = ihaleler.tenders.find(t => String(t.id) === ihaleParam);
        if (target) {
            if (teklifParam) teklifHook.openTeklifPopup(target);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            else setDetailTender(target);
            setHighlightTenderId(target.id);
            setTimeout(() => setHighlightTenderId(null), 3000);
        }
        const params = new URLSearchParams(searchParams);
        params.delete("ihale"); params.delete("teklif");
        setSearchParams(params, { replace: true });
    }, [ihaleParam, ihaleler.loading, ihaleler.tenders]); // eslint-disable-line

    useEffect(() => {
        if (highlightTenderId && highlightTenderRef.current)
            highlightTenderRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [highlightTenderId]);

    return (
        <div className="tenders-page">
            {myTendersHook.ihToast && <IhaleToast ihToast={myTendersHook.ihToast} onClose={() => myTendersHook.setIhToast(null)} />}
            <SEO title="Ihaleler" description="Canli ihaleleri kesffedin, teklif verin. Turkiye genelinde B2B ihale platformu." path="/ihaleler" />
            <SharedHeader />
            <main className="tenders-page-main">
                <IhalelerModals
                    ihaleler={ihaleler} myTendersHook={myTendersHook} ihaleFormHook={ihaleFormHook} teklifHook={teklifHook}
                    detailTender={detailTender} setDetailTender={setDetailTender}
                    authManagedCompanyId={authManagedCompanyId} userProfile={userProfile} navigate={(path) => router.push(path)}
                />
                <TendersHero
                    selectedFirmaName={ihaleler.selectedFirmaName}
                    liveCount={ihaleler.liveCount} upcomingCount={ihaleler.upcomingCount} closedCount={ihaleler.closedCount} tamamlandiCount={ihaleler.tamamlandiCount}
                />
                {/* Enes Doğanay | 12 Haziran 2026: Kurumsal hesabı olmayan kullanıcılara ihale açma bilgisi */}
                <IhaleAcBanner authManagedCompanyId={authManagedCompanyId} authChecked={authChecked} />
                <TendersToolbar
                    searchTerm={ihaleler.searchTerm} setSearchTerm={ihaleler.setSearchTerm}
                    viewMode={ihaleler.viewMode} toggleViewMode={ihaleler.toggleViewMode}
                    statusFilter={ihaleler.statusFilter} setStatusFilter={ihaleler.setStatusFilter}
                    sortBy={ihaleler.sortBy} setSortBy={ihaleler.setSortBy}
                    sortDropdownOpen={ihaleler.sortDropdownOpen} setSortDropdownOpen={ihaleler.setSortDropdownOpen}
                    sortDropdownRef={ihaleler.sortDropdownRef}
                    page={ihaleler.page} setPage={ihaleler.setPage} totalPages={ihaleler.totalPages}
                />
                {/* Enes Doğanay | 13 Mayıs 2026: Sektör bazlı e-posta uyarı paneli */}
                {userProfile && (
                    <div className="tenders-alert-row">
                        <AlertSubscriptionPanel userId={userProfile.id} />
                        <span className="tenders-alert-hint">Yeni ihale açıldığında e-posta al</span>
                    </div>
                )}
                <TendersContent
                    tableMissing={ihaleler.tableMissing} loading={ihaleler.loading}
                    filteredTenders={ihaleler.filteredTenders} paginatedTenders={ihaleler.paginatedTenders}
                    userProfile={userProfile} searchTerm={ihaleler.searchTerm} statusFilter={ihaleler.statusFilter}
                    viewMode={ihaleler.viewMode} highlightTenderId={highlightTenderId} highlightTenderRef={highlightTenderRef}
                    authManagedCompanyId={authManagedCompanyId} userOffers={teklifHook.userOffers}
                    page={ihaleler.page} setPage={ihaleler.setPage} totalPages={ihaleler.totalPages} smartPages={ihaleler.smartPages}
                    onDetail={setDetailTender} onEdit={ihaleFormHook.openEdit}
                    onTeklif={teklifHook.openTeklifPopup} onContact={teklifHook.openFirmaContact}
                    onNavigateFirma={(t) => router.push(t.firma_slug ? `/firmalar/${t.firma_slug}` : `/firmadetay/${t.firma_id}`)}
                    onLoginRedirect={() => router.push("/login?redirect=/ihaleler")}
                    onRegisterRedirect={() => router.push("/register")}
                />
            </main>
        </div>
    );
};

export default IhalelerPage;
