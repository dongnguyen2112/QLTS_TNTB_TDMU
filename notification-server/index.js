import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3001;
// Sử dụng cors
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: ' http://10.0.2.60:8081', // Thêm địa chỉ của app frontend
    methods: ['GET', 'POST'], // Cho phép các phương thức này
  }));

 // Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Sử dụng host SMTP của Gmail
  port: 587, // Cổng TLS
  secure: false, // Không sử dụng SSL, kích hoạt STARTTLS
  auth: {
    user: 'nguyentaitest123@gmail.com',
    pass: 'brqq ejxl hafv pasi',
  },
});

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: 'nguyentaitest123@gmail.com',
    to,
    subject,
    text,
  };

  try {
    // Gửi email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Lỗi gửi email:', error);
        res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email đã được gửi:', info.response);
        res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


// Endpoint gửi thông báo chung
app.post('/send-notification', async (req, res) => {
    const { expoPushToken, title, body } = req.body;

    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title || 'Thông báo!',
        body: body || 'Bạn đã được phân công sự cố mới',
        data: { "type": "repair" }
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi gửi thông báo.' });
    }
});

// Hàm gửi thông báo lịch bảo trì
app.post('/send-maintenance-notification', async (req, res) => {
    const { expoPushToken } = req.body;
    const title = 'Lịch Bảo Trì Mới!';
    const body = 'Bạn có lịch bảo trì mới. Vui lòng kiểm tra chi tiết trong ứng dụng.';

    // Gọi hàm gửi thông báo
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { "type": "maintenance" }
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        res.status(response.status).json(result);
    } catch (error) {
        console.error('Lỗi khi gửi thông báo lịch bảo trì:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi gửi thông báo lịch bảo trì.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
