import { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Upload, message as antdMessage, Avatar, notification } from 'antd';
import { UploadOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { updateName, uploadAvatar, changePassword, sendOTPForgotPassword } from '@/services/authService';

export default function AvatarPasswordPopup({ onClose }: { onClose: () => void }) {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Gửi OTP khi chuyển tab
    const handleTabChange = async (key: string) => {
        if (key === '2' && user?.email && !otpSent) {
            setLoading(true);
            try {
                await sendOTPForgotPassword(user.email);
                setOtpSent(true);
                notification.info({
                    message: 'OTP đã được gửi',
                    description: `Mã OTP đã được gửi tới email: ${user.email}`,
                    placement: 'topRight',
                    duration: 4,
                });
            } catch (e: any) {
                notification.error({
                    message: 'Lỗi gửi OTP',
                    description: e.message || 'Không thể gửi OTP, vui lòng thử lại',
                    placement: 'topRight',
                });
            }
            setLoading(false);
        }
    };

    // Xác thực OTP - chỉ cần 6 số
    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            antdMessage.error('Vui lòng nhập đủ 6 số OTP');
            return;
        }

        setLoading(true);
        // Giả lập xác thực - chỉ cần 6 số bất kỳ
        setTimeout(() => {
            setIsOtpVerified(true);
            notification.success({
                message: 'Xác thực thành công!',
                description: 'OTP đã được xác thực. Bạn có thể đổi mật khẩu ngay bây giờ.',
                placement: 'topRight',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            });
            setLoading(false);
        }, 1000);
    };

    const handleUpdateNameAvatar = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            let updateMessage = 'Đã cập nhật: ';
            let updates = [];

            // Cập nhật tên
            if (name !== user.name) {
                await updateName(user._id, name);
                setUser({ ...user, name });
                updates.push('tên hiển thị');
            }

            // Upload avatar
            if (avatarFile) {
                const uploadResponse = await uploadAvatar(avatarFile);
                const newAvatarUrl = uploadResponse.data?.avatarUrl;
                if (newAvatarUrl) {
                    setUser({ ...user, avatar: newAvatarUrl });
                }
                updates.push('ảnh đại diện');
            }

            if (updates.length > 0) {
                notification.success({
                    message: 'Cập nhật thành công!',
                    description: `${updateMessage}${updates.join(' và ')}`,
                    placement: 'topRight',
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    duration: 4,
                });
            } else {
                antdMessage.info('Không có thay đổi nào để cập nhật');
            }

            onClose();
        } catch (e: any) {
            notification.error({
                message: 'Lỗi cập nhật',
                description: e.message || 'Không thể cập nhật thông tin, vui lòng thử lại',
                placement: 'topRight',
            });
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!user?._id || !currentPassword || !newPassword) return;
        setLoading(true);
        try {
            await changePassword(user._id, currentPassword, newPassword);
            notification.success({
                message: 'Đổi mật khẩu thành công!',
                description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng sử dụng mật khẩu mới để đăng nhập lần sau.',
                placement: 'topRight',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                duration: 5,
            });
            onClose();
        } catch (e: any) {
            notification.error({
                message: 'Lỗi đổi mật khẩu',
                description: e.message || 'Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra',
                placement: 'topRight',
            });
        }
        setLoading(false);
    };

    return (
        <Modal
            open={true}
            onCancel={onClose}
            footer={null}
            title="Chỉnh sửa thông tin cá nhân"
            centered
            width={500}
        >
            <Tabs
                defaultActiveKey="1"
                onChange={handleTabChange}
                items={[
                    {
                        key: '1',
                        label: 'Thông tin cá nhân',
                        children: (
                            <Form layout="vertical" onFinish={handleUpdateNameAvatar}>
                                <Form.Item>
                                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <Avatar
                                            size={80}
                                            src={avatarPreview || user?.avatar}
                                            icon={<UserOutlined />}
                                            style={{ marginBottom: 16 }}
                                        />
                                        <div>
                                            <Upload
                                                beforeUpload={file => {
                                                    const isImage = file.type.startsWith('image/');
                                                    if (!isImage) {
                                                        notification.error({
                                                            message: 'Định dạng file không hợp lệ',
                                                            description: 'Chỉ được upload file ảnh (JPG, PNG, GIF, ...)',
                                                            placement: 'topRight',
                                                        });
                                                        return false;
                                                    }
                                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                                    if (!isLt2M) {
                                                        notification.error({
                                                            message: 'Kích thước file quá lớn',
                                                            description: 'Ảnh phải nhỏ hơn 2MB',
                                                            placement: 'topRight',
                                                        });
                                                        return false;
                                                    }
                                                    setAvatarFile(file);
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                    antdMessage.success('Đã chọn ảnh thành công!');
                                                    return false;
                                                }}
                                                showUploadList={false}
                                                maxCount={1}
                                            >
                                                <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                                            </Upload>
                                        </div>
                                    </div>
                                </Form.Item>

                                <Form.Item label="Tên hiển thị" required>
                                    <Input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Nhập tên hiển thị"
                                    />
                                </Form.Item>

                                <Form.Item label="Email">
                                    <Input value={user?.email} disabled />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: '2',
                        label: 'Đổi mật khẩu',
                        children: (
                            !isOtpVerified ? (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <div style={{ marginBottom: 24 }}>
                                        <p style={{ marginBottom: 16 }}>
                                            Để đổi mật khẩu, vui lòng xác thực email của bạn
                                        </p>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                if (user?.email) {
                                                    setLoading(true);
                                                    try {
                                                        await sendOTPForgotPassword(user.email);
                                                        setOtpSent(true);
                                                        notification.info({
                                                            message: 'OTP đã được gửi',
                                                            description: `Mã OTP đã được gửi tới email: ${user.email}`,
                                                            placement: 'topRight',
                                                            duration: 4,
                                                        });
                                                    } catch (e: any) {
                                                        notification.error({
                                                            message: 'Lỗi gửi OTP',
                                                            description: e.message || 'Không thể gửi OTP, vui lòng thử lại',
                                                            placement: 'topRight',
                                                        });
                                                    }
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading || otpSent}
                                            loading={loading}
                                        >
                                            {otpSent ? 'OTP đã gửi' : 'Gửi OTP'}
                                        </Button>
                                    </div>

                                    {otpSent && (
                                        <Form layout="vertical" onFinish={handleVerifyOtp}>
                                            <Form.Item
                                                label="Nhập mã OTP từ email"
                                                name="otp"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập OTP' },
                                                    { len: 6, message: 'OTP phải có 6 số' }
                                                ]}
                                            >
                                                <Input
                                                    value={otp}
                                                    onChange={e => {
                                                        // Chỉ cho phép nhập số
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setOtp(value);
                                                    }}
                                                    placeholder="Nhập 6 số OTP"
                                                    maxLength={6}
                                                    onPressEnter={() => {
                                                        if (otp.length === 6) handleVerifyOtp();
                                                    }}
                                                />
                                            </Form.Item>
                                            <Form.Item>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    loading={loading}
                                                    block
                                                    disabled={!otp || otp.length !== 6}
                                                >
                                                    Xác thực OTP
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    )}
                                </div>
                            ) : (
                                <Form layout="vertical" onFinish={handleChangePassword}>
                                    <Form.Item label="Mật khẩu hiện tại" required>
                                        <Input.Password
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                    </Form.Item>
                                    <Form.Item label="Mật khẩu mới" required>
                                        <Input.Password
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            disabled={!currentPassword || !newPassword}
                                        >
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )
                        ),
                    },
                ]}
            />
        </Modal>
    );
}