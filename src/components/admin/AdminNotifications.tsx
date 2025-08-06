import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  type: 'course' | 'teacher' | 'proposal' | 'system';
}

interface AdminNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'error' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Données de démonstration
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Cours vacants détectés',
      message: '5 cours sont encore vacants et nécessitent une attention',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      read: false,
      action: {
        label: 'Voir les cours',
        onClick: () => console.log('Voir les cours vacants')
      }
    },
    {
      id: '2',
      type: 'success',
      title: 'Import réussi',
      message: '150 cours ont été importés avec succès',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      read: true
    },
    {
      id: '3',
      type: 'error',
      title: 'Erreur de validation',
      message: 'Le cours WMEDE1159 présente des incohérences de volume',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h ago
      read: false,
      action: {
        label: 'Corriger',
        onClick: () => console.log('Corriger le cours')
      }
    }
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Cours modifié',
      user: 'Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      details: 'WMEDE1159 - Volume Vol1 mis à jour',
      type: 'course'
    },
    {
      id: '2',
      action: 'Enseignant ajouté',
      user: 'Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      details: 'Dr. Martin Dupont ajouté au cours WMEDE1159',
      type: 'teacher'
    },
    {
      id: '3',
      action: 'Proposition validée',
      user: 'Admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      details: 'Proposition d\'équipe pour WMEDE1159 approuvée',
      type: 'proposal'
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'error' && notif.type !== 'error') return false;
    if (filter === 'warning' && notif.type !== 'warning') return false;
    if (searchQuery && !notif.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredActivityLogs = activityLogs.filter(log => {
    if (searchQuery && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: ActivityLog['type']) => {
    const colors = {
      course: 'bg-blue-100 text-blue-800',
      teacher: 'bg-purple-100 text-purple-800',
      proposal: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Centre de notifications</h2>
            <Badge variant="secondary">
              {notifications.filter(n => !n.read).length} non lues
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'notifications'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'activity'
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            Activité récente
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {activeTab === 'notifications' && (
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="unread">Non lues</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="warning">Avertissements</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {activeTab === 'notifications' ? (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        notification.read
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-blue-200 shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            {notification.action && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Marquer comme lue
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivityLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{log.action}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", getTypeBadge(log.type))}>
                            {log.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      <p className="text-xs text-gray-500 mt-1">Par {log.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {activeTab === 'notifications' && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full"
            >
              Marquer toutes comme lues
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 