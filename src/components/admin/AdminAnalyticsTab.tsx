import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Users, ShoppingCart, LogIn, Globe, Eye, MapPin, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

interface LoginEntry {
  id: string;
  user_id: string;
  logged_in_at: string;
  ip_address: string | null;
  user_email?: string;
}

interface PurchaseEntry {
  id: string;
  user_id: string;
  product_lookup_key: string;
  amount: number;
  currency: string;
  purchased_at: string;
  status: string;
  user_email?: string;
}

interface VisitEvent {
  id: string;
  visitor_id: string;
  user_id: string | null;
  path: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  created_at: string;
}

interface LocationStat {
  country: string;
  region: string;
  city: string;
  count: number;
}

interface VisitorSummary {
  visitor_id: string;
  total_visits: number;
  first_seen: string;
  last_seen: string;
  last_city: string | null;
  last_region: string | null;
  last_country: string | null;
  is_logged_in: boolean;
  user_email?: string;
}

export function AdminAnalyticsTab() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [logins, setLogins] = useState<LoginEntry[]>([]);
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [visitEvents, setVisitEvents] = useState<VisitEvent[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
  const [visitorSummaries, setVisitorSummaries] = useState<VisitorSummary[]>([]);
  const [visitStats, setVisitStats] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    loggedInVisits: 0,
    anonymousVisits: 0,
  });
  const [stats, setStats] = useState({
    totalLogins: 0,
    uniqueUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      // Get visit events from last 7 days
      const { data: visitData, error: visitError } = await supabase
        .from('visit_events')
        .select('*')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (visitError) {
        console.error('Error fetching visit events:', visitError);
      }

      const visits = (visitData || []) as VisitEvent[];
      setVisitEvents(visits);

      // Calculate visit stats
      const uniqueVisitorIds = new Set(visits.map(v => v.visitor_id));
      const loggedInVisits = visits.filter(v => v.user_id !== null).length;
      const anonymousVisits = visits.filter(v => v.user_id === null).length;

      setVisitStats({
        totalVisits: visits.length,
        uniqueVisitors: uniqueVisitorIds.size,
        loggedInVisits,
        anonymousVisits,
      });

      // Calculate location stats
      const locationMap = new Map<string, number>();
      visits.forEach(v => {
        if (v.country) {
          const key = `${v.country}|${v.region || 'Unknown'}|${v.city || 'Unknown'}`;
          locationMap.set(key, (locationMap.get(key) || 0) + 1);
        }
      });
      
      const locations: LocationStat[] = Array.from(locationMap.entries())
        .map(([key, count]) => {
          const [country, region, city] = key.split('|');
          return { country, region, city, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      
      setLocationStats(locations);

      // Build visitor summaries
      const visitorMap = new Map<string, VisitorSummary>();
      visits.forEach(v => {
        const existing = visitorMap.get(v.visitor_id);
        if (!existing) {
          visitorMap.set(v.visitor_id, {
            visitor_id: v.visitor_id,
            total_visits: 1,
            first_seen: v.created_at,
            last_seen: v.created_at,
            last_city: v.city,
            last_region: v.region,
            last_country: v.country,
            is_logged_in: v.user_id !== null,
          });
        } else {
          existing.total_visits++;
          if (new Date(v.created_at) < new Date(existing.first_seen)) {
            existing.first_seen = v.created_at;
          }
          if (new Date(v.created_at) > new Date(existing.last_seen)) {
            existing.last_seen = v.created_at;
            existing.last_city = v.city;
            existing.last_region = v.region;
            existing.last_country = v.country;
          }
          if (v.user_id !== null) {
            existing.is_logged_in = true;
          }
        }
      });

      // Get login data
      const { data: loginData } = await supabase
        .from('user_logins')
        .select('*')
        .order('logged_in_at', { ascending: false })
        .limit(50);

      // Get all logins for stats
      const { data: allLogins } = await supabase
        .from('user_logins')
        .select('user_id');

      // Get purchase data
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .order('purchased_at', { ascending: false })
        .limit(50);

      // Get user emails from edge function
      let emailMap = new Map<string, string>();
      try {
        const { data: authData } = await supabase.functions.invoke('admin-user-management', {
          body: { action: 'get_users' }
        });
        if (authData?.users) {
          emailMap = new Map(authData.users.map((u: any) => [u.id, u.email]));
        }
      } catch (e) {
        console.error('Failed to fetch user emails:', e);
      }

      // Enrich visitor summaries with emails
      const summaries = Array.from(visitorMap.values())
        .sort((a, b) => b.total_visits - a.total_visits)
        .slice(0, 50);
      
      // Find user_ids for logged-in visitors
      const visitorUserMap = new Map<string, string>();
      visits.forEach(v => {
        if (v.user_id && !visitorUserMap.has(v.visitor_id)) {
          visitorUserMap.set(v.visitor_id, v.user_id);
        }
      });

      summaries.forEach(s => {
        const userId = visitorUserMap.get(s.visitor_id);
        if (userId) {
          s.user_email = emailMap.get(userId);
        }
      });

      setVisitorSummaries(summaries);

      // Enrich logins with emails
      const enrichedLogins = (loginData || []).map(login => ({
        ...login,
        user_email: emailMap.get(login.user_id) || login.user_id.slice(0, 8) + '...',
      }));

      // Enrich purchases with emails
      const enrichedPurchases = (purchaseData || []).map(purchase => ({
        ...purchase,
        user_email: emailMap.get(purchase.user_id) || purchase.user_id.slice(0, 8) + '...',
      }));

      // Calculate stats
      const uniqueUserIds = new Set(allLogins?.map(l => l.user_id) || []);
      const totalRevenue = purchaseData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setLogins(enrichedLogins);
      setPurchases(enrichedPurchases);
      setStats({
        totalLogins: allLogins?.length || 0,
        uniqueUsers: uniqueUserIds.size,
        totalPurchases: purchaseData?.length || 0,
        totalRevenue: totalRevenue / 100,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visitor Stats (Last 7 Days) */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Visitor Analytics (Last 7 Days)
          </CardTitle>
          <CardDescription>Traffic data from your tracked visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" /> Total Visits
              </span>
              <span className="text-3xl font-bold text-primary">{visitStats.totalVisits}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Unique Visitors
              </span>
              <span className="text-3xl font-bold">{visitStats.uniqueVisitors}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> Logged-In Visits
              </span>
              <span className="text-3xl font-bold text-green-600">{visitStats.loggedInVisits}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <UserX className="h-3 w-3" /> Anonymous Visits
              </span>
              <span className="text-3xl font-bold text-orange-600">{visitStats.anonymousVisits}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Locations
          </CardTitle>
          <CardDescription>Where your visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>State/Region</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationStats.length > 0 ? (
                  locationStats.map((loc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{loc.country}</TableCell>
                      <TableCell>{loc.region}</TableCell>
                      <TableCell>{loc.city}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{loc.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No location data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visitors
          </CardTitle>
          <CardDescription>Individual visitor activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor ID</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Logged In?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitorSummaries.length > 0 ? (
                  visitorSummaries.map((v) => (
                    <TableRow key={v.visitor_id}>
                      <TableCell className="font-mono text-xs">
                        {v.visitor_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.total_visits}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(v.first_seen), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(v.last_seen), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {v.last_city && v.last_region ? 
                          `${v.last_city}, ${v.last_region}` : 
                          v.last_country || '-'}
                      </TableCell>
                      <TableCell>
                        {v.is_logged_in ? (
                          <div className="flex flex-col">
                            <Badge variant="default" className="w-fit">Yes</Badge>
                            {v.user_email && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {v.user_email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No visitor data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.totalLogins')}</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.analytics.uniqueUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            {t('admin.analytics.recentLogins')}
          </CardTitle>
          <CardDescription>{t('admin.analytics.recentLoginsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.analytics.user')}</TableHead>
                  <TableHead>{t('admin.analytics.date')}</TableHead>
                  <TableHead>{t('admin.analytics.ipAddress')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logins.length > 0 ? (
                  logins.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell className="font-medium">{login.user_email}</TableCell>
                      <TableCell>
                        {format(new Date(login.logged_in_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {login.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      {t('admin.analytics.noLogins')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('admin.analytics.purchases')}
          </CardTitle>
          <CardDescription>{t('admin.analytics.purchasesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.analytics.user')}</TableHead>
                  <TableHead>{t('admin.analytics.product')}</TableHead>
                  <TableHead>{t('admin.analytics.amount')}</TableHead>
                  <TableHead>{t('admin.analytics.purchaseDate')}</TableHead>
                  <TableHead>{t('admin.users.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.product_lookup_key}</Badge>
                      </TableCell>
                      <TableCell>
                        ${(purchase.amount / 100).toFixed(2)} {purchase.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {format(new Date(purchase.purchased_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                          {purchase.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('admin.analytics.noPurchases')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
