
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AutomationService, AutomationResult } from "@/services/automationService";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Store, Package, TrendingUp, Play, RefreshCw } from "lucide-react";

const AutomationDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [automationHistory, setAutomationHistory] = useState<AutomationResult[]>([]);
  const [todayStatus, setTodayStatus] = useState({
    completed: false,
    stores_processed: 0,
    products_added: 0,
    last_run: undefined as string | undefined
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [history, status] = await Promise.all([
        AutomationService.getAutomationHistory(10),
        AutomationService.getTodaysAutomationStatus()
      ]);
      
      setAutomationHistory(history);
      setTodayStatus(status);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load automation dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualAutomation = async () => {
    setIsTriggering(true);
    try {
      const result = await AutomationService.triggerDailyAutomation();
      
      if (result.success) {
        toast({
          title: "Automation Started",
          description: result.message,
        });
        
        // Refresh dashboard data after a short delay
        setTimeout(loadDashboardData, 2000);
      } else {
        toast({
          title: "Automation Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger automation",
        variant: "destructive"
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = (result: AutomationResult) => {
    if (result.stores_processed === 0) return 0;
    return Math.round((result.stores_successful / result.stores_processed) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Product Automation</h1>
          <p className="text-gray-600 mt-1">
            Automated winning product generation for Shopify stores
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={triggerManualAutomation}
            disabled={isTriggering}
          >
            <Play className={`h-4 w-4 mr-2 ${isTriggering ? 'animate-pulse' : ''}`} />
            {isTriggering ? 'Running...' : 'Trigger Automation'}
          </Button>
        </div>
      </div>

      {/* Today's Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStatus.completed ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </div>
            {todayStatus.last_run && (
              <p className="text-xs text-muted-foreground mt-1">
                Last run: {formatDate(todayStatus.last_run)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores Processed</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStatus.stores_processed}</div>
            <p className="text-xs text-muted-foreground">
              Active Shopify stores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Added</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStatus.products_added}</div>
            <p className="text-xs text-muted-foreground">
              New winning products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automationHistory.length > 0 ? (
                `${Math.round(
                  automationHistory.reduce((acc, result) => acc + getSuccessRate(result), 0) / 
                  automationHistory.length
                )}%`
              ) : (
                '—'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 10 runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation History */}
      <Card>
        <CardHeader>
          <CardTitle>Automation History</CardTitle>
          <CardDescription>
            Recent daily automation executions and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : automationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No automation history yet</p>
              <p className="text-sm">Trigger your first automation to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {automationHistory.map((result, index) => {
                const successRate = getSuccessRate(result);
                return (
                  <div key={result.session_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatDate(result.execution_date)}
                        </span>
                        <Badge variant={successRate >= 80 ? "secondary" : successRate >= 50 ? "outline" : "destructive"}>
                          {successRate}% Success
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Session: {result.session_id.substring(0, 8)}...
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">{result.stores_processed}</div>
                        <div className="text-xs text-gray-500">Stores</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{result.stores_successful}</div>
                        <div className="text-xs text-gray-500">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{result.total_products_added}</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                    </div>

                    <Progress value={successRate} className="h-2" />

                    {result.results && result.results.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View detailed results ({result.results.length} stores)
                        </summary>
                        <div className="mt-2 space-y-2 text-sm">
                          {result.results.map((storeResult, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{storeResult.niche}</span>
                                <span className="text-gray-500 ml-2">{storeResult.shopify_url}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{storeResult.products_added} products</span>
                                <Badge variant={storeResult.success ? "secondary" : "destructive"} size="sm">
                                  {storeResult.success ? 'Success' : 'Failed'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationDashboard;
