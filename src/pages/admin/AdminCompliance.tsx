 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { supabase } from "@/integrations/supabase/client";
 import { useAdminStatus } from "@/hooks/useAdminStatus";
 import { Skeleton } from "@/components/ui/skeleton";
 import { 
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell, Legend
 } from "recharts";
 import { AlertTriangle, Shield, FileCheck, TrendingUp } from "lucide-react";
 
 interface ComplianceStats {
   pii_attempts_by_day: Array<{ date: string; count: number }>;
   boundary_triggers_by_day: Array<{ date: string; count: number; type: string }>;
   consent_rate: number;
   avg_summary_length: number;
   renewal_vs_expiration: { renewals: number; expirations: number };
   top_pii_patterns: Array<{ pattern: string; count: number }>;
 }
 
 const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];
 
 export default function AdminCompliance() {
   const navigate = useNavigate();
   const { isAdmin, isLoading: adminLoading } = useAdminStatus();
   const [stats, setStats] = useState<ComplianceStats | null>(null);
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
     await supabase.rpc('log_admin_page_access', { _page_path: '/admin/compliance' });
   };
 
   const loadStats = async () => {
     try {
       const { data, error } = await supabase.rpc('get_compliance_stats');
       if (error) throw error;
      setStats(data as unknown as ComplianceStats);
     } catch (err) {
       console.error('Failed to load compliance stats:', err);
     } finally {
       setLoading(false);
     }
   };
 
   if (adminLoading || loading) {
     return (
       <div className="container mx-auto p-6 space-y-6">
         <Skeleton className="h-8 w-64" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-64" />
           ))}
         </div>
       </div>
     );
   }
 
   if (!isAdmin) return null;
 
   const renewalData = stats?.renewal_vs_expiration ? [
     { name: 'Renewals', value: stats.renewal_vs_expiration.renewals },
     { name: 'Expirations', value: stats.renewal_vs_expiration.expirations }
   ] : [];
 
   return (
     <div className="container mx-auto p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
         <Badge variant="outline">Last 30 Days</Badge>
       </div>
 
       {/* Key Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Consent Rate
             </CardTitle>
             <FileCheck className="h-4 w-4 text-green-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{stats?.consent_rate ?? 0}%</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Avg Summary Length
             </CardTitle>
             <TrendingUp className="h-4 w-4 text-blue-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{stats?.avg_summary_length ?? 0} chars</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Total Renewals
             </CardTitle>
             <Shield className="h-4 w-4 text-purple-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{stats?.renewal_vs_expiration?.renewals ?? 0}</div>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">
               Total Expirations
             </CardTitle>
             <AlertTriangle className="h-4 w-4 text-orange-500" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{stats?.renewal_vs_expiration?.expirations ?? 0}</div>
           </CardContent>
         </Card>
       </div>
 
       {/* Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* PII Attempts Over Time */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-red-500" />
               PII Attempts Over Time
             </CardTitle>
           </CardHeader>
           <CardContent>
             {stats?.pii_attempts_by_day && stats.pii_attempts_by_day.length > 0 ? (
               <ResponsiveContainer width="100%" height={250}>
                 <BarChart data={stats.pii_attempts_by_day}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="date" fontSize={12} />
                   <YAxis />
                   <Tooltip />
                   <Bar dataKey="count" fill="#ef4444" name="PII Attempts" />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                 No PII attempts recorded
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* Renewal vs Expiration */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Shield className="h-5 w-5 text-purple-500" />
               Renewal vs Expiration
             </CardTitle>
           </CardHeader>
           <CardContent>
             {renewalData.some(d => d.value > 0) ? (
               <ResponsiveContainer width="100%" height={250}>
                 <PieChart>
                   <Pie
                     data={renewalData}
                     cx="50%"
                     cy="50%"
                     labelLine={false}
                     outerRadius={80}
                     fill="#8884d8"
                     dataKey="value"
                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                   >
                     {renewalData.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Legend />
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                 No data available
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       {/* Boundary Triggers */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Shield className="h-5 w-5 text-yellow-500" />
             Boundary Triggers Over Time (Legal / Medical / Financial)
           </CardTitle>
         </CardHeader>
         <CardContent>
           {stats?.boundary_triggers_by_day && stats.boundary_triggers_by_day.length > 0 ? (
             <ResponsiveContainer width="100%" height={250}>
               <BarChart data={stats.boundary_triggers_by_day}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="date" fontSize={12} />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="count" fill="#f59e0b" name="Triggers" />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-[250px] flex items-center justify-center text-muted-foreground">
               No boundary triggers recorded
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Top PII Patterns */}
       <Card>
         <CardHeader>
           <CardTitle>Top Detected PII Pattern Types</CardTitle>
           <p className="text-sm text-muted-foreground">
             Pattern types only — no user data displayed
           </p>
         </CardHeader>
         <CardContent>
           {stats?.top_pii_patterns && stats.top_pii_patterns.length > 0 ? (
             <div className="space-y-2">
               {stats.top_pii_patterns.map((pattern, index) => (
                 <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                   <span className="font-medium">{pattern.pattern}</span>
                   <Badge variant="secondary">{pattern.count} occurrences</Badge>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center text-muted-foreground py-8">
               No PII patterns detected
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 }