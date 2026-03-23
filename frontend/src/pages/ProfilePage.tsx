/**
 * ProfilePage Component
 *
 * User profile management page
 * Phase 6D - Task 6D.2
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Loader2, Save } from 'lucide-react';
import { useAuthStore, useUser } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useUser();
  const { logout, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch {
      // Error handled by store
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] section-padding">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[var(--color-primary-600)] flex items-center justify-center rounded-full">
                  <span className="text-white text-2xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  <CardDescription>
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <Input
                      value={user.username}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Logout */}
              <div className="pt-6 border-t border-[var(--color-border)]">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
