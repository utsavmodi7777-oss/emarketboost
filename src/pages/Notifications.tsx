import { useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/lib/realtime';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(profile?.id);

  useEffect(() => {
    if (!profile) {
      navigate('/auth');
    }
  }, [profile]);

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-gray-400">Stay updated with your campaigns</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <div className="p-12 text-center">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
                    <p className="text-gray-400">You're all caught up!</p>
                  </div>
                </Card>
              ) : (
                notifications.map((notification) => {
                  const Icon = ICON_MAP[notification.type as keyof typeof ICON_MAP] || Info;
                  const iconColor = COLOR_MAP[notification.type as keyof typeof COLOR_MAP] || 'text-gray-500';

                  return (
                    <Card
                      key={notification.id}
                      className={`bg-gray-800/50 border-gray-700 p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                        !notification.is_read ? 'bg-gray-800' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          navigate(notification.link);
                        }
                      }}
                    >
                      <div className="flex gap-4">
                        <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white">{notification.title}</h3>
                            <div className="flex gap-2 items-center">
                              {!notification.is_read && (
                                <Badge className="bg-primary">New</Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm">{notification.message}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
