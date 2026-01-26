"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/contexts/admin-context";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Brain, 
  Activity, 
  MessageSquare, 
  FileText,
  LogOut,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Clock,
  Loader2,
  History,
  MessageSquareHeart,
  Menu,
  X,
} from "lucide-react";
import {
  getDashboardStats,
  getMoodTrends,
  getActivityStats,
  getUsers,
  getAdminLogs,
} from "@/lib/api/admin";

interface DashboardStats {
  totalUsers: number;
  totalMoodEntries: number;
  totalActivities: number;
  totalChatSessions: number;
  totalReports: number;
  recentUsers: number;
  lastUpdated: string;
}

interface MoodTrend {
  _id: string;
  averageScore: number;
  averageIntensity: number;
  count: number;
}

interface ActivityStat {
  _id: string;
  count: number;
  totalDuration: number;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  stats?: {
    streak: number;
    lastActiveDate: string | null;
  };
}

interface AdminLogEntry {
  _id: string;
  adminEmail: string;
  action: string;
  resource: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, loading: authLoading, isAuthenticated, logout } = useAdmin();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserInfo[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "analytics" | "logs">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, moodRes, activityRes, usersRes, logsRes] = await Promise.all([
        getDashboardStats(),
        getMoodTrends(14),
        getActivityStats(30),
        getUsers(1, 10),
        getAdminLogs(1, 10),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (moodRes.success) setMoodTrends(moodRes.data.trends || []);
      if (activityRes.success) setActivityStats(activityRes.data.byType || []);
      if (usersRes.success) setRecentUsers(usersRes.data.users || []);
      if (logsRes.success) setAdminLogs(logsRes.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      change: `+${stats?.recentUsers || 0} this week`,
    },
    {
      title: "Mood Entries",
      value: stats?.totalMoodEntries || 0,
      icon: Brain,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      change: "Total logged",
    },
    {
      title: "Activities",
      value: stats?.totalActivities || 0,
      icon: Activity,
      color: "from-teal-500 to-emerald-500",
      bgColor: "bg-teal-500/10",
      change: "All time",
    },
    {
      title: "Chat Sessions",
      value: stats?.totalChatSessions || 0,
      icon: MessageSquare,
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-500/10",
      change: "Total sessions",
    },
    {
      title: "Reports",
      value: stats?.totalReports || 0,
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      change: "AI reflections",
    },
  ];

  const navTabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "logs", label: "Logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">MindEase Admin</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Dashboard</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-white">{admin?.name}</p>
                  <p className="text-xs text-slate-400">{admin?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-3 border-t border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-sm font-medium text-white">{admin?.name}</p>
                  <p className="text-xs text-slate-400">{admin?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchDashboardData();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoading}
                className="w-full border-white/10 text-slate-300"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh Data
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 sticky top-14 sm:top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tab.label}
              </button>
            ))}
            {/* Reviews Moderation Link */}
            <button
              onClick={() => router.push("/admin/reviews")}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white hover:border-slate-600 transition-all whitespace-nowrap shrink-0"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Reviews
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {statCards.map((stat, idx) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group"
                >
                  <div className={cn(
                    "absolute inset-0 rounded-xl sm:rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity",
                    stat.bgColor
                  )} />
                  <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                        stat.color
                      )}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1">
                      {isLoading ? "—" : stat.value.toLocaleString()}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">{stat.title}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">{stat.change}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Mood Trends */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                    Mood Trends (14 days)
                  </h3>
                </div>
                {moodTrends.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {moodTrends.slice(-7).map((trend) => (
                      <div key={trend._id} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-slate-500 w-16 sm:w-20 truncate">{trend._id}</span>
                        <div className="flex-1 h-1.5 sm:h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            style={{ width: `${trend.averageScore}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-white w-8 sm:w-12 text-right">
                          {Math.round(trend.averageScore)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs sm:text-sm">No mood data available</p>
                )}
              </div>

              {/* Activity Distribution */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    Activity Distribution
                  </h3>
                </div>
                {activityStats.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {activityStats.map((stat) => (
                      <div key={stat._id} className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-300 capitalize truncate mr-2">{stat._id}</span>
                        <span className="text-xs sm:text-sm font-medium text-white shrink-0">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs sm:text-sm">No activity data available</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Recent Users
              </h3>
              <p className="text-[10px] sm:text-sm text-slate-400 mt-1">
                Basic user information only - No sensitive data displayed
              </p>
            </div>
            <div className="divide-y divide-slate-700/50">
              {recentUsers.map((user) => (
                <div key={user._id} className="p-3 sm:p-4 hover:bg-slate-700/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{user.name}</p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">{user.email}</p>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col gap-2 sm:gap-0 text-[10px] sm:text-xs shrink-0">
                      <p className="text-slate-300">
                        Streak: {user.stats?.streak || 0} days
                      </p>
                      <p className="text-slate-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">
                  No users found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-white mb-3 sm:mb-4">Analytics Overview</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                All analytics data is aggregated and anonymized. No individual user data is exposed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-sm text-slate-400 mb-1">Avg Mood Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {moodTrends.length > 0
                      ? Math.round(
                          moodTrends.reduce((sum, t) => sum + t.averageScore, 0) /
                            moodTrends.length
                        )
                      : "—"}
                    %
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-sm text-slate-400 mb-1">Total Activities</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {activityStats.reduce((sum, s) => sum + s.count, 0)}
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-sm text-slate-400 mb-1">Activity Types</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{activityStats.length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Admin Activity Logs
              </h3>
              <p className="text-[10px] sm:text-sm text-slate-400 mt-1">
                Audit trail of all admin actions
              </p>
            </div>
            <div className="divide-y divide-slate-700/50">
              {adminLogs.map((log) => (
                <div key={log._id} className="p-3 sm:p-4 hover:bg-slate-700/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{log.action}</p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">
                        {log.adminEmail} • {log.resource}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {adminLogs.length === 0 && (
                <div className="p-6 sm:p-8 text-center text-slate-500 text-sm">
                  No activity logs found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        {stats?.lastUpdated && (
          <p className="text-center text-[10px] sm:text-xs text-slate-500 mt-6 sm:mt-8">
            <Clock className="w-3 h-3 inline mr-1" />
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        )}
      </main>
    </div>
  );
}
