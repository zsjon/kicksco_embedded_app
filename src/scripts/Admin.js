import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../css/Admin.css';

// Leaflet 마커 아이콘 경로 설정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// parkingStatus 값에 따른 이미지 URL 매핑 (public 폴더)
const parkingStatusImages = {
    "정상 주차": "/kicksco_embedded_app/normal1.jpg",
    "보행 방해": "/kicksco_embedded_app/pm_on2.webp",
    "보도블럭 침범": "/kicksco_embedded_app/bodo_heatmap3.jpg"
};

function Admin() {
    const [activeTab, setActiveTab] = useState('adjust');
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedModalImage, setSelectedModalImage] = useState(null);
    const [selectedParkingStatus, setSelectedParkingStatus] = useState(null);

    // 예제용 더미 데이터
    const dummyData = [
        {
            id: 'Q2XX-1234-ABCD',
            message: '시청 앞 조정 완료',
            timestamp: '2025-04-12T17:30:00Z',
            parkingStatus: "정상 주차",
            latitude: 37.5665,
            longitude: 126.978,
        },
        {
            id: 'Q2XX-5678-EFGH',
            message: '도로에 보행 방해 발생',
            timestamp: '2025-04-12T18:00:00Z',
            parkingStatus: "보행 방해",
            latitude: 37.5700,
            longitude: 126.980,
        },
        {
            id: 'Q2XX-9012-IJKL',
            message: '보도블럭 침범 주차 발생',
            timestamp: '2025-04-12T18:30:00Z',
            parkingStatus: "보도블럭 침범",
            latitude: 37.5650,
            longitude: 126.977,
        }
    ];

    // "사진 보기" 버튼 클릭 시 실행
    const handleViewImage = (parkingStatus) => {
        const imageUrl = parkingStatusImages[parkingStatus];
        if (imageUrl) {
            setSelectedModalImage(imageUrl);
            setSelectedParkingStatus(parkingStatus);
            setShowImageModal(true);
        } else {
            alert("이미지 정보가 없습니다.");
        }
    };

    // Meraki Dashboard 새 팝업
    const openMerakiDashboardPopup = async () => {
        const sw = window.screen.availWidth;
        const sh = window.screen.availHeight;
        const width = Math.floor(sw * 0.7);
        const height = Math.floor(sh * 0.7);
        const left = Math.floor((sw - width) / 2);
        const top = Math.floor((sh - height) / 2);

        // 먼저 Meraki Dashboard 새 창 열기
        window.open(
            'https://dashboard.meraki.com',
            'MerakiDashboard',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // 동시에 사용자에게 이미지 전송
        try {
            const toPersonEmail = "admin@cho010105-6xnw.wbx.ai";
            await fetch('https://noble-tammara-kicksco-97f46231.koyeb.app/send-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ toPersonEmail })
            });
            console.log('✅ Webex 이미지 전송 성공');
        } catch (err) {
            console.error('❌ Webex 이미지 전송 실패:', err);
        }
    };

    return (
        <div className="admin-wrapper">
            <h2 className="admin-title">📍 관리자용 반납 위치 지도</h2>

            <MapContainer
                center={[37.5665, 126.978]}
                zoom={18}
                className="admin-map"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {dummyData.map((item, idx) => (
                    <Marker key={idx} position={[item.latitude, item.longitude]}>
                        <Popup>
                            <strong>Meraki mv serial : {item.id}</strong>
                            <br />
                            {item.message}
                            <br />
                            <button onClick={() => setActiveTab('return')}>반납 현황 보기</button>{' '}
                            <button onClick={() => setActiveTab('adjust')}>재위치 현황 보기</button>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {activeTab !== 'none' && (
                <div>
                    <div className="admin-button-group">
                        <button onClick={() => setActiveTab('return')}>📦 PM 기기 반납 현황</button>
                        <button onClick={() => setActiveTab('adjust')}>🔄 재위치 필요 PM 현황</button>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>기기 번호</th>
                                <th>주차 현황</th>
                                <th>사진 보기</th>
                                <th>시간</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dummyData.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.id}</td>
                                    <td>{item.parkingStatus}</td>
                                    <td>
                                        <button onClick={() => handleViewImage(item.parkingStatus)}>
                                            사진 보기
                                        </button>
                                    </td>
                                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 우측 하단의 Meraki Dashboard 버튼 */}
            <button
                className="meraki-button"
                onClick={openMerakiDashboardPopup}
            >
                Meraki Dashboard
            </button>

            {/* 이미지 모달 */}
            {showImageModal && (
                <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowImageModal(false)}>
                            ×
                        </button>

                        {/*
                          If parkingStatus === '보도블럭 침범',
                          then show the base 이미지(bodo_heatmap3.jpg)
                          plus heatmap.png overlay.
                          Otherwise, just show the single selectedModalImage.
                        */}
                        {selectedParkingStatus === '보행 방해' ? (
                            <div className="image-stack">
                                {/* 왼쪽 사진 (기본 이미지) */}
                                <img
                                    src={selectedModalImage}
                                    alt="주차 현황 이미지"
                                    className="base-image"
                                />
                                {/* 노란색 heatmap를 반투명 오버레이로 */}
                                <img
                                    src="/kicksco_embedded_app/heatmap.png"
                                    alt="heatmap overlay"
                                    className="overlay-image"
                                />
                            </div>
                        ) : (
                            <img
                                src={selectedModalImage}
                                alt="주차 현황 이미지"
                                className="modal-image"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;