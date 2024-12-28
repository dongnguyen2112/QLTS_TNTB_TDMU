import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom'; 
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../css/Report.css';

const Report = () => {
  const [bookings, setBookings] = useState([]);
  const [searchID, setSearchID] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const bookingsCollection = collection(db, 'bookings');
  
    const unsubscribe = onSnapshot(bookingsCollection, (snapshot) => {
      const priorityOrder = ['Cao', 'Trung bình', 'Thấp'];
      const bookingsData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            bookingDate: parseFirestoreDate(data.bookingDate), // Chuyển đổi thành Date
          };
        })
        .sort((a, b) => {
          // Sắp xếp ngày báo hỏng (bookingDate) trước
          if (a.bookingDate.getTime() !== b.bookingDate.getTime()) {
            return a.bookingDate - b.bookingDate;
          }
          // Nếu bookingDate bằng nhau, xét tiếp priority
          return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        });

  
      setBookings(bookingsData);
    });
  
    return () => unsubscribe();
  }, []);

   

  const parseFirestoreDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('-');
    const fullYear = `20${year}`; // Thêm '20' vào năm 2 chữ số
    return new Date(`${fullYear}-${month}-${day}`); // Chuyển thành định dạng yyyy-mm-dd
  };
  
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return 'Không hợp lệ'; // Xử lý ngày không hợp lệ
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  
  // Filter functions for each tab
  const filterNewIncidents = () => {
    return bookings.filter(booking => 
      !booking.employeName && // Không có employeName
      booking.status === 'Đang xử lý' && // Trạng thái là 'Đang xử lý'
      booking.problemCode.toLowerCase().startsWith(searchID.toLowerCase())
    );
  };
  

  const filterAssignedIncidents = () => {
    return bookings.filter(booking => booking.employeName && booking.status === 'Đang xử lý');
  };
  
  const filterFollowUpIncidents = () => {
    return bookings.filter(booking => booking.status === 'Đã tiếp nhận' || booking.status === 'Đang sửa chữa'|| booking.status === 'Hoàn tất');
  };

  return (
    <div className="report-container">
      <Tabs>
        <TabList>
          <Tab>Sự cố mới</Tab>
          <Tab>Đã phân công</Tab>
          <Tab>Theo dõi sự cố</Tab>
        </TabList>

        <TabPanel>
        <div>
        <div className="search-bar-container" 
            style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}
          >
            <input
              type="text"
              className="search-bar"
              placeholder="Tìm kiếm theo ID..."
              value={searchID}
              onChange={(e) => setSearchID(e.target.value)}
              style={{ maxWidth: '250px', padding: '5px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div className="table-scroll-container">
            <table className="report-table new-incidents-table">
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Tài sản</th>
                  <th className="table-header">Ngày báo hỏng</th>
                  <th className="table-header">Mức độ</th>
                  <th className="table-header">Vị trí</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Phân công</th>
                  <th className="table-header">Xem chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filterNewIncidents().length > 0 ? (
                  filterNewIncidents().map(booking => (
                    <tr key={booking.id}>
                      <td className="table-data">{booking.problemCode}</td>
                      <td className="table-data">{booking.assetName}</td>
                      <td className="table-data">{formatDate(booking.bookingDate)}</td>
                      <td className="table-data">{booking.priority}</td>
                      <td className="table-data">{booking.qrCodeValue}</td>
                      <td className="table-data">{booking.status}</td>
                      <td className="table-data">{booking.employeName || 'Chưa phân công'}</td>
                      <td className="table-data">
                        <button onClick={() => navigate(`/detail_report/${booking.id}`)} className='btn_details_report'>Xem chi tiết</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results-message">
                      Không tìm thấy sự cố nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </TabPanel>


        {/* Đã phân công */}
        <TabPanel>
        <div className="table-scroll-container">
          <table className="report-table assigned-incidents-table">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Tài sản</th>
                <th className="table-header">Ngày báo hỏng</th>
                <th className="table-header">Mức độ</th>
                <th className="table-header">Vị trí</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Phân công</th>
              </tr>
            </thead>
            <tbody>
              {filterAssignedIncidents().map(booking => (
                <tr key={booking.id}>
                  <td className="table-data">{booking.problemCode}</td>
                  <td className="table-data">{booking.assetName}</td>
                  <td className="table-data">{formatDate(booking.bookingDate)}</td>
                  <td className="table-data">{booking.priority}</td>
                  <td className="table-data">{booking.qrCodeValue}</td>
                  <td className="table-data">{booking.status}</td>
                  <td className="table-data">{booking.employeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TabPanel>

        {/* Theo dõi sự cố */}
        <TabPanel>
        <div className="table-scroll-container">
          <table className="report-table follow-up-incidents-table">
            <thead>
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Tài sản</th>
                <th className="table-header">Ngày báo hỏng</th>
                <th className="table-header">Mức độ</th>
                <th className="table-header">Vị trí</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Phân công</th>
              </tr>
            </thead>
            <tbody>
              {filterFollowUpIncidents().map(booking => (
                <tr key={booking.id}>
                  <td className="table-data">{booking.problemCode}</td>
                  <td className="table-data">{booking.assetName}</td>
                  <td className="table-data">{formatDate(booking.bookingDate)}</td>
                  <td className="table-data">{booking.priority}</td>
                  <td className="table-data">{booking.qrCodeValue}</td>
                  <td className="table-data">{booking.status}</td>
                  <td className="table-data">{booking.employeName || 'Chưa phân công'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Report;
