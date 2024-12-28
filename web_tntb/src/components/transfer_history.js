import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore từ tệp firebase.js
import { useNavigate } from 'react-router-dom'; // Import useNavigate từ react-router-dom
import '../css/Transfer_history.css';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState({});
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        // Lấy dữ liệu từ collection transfer_history
        const transferRef = collection(db, 'transfer_history');
        const transferSnapshot = await getDocs(transferRef);
        const transferData = transferSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransfers(transferData);

        // Lấy thông tin tài sản
        const assetIds = transferData.flatMap(transfer => transfer.selectedAssets);
        
        // Chia assetIds thành các nhóm nhỏ để tránh giới hạn của Firestore
        const chunkSize = 10; // Số lượng tài liệu tối đa cho mỗi truy vấn `in`
        for (let i = 0; i < assetIds.length; i += chunkSize) {
          const chunk = assetIds.slice(i, i + chunkSize);
          const assetRef = collection(db, 'asset');
          const assetQuery = query(assetRef, where(documentId(), 'in', chunk));
          const assetSnapshot = await getDocs(assetQuery);

          // Lưu thông tin tài sản vào đối tượng assetData
          const assetData = {};
          assetSnapshot.docs.forEach(doc => {
            assetData[doc.id] = doc.data();
          });

          // Hợp nhất dữ liệu vào assets hiện có
          setAssets(prevAssets => ({ ...prevAssets, ...assetData }));
        }
      } catch (error) {
        console.error("Error fetching transfer history: ", error);
      }
    };

    fetchTransferHistory();
  }, []);
  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
  };
  const filteredTransfers = transfers.filter((transfer) =>
    transfer.transferId.toLowerCase().startsWith(searchId.toLowerCase())
  );
  

  const handleDetailClick = (transferId) => {
    // Chuyển hướng đến trang chi tiết
    navigate(`/detail_history_transfer/${transferId}`); 
  };

  return (
    <div className="transfer-history-new">
      {/* Search bar */}
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

      <div className="table-scroll"> {/* Div chứa bảng với thanh cuộn */}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên tài sản</th>
              <th>Vị trí mới</th>
              <th>Ngày điều chuyển</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td>{transfer.transferId}</td>
                  <td>
                    {transfer.selectedAssets.map((assetId) => (
                      <div key={assetId}>
                        {assets[assetId]?.assetName || 'Không tìm thấy tên tài sản'}
                      </div>
                    ))}
                  </td>
                  <td>{transfer.newPosition}</td>
                  <td>{transfer.currentDate}</td>
                  <td>
                    <button
                      onClick={() => handleDetailClick(transfer.id)}
                      style={{
                        backgroundColor: '#43CD80',
                        padding: 12,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: '600',
                        width: 'auto',
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Không có kết quả nào!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TransferHistory;
