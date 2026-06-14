import React, { useState } from 'react';
import './PatientHistory.css';

export const PatientHistory = () => {
    // Dữ liệu giả lập lịch sử khám bệnh
    const mockHistory = [
        { id: 1, ma_bn: 'BN260601', name: 'Nguyễn Văn A', gender: 'Nam', age: 32, date: '12/06/2026', diagnosis: 'K02 - Sâu răng ngà sâu', service: 'Hàn răng CO', status: 'Đã hoàn thành' },
        { id: 2, ma_bn: 'BN260605', name: 'Lê Hoàng Long', gender: 'Nam', age: 45, date: '11/06/2026', diagnosis: 'K05 - Viêm quanh răng mãn tính', service: 'Lấy cao răng siêu âm', status: 'Đã hoàn thành' },
        { id: 3, ma_bn: 'BN260606', name: 'Vũ Thị Thắm', gender: 'Nữ', age: 28, date: '10/06/2026', diagnosis: 'K04 - Viêm tủy răng cấp tính', service: 'Điều trị tủy răng số 36', status: 'Đã hoàn thành' },
        { id: 4, ma_bn: 'BN260607', name: 'Trần Minh Đức', gender: 'Nam', age: 19, date: '08/06/2026', diagnosis: 'K02.3 - Sâu răng đã ngừng tiến triển', service: 'Khám định kỳ', status: 'Đã hoàn thành' }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Bộ lọc tìm kiếm
    const filteredHistory = mockHistory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ma_bn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? item.date === new Date(filterDate).toLocaleDateString('vi-VN') : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="patient-history-page">
            <div className="history-header">
                <h2>Lịch sử bệnh án</h2>
                <p className="history-subtitle">Quản lý và tra cứu thông tin hồ sơ bệnh án y khoa do bạn đảm nhiệm</p>
            </div>

            {/* Thanh công cụ tìm kiếm */}
            <div className="filter-bar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm theo tên bệnh nhân hoặc mã ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="date-box">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Bảng hiển thị */}
            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Mã BN</th>
                            <th>Họ và tên</th>
                            <th>Tuổi</th>
                            <th>Giới tính</th>
                            <th>Ngày khám</th>
                            <th>Chẩn đoán chính</th>
                            <th>Dịch vụ điều trị</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">Không tìm thấy bệnh án nào phù hợp</td>
                            </tr>
                        ) : (
                            filteredHistory.map((item) => (
                                <tr key={item.id}>
                                    <td className="txt-bold">{item.ma_bn}</td>
                                    <td className="txt-name">{item.name}</td>
                                    <td>{item.age}</td>
                                    <td>{item.gender}</td>
                                    <td>{item.date}</td>
                                    <td className="txt-diagnosis">{item.diagnosis}</td>
                                    <td><span className="treatment-tag">{item.service}</span></td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => alert(`Chức năng xem chi tiết bệnh án của bệnh nhân ${item.name} đang được tích hợp.`)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientHistory;