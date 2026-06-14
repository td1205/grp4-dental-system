import { Icon } from '../../components/common/Icon/Icon';

export function IncomeReportPage() {
    // Dữ liệu giả lập - sau này bạn sẽ thay bằng axios gọi API
    const incomeData = [
        { id: 1, date: '12/06/2026', description: 'Khám tổng quát (BN260601)', amount: '500.000' },
        { id: 2, date: '11/06/2026', description: 'Lấy cao răng (BN260605)', amount: '300.000' },
    ];

    return (
        <div className="staff-page" id="income-report-page">
            <header className="staff-page__header">
                <h1 className="staff-page__title">Báo cáo thu nhập</h1>
                <p>Thống kê chi tiết thu nhập cá nhân từ các ca khám và dịch vụ</p>
            </header>

            <div className="staff-card">
                {/* Phần thống kê tổng */}
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                    <div className="staff-badge staff-badge--status-active" style={{ padding: '15px 20px', fontSize: '1.1rem' }}>
                        Tổng thu nhập: 800.000 VND
                    </div>
                </div>

                <div className="staff-table-wrap">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>NGÀY</th>
                                <th>MÔ TẢ DỊCH VỤ</th>
                                <th style={{ textAlign: 'right' }}>SỐ TIỀN (VND)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomeData?.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.date}</td>
                                    <td>{item.description}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--staff-primary)' }}>{item.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}