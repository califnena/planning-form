 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { supabase } from "@/integrations/supabase/client";
 import { useAdminStatus } from "@/hooks/useAdminStatus";
 import { 
   Users, Activity, MessageSquare, FileText, RefreshCw, 
   Clock, Headphones, Eye, AlertTriangle, Shield, Zap, AlertCircle
 } from "lucide-react";
 import { Skeleton } from "@/components/ui/skeleton";
 
 interface DashboardStats {
   total_users: number;
   active_users_7d: number;
   claire_sessions_7d: number;
   summaries_created_7d: number;
   renewals_7d: number;
   expirations_7d: number;
   assisted_requests_7d: number;
   vip_visits_7d: number;
   pii_attempts_7d: number;
   boundary_triggers_7d: number;
   high_frequency_users: number;
 }
 
 export default function AdminDashboard() {
   const navigate = useNavigate();
   const { isAdmin, isLoading: adminLoading } = useAdminStatus();
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!adminLoading && !isAdmin) {
       navigate("/");
       return;
     }
 
     if (isAdmin) {
       loadStats();
       logPageAccess();
     }
   }, [isAdmin, adminLoading, navigate]);
 
   const logPageAccess = async () => {
     await supabase.rpc('log_admin_page_access', { _page_path: '/admin/dashboard' });
   };
 
   const loadStats = async () => {
     try {
       const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
       if (error) throw error;
      setStats(data as unknown as DashboardStats);
     } catch (err) {
       console.error('Failed to load dashboard stats:', err);
     } finally {
       setLoading(false);
     }
   };
 
   if (adminLoading || loading) {
     return (
       <div className="container mx-auto p-6 space-y-6">
         <Skeleton className="h-8 w-64" />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[...Array(8)].map((_, i) => (
             <Skeleton key={i} className="h-32" />
           ))}
         </div>
       </div>
     );
   }
 
   if (!isAdmin) return null;
 
   const statCards = [
     { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "text-blue-500" },
     { label: "Active Users (7d)", value: stats?.active_users_7d ?? 0, icon: Activity, color: "text-green-500" },
     { label: "Claire Sessions (7d)", value: stats?.claire_sessions_7d ?? 0, icon: MessageSquare, color: "text-purple-500" },
     { label: "Summaries Created (7d)", value: stats?.summaries_created_7d ?? 0, icon: FileText, color: "text-indigo-500" },
     { label: "Renewals (7d)", value: stats?.renewals_7d ?? 0, icon: RefreshCw, color: "text-teal-500" },
     { label: "Expirations (7d)", value: stats?.expirations_7d ?? 0, icon: Clock, color: "text-orange-500" },
     { label: "Assisted Requests (7d)", value: stats?.assisted_requests_7d ?? 0, icon: Headphones, color: "text-pink-500" },
     { label: "VIP Page Visits (7d)", value: stats?.vip_visits_7d ?? 0, icon: Eye, color: "text-amber-500" },
   ];
 
   const alertCards = [
     { 
       label: "PII Attempt Flags", 
       value: stats?.pii_attempts_7d ?? 0, 
       icon: AlertTriangle, 
       color: stats?.pii_attempts_7d ? "text-red-500" : "text-muted-foreground",
       urgent: (stats?.pii_attempts_7d ?? 0) > 0
     },
     { 
       label: "Advice Boundary Flags", 
       value: stats?.boundary_triggers_7d ?? 0, 
       icon: Shield, 
       color: stats?.boundary_triggers_7d ? "text-yellow-500" : "text-muted-foreground",
       urgent: (stats?.boundary_triggers_7d ?? 0) > 5
     },
     { 
       label: "High Frequency Users", 
       value: stats?.high_frequency_users ?? 0, 
       icon: Zap, 
       color: stats?.high_frequency_users ? "text-orange-500" : "text-muted-foreground",
       urgent: (stats?.high_frequency_users ?? 0) > 0
     },
   ];
 
   return (
     <div className="container mx-auto p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
         <Badge variant="outline">Last 7 Days</Badge>
       </div>
 
       {/* Main Stats */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {statCards.map((stat) => (
           <Card key={stat.label}>
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">
                 {stat.label}
               </CardTitle>
               <stat.icon className={`h-4 w-4 ${stat.color}`} />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Alert Tiles */}
       <div>
         <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
           <AlertCircle className="h-5 w-5 text-muted-foreground" />
           Alerts & Flags
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {alertCards.map((alert) => (
             <Card key={alert.label} className={alert.urgent ? "border-destructive/50 bg-destructive/5" : ""}>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">
                   {alert.label}
                 </CardTitle>
                 <alert.icon className={`h-4 w-4 ${alert.color}`} />
               </CardHeader>
               <CardContent>
                 <div className={`text-2xl font-bold ${alert.urgent ? 'text-destructive' : ''}`}>
                   {alert.value}
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
 
       {/* Quick Links */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card 
           className="cursor-pointer hover:bg-muted/50 transition-colors"
           onClick={() => navigate('/admin/summary-audit')}
         >
           <CardContent className="p-4 flex items-center gap-3">
             <FileText className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">Summary Audit</span>
           </CardContent>
         </Card>
         <Card 
           className="cursor-pointer hover:bg-muted/50 transition-colors"
           onClick={() => navigate('/admin/compliance')}
         >
           <CardContent className="p-4 flex items-center gap-3">
             <Shield className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">Compliance</span>
           </CardContent>
         </Card>
         <Card 
           className="cursor-pointer hover:bg-muted/50 transition-colors"
           onClick={() => navigate('/admin/assisted-requests')}
         >
           <CardContent className="p-4 flex items-center gap-3">
             <Headphones className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">Assisted Requests</span>
           </CardContent>
         </Card>
         <Card 
           className="cursor-pointer hover:bg-muted/50 transition-colors"
           onClick={() => navigate('/admin')}
         >
           <CardContent className="p-4 flex items-center gap-3">
             <Users className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">User Management</span>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }