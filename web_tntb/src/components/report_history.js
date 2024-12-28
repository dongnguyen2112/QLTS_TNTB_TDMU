import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import Firebase firestore config
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Cập nhật import từ Firebase v9
import '../css/Report_history.css';

const ReportHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [searchId, setSearchId] = useState(''); // State to store the search input
  const [filteredBookings, setFilteredBookings] = useState([]); // State to store filtered bookings

  // Hàm sắp xếp các booking theo ngày hoàn tất từ lớn đến bé
  const sortBookings = (bookingsData) => {
    return bookingsData.sort((a, b) => {
      // Chuyển đổi addedDate thành thời gian tính bằng milliseconds
      const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0;
      const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0;

      // So sánh thời gian
      return dateB - dateA; // Sắp xếp từ lớn đến bé
    });
  };

  // Hàm lọc bookings theo ID
  const filterBookingsById = (searchId) => {
    if (searchId === '') {
      setFilteredBookings(bookings); // Nếu không có gì được tìm kiếm, hiển thị tất cả
    } else {
      const filtered = bookings.filter((booking) => 
        booking.problemCode.toLowerCase().startsWith(searchId.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  };

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings'); // Lấy tham chiếu đến collection 'bookings'
    const q = query(
      bookingsRef,
      where('status', 'in', ['Đạt Yêu Cầu', 'Thay mới']) // Lọc các mục có status là "Đạt Yêu Cầu" hoặc "Thay mới"
    );

    // Lắng nghe các thay đổi trong Firestore
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sắp xếp dữ liệu theo ngày hoàn tất
      const sortedBookings = sortBookings(bookingsData);
      setBookings(sortedBookings);
      setFilteredBookings(sortedBookings); // Hiển thị tất cả bookings ban đầu
    }, (error) => {
      console.error("Error fetching bookings:", error);
    });

    // Dọn dẹp khi component bị hủy
    return () => unsubscribe();
  }, []);

  // Khi người dùng nhập ID tìm kiếm, lọc danh sách bookings
  const handleSearchChange = (event) => {
    setSearchId(event.target.value);
    filterBookingsById(event.target.value);
  };

  return (
    <div className="report-history">
      {/* Thêm phần nhập tìm kiếm */}
      <div className="search-bar" style={{ margin: '10px 0', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo ID"
          value={searchId}
          onChange={handleSearchChange}
          style={{
            padding: '8px',
            width: '300px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <div className="report-history-table-wrapper">
        <table className="report-history-table">
          <thead className="report-history-header">
            <tr>
              <th>ID</th>
              <th>Mã tài sản</th>
              <th>Tên tài sản</th>
              <th>Vị trí</th>
              <th>Giảng viên</th>
              <th>Thời gian</th>
              <th>Hoàn tất</th>
              <th>Nhân viên</th>
              <th>Trạng thái</th>
              <th>Minh chứng</th>
            </tr>
          </thead>
          <tbody className="report-history-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr className="report-history-row" key={booking.id}>
                  <td>{booking.problemCode}</td>
                  <td>{booking.assetCode}</td>
                  <td>{booking.assetName}</td>
                  <td>{booking.qrCodeValue}</td>
                  <td>{booking.name}</td>
                  <td>{booking.bookingDate} {booking.currentTime}</td>
                  <td>{booking.addedDate} {booking.addedTime}</td>
                  <td>{booking.employeName}</td>
                  <td>{booking.status}</td>
                  <td className="report-history-image-cell">
                    <img src={booking.proofphoto} alt={booking.serviceName} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>Không có báo cáo sự cố nào!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportHistory;
