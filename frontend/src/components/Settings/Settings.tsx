import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  CreditCard, 
  Download, 
  Trash2,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { categoriesAPI } from '@/services/api';
import { getCurrencyOptions } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
}

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { categories, fetchCategories } = useTransactions();
  const { theme, setTheme, isDark } = useTheme();
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Local preferences state for form handling
  const [localPreferences, setLocalPreferences] = useState(preferences);

  // Categories state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  // Form states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);

  const currencyOptions = getCurrencyOptions();

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const colorOptions = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#84cc16'
  ];

  const handleProfileSave = async () => {
    setIsProfileSaving(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsPreferencesSaving(true);
    try {
      updatePreferences(localPreferences);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreferencesSaving(false);
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Sync local preferences with context preferences
  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  // Initialize local preferences on mount
  useEffect(() => {
    setLocalPreferences(preferences);
  }, []);

  const handleCategorySave = async () => {
    if (!editingCategory && !newCategory.name.trim()) return;
    
    setIsCategorySaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        await categoriesAPI.update(editingCategory.id, {
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
        });
      } else {
        // Create new category
        await categoriesAPI.create({
          name: newCategory.name,
          description: newCategory.description,
          color: newCategory.color,
        });
      }
      
      // Refresh categories
      await fetchCategories();
      
      // Reset form
      setEditingCategory(null);
      setNewCategory({ name: '', description: '', color: '#3b82f6' });
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setIsCategorySaving(false);
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      await categoriesAPI.delete(categoryId);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
    });
  };

  const handleCategoryCancel = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', color: '#3b82f6' });
  };

  return (
    <div className="space-y-6">
      <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and categories
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user?.role}</Badge>
                <span className="text-sm text-muted-foreground">Account Type</span>
              </div>
              <Button onClick={handleProfileSave} disabled={isProfileSaving}>
                {isProfileSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={localPreferences.emailNotifications}
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Get weekly financial summaries via email
                  </p>
                </div>
                <Switch
                  checked={localPreferences.weeklyReports}
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Monthly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed monthly financial reports
                  </p>
                </div>
                <Switch
                  checked={localPreferences.monthlyReports}
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, monthlyReports: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Budget Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you exceed budget limits
                  </p>
                </div>
                <Switch
                  checked={localPreferences.budgetAlerts}
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, budgetAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display & Format
              </CardTitle>
              <CardDescription>
                Customize your display preferences and formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={localPreferences.currency} onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={localPreferences.dateFormat} onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormatOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handlePreferencesSave} disabled={isPreferencesSaving}>
                {isPreferencesSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Manage Categories
              </CardTitle>
              <CardDescription>
                Create, edit, and manage your transaction categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add/Edit Category Form */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCategorySave} disabled={isCategorySaving || !newCategory.name.trim()}>
                    {isCategorySaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                  </Button>
                  {editingCategory && (
                    <Button variant="outline" onClick={handleCategoryCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <h3 className="font-medium">Existing Categories</h3>
                <div className="grid gap-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCategoryEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCategoryDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Button variant="outline">Update Password</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Export Data</Label>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-destructive">Danger Zone</Label>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;