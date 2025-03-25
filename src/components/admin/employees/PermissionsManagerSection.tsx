
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Save, RefreshCw, Shield, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

// Sample roles and permissions
const roles = [
  { id: 1, name: 'Super Admin', description: 'Full system access with no restrictions' },
  { id: 2, name: 'Department Manager', description: 'Can manage department members and their tasks' },
  { id: 3, name: 'Team Lead', description: 'Can manage team tasks and view team analytics' },
  { id: 4, name: 'Staff Member', description: 'Regular access to assigned modules' },
  { id: 5, name: 'Intern', description: 'Limited access to basic functions' },
  { id: 6, name: 'Sales', description: 'Access to sales-related functions and clients' },
  { id: 7, name: 'Support', description: 'Access to support tickets and client communications' },
  { id: 8, name: 'Developer', description: 'Access to development tools and services' },
  { id: 9, name: 'Content Manager', description: 'Can manage content and communications' },
];

// Sample permissions matrix
const permissions = [
  { id: 1, name: 'View Clients', description: 'View client profiles and basic information' },
  { id: 2, name: 'Edit Services', description: 'Modify service offerings and configurations' },
  { id: 3, name: 'Process Payments', description: 'Handle payment processing and refunds' },
  { id: 4, name: 'Send Official Communications', description: 'Send official emails and notifications' },
  { id: 5, name: 'Manage Team Tasks', description: 'Create and assign tasks to team members' },
  { id: 6, name: 'View Financial Data', description: 'Access financial reports and metrics' },
  { id: 7, name: 'Edit Client Information', description: 'Modify client profiles and details' },
  { id: 8, name: 'View Analytics', description: 'Access system analytics and reports' },
  { id: 9, name: 'Manage Employees', description: 'Add, edit, or remove employee accounts' },
  { id: 10, name: 'System Configuration', description: 'Change system-wide settings' },
];

// Predefined permission sets for each role
const rolePermissions: Record<string, number[]> = {
  'Super Admin': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  'Department Manager': [1, 4, 5, 7, 8, 9],
  'Team Lead': [1, 4, 5, 8],
  'Staff Member': [1, 4],
  'Intern': [1],
  'Sales': [1, 4, 5, 8],
  'Support': [1, 4, 5],
  'Developer': [2, 5, 8, 10],
  'Content Manager': [4, 5, 8],
};

const PermissionsManagerSection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchPermission, setSearchPermission] = useState('');
  const [customPermissions, setCustomPermissions] = useState<number[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Handle role selection
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    if (value in rolePermissions) {
      setCustomPermissions(rolePermissions[value]);
      setIsCustomMode(false);
    } else {
      setCustomPermissions([]);
    }
  };
  
  // Toggle custom permission
  const togglePermission = (permissionId: number) => {
    if (!isCustomMode) {
      // If we're switching to custom mode, start with current role permissions
      if (selectedRole in rolePermissions) {
        setCustomPermissions([...rolePermissions[selectedRole]]);
      }
      setIsCustomMode(true);
    }
    
    setCustomPermissions(current => 
      current.includes(permissionId) 
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId]
    );
  };
  
  // Filter permissions based on search
  const filteredPermissions = permissions.filter(
    permission => permission.name.toLowerCase().includes(searchPermission.toLowerCase())
  );
  
  // Check if permission is allowed for selected role
  const isPermissionAllowed = (permissionId: number) => {
    if (isCustomMode) {
      return customPermissions.includes(permissionId);
    }
    
    if (selectedRole && selectedRole in rolePermissions) {
      return rolePermissions[selectedRole].includes(permissionId);
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="space-y-2 flex-1">
          <Label htmlFor="role-select">Select Role</Label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger id="role-select" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedRole && roles.find(r => r.name === selectedRole) && (
            <p className="text-sm text-muted-foreground">
              {roles.find(r => r.name === selectedRole)?.description}
            </p>
          )}
        </div>
        
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchPermission}
              onChange={(e) => setSearchPermission(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant={isCustomMode ? "default" : "outline"} onClick={() => setIsCustomMode(!isCustomMode)}>
            <Shield className="mr-2 h-4 w-4" />
            {isCustomMode ? "Custom Mode" : "Standard Mode"}
          </Button>
          
          <Button variant="outline" onClick={() => {
            if (selectedRole in rolePermissions) {
              setCustomPermissions(rolePermissions[selectedRole]);
              setIsCustomMode(false);
            }
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {selectedRole ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Permission</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px] text-center">Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map(permission => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {permission.name}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">{permission.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {permission.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={isPermissionAllowed(permission.id)}
                            onCheckedChange={() => {
                              if (isCustomMode || selectedRole === 'Super Admin') {
                                togglePermission(permission.id);
                              }
                            }}
                            disabled={!isCustomMode && selectedRole !== 'Super Admin'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {isCustomMode && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                if (selectedRole in rolePermissions) {
                  setCustomPermissions(rolePermissions[selectedRole]);
                  setIsCustomMode(false);
                }
              }}>
                Cancel
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Custom Permissions
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64 border rounded-md bg-muted/30">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Select a Role</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a role to view or customize its permissions
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Permission Matrix Reference</h3>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Developer</TableHead>
                <TableHead>Content Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>View Clients</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✗</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Edit Services</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✗</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Process Payments</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✗</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Send Official Comms</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✗</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manage Tasks</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Team</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagerSection;
