import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  MessageSquare,
  BookOpen,
  Users,
  TrendingUp,
  Activity
} from "lucide-react";

interface Notification {
  id: string;
  type: 'proposal' | 'request' | 'course' | 'teacher' | 'system';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AdminNotificationsProps {
  proposalsCount: number;
  requestsCount: number;
  vacantCoursesCount: number;
  onViewProposals: () => void;
  onViewRequests: () => void;
  onViewCourses: () => void;
}

export const AdminNotifications = ({
  proposalsCount,
  requestsCount,
  vacantCoursesCount,
  onViewProposals,
  onViewRequests,
  onViewCourses
}: AdminNotificationsProps) => {
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const notifications: Notification[] = [
    ...(proposalsCount > 0 ? [{
      id: 'pending-proposals',
      type: 'proposal' as const,
      title: 'Propositions en attente',
      message: `${proposalsCount} proposition(s) d'attribution nécessitent votre validation`,
      priority: 'high' as const,
      timestamp: new Date(),
      action: {
        label: 'Voir les propositions',
        onClick: onViewProposals
      }
    }] : []),
    ...(requestsCount > 0 ? [{
      id: 'pending-requests',
      type: 'request' as const,
      title: 'Demandes de modification',
      message: `${requestsCount} demande(s) de modification en attente de traitement`,
      priority: 'medium' as const,
      timestamp: new Date(),
      action: {
        label: 'Voir les demandes',
        onClick: onViewRequests
      }
    }] : []),
    ...(vacantCoursesCount > 10 ? [{
      id: 'many-vacant-courses',
      type: 'course' as const,
      title: 'Cours vacants',
      message: `${vacantCoursesCount} cours sont encore vacants et nécessitent une attribution`,
      priority: 'medium' as const,
      timestamp: new Date(),
      action: {
        label: 'Voir les cours',
        onClick: onViewCourses
      }
    }] : []),

  ].filter(notification => !dismissedNotifications.includes(notification.id));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'request':
        return <MessageSquare className="h-5 w-5 text-orange-500" />;
      case 'course':
        return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'teacher':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Activity className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Important</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Info</Badge>;
      default:
        return null;
    }
  };

  const dismissNotification = (id: string) => {
    setDismissedNotifications(prev => [...prev, id]);
  };

  if (notifications.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Tout est à jour !</p>
              <p className="text-sm text-green-600">Aucune action urgente requise</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`border-2 ${getPriorityColor(notification.priority)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    {getPriorityBadge(notification.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {notification.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={notification.action.onClick}
                      className="mt-2"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 