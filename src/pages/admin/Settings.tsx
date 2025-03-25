
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Lock, 
  Key, 
  RefreshCw, 
  Globe, 
  Database, 
  AlertTriangle, 
  Save, 
  Bell, 
  Moon, 
  Sun
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [darkMode, setDarkMode] = useState(true);
  
  // Access settings states
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [autoLogout, setAutoLogout] = useState(30); // in minutes
  const [sessionRecording, setSessionRecording] = useState(false);
  
  // System settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  const saveSettings = (settingType: string) => {
    toast.success(`${settingType} settings saved successfully`);
    
    // In real app, this would connect to Supabase to save the settings
  };
  
  const handleRefreshApiKey = () => {
    toast.info('API key refreshed successfully');
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(`${!darkMode ? 'Dark' : 'Light'} mode activated`);
  };
  
  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode);
    toast[maintenanceMode ? 'info' : 'warning'](
      `Maintenance mode ${maintenanceMode ? 'deactivated' : 'activated'}`
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Manage admin portal configuration and security
          </p>
        </div>
        
        <Button variant="outline" onClick={toggleDarkMode}>
          {darkMode ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Access Control</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options for the admin portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Policy</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Minimum Password Length</Label>
                      <p className="text-sm text-muted-foreground">Require at least this many characters</p>
                    </div>
                    <Select defaultValue="12">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 characters</SelectItem>
                        <SelectItem value="10">10 characters</SelectItem>
                        <SelectItem value="12">12 characters</SelectItem>
                        <SelectItem value="16">16 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Required Character Types</Label>
                      <p className="text-sm text-muted-foreground">Enforce complexity requirements</p>
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lowercase">Lowercase</SelectItem>
                        <SelectItem value="uppercase">+ Uppercase</SelectItem>
                        <SelectItem value="numbers">+ Numbers</SelectItem>
                        <SelectItem value="all">+ Symbols</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <Label htmlFor="passwordExpiry">Password Expiry</Label>
                      <p className="text-sm text-muted-foreground">Force password reset after period</p>
                    </div>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Never</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Authentication</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="enforce2FA">Enforce Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch 
                      id="enforce2FA" 
                      checked={enforce2FA} 
                      onCheckedChange={setEnforce2FA} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="failedAttempts">Maximum Failed Login Attempts</Label>
                      <p className="text-sm text-muted-foreground">Lock account after this many attempts</p>
                    </div>
                    <Select defaultValue="5">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">API Security</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>API Access Key</Label>
                      <p className="text-sm text-muted-foreground">Used for programmatic access to the admin API</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="password" value="••••••••••••••••••••••" readOnly className="w-[200px] font-mono" />
                      <Button variant="outline" size="icon" onClick={handleRefreshApiKey}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>API Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">Maximum requests per minute</p>
                    </div>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 req/min</SelectItem>
                        <SelectItem value="60">60 req/min</SelectItem>
                        <SelectItem value="120">120 req/min</SelectItem>
                        <SelectItem value="300">300 req/min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('Security')}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Settings</CardTitle>
              <CardDescription>Manage admin access restrictions and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">IP Restrictions</h3>
                <div className="grid gap-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="ipWhitelist" 
                      placeholder="Enter allowed IP addresses (comma-separated)" 
                      value={ipWhitelist} 
                      onChange={(e) => setIpWhitelist(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="secondary">Verify</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Leave empty to allow access from any IP address
                  </p>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Session Management</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="autoLogout">Auto Logout Timeout</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                    </div>
                    <Select 
                      value={autoLogout.toString()} 
                      onValueChange={(value) => setAutoLogout(parseInt(value))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="sessionRecording">Session Recording</Label>
                      <p className="text-sm text-muted-foreground">Record admin actions for security auditing</p>
                    </div>
                    <Switch 
                      id="sessionRecording" 
                      checked={sessionRecording} 
                      onCheckedChange={setSessionRecording} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="concurrentSessions">Maximum Concurrent Sessions</Label>
                      <p className="text-sm text-muted-foreground">Limit simultaneous logins per account</p>
                    </div>
                    <Select defaultValue="1">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 session</SelectItem>
                        <SelectItem value="2">2 sessions</SelectItem>
                        <SelectItem value="3">3 sessions</SelectItem>
                        <SelectItem value="0">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Access Logs</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>Log Retention Period</Label>
                      <p className="text-sm text-muted-foreground">How long to keep access logs</p>
                    </div>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>Audit Log Export</Label>
                      <p className="text-sm text-muted-foreground">Export format for audit logs</p>
                    </div>
                    <Select defaultValue="csv">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('Access Control')}>
                <Save className="h-4 w-4 mr-2" />
                Save Access Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage system configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Status</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Make the portal inaccessible to regular users
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Switch 
                        id="maintenanceMode" 
                        checked={maintenanceMode} 
                        onCheckedChange={() => toggleMaintenanceMode()} 
                      />
                      {maintenanceMode && (
                        <Badge variant="destructive">Enabled</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="debugMode">Debug Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable detailed error messages and logging
                      </p>
                    </div>
                    <Switch 
                      id="debugMode" 
                      checked={debugMode} 
                      onCheckedChange={setDebugMode} 
                    />
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Data Management</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>Database Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatic backup frequency
                      </p>
                    </div>
                    <Select 
                      value={backupFrequency} 
                      onValueChange={setBackupFrequency}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>Backup Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep backups
                      </p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system alerts to admin email
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label>Alert Recipients</Label>
                      <p className="text-sm text-muted-foreground">
                        Who receives system alerts
                      </p>
                    </div>
                    <Select defaultValue="superadmins">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superadmins">Super Admins</SelectItem>
                        <SelectItem value="alladmins">All Admins</SelectItem>
                        <SelectItem value="custom">Custom List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('System')}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Manage external services and API connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Database Integration</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Supabase Connection</h4>
                      <p className="text-sm text-muted-foreground">Backend database configuration</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Database URL</span>
                      <span className="text-xs bg-muted-foreground/20 px-2 py-1 rounded">Production</span>
                    </div>
                    <div className="flex">
                      <Input
                        type="text"
                        value="https://xxxxxxxxxxxxx.supabase.co"
                        readOnly
                        className="flex-1 font-mono text-xs border-none bg-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Manage Keys
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">External Integrations</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Email Service</h4>
                      <p className="text-sm text-muted-foreground">For sending notifications and alerts</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Payment Gateway</h4>
                      <p className="text-sm text-muted-foreground">Processes client payments</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Cloud Storage</h4>
                      <p className="text-sm text-muted-foreground">For file uploads and backups</p>
                    </div>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Analytics Service</h4>
                      <p className="text-sm text-muted-foreground">For tracking user behavior</p>
                    </div>
                    <Badge variant="success">Connected</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Webhooks</h3>
                <div className="grid gap-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://your-service.com/webhook"
                  />
                  <p className="text-sm text-muted-foreground">
                    Configure an endpoint to receive real-time admin events
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Test Webhook
                    </Button>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Generate Secret
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings('Integration')}>
                <Save className="h-4 w-4 mr-2" />
                Save Integration Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
