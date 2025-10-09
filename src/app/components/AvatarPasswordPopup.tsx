import { useState } from 'react';
import {
    Modal,
    Tabs,
    Form,
    Input,
    Button,
    Upload,
    message as antdMessage,
    Avatar,
    notification
} from 'antd';
import {
    UploadOutlined,
    UserOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import {
    updateName,
    uploadAvatar,
    changePassword
} from '@/services/authService';

export default function AvatarPasswordPopup({ onClose }: { onClose: () => void }) {
    const { user, setUser } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // ========== CẬP NHẬT THÔNG TIN CÁ NHÂN ==========
    const handleUpdateProfile = async () => {
        if (!user?._id) return;
        setLoading(true);

        try {
            const updates: string[] = [];

            if (name && name !== user.name) {
                await updateName(user._id, name);
                setUser({ ...user, name });
                updates.push('tên hiển thị');
            }

            if (avatarFile) {
                const res = await uploadAvatar(avatarFile);
                const newAvatar = res.data?.avatarUrl;
                if (newAvatar) {
                    setUser({ ...user, avatar: newAvatar });
                    updates.push('ảnh đại diện');
                }
            }

            if (updates.length > 0) {
                notification.success({
                    message: 'Cập nhật thành công!',
                    description: `Đã cập nhật ${updates.join(' và ')}`,
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    placement: 'topRight'
                });
                onClose();
            } else {
                antdMessage.info('Không có thay đổi nào để cập nhật');
            }
        } catch (e: any) {
            notification.error({
                message: 'Lỗi cập nhật',
                description: e.message || 'Không thể cập nhật thông tin, vui lòng thử lại',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    // ========== XÁC MINH MẬT KHẨU HIỆN TẠI ==========
    const handleVerifyCurrentPassword = async () => {
        if (!user?._id || !currentPassword) {
            antdMessage.error('Vui lòng nhập mật khẩu hiện tại');
            return;
        }

        setLoading(true);
        try {
            // Giả lập xác minh bằng cách gọi changePassword với mật khẩu mới trùng mật khẩu cũ
            // hoặc bạn có thể tạo endpoint verifyPassword riêng để xác minh
            await changePassword(user._id, currentPassword, currentPassword);
            setIsVerified(true);
            notification.success({
                message: 'Xác minh thành công!',
                description: 'Bạn có thể đổi mật khẩu mới.',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                placement: 'topRight'
            });
        } catch (e: any) {
            notification.error({
                message: 'Sai mật khẩu',
                description: 'Mật khẩu hiện tại không chính xác. Vui lòng thử lại.',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    // ========== ĐỔI MẬT KHẨU ==========
    const handleChangePassword = async () => {
        if (!user?._id || !newPassword) {
            antdMessage.error('Vui lòng nhập mật khẩu mới');
            return;
        }

        setLoading(true);
        try {
            await changePassword(user._id, currentPassword, newPassword);
            notification.success({
                message: 'Đổi mật khẩu thành công!',
                description: 'Mật khẩu của bạn đã được cập nhật.',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                placement: 'topRight'
            });
            onClose();
        } catch (e: any) {
            notification.error({
                message: 'Lỗi đổi mật khẩu',
                description: e.message || 'Không thể đổi mật khẩu, vui lòng thử lại.',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open
            onCancel={onClose}
            footer={null}
            title="Chỉnh sửa thông tin cá nhân"
            centered
            width={500}
        >
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Thông tin cá nhân',
                        children: (
                            <Form layout="vertical" onFinish={handleUpdateProfile}>
                                <Form.Item>
                                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <Avatar
                                            size={80}
                                            src={avatarPreview || user?.avatar}
                                            icon={<UserOutlined />}
                                            style={{ marginBottom: 16 }}
                                        />
                                        <Upload
                                            beforeUpload={file => {
                                                const isImage = file.type.startsWith('image/');
                                                if (!isImage) {
                                                    antdMessage.error('Chỉ được chọn file ảnh');
                                                    return false;
                                                }
                                                const isLt2M = file.size / 1024 / 1024 < 2;
                                                if (!isLt2M) {
                                                    antdMessage.error('Ảnh phải nhỏ hơn 2MB');
                                                    return false;
                                                }
                                                setAvatarFile(file);
                                                setAvatarPreview(URL.createObjectURL(file));
                                                antdMessage.success('Đã chọn ảnh!');
                                                return false;
                                            }}
                                            showUploadList={false}
                                            maxCount={1}
                                        >
                                            <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                                        </Upload>
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
                                    <Button type="primary" htmlType="submit" loading={loading} block>
                                        Lưu thay đổi
                                    </Button>
                                </Form.Item>
                            </Form>
                        )
                    },
                    {
                        key: '2',
                        label: 'Đổi mật khẩu',
                        children: (
                            <Form layout="vertical" onFinish={isVerified ? handleChangePassword : handleVerifyCurrentPassword}>
                                <Form.Item label="Mật khẩu hiện tại" required>
                                    <Input.Password
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                </Form.Item>

                                {isVerified && (
                                    <Form.Item label="Mật khẩu mới" required>
                                        <Input.Password
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                    </Form.Item>
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        block
                                        disabled={!currentPassword || (isVerified && !newPassword)}
                                    >
                                        {isVerified ? 'Đổi mật khẩu' : 'Xác minh mật khẩu hiện tại'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        )
                    }
                ]}
            />
        </Modal>
    );
}
